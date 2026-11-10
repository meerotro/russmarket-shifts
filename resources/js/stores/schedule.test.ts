import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { scheduleApi } from '@/api/schedule';
import type { Shift, ShiftTemplate } from '@/api/types';

import { useScheduleStore } from './schedule';

vi.mock('@/api/schedule', () => ({
  scheduleApi: {
    employees: vi.fn(),
    templates: vi.fn(),
    shifts: vi.fn(),
    saveShifts: vi.fn(),
    publish: vi.fn(),
  },
}));

const api = vi.mocked(scheduleApi);

const WEEK = { from: '2026-11-09', to: '2026-11-15' };
const MORNING: ShiftTemplate = {
  id: 1,
  name: 'Утро',
  start_time: '07:00',
  end_time: '15:00',
  duration_minutes: 480,
  color: 'blue',
};
const SAVED: Shift = {
  id: 10,
  employee_id: 1,
  date: '2026-11-10',
  start_time: '10:00',
  end_time: '18:00',
  template_id: null,
  duration_minutes: 480,
};
const savedCell = { employeeId: 1, date: '2026-11-10' };
const emptyCell = { employeeId: 2, date: '2026-11-11' };

/** A store with one template and one saved shift loaded for the week. */
async function loadedStore() {
  api.templates.mockResolvedValue({ data: [MORNING] });
  api.shifts.mockResolvedValue({
    data: [SAVED],
    meta: { ...WEEK, published_days: ['2026-11-10'] },
  });

  const store = useScheduleStore();
  await store.loadTemplates();
  await store.loadShifts(WEEK);
  return store;
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe('draft', () => {
  it('starts clean and shows saved shifts', async () => {
    const store = await loadedStore();

    expect(store.isDirty).toBe(false);
    expect(store.shiftAt(savedCell)).toMatchObject({ start_time: '10:00', pending: false });
    expect(store.shiftAt(emptyCell)).toBeNull();
  });

  it('records a new shift as an upsert', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);

    expect(store.shiftAt(emptyCell)).toMatchObject({ template_id: 1, pending: true });
    expect(store.changeset).toEqual({
      upsert: [
        {
          employee_id: 2,
          date: '2026-11-11',
          start_time: '07:00',
          end_time: '15:00',
          template_id: 1,
        },
      ],
      delete: [],
    });
  });

  it('records clearing a saved shift as a delete, and clearing a draft as nothing', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);
    store.clearCells([savedCell, emptyCell]);

    expect(store.shiftAt(savedCell)).toBeNull();
    expect(store.changeset).toEqual({
      upsert: [],
      delete: [{ employee_id: 1, date: '2026-11-10' }],
    });
  });

  it('is clean again when a cell is put back to its saved value', async () => {
    const store = await loadedStore();
    store.applyTemplate([savedCell], MORNING.id);
    expect(store.isDirty).toBe(true);

    store.applyCustom([savedCell], '10:00', '18:00');
    expect(store.isDirty).toBe(false);
  });

  it('refuses an invalid custom range and changes nothing', async () => {
    const store = await loadedStore();

    expect(store.applyCustom([emptyCell], '09:00', '09:00')).toBe(
      'Начало и конец смены не могут совпадать',
    );
    expect(store.isDirty).toBe(false);
  });

  it('moves and copies a shift between cells', async () => {
    const store = await loadedStore();
    store.moveShift(savedCell, emptyCell);

    expect(store.shiftAt(savedCell)).toBeNull();
    expect(store.shiftAt(emptyCell)).toMatchObject({ start_time: '10:00', end_time: '18:00' });
    expect(store.changeCount).toBe(2);

    store.discard();
    store.moveShift(savedCell, emptyCell, { copy: true });
    expect(store.shiftAt(savedCell)).not.toBeNull();
    expect(store.changeCount).toBe(1);
  });

  it('discards all pending changes', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);
    store.clearShift(savedCell);
    store.discard();

    expect(store.isDirty).toBe(false);
    expect(store.shiftAt(savedCell)).not.toBeNull();
  });

  it('keeps the draft when another period is loaded', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);

    api.shifts.mockResolvedValue({
      data: [],
      meta: { from: '2026-11-16', to: '2026-11-22', published_days: [] },
    });
    await store.loadShifts({ from: '2026-11-16', to: '2026-11-22' });

    expect(store.changeCount).toBe(1);
    expect(store.shiftAt(emptyCell)).toMatchObject({ pending: true });
  });
});

