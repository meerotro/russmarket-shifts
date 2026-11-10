import { describe, expect, it } from 'vitest';

import {
  addDays,
  daysOf,
  formatPeriod,
  isIsoDate,
  periodFor,
  shiftAnchor,
  startOfWeek,
  weekdayShort,
} from './dates';

describe('periodFor', () => {
  it('returns Monday to Sunday for a week', () => {
    expect(periodFor('week', '2026-11-10')).toEqual({ from: '2026-11-09', to: '2026-11-15' });
  });

  it('puts Sunday into the week that started on the previous Monday', () => {
    expect(startOfWeek('2026-11-15')).toBe('2026-11-09');
    expect(startOfWeek('2026-11-09')).toBe('2026-11-09');
  });

  it('returns the whole calendar month', () => {
    expect(periodFor('month', '2026-11-10')).toEqual({ from: '2026-11-01', to: '2026-11-30' });
    expect(periodFor('month', '2028-02-15')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
});

describe('navigation', () => {
  it('moves by a week', () => {
    expect(shiftAnchor('week', '2026-12-29', 1)).toBe('2027-01-05');
    expect(shiftAnchor('week', '2026-11-10', -1)).toBe('2026-11-03');
  });

  it('moves by a month without skipping short months', () => {
    expect(shiftAnchor('month', '2026-01-31', 1)).toBe('2026-02-01');
    expect(shiftAnchor('month', '2026-01-15', -1)).toBe('2025-12-01');
  });

  it('crosses a daylight saving change without losing a day', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
  });
});

describe('daysOf', () => {
  it('lists every day of the period', () => {
    const days = daysOf(periodFor('week', '2026-11-10'));
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2026-11-09');
    expect(days[6]).toBe('2026-11-15');
    expect(days.map(weekdayShort)).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']);
    expect(daysOf(periodFor('month', '2026-11-10'))).toHaveLength(30);
  });
});

describe('formatPeriod', () => {
  it('names a month', () => {
    expect(formatPeriod('month', periodFor('month', '2026-11-10'))).toBe('Ноябрь 2026');
  });

  it('prints a week inside one month and across two', () => {
    expect(formatPeriod('week', periodFor('week', '2026-11-10'))).toBe('9 – 15 ноября 2026');
    expect(formatPeriod('week', periodFor('week', '2026-12-01'))).toBe(
      '30 ноября – 6 декабря 2026',
    );
  });
});

describe('isIsoDate', () => {
  it('accepts real dates only', () => {
    expect(isIsoDate('2026-11-10')).toBe(true);
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('10.11.2026')).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});
