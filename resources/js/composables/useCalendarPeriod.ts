import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  type CalendarView,
  daysOf,
  formatPeriod,
  isIsoDate,
  periodFor,
  shiftAnchor,
  todayIso,
} from '@/lib/dates';

/**
 * The visible period of the calendar. The view and the anchor date live in the URL query
 * (`?view=month&date=2026-11-10`), so a period can be bookmarked and survives a reload.
 */
export function useCalendarPeriod() {
  const route = useRoute();
  const router = useRouter();

  const anchor = computed(() => (isIsoDate(route.query.date) ? route.query.date : todayIso()));

  function update(patch: { view?: CalendarView; date?: string | undefined }): void {
    const query = { ...route.query, ...patch };
    // Defaults stay out of the URL.
    if (query.view === 'week') delete query.view;
    if (query.date === undefined || query.date === todayIso()) delete query.date;
    void router.replace({ query });
  }

  const view = computed<CalendarView>({
    get: () => (route.query.view === 'month' ? 'month' : 'week'),
    set: (next) => update({ view: next }),
  });

  const period = computed(() => periodFor(view.value, anchor.value));
  const days = computed(() => daysOf(period.value));
  const label = computed(() => formatPeriod(view.value, period.value));
  const isCurrent = computed(() => {
    const today = todayIso();
    return period.value.from <= today && today <= period.value.to;
  });

  return {
    view,
    period,
    days,
    label,
    isCurrent,
    next: () => update({ date: shiftAnchor(view.value, anchor.value, 1) }),
    previous: () => update({ date: shiftAnchor(view.value, anchor.value, -1) }),
    today: () => update({ date: undefined }),
  };
}
