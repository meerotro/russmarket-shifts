import { describe, expect, it } from 'vitest';

import {
  crossesMidnight,
  durationMinutes,
  formatHours,
  formatShortRange,
  parseTime,
  validateRange,
} from './time';

describe('parseTime', () => {
  it('reads HH:MM as minutes since midnight', () => {
    expect(parseTime('00:00')).toBe(0);
    expect(parseTime('07:30')).toBe(450);
    expect(parseTime('23:59')).toBe(1439);
  });

  it.each(['', '7:00', '24:00', '12:60', '12-00', '12:00:00'])('rejects %j', (value) => {
    expect(parseTime(value)).toBeNull();
  });
});

describe('durationMinutes', () => {
  it.each([
    ['07:00', '15:00', 480],
    ['15:00', '23:00', 480],
    ['08:30', '18:15', 585],
  ])('measures a daytime shift %s-%s', (start, end, minutes) => {
    expect(durationMinutes(start, end)).toBe(minutes);
    expect(crossesMidnight(start, end)).toBe(false);
  });

  it.each([
    ['22:00', '06:00', 480],
    ['16:00', '00:00', 480],
    ['12:00', '11:59', 1439],
  ])('treats %s-%s as ending on the next day', (start, end, minutes) => {
    expect(durationMinutes(start, end)).toBe(minutes);
    expect(crossesMidnight(start, end)).toBe(true);
  });

  it('refuses a shift that starts and ends at the same minute', () => {
    expect(() => durationMinutes('09:00', '09:00')).toThrow(RangeError);
  });
});

describe('validateRange', () => {
  it('accepts day and night ranges', () => {
    expect(validateRange('09:00', '17:00')).toBeNull();
    expect(validateRange('22:00', '06:00')).toBeNull();
  });

  it('explains what is wrong', () => {
    expect(validateRange('', '17:00')).toBe('Укажите время начала');
    expect(validateRange('09:00', '')).toBe('Укажите время окончания');
    expect(validateRange('09:00', '09:00')).toBe('Начало и конец смены не могут совпадать');
  });
});

describe('formatting', () => {
  it('prints whole and fractional hours', () => {
    expect(formatHours(480)).toBe('8 ч');
    expect(formatHours(450)).toBe('7,5 ч');
    expect(formatHours(585)).toBe('9,75 ч');
    expect(formatHours(0)).toBe('0 ч');
  });

  it('drops the minutes of round hours in a cell', () => {
    expect(formatShortRange('08:00', '18:00')).toBe('08 - 18');
    expect(formatShortRange('08:30', '18:00')).toBe('08:30 - 18');
  });
});
