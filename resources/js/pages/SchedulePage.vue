<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import type { IsoDate } from '@/api/types';
import CustomShiftForm from '@/components/schedule/CustomShiftForm.vue';
import QuickAssignMenu from '@/components/schedule/QuickAssignMenu.vue';
import ScheduleGrid from '@/components/schedule/ScheduleGrid.vue';
import ScheduleToolbar from '@/components/schedule/ScheduleToolbar.vue';
import SelectionBar from '@/components/schedule/SelectionBar.vue';
import TemplatesPanel from '@/components/schedule/TemplatesPanel.vue';
import { useCalendarPeriod } from '@/composables/useCalendarPeriod';
import { useCellSelection } from '@/composables/useCellSelection';
import { useDebounce } from '@/composables/useDebounce';
import { useDragAndDrop } from '@/composables/useDragAndDrop';
import { useScheduleBoard } from '@/composables/useScheduleBoard';
import { useUnsavedGuard } from '@/composables/useUnsavedGuard';
import type { CellRef } from '@/lib/cellKey';
import { todayIso } from '@/lib/dates';
import { plural } from '@/lib/plural';
import { durationMinutes, formatHours, formatRange, validateRange } from '@/lib/time';
import { useScheduleStore } from '@/stores/schedule';
import UiBadge from '@/ui/UiBadge.vue';
import UiButton from '@/ui/UiButton.vue';
import UiIcon from '@/ui/UiIcon.vue';
import UiPopover from '@/ui/UiPopover.vue';

const store = useScheduleStore();
const { employees, isDirty, changeCount, saving, publishing, publicationState } =
  storeToRefs(store);

// ── Period, search, data ────────────────────────────────────────────────────────────────────

const calendar = useCalendarPeriod();
const { view, period, days } = calendar;
const today = todayIso();

const search = ref('');
const appliedSearch = useDebounce(search, 250);

watch(
  () => `${period.value.from}|${period.value.to}`,
  () => void store.loadShifts(period.value),
  { immediate: true },
);
watch(appliedSearch, (value) => void store.loadEmployees(value.trim()), { immediate: true });
onMounted(() => void store.loadTemplates());

function reload(): void {
  void store.loadTemplates();
  void store.loadEmployees(appliedSearch.value.trim());
  void store.loadShifts(period.value);
}

const board = useScheduleBoard(days);
useUnsavedGuard(isDirty);

// ── Selection ───────────────────────────────────────────────────────────────────────────────

const employeeIds = computed(() => employees.value.map((employee) => employee.id));
const selection = useCellSelection(employeeIds, days);
const selectedCells = selection.cells;
const selectedShifts = computed(() => selectedCells.value.filter((cell) => store.shiftAt(cell)));
const hasSelection = computed(() => selectedCells.value.length > 0);

function onCellPointerDown(cell: CellRef, event: PointerEvent): void {
  if (event.button !== 0) return;
  if (event.ctrlKey || event.metaKey) return selection.toggle(cell);
  if (event.shiftKey) return selection.extendTo(cell);
  // A shift can be dragged to another cell, so pressing it only selects; an empty cell starts
  // a rectangle selection that follows the pointer.
  if (store.shiftAt(cell)) selection.selectOnly(cell);
  else selection.startDrag(cell);
}

// ── Menus ───────────────────────────────────────────────────────────────────────────────────

type MenuKind = 'cell' | 'day' | 'selection' | 'edit';
const menu = ref<{ kind: MenuKind; anchor: HTMLElement } | null>(null);
const menuOpen = computed({
  get: () => menu.value !== null,
  set: (open) => {
    if (!open) menu.value = null;
  },
});

