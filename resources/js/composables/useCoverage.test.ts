import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import { useCoverage } from './useCoverage';
import { useShiftDuration } from './useShiftDuration';

const DAYS = ['2026-11-09', '2026-11-10', '2026-11-11'];
const shift = (start: string, end: string, template_id: number | null = null) => ({
  start_time: start,
  end_time: end,
  template_id,
});

describe('useCoverage', () => {
  it('counts shifts per visible day and reacts to changes', () => {
    const shifts = ref(new Map([['1:2026-11-09', shift('07:00', '15:00')]]));
    const coverage = useCoverage(shifts, ref(DAYS));

    expect([...coverage.value]).toEqual([
      ['2026-11-09', 1],
      ['2026-11-10', 0],
      ['2026-11-11', 0],
    ]);

    shifts.value.set('2:2026-11-09', shift('10:00', '18:00'));
    shifts.value.set('2:2026-11-11', shift('10:00', '18:00'));
    expect(coverage.value.get('2026-11-09')).toBe(2);
    expect(coverage.value.get('2026-11-11')).toBe(1);

    shifts.value.delete('1:2026-11-09');
    expect(coverage.value.get('2026-11-09')).toBe(1);
  });

  it('ignores shifts outside the visible days', () => {
    const shifts = ref(new Map([['1:2026-12-01', shift('07:00', '15:00')]]));
    const coverage = useCoverage(shifts, ref(DAYS));

    expect([...coverage.value.values()]).toEqual([0, 0, 0]);
  });
});

describe('useShiftDuration', () => {
  it('sums hours per employee, including shifts past midnight', () => {
    const shifts = ref(
      new Map([
        ['1:2026-11-09', shift('07:00', '15:00', 1)],
        ['1:2026-11-10', shift('22:00', '06:00')],
        ['2:2026-11-10', shift('10:00', '18:30', 2)],
        ['2:2026-12-01', shift('10:00', '18:00', 2)],
      ]),
    );
    const { minutesByEmployee, usageByTemplate } = useShiftDuration(shifts, ref(DAYS));

    expect(minutesByEmployee.value.get(1)).toBe(960);
    expect(minutesByEmployee.value.get(2)).toBe(510);
    expect([...usageByTemplate.value]).toEqual([
      [1, 1],
      [2, 1],
    ]);
  });
});
