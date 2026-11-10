/**
 * Wall-clock time helpers. The rules mirror App\Services\ShiftDuration on the backend:
 *  - times are "HH:MM";
 *  - an end time that is not later than the start means the shift ends on the next day;
 *  - a shift cannot start and end at the same minute.
 */

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTES_PER_DAY = 1440;

/** Minutes since midnight, or null when the string is not a valid "HH:MM". */
export function parseTime(time: string): number | null {
  const match = TIME_PATTERN.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isValidTime(time: string): boolean {
  return parseTime(time) !== null;
}

/** Why a start/end pair cannot be a shift, or null when it can. */
export function validateRange(start: string, end: string): string | null {
  const from = parseTime(start);
  const to = parseTime(end);
  if (from === null) return 'Укажите время начала';
  if (to === null) return 'Укажите время окончания';
  if (from === to) return 'Начало и конец смены не могут совпадать';
  return null;
}

/** Length of a shift in minutes. Throws on a pair that validateRange rejects. */
export function durationMinutes(start: string, end: string): number {
  const error = validateRange(start, end);
  if (error) throw new RangeError(error);
  const from = parseTime(start) as number;
  const to = parseTime(end) as number;
  return to > from ? to - from : to + MINUTES_PER_DAY - from;
}

export function crossesMidnight(start: string, end: string): boolean {
  const from = parseTime(start);
  const to = parseTime(end);
  return from !== null && to !== null && to <= from;
}

/** "8 ч", "7,5 ч", "9,75 ч": whole hours stay whole, fractions use a decimal comma. */
export function formatHours(minutes: number): string {
  const hours = Math.round((minutes / 60) * 100) / 100;
  return `${String(hours).replace('.', ',')} ч`;
}

/** "08" for a round hour, "08:30" otherwise: the compact form used inside a cell. */
export function formatShortTime(time: string): string {
  return time.endsWith(':00') ? time.slice(0, 2) : time;
}

/** "08 - 18", "08:30 - 18". */
export function formatShortRange(start: string, end: string): string {
  return `${formatShortTime(start)} - ${formatShortTime(end)}`;
}

/** "07:00 - 15:00". */
export function formatRange(start: string, end: string): string {
  return `${start} - ${end}`;
}