function onCellClick(cell: CellRef, element: HTMLElement, event: MouseEvent): void {
  if (event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (selectedCells.value.length === 1 && selection.isSelected(cell)) {
    menu.value = { kind: 'cell', anchor: element };
  }
}

function onDayClick(date: IsoDate, element: HTMLElement): void {
  if (employeeIds.value.length === 0) return;
  selection.selectColumn(date);
  menu.value = { kind: 'day', anchor: element };
}

function finishAction(): void {
  menu.value = null;
  selection.clear();
}

// ── Assigning shifts ────────────────────────────────────────────────────────────────────────

const customStart = ref('09:00');
const customEnd = ref('17:00');
const customError = computed(() => validateRange(customStart.value, customEnd.value));
const customDetails = computed(() =>
  customError.value
    ? null
    : `${formatRange(customStart.value, customEnd.value)} · ${formatHours(durationMinutes(customStart.value, customEnd.value))}`,
);

const editStart = ref('09:00');
const editEnd = ref('17:00');
const editError = computed(() => validateRange(editStart.value, editEnd.value));

function applyTemplate(templateId: number): void {
  if (!hasSelection.value) {
    notify('info', 'Выделите ячейки в графике или перетащите шаблон в ячейку');
    return;
  }
  store.applyTemplate(selectedCells.value, templateId);
  finishAction();
}

function applyCustom(): void {
  if (
    !hasSelection.value ||
    store.applyCustom(selectedCells.value, customStart.value, customEnd.value)
  )
    return;
  finishAction();
}

function openEdit(anchor: HTMLElement): void {
  const first = selectedShifts.value[0] && store.shiftAt(selectedShifts.value[0]);
  if (!first) return;
  editStart.value = first.start_time;
  editEnd.value = first.end_time;
  menu.value = { kind: 'edit', anchor };
}

/** "Изменить": new times for the selected cells that already hold a shift. */
function applyEdit(): void {
  if (store.applyCustom(selectedShifts.value, editStart.value, editEnd.value)) return;
  finishAction();
}

function clearSelected(): void {
  store.clearCells(selectedCells.value);
  finishAction();
}

// ── Drag and drop ───────────────────────────────────────────────────────────────────────────

const dnd = useDragAndDrop();

function onShiftDragStart(cell: CellRef, event: DragEvent): void {
  selection.endDrag();
  menu.value = null;
  dnd.start(event, { kind: 'shift', cell });
}

function onCellDrop(cell: CellRef, event: DragEvent): void {
  const dropped = dnd.drop(event);
  if (!dropped) return;

  if (dropped.payload.kind === 'template') {
    // Dropping onto a selected cell fills the whole selection.
    const targets = selection.isSelected(cell) ? selectedCells.value : [cell];
    store.applyTemplate(targets, dropped.payload.templateId);
  } else {
    store.moveShift(dropped.payload.cell, cell, { copy: dropped.copy });
  }
  finishAction();
}

// ── Saving ──────────────────────────────────────────────────────────────────────────────────

type NoticeTone = 'success' | 'info';
const notice = ref<{ tone: NoticeTone; text: string } | null>(null);
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

function notify(tone: NoticeTone, text: string): void {
  clearTimeout(noticeTimer);
  notice.value = { tone, text };
  noticeTimer = setTimeout(() => (notice.value = null), 3000);
}

async function save(): Promise<void> {
  if (!isDirty.value) return;
  if (await store.save()) notify('success', 'Изменения сохранены');
}

async function publish(): Promise<void> {
  if (await store.publish()) notify('success', 'График опубликован');
}

const status = computed<{ tone: 'blue' | 'dark' | 'neutral'; text: string }>(() => {
  if (isDirty.value) {
    const changes = plural(changeCount.value, ['изменение', 'изменения', 'изменений']);
    return { tone: 'dark', text: `Не сохранено: ${changeCount.value} ${changes}` };
  }
  if (publicationState.value === 'published') return { tone: 'blue', text: 'Опубликован' };
  if (publicationState.value === 'partial')
    return { tone: 'neutral', text: 'Опубликован частично' };
  return { tone: 'neutral', text: 'Черновик' };
});

const canPublish = computed(
  () =>
    !saving.value && !publishing.value && (isDirty.value || publicationState.value !== 'published'),
);

// ── Keyboard ────────────────────────────────────────────────────────────────────────────────

function onKeyDown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    void save();
    return;
  }

  const typing = event.target instanceof HTMLInputElement;
  if (typing || !hasSelection.value) return;

  if (event.key === 'Escape') selection.clear();
  if (event.key === 'Delete' || event.key === 'Backspace') clearSelected();
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('pointerup', selection.endDrag);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('pointerup', selection.endDrag);
  clearTimeout(noticeTimer);
});

const emptyText = computed(() => {
  if (store.employeesStatus === 'error' || store.shiftsStatus === 'error') return null;
  if (store.employeesStatus !== 'ready') return 'Загружаем сотрудников…';
  if (employees.value.length > 0) return null;
  const query = appliedSearch.value.trim();
  return query ? `Никого не нашли по запросу «${query}»` : 'Сотрудников пока нет';
});
</script>

