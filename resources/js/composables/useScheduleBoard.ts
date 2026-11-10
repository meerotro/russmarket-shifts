import { storeToRefs } from 'pinia';
import { computed, type Ref } from 'vue';

import type { IsoDate } from '@/api/types';
import type { GridShift } from '@/components/schedule/ScheduleGrid.vue';
import type { TemplateItem } from '@/components/schedule/TemplatesPanel.vue';
import { describeShift } from '@/lib/shiftView';
import { formatHours, formatRange } from '@/lib/time';
import { useScheduleStore } from '@/stores/schedule';

import { useCoverage } from './useCoverage';
import { useShiftDuration } from './useShiftDuration';

/**
 * Everything the schedule page displays, derived from the store for the visible days:
 * ready-to-draw shifts, coverage per day, hours per employee and template cards with counters.
 */
export function useScheduleBoard(days: Ref<IsoDate[]>) {
  const { shifts, templates, templatesById } = storeToRefs(useScheduleStore());

  const coverage = useCoverage(shifts, days);
  const { minutesByEmployee, usageByTemplate } = useShiftDuration(shifts, days);

  const gridShifts = computed(() => {
    const result = new Map<string, GridShift>();
    for (const [key, shift] of shifts.value) {
      result.set(key, { view: describeShift(shift, templatesById.value), pending: shift.pending });
    }
    return result;
  });

  const hours = computed(
    () => new Map([...minutesByEmployee.value].map(([id, minutes]) => [id, formatHours(minutes)])),
  );

  const templateItems = computed<TemplateItem[]>(() =>
    templates.value.map((template) => ({
      id: template.id,
      name: template.name,
      color: template.color,
      details: `${formatRange(template.start_time, template.end_time)} · ${formatHours(template.duration_minutes)}`,
      count: usageByTemplate.value.get(template.id) ?? 0,
    })),
  );

  return { gridShifts, coverage, hours, templateItems };
}
