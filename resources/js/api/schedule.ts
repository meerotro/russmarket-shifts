import { http } from './client';
import type {
  Collection,
  Employee,
  IsoDate,
  PublishResponse,
  SaveShiftsResponse,
  ShiftChangeset,
  ShiftsResponse,
  ShiftTemplate,
} from './types';

/** Typed endpoints of the schedule API. */
export const scheduleApi = {
  employees: (search: string, signal?: AbortSignal) =>
    http.get<Collection<Employee>>('/employees', { query: { search }, signal }),

  templates: () => http.get<Collection<ShiftTemplate>>('/shift-templates'),

  shifts: (from: IsoDate, to: IsoDate, signal?: AbortSignal) =>
    http.get<ShiftsResponse>('/shifts', { query: { from, to }, signal }),

  saveShifts: (changeset: ShiftChangeset) => http.put<SaveShiftsResponse>('/shifts', changeset),

  publish: (from: IsoDate, to: IsoDate) =>
    http.post<PublishResponse>('/schedule/publish', { from, to }),
};

export type ScheduleApi = typeof scheduleApi;
