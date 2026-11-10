<script setup lang="ts">
import type { CalendarView } from '@/lib/dates';
import UiButton from '@/ui/UiButton.vue';
import UiIcon from '@/ui/UiIcon.vue';
import UiSearchInput from '@/ui/UiSearchInput.vue';
import UiSegmented from '@/ui/UiSegmented.vue';

/** Search, the month/week switch and date navigation. */
defineProps<{ periodLabel: string; isCurrentPeriod: boolean }>();
defineEmits<{ previous: []; next: []; today: [] }>();

const search = defineModel<string>('search', { required: true });
const view = defineModel<CalendarView>('view', { required: true });

const VIEWS = [
  { value: 'month', label: 'Месяц' },
  { value: 'week', label: 'Неделя' },
] as const;
</script>

<template>
  <div class="schedule-toolbar">
    <UiSearchInput
      v-model="search"
      class="schedule-toolbar__search"
      placeholder="Поиск по ФИО"
      label="Поиск сотрудника по ФИО"
    />
    <UiSegmented v-model="view" :options="VIEWS" label="Период" />

    <div class="schedule-toolbar__dates">
      <UiButton
        variant="quaternary"
        size="sm"
        icon-only
        aria-label="Предыдущий период"
        @click="$emit('previous')"
      >
        <UiIcon name="chevron-left" :size="14" />
      </UiButton>
      <span class="schedule-toolbar__period" aria-live="polite">{{ periodLabel }}</span>
      <UiButton
        variant="quaternary"
        size="sm"
        icon-only
        aria-label="Следующий период"
        @click="$emit('next')"
      >
        <UiIcon name="chevron-right" :size="14" />
      </UiButton>
      <UiButton variant="quaternary" size="sm" :disabled="isCurrentPeriod" @click="$emit('today')">
        Сегодня
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.schedule-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
}

.schedule-toolbar__search {
  flex: 0 1 310px;
  min-width: 150px;
}

.schedule-toolbar__dates {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding-left: 6px;
}

.schedule-toolbar__period {
  min-width: 92px;
  padding: 0 2px;
  font-size: var(--fs-xs);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}
</style>
