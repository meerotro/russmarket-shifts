import { computed, type ComputedRef, type Ref } from 'vue';

import type { IsoDate } from '@/api/types';
import { parseCellKey } from '@/lib/cellKey';

/**
 * How many shifts fall on each visible day. Purely derived from the shifts map, so the footer
 * row updates the moment a shift is added or removed; there is no separate state to keep in sync.
 */
export function useCoverage(
  shifts: Ref<ReadonlyMap<string, unknown>>,
  days: Ref<IsoDate[]>,
): ComputedRef<Map<IsoDate, number>> {
  return computed(() => {
    const coverage = new Map<IsoDate, number>(days.value.map((day) => [day, 0]));

    for (const key of shifts.value.keys()) {
      const { date } = parseCellKey(key);
      const count = coverage.get(date);
      if (count !== undefined) coverage.set(date, count + 1);
    }

    return coverage;
  });
}