describe('save', () => {
  it('sends only the changes in one request and becomes clean', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);
    store.clearShift(savedCell);

    const created: Shift = { ...SAVED, id: 11, employee_id: 2, date: '2026-11-11', template_id: 1 };
    api.saveShifts.mockResolvedValue({
      data: [created],
      meta: { unpublished_days: ['2026-11-10'] },
    });

    expect(await store.save()).toBe(true);
    expect(api.saveShifts).toHaveBeenCalledTimes(1);
    expect(api.saveShifts).toHaveBeenCalledWith({
      upsert: [
        {
          employee_id: 2,
          date: '2026-11-11',
          start_time: '07:00',
          end_time: '15:00',
          template_id: 1,
        },
      ],
      delete: [{ employee_id: 1, date: '2026-11-10' }],
    });
    expect(store.isDirty).toBe(false);
    expect(store.shiftAt(emptyCell)).toMatchObject({ pending: false });
    expect(store.shiftAt(savedCell)).toBeNull();
    expect(store.publishedDays.has('2026-11-10')).toBe(false);
  });

  it('does not call the API when there is nothing to save', async () => {
    const store = await loadedStore();

    expect(await store.save()).toBe(true);
    expect(api.saveShifts).not.toHaveBeenCalled();
  });

  it('attaches validation errors to their cells and keeps the draft', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);
    api.saveShifts.mockRejectedValue(
      new ApiError('Ошибка проверки', 422, { 'upsert.0.employee_id': ['Сотрудник не найден.'] }),
    );

    expect(await store.save()).toBe(false);
    expect(store.cellErrors.get('2:2026-11-11')).toBe('Сотрудник не найден.');
    expect(store.saveError).toBe('Не удалось сохранить: проверьте отмеченные ячейки');
    expect(store.isDirty).toBe(true);

    // Editing the cell again clears its error.
    store.applyCustom([emptyCell], '09:00', '17:00');
    expect(store.cellErrors.size).toBe(0);
  });

  it('reports a network failure without losing the draft', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);
    api.saveShifts.mockRejectedValue(
      new ApiError('Нет связи с сервером. Проверьте подключение', 0),
    );

    expect(await store.save()).toBe(false);
    expect(store.saveError).toBe('Нет связи с сервером. Проверьте подключение');
    expect(store.changeCount).toBe(1);
    expect(store.saving).toBe(false);
  });

  it('keeps a cell that was edited while the request was in flight', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);

    let respond: (value: Awaited<ReturnType<typeof scheduleApi.saveShifts>>) => void = () => {};
    api.saveShifts.mockReturnValue(new Promise((resolve) => (respond = resolve)));

    const saving = store.save();
    store.applyCustom([emptyCell], '12:00', '20:00');
    respond({
      data: [
        {
          ...SAVED,
          id: 11,
          employee_id: 2,
          date: '2026-11-11',
          start_time: '07:00',
          end_time: '15:00',
          template_id: 1,
        },
      ],
      meta: { unpublished_days: [] },
    });

    expect(await saving).toBe(false);
    expect(store.shiftAt(emptyCell)).toMatchObject({ start_time: '12:00', pending: true });
  });
});

describe('publish', () => {
  it('reports the state of the period', async () => {
    const store = await loadedStore();
    expect(store.publicationState).toBe('partial');

    api.publish.mockResolvedValue({
      data: {
        ...WEEK,
        published_days: [
          '2026-11-09',
          '2026-11-10',
          '2026-11-11',
          '2026-11-12',
          '2026-11-13',
          '2026-11-14',
          '2026-11-15',
        ],
      },
    });

    expect(await store.publish()).toBe(true);
    expect(api.publish).toHaveBeenCalledWith('2026-11-09', '2026-11-15');
    expect(store.publicationState).toBe('published');
  });

  it('saves pending changes first and does not publish if saving fails', async () => {
    const store = await loadedStore();
    store.applyTemplate([emptyCell], MORNING.id);
    api.saveShifts.mockRejectedValue(new ApiError('Ошибка сервера. Попробуйте ещё раз', 500));

    expect(await store.publish()).toBe(false);
    expect(api.publish).not.toHaveBeenCalled();
  });
});

describe('loading', () => {
  it('exposes a load error', async () => {
    api.shifts.mockRejectedValue(new ApiError('Нет связи с сервером. Проверьте подключение', 0));
    const store = useScheduleStore();
    await store.loadShifts(WEEK);

    expect(store.shiftsStatus).toBe('error');
    expect(store.loadError).toBe('Нет связи с сервером. Проверьте подключение');
  });

  it('ignores a cancelled request', async () => {
    api.employees.mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const store = useScheduleStore();
    await store.loadEmployees('ал');

    expect(store.employeesStatus).toBe('loading');
    expect(store.loadError).toBeNull();
  });
});
