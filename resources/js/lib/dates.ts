import type { IsoDate } from '@/api/types';

/**
 * Calendar-date helpers. Dates travel as "YYYY-MM-DD" strings and all arithmetic is done in UTC,
 * so daylight saving changes and the browser time zone can never shift a day.
 */

export type CalendarView = 'week' | 'month';

export interface Period {
  from: IsoDate;
  to: IsoDate;
}

const DAY_MS = 86_400_000;
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'] as const;
const MONTHS_NOMINATIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;
const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function toUtc(iso: IsoDate): Date {
  const match = ISO_PATTERN.exec(iso);
  if (!match) throw new RangeError(`Invalid date: ${iso}`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function fromUtc(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string' || !ISO_PATTERN.test(value)) return false;
  // Rejects impossible dates such as 2026-02-31, which Date would silently roll over.
  return fromUtc(toUtc(value)) === value;
}

/** Today in the time zone of the browser. */
export function todayIso(now: Date = new Date()): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return fromUtc(new Date(toUtc(iso).getTime() + days * DAY_MS));
}

/** First day of the month that is the given number of months away. */
export function addMonths(iso: IsoDate, months: number): IsoDate {
  const date = toUtc(iso);
  return fromUtc(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)));
}

/** Monday of the week that contains the date. */
export function startOfWeek(iso: IsoDate): IsoDate {
  const weekday = toUtc(iso).getUTCDay();
  return addDays(iso, weekday === 0 ? -6 : 1 - weekday);
}

export function startOfMonth(iso: IsoDate): IsoDate {
  return `${iso.slice(0, 8)}01`;
}

export function endOfMonth(iso: IsoDate): IsoDate {
  const date = toUtc(iso);
  return fromUtc(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}

/** The week (Mon-Sun) or the calendar month that contains the anchor date. */
export function periodFor(view: CalendarView, anchor: IsoDate): Period {
  if (view === 'week') {
    const from = startOfWeek(anchor);
    return { from, to: addDays(from, 6) };
  }
  return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

/** Anchor date of the neighbouring period. */
export function shiftAnchor(view: CalendarView, anchor: IsoDate, step: 1 | -1): IsoDate {
  return view === 'week' ? addDays(anchor, 7 * step) : addMonths(anchor, step);
}

/** Every date of the period, inclusive. */
export function daysOf(period: Period): IsoDate[] {
  const days: IsoDate[] = [];
  for (let day = period.from; day <= period.to; day = addDays(day, 1)) days.push(day);
  return days;
}

export function weekdayShort(iso: IsoDate): string {
  return WEEKDAYS_SHORT[toUtc(iso).getUTCDay()] as string;
}

export function dayOfMonth(iso: IsoDate): number {
  return Number(iso.slice(8, 10));
}

export function isWeekend(iso: IsoDate): boolean {
  const weekday = toUtc(iso).getUTCDay();
  return weekday === 0 || weekday === 6;
}

/** "Ноябрь 2026" for a month; "9 – 15 ноября 2026" or "30 ноября – 6 декабря 2026" for a week. */
export function formatPeriod(view: CalendarView, period: Period): string {
  const from = toUtc(period.from);
  const to = toUtc(period.to);

  if (view === 'month') {
    return `${MONTHS_NOMINATIVE[from.getUTCMonth()]} ${from.getUTCFullYear()}`;
  }

  const toLabel = `${to.getUTCDate()} ${MONTHS_GENITIVE[to.getUTCMonth()]} ${to.getUTCFullYear()}`;
  const fromLabel =
    from.getUTCMonth() === to.getUTCMonth()
      ? String(from.getUTCDate())
      : `${from.getUTCDate()} ${MONTHS_GENITIVE[from.getUTCMonth()]}`;

  return `${fromLabel} – ${toLabel}`;
}
