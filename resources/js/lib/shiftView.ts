import type { ClockTime, ShiftTemplate } from '@/api/types';

import { durationMinutes, formatHours, formatShortRange } from './time';

/** Colour of a shift cell: a template colour, or `solid` for a custom shift. */
export type ShiftTone = 'blue' | 'purple' | 'mint' | 'solid';

/** Everything a cell needs to draw a shift; no calculations are left for the component. */
export interface ShiftView {
  /** "08 - 18" */
  time: string;
  /** "10 ч" */
  hours: string;
  tone: ShiftTone;
  /** Full description for the tooltip, e.g. "День · 10:00 - 18:00 · 8 ч". */
  title: string;
}

interface ShiftLike {
  start_time: ClockTime;
  end_time: ClockTime;
  template_id: number | null;
}

export function describeShift(
  shift: ShiftLike,
  templates: ReadonlyMap<number, ShiftTemplate>,
): ShiftView {
  const template = shift.template_id === null ? undefined : templates.get(shift.template_id);
  const hours = formatHours(durationMinutes(shift.start_time, shift.end_time));

  return {
    time: formatShortRange(shift.start_time, shift.end_time),
    hours,
    // A shift whose template no longer exists is shown as a custom one.
    tone: template?.color ?? 'solid',
    title: `${template?.name ?? 'Своя смена'} · ${shift.start_time} - ${shift.end_time} · ${hours}`,
  };
}
