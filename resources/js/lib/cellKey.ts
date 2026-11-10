import type { IsoDate } from '@/api/types';

/** A cell of the schedule grid: one employee on one day. */
export interface CellRef {
  employeeId: number;
  date: IsoDate;
}

/** Stable string id of a cell, used as a Map/Set key. */
export function cellKey(employeeId: number, date: IsoDate): string {
  return `${employeeId}:${date}`;
}

export function keyOf(cell: CellRef): string {
  return cellKey(cell.employeeId, cell.date);
}

export function parseCellKey(key: string): CellRef {
  const separator = key.indexOf(':');
  return { employeeId: Number(key.slice(0, separator)), date: key.slice(separator + 1) };
}
