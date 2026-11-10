import { computed, type ComputedRef, type Ref } from 'vue';

import type { ClockTime, IsoDate } from '@/api/types';
import { parseCellKey } from '@/lib/cellKey';
import { durationMinutes } from '@/lib/time';

interface TimedShift {
  start_time: ClockTime;
  end_time: ClockTime;
  template_id: number | null;
}

/**
 * Totals derived from the shifts of the visible period:
 *  - minutes worked per employee (the "агент · 24 ч" line);
 *  - how many shifts use each template (the counter on a template card).
 */
export function useShiftDuration(
  shifts: Ref<ReadonlyMap<string, TimedShift>>,
  days: Ref<IsoDate[]>,
): {
  minutesByEmployee: ComputedRef<Map<number, number>>;
  usageByTemplate: ComputedRef<Map<number, number>>;
} {
  const visible = computed(() => {
    const dates = new Set(days.value);
    return [...shifts.value].flatMap(([key, shift]) => {
      const { employeeId, date } = parseCellKey(key);
      return dates.has(date) ? [{ employeeId, shift }] : [];
    });
  });

  const minutesByEmployee = computed(() => {
    const totals = new Map<number, number>();
    for (const { employeeId, shift } of visible.value) {
      const minutes = durationMinutes(shift.start_time, shift.end_time);
      totals.set(employeeId, (totals.get(employeeId) ?? 0) + minutes);
    }
    return totals;
  });

  const usageByTemplate = computed(() => {
    const usage = new Map<number, number>();
    for (const { shift } of visible.value) {
      if (shift.template_id === null) continue;
      usage.set(shift.template_id, (usage.get(shift.template_id) ?? 0) + 1);
    }
    return usage;
  });

  return { minutesByEmployee, usageByTemplate };
}
