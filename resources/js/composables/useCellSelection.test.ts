import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';

import { useCellSelection } from './useCellSelection';

const DAYS = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12'];

function setup() {
  const employees = ref([1, 2, 3]);
  const days = ref([...DAYS]);
  return { employees, days, selection: useCellSelection(employees, days) };
}

const cell = (employeeId: number, day: number) => ({ employeeId, date: DAYS[day]! });

describe('useCellSelection', () => {
  it('selects one cell on a plain click', () => {
    const { selection } = setup();
    selection.selectOnly(cell(1, 0));
    selection.selectOnly(cell(2, 1));

    expect(selection.cells.value).toEqual([cell(2, 1)]);
    expect(selection.isSelected(cell(1, 0))).toBe(false);
  });

  it('adds and removes cells with Ctrl+click', () => {
    const { selection } = setup();
    selection.selectOnly(cell(1, 0));
    selection.toggle(cell(3, 2));
    selection.toggle(cell(2, 1));
    selection.toggle(cell(3, 2));

    expect(selection.cells.value).toEqual([cell(1, 0), cell(2, 1)]);
  });

  it('selects a rectangle from the anchor with Shift+click', () => {
    const { selection } = setup();
    selection.selectOnly(cell(3, 2));
    selection.extendTo(cell(2, 0));

    expect(selection.cells.value).toEqual([
      cell(2, 0),
      cell(2, 1),
      cell(2, 2),
      cell(3, 0),
      cell(3, 1),
      cell(3, 2),
    ]);
  });

  it('follows the pointer while dragging and stops after the drag ends', () => {
    const { selection } = setup();
    selection.startDrag(cell(1, 1));
    selection.dragTo(cell(2, 2));
    expect(selection.summary.value).toEqual({ cells: 4, employees: 2, days: 2 });

    selection.dragTo(cell(1, 1));
    expect(selection.summary.value.cells).toBe(1);

    selection.endDrag();
    selection.dragTo(cell(3, 3));
    expect(selection.summary.value.cells).toBe(1);
  });

  it('selects a whole day for the visible employees', () => {
    const { selection } = setup();
    selection.selectColumn(DAYS[2]!);

    expect(selection.cells.value).toEqual([cell(1, 2), cell(2, 2), cell(3, 2)]);
    expect(selection.summary.value).toEqual({ cells: 3, employees: 3, days: 1 });
  });

  it('counts cells, employees and days of a scattered selection', () => {
    const { selection } = setup();
    selection.selectOnly(cell(1, 0));
    selection.toggle(cell(1, 1));
    selection.toggle(cell(3, 1));

    expect(selection.summary.value).toEqual({ cells: 3, employees: 2, days: 2 });
  });

  it('drops cells that are no longer in the grid', async () => {
    const { selection, employees, days } = setup();
    selection.selectOnly(cell(1, 0));
    selection.toggle(cell(2, 0));
    selection.toggle(cell(3, 3));

    employees.value = [2, 3];
    await nextTick();
    expect(selection.cells.value).toEqual([cell(2, 0), cell(3, 3)]);

    days.value = DAYS.slice(0, 2);
    await nextTick();
    expect(selection.cells.value).toEqual([cell(2, 0)]);
    expect(selection.selected.value.size).toBe(1);
  });

  it('clears everything', () => {
    const { selection } = setup();
    selection.startDrag(cell(1, 0));
    selection.clear();

    expect(selection.cells.value).toEqual([]);
    expect(selection.dragging.value).toBe(false);
  });
});
