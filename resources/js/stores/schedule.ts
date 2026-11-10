import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ApiError, isAbort } from '@/api/client';
import { scheduleApi } from '@/api/schedule';
import type {
  ClockTime,
  Employee,
  IsoDate,
  Shift,
  ShiftChangeset,
  ShiftTemplate,
} from '@/api/types';
import { cellKey, type CellRef, keyOf, parseCellKey } from '@/lib/cellKey';
import { daysOf, type Period } from '@/lib/dates';
import { validateRange } from '@/lib/time';

/** The editable part of a shift. `template_id: null` marks a custom shift. */
export interface ShiftValue {
  start_time: ClockTime;
  end_time: ClockTime;
  template_id: number | null;
}

/** What a grid cell shows: the saved shift with the local draft applied on top. */
export interface CellShift extends ShiftValue {
  /** True while the value exists only in the draft and has not been saved yet. */
  pending: boolean;
}

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type PublicationState = 'draft' | 'partial' | 'published';

function sameValue(a: ShiftValue, b: ShiftValue): boolean {
  return (
    a.start_time === b.start_time && a.end_time === b.end_time && a.template_id === b.template_id
  );
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Что-то пошло не так. Попробуйте ещё раз';
}

/**
 * Schedule data and the local draft of changes.
 *
 * `serverShifts` is what the backend has; `draft` holds only the cells the user has changed
 * since the last save (a value to store, or null to delete). The grid reads the two merged, and
 * "Save" sends just the draft as one batch.
 */
