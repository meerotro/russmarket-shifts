/** Shapes of the JSON API. Field names match the backend resources one to one. */

/** "YYYY-MM-DD" */
export type IsoDate = string;
/** "HH:MM" */
export type ClockTime = string;

export type TemplateColor = 'blue' | 'purple' | 'mint';

export interface Employee {
  id: number;
  full_name: string;
  position: string;
  avatar_url: string | null;
}

export interface ShiftTemplate {
  id: number;
  name: string;
  start_time: ClockTime;
  end_time: ClockTime;
  duration_minutes: number;
  color: TemplateColor;
}

/** What identifies a shift: there is at most one per employee per day. */
export interface ShiftKey {
  employee_id: number;
  date: IsoDate;
}

/** A shift as the client sends it. `template_id: null` is a custom shift. */
export interface ShiftInput extends ShiftKey {
  start_time: ClockTime;
  end_time: ClockTime;
  template_id: number | null;
}

/** A shift as the server stores it. */
export interface Shift extends ShiftInput {
  id: number;
  duration_minutes: number;
}

/** One batch for PUT /api/shifts: applied in a single transaction. */
export interface ShiftChangeset {
  upsert: ShiftInput[];
  delete: ShiftKey[];
}

export interface Collection<T> {
  data: T[];
}

export interface ShiftsResponse extends Collection<Shift> {
  meta: { from: IsoDate; to: IsoDate; published_days: IsoDate[] };
}

export interface SaveShiftsResponse extends Collection<Shift> {
  meta: { unpublished_days: IsoDate[] };
}

export interface PublishResponse {
  data: { from: IsoDate; to: IsoDate; published_days: IsoDate[] };
}