<template>
  <main class="schedule-page">
    <div class="schedule-page__crumbs">
      <RouterLink class="schedule-page__back" to="/home" aria-label="Назад">
        <UiIcon name="chevron-left" :size="14" />
      </RouterLink>
      <span>Графики смен</span>
    </div>

    <header class="schedule-page__header">
      <h1 class="schedule-page__title">График</h1>
      <UiBadge :tone="status.tone">{{ status.text }}</UiBadge>

      <div class="schedule-page__actions">
        <span
          v-if="notice"
          class="schedule-page__notice"
          :class="`is-${notice.tone}`"
          role="status"
        >
          <UiIcon v-if="notice.tone === 'success'" name="check" :size="14" />
          {{ notice.text }}
        </span>
        <UiButton v-if="isDirty" variant="quinary" :disabled="saving" @click="store.discard()">
          <template #icon-left><UiIcon name="undo" :size="14" /></template>
          Отменить изменения
        </UiButton>
        <UiButton variant="secondary" theme="blue" :disabled="!canPublish" @click="publish">
          {{ publishing ? 'Публикуем…' : 'Опубликовать' }}
        </UiButton>
        <UiButton theme="blue" :disabled="!isDirty || saving" @click="save">
          {{ saving ? 'Сохраняем…' : 'Сохранить' }}
        </UiButton>
      </div>
    </header>

    <div class="schedule-page__content">
      <section class="schedule-page__card" aria-label="График смен">
        <SelectionBar
          v-if="hasSelection"
          v-bind="selection.summary.value"
          :has-shifts="selectedShifts.length > 0"
          @apply-template="menu = { kind: 'selection', anchor: $event }"
          @edit="openEdit"
          @clear="clearSelected"
          @deselect="selection.clear()"
        />
        <ScheduleToolbar
          v-else
          v-model:search="search"
          v-model:view="view"
          :period-label="calendar.label.value"
          :is-current-period="calendar.isCurrent.value"
          @previous="calendar.previous"
          @next="calendar.next"
          @today="calendar.today"
        />

        <div v-if="store.saveError" class="schedule-page__alert" role="alert">
          <UiIcon name="alert" /> {{ store.saveError }}
        </div>

        <ScheduleGrid
          :view="view"
          :employees="employees"
          :days="days"
          :shifts="board.gridShifts.value"
          :selected="selection.selected.value"
          :errors="store.cellErrors"
          :coverage="board.coverage.value"
          :hours="board.hours.value"
          :drop-key="dnd.overKey.value"
          :today="today"
          @cell-pointerdown="onCellPointerDown"
          @cell-pointerenter="selection.dragTo"
          @cell-click="onCellClick"
          @cell-dragover="(cell, event) => dnd.over(event, cell)"
          @cell-dragleave="dnd.leave"
          @cell-drop="onCellDrop"
          @shift-dragstart="onShiftDragStart"
          @shift-dragend="dnd.end"
          @day-click="onDayClick"
        >
          <template #state>
            <div v-if="store.loadError && !emptyText" class="schedule-page__state" role="alert">
              <p>{{ store.loadError }}</p>
              <UiButton variant="secondary" @click="reload">Повторить</UiButton>
            </div>
            <div v-else-if="emptyText" class="schedule-page__state">{{ emptyText }}</div>
          </template>
        </ScheduleGrid>
      </section>

      <TemplatesPanel
        :templates="board.templateItems.value"
        @pick="applyTemplate"
        @template-dragstart="(id, event) => dnd.start(event, { kind: 'template', templateId: id })"
        @template-dragend="dnd.end"
      >
        <CustomShiftForm
          v-model:start="customStart"
          v-model:end="customEnd"
          :error="customError"
          :hint="customDetails"
          :can-submit="hasSelection"
          @submit="applyCustom"
        />
      </TemplatesPanel>
    </div>

    <UiPopover
      v-model:open="menuOpen"
      :anchor="menu?.anchor ?? null"
      :placement="menu?.kind === 'cell' || menu?.kind === 'day' ? 'bottom-start' : 'bottom-end'"
      label="Назначение смены"
    >
      <CustomShiftForm
        v-if="menu?.kind === 'edit'"
        v-model:start="editStart"
        v-model:end="editEnd"
        class="schedule-page__edit"
        :error="editError"
        submit-label="Применить"
        @submit="applyEdit"
      />
      <QuickAssignMenu
        v-else
        :templates="board.templateItems.value"
        :custom-details="customDetails"
        :clear-label="
          selectedShifts.length === 0 ? null : menu?.kind === 'day' ? 'Очистить день' : 'Очистить'
        "
        @template="applyTemplate"
        @custom="applyCustom"
        @clear="clearSelected"
      />
    </UiPopover>
  </main>
</template>

<style scoped>
.schedule-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 520px;
  padding: 19px var(--page-pad) var(--page-pad);
}

.schedule-page__crumbs {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--fs-sm);
}

.schedule-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-surface);
  color: var(--c-text);
}

.schedule-page__back:hover {
  background: var(--c-neutral-hover);
}

.schedule-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 14px;
}

.schedule-page__title {
  font-size: var(--fs-title);
  font-weight: 500;
  line-height: 36px;
}

.schedule-page__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.schedule-page__notice {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 8px;
  color: var(--c-text-2);
  font-size: var(--fs-xs);
}

.schedule-page__notice.is-success {
  color: var(--c-success);
}

.schedule-page__content {
  display: flex;
  flex: 1;
  gap: 8px;
  min-height: 0;
}

.schedule-page__card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 10px 10px 0;
  overflow: hidden;
  border-radius: var(--r-lg);
  background: var(--c-surface);
}

.schedule-page__alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--r-md);
  background: var(--c-danger-bg);
  color: var(--c-danger);
  font-size: var(--fs-xs);
  font-weight: 500;
}

.schedule-page__state {
  position: sticky;
  left: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 160px;
  color: var(--c-text-2);
  font-size: var(--fs-sm);
}

.schedule-page__edit {
  width: 236px;
  padding: 12px;
}
</style>