export const useScheduleStore = defineStore('schedule', () => {
  const employees = ref<Employee[]>([]);
  const templates = ref<ShiftTemplate[]>([]);
  const serverShifts = ref(new Map<string, Shift>());
  const draft = ref(new Map<string, ShiftValue | null>());
  const publishedDays = ref(new Set<IsoDate>());
  const period = ref<Period | null>(null);

  const employeesStatus = ref<LoadStatus>('idle');
  const shiftsStatus = ref<LoadStatus>('idle');
  const loadError = ref<string | null>(null);
  const saving = ref(false);
  const publishing = ref(false);
  const saveError = ref<string | null>(null);
  /** Server-side validation messages by cell key. */
  const cellErrors = ref(new Map<string, string>());

  let employeesRequest: AbortController | null = null;
  let shiftsRequest: AbortController | null = null;

  const templatesById = computed(() => new Map(templates.value.map((t) => [t.id, t])));

  /** Saved shifts with the draft applied: the single source for everything the page shows. */
  const shifts = computed(() => {
    const merged = new Map<string, CellShift>();

    for (const [key, shift] of serverShifts.value) {
      merged.set(key, {
        start_time: shift.start_time,
        end_time: shift.end_time,
        template_id: shift.template_id,
        pending: false,
      });
    }

    for (const [key, value] of draft.value) {
      if (value) merged.set(key, { ...value, pending: true });
      else merged.delete(key);
    }

    return merged;
  });

  const isDirty = computed(() => draft.value.size > 0);
  const changeCount = computed(() => draft.value.size);

  /** The draft in the shape the API expects. */
  const changeset = computed<ShiftChangeset>(() => {
    const result: ShiftChangeset = { upsert: [], delete: [] };

    for (const [key, value] of draft.value) {
      const { employeeId, date } = parseCellKey(key);
      if (value) result.upsert.push({ employee_id: employeeId, date, ...value });
      else result.delete.push({ employee_id: employeeId, date });
    }

    return result;
  });

  const publicationState = computed<PublicationState>(() => {
    if (!period.value) return 'draft';
    const days = daysOf(period.value);
    const published = days.filter((day) => publishedDays.value.has(day)).length;
    if (published === 0) return 'draft';
    return published === days.length ? 'published' : 'partial';
  });

  function shiftAt(cell: CellRef): CellShift | null {
    return shifts.value.get(keyOf(cell)) ?? null;
  }

  // ── Loading ───────────────────────────────────────────────────────────────────────────────

  async function loadTemplates(): Promise<void> {
    try {
      templates.value = (await scheduleApi.templates()).data;
    } catch (error) {
      loadError.value = errorMessage(error);
    }
  }

  /** Loads the employee list; a newer search cancels the one still in flight. */
  async function loadEmployees(search = ''): Promise<void> {
    employeesRequest?.abort();
    const request = new AbortController();
    employeesRequest = request;
    employeesStatus.value = 'loading';

    try {
      employees.value = (await scheduleApi.employees(search, request.signal)).data;
      employeesStatus.value = 'ready';
    } catch (error) {
      if (isAbort(error)) return;
      employeesStatus.value = 'error';
      loadError.value = errorMessage(error);
    }
  }

  /** Loads the saved shifts of a period. The draft is kept: it is keyed by date, not by period. */
  async function loadShifts(next: Period): Promise<void> {
    shiftsRequest?.abort();
    const request = new AbortController();
    shiftsRequest = request;
    period.value = next;
    shiftsStatus.value = 'loading';
    loadError.value = null;

    try {
      const response = await scheduleApi.shifts(next.from, next.to, request.signal);
      serverShifts.value = new Map(response.data.map((s) => [cellKey(s.employee_id, s.date), s]));
      publishedDays.value = new Set(response.meta.published_days);
      shiftsStatus.value = 'ready';
    } catch (error) {
      if (isAbort(error)) return;
      shiftsStatus.value = 'error';
      loadError.value = errorMessage(error);
    }
  }

  // ── Editing the draft ─────────────────────────────────────────────────────────────────────

  function setShift(cell: CellRef, value: ShiftValue): void {
    const key = keyOf(cell);
    const saved = serverShifts.value.get(key);
    cellErrors.value.delete(key);

    // Putting back exactly what is saved is not a change.
    if (saved && sameValue(saved, value)) draft.value.delete(key);
    else draft.value.set(key, { ...value });
  }

  function clearShift(cell: CellRef): void {
    const key = keyOf(cell);
    cellErrors.value.delete(key);

    if (serverShifts.value.has(key)) draft.value.set(key, null);
    else draft.value.delete(key);
  }

  function applyTemplate(cells: readonly CellRef[], templateId: number): void {
    const template = templatesById.value.get(templateId);
    if (!template) return;

    const value = {
      start_time: template.start_time,
      end_time: template.end_time,
      template_id: template.id,
    };
    for (const cell of cells) setShift(cell, value);
  }

  /** Puts a custom shift into the cells. Returns the reason when the time range is invalid. */
  function applyCustom(cells: readonly CellRef[], start: ClockTime, end: ClockTime): string | null {
    const error = validateRange(start, end);
    if (error) return error;

    for (const cell of cells)
      setShift(cell, { start_time: start, end_time: end, template_id: null });
    return null;
  }

  function clearCells(cells: readonly CellRef[]): void {
    for (const cell of cells) clearShift(cell);
  }

  /** Moves (or copies) a shift to another cell, replacing whatever is there. */
  function moveShift(from: CellRef, to: CellRef, options: { copy?: boolean } = {}): void {
    const shift = shiftAt(from);
    if (!shift || keyOf(from) === keyOf(to)) return;

    setShift(to, {
      start_time: shift.start_time,
      end_time: shift.end_time,
      template_id: shift.template_id,
    });
    if (!options.copy) clearShift(from);
  }

  function discard(): void {
    draft.value.clear();
    cellErrors.value.clear();
    saveError.value = null;
  }

  // ── Saving ────────────────────────────────────────────────────────────────────────────────

  /** Turns "upsert.3.end_time" style errors into messages attached to cells. */
  function assignCellErrors(error: ApiError, sent: ShiftChangeset): boolean {
    let assigned = false;

    for (const [path, messages] of Object.entries(error.fieldErrors)) {
      const match = /^(upsert|delete)\.(\d+)\./.exec(path);
      if (!match) continue;

      const item = sent[match[1] as keyof ShiftChangeset][Number(match[2])];
      const message = messages[0];
      if (!item || !message) continue;

      const key = cellKey(item.employee_id, item.date);
      if (!cellErrors.value.has(key)) cellErrors.value.set(key, message);
      assigned = true;
    }

    return assigned;
  }

  /** Sends the draft as one batch. Resolves to true when nothing is left unsaved. */
  async function save(): Promise<boolean> {
    if (!isDirty.value) return true;
    if (saving.value) return false;

    const sent = changeset.value;
    const sentDraft = new Map(draft.value);
    saving.value = true;
    saveError.value = null;
    cellErrors.value.clear();

    try {
      const response = await scheduleApi.saveShifts(sent);

      for (const key of sent.delete) serverShifts.value.delete(cellKey(key.employee_id, key.date));
      for (const shift of response.data) {
        serverShifts.value.set(cellKey(shift.employee_id, shift.date), shift);
      }
      for (const day of response.meta.unpublished_days) publishedDays.value.delete(day);

      // Drop only what was sent: a cell edited while the request was in flight stays in the draft.
      for (const [key, sentValue] of sentDraft) {
        const current = draft.value.get(key);
        const unchanged =
          current === undefined
            ? false
            : current === null || sentValue === null
              ? current === sentValue
              : sameValue(current, sentValue);
        if (unchanged) draft.value.delete(key);
      }

      return !isDirty.value;
    } catch (error) {
      const onCells =
        error instanceof ApiError && error.isValidation && assignCellErrors(error, sent);
      saveError.value = onCells
        ? 'Не удалось сохранить: проверьте отмеченные ячейки'
        : errorMessage(error);
      return false;
    } finally {
      saving.value = false;
    }
  }

  /** Saves pending changes, then marks every day of the current period as published. */
  async function publish(): Promise<boolean> {
    if (!period.value || publishing.value) return false;
    if (!(await save())) return false;

    publishing.value = true;
    try {
      const response = await scheduleApi.publish(period.value.from, period.value.to);
      for (const day of response.data.published_days) publishedDays.value.add(day);
      return true;
    } catch (error) {
      saveError.value = errorMessage(error);
      return false;
    } finally {
      publishing.value = false;
    }
  }

  return {
    employees,
    templates,
    templatesById,
    period,
    shifts,
    publishedDays,
    publicationState,
    employeesStatus,
    shiftsStatus,
    loadError,
    saving,
    publishing,
    saveError,
    cellErrors,
    isDirty,
    changeCount,
    changeset,
    shiftAt,
    loadTemplates,
    loadEmployees,
    loadShifts,
    setShift,
    clearShift,
    applyTemplate,
    applyCustom,
    clearCells,
    moveShift,
    discard,
    save,
    publish,
  };
});
