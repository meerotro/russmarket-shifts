import { computed, type Ref, ref, watch } from 'vue';

import type { IsoDate } from '@/api/types';
import { cellKey, type CellRef, keyOf } from '@/lib/cellKey';

/**
 * Selection of grid cells. `employeeIds` and `dates` describe the visible grid (rows and columns
 * in display order); cells that leave the grid, for example after a search, leave the selection.
 *
 *  - click: `selectOnly`; Ctrl/Cmd+click: `toggle`; Shift+click: `extendTo` (rectangle from anchor);
 *  - mouse drag: `startDrag` then `dragTo` for every cell the pointer enters, then `endDrag`;
 *  - click on a date: `selectColumn`.
 */
export function useCellSelection(employeeIds: Ref<number[]>, dates: Ref<IsoDate[]>) {
  const selected = ref(new Set<string>());
  const anchor = ref<CellRef | null>(null);
  const dragging = ref(false);

  function rectangle(from: CellRef, to: CellRef): CellRef[] {
    const rows = [
      employeeIds.value.indexOf(from.employeeId),
      employeeIds.value.indexOf(to.employeeId),
    ];
    const cols = [dates.value.indexOf(from.date), dates.value.indexOf(to.date)];
    if (rows.includes(-1) || cols.includes(-1)) return [to];

    const cells: CellRef[] = [];
    for (let row = Math.min(...rows); row <= Math.max(...rows); row++) {
      for (let col = Math.min(...cols); col <= Math.max(...cols); col++) {
        cells.push({ employeeId: employeeIds.value[row]!, date: dates.value[col]! });
      }
    }
    return cells;
  }

  function selectOnly(cell: CellRef): void {
    selected.value = new Set([keyOf(cell)]);
    anchor.value = cell;
  }

  function toggle(cell: CellRef): void {
    const key = keyOf(cell);
    if (!selected.value.delete(key)) selected.value.add(key);
    anchor.value = cell;
  }

  function extendTo(cell: CellRef): void {
    if (!anchor.value) return selectOnly(cell);
    selected.value = new Set(rectangle(anchor.value, cell).map(keyOf));
  }

  function selectColumn(date: IsoDate): void {
    selected.value = new Set(employeeIds.value.map((id) => cellKey(id, date)));
    const first = employeeIds.value[0];
    anchor.value = first === undefined ? null : { employeeId: first, date };
  }

  function startDrag(cell: CellRef): void {
    selectOnly(cell);
    dragging.value = true;
  }

  function dragTo(cell: CellRef): void {
    if (dragging.value) extendTo(cell);
  }

  function endDrag(): void {
    dragging.value = false;
  }

  function clear(): void {
    selected.value = new Set();
    anchor.value = null;
    dragging.value = false;
  }

  function isSelected(cell: CellRef): boolean {
    return selected.value.has(keyOf(cell));
  }

  /** Selected cells in grid order: by row, then by column. */
  const cells = computed<CellRef[]>(() => {
    const result: CellRef[] = [];
    for (const employeeId of employeeIds.value) {
      for (const date of dates.value) {
        if (selected.value.has(cellKey(employeeId, date))) result.push({ employeeId, date });
      }
    }
    return result;
  });

  const summary = computed(() => ({
    cells: cells.value.length,
    employees: new Set(cells.value.map((cell) => cell.employeeId)).size,
    days: new Set(cells.value.map((cell) => cell.date)).size,
  }));

  // Keep the selection inside the visible grid.
  watch([employeeIds, dates], () => {
    if (cells.value.length === selected.value.size) return;
    selected.value = new Set(cells.value.map(keyOf));
    if (selected.value.size === 0) anchor.value = null;
  });

  return {
    selected,
    cells,
    summary,
    dragging,
    isSelected,
    selectOnly,
    toggle,
    extendTo,
    selectColumn,
    startDrag,
    dragTo,
    endDrag,
    clear,
  };
}
