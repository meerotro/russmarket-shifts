<script setup lang="ts">
import type { Employee, IsoDate } from '@/api/types';
import { cellKey, type CellRef } from '@/lib/cellKey';
import { type CalendarView, dayOfMonth, weekdayShort } from '@/lib/dates';
import type { ShiftView } from '@/lib/shiftView';

import CoverageCell from './CoverageCell.vue';
import EmployeeCell from './EmployeeCell.vue';
import ShiftCell from './ShiftCell.vue';

/** A shift ready to be drawn, plus whether it is still an unsaved draft. */
export interface GridShift {
  view: ShiftView;
  pending: boolean;
}

/**
 * The employees × days table. It draws what it is given and reports what the user does with
 * cells and dates; selection, assignment and drag-and-drop rules live in the page and the store.
 */
defineProps<{
  view: CalendarView;
  employees: Employee[];
  days: IsoDate[];
  /** Shifts by cell key. */
  shifts: ReadonlyMap<string, GridShift>;
  selected: ReadonlySet<string>;
  errors: ReadonlyMap<string, string>;
  coverage: ReadonlyMap<IsoDate, number>;
  /** Formatted hours per employee id, e.g. "24 ч". */
  hours: ReadonlyMap<number, string>;
  /** Key of the cell under a dragged item. */
  dropKey: string | null;
  today: IsoDate;
}>();

const emit = defineEmits<{
  'cell-pointerdown': [cell: CellRef, event: PointerEvent];
  'cell-pointerenter': [cell: CellRef];
  'cell-click': [cell: CellRef, element: HTMLElement, event: MouseEvent];
  'cell-dragover': [cell: CellRef, event: DragEvent];
  'cell-dragleave': [cell: CellRef];
  'cell-drop': [cell: CellRef, event: DragEvent];
  'shift-dragstart': [cell: CellRef, event: DragEvent];
  'shift-dragend': [];
  'day-click': [date: IsoDate, element: HTMLElement];
}>();
</script>

<template>
  <div class="schedule-grid" :class="`schedule-grid--${view}`" :style="{ '--cols': days.length }">
    <div class="schedule-grid__row schedule-grid__row--head">
      <div class="schedule-grid__corner">Сотрудник</div>
      <button
        v-for="day in days"
        :key="day"
        class="schedule-grid__day"
        :class="{ 'is-today': day === today }"
        type="button"
        :title="`Назначить смену на ${dayOfMonth(day)} число`"
        @click="emit('day-click', day, $event.currentTarget as HTMLElement)"
      >
        <span>{{ weekdayShort(day) }}</span>
        <span>{{ dayOfMonth(day) }}</span>
      </button>
    </div>

    <div class="schedule-grid__body">
      <div
        v-for="(employee, index) in employees"
        :key="employee.id"
        class="schedule-grid__row"
        :class="{ 'schedule-grid__row--alt': index % 2 === 1 }"
      >
        <EmployeeCell
          class="schedule-grid__employee"
          :name="employee.full_name"
          :position="employee.position"
          :avatar-url="employee.avatar_url"
          :hours="hours.get(employee.id) ?? '0 ч'"
        />
        <ShiftCell
          v-for="day in days"
          :key="day"
          :view="view"
          :shift="shifts.get(cellKey(employee.id, day))?.view"
          :pending="shifts.get(cellKey(employee.id, day))?.pending"
          :selected="selected.has(cellKey(employee.id, day))"
          :error="errors.get(cellKey(employee.id, day))"
          :drop-target="dropKey === cellKey(employee.id, day)"
          @pointerdown="emit('cell-pointerdown', { employeeId: employee.id, date: day }, $event)"
          @pointerenter="emit('cell-pointerenter', { employeeId: employee.id, date: day })"
          @click="
            emit(
              'cell-click',
              { employeeId: employee.id, date: day },
              $event.currentTarget as HTMLElement,
              $event,
            )
          "
          @dragover="emit('cell-dragover', { employeeId: employee.id, date: day }, $event)"
          @dragleave="emit('cell-dragleave', { employeeId: employee.id, date: day })"
          @drop="emit('cell-drop', { employeeId: employee.id, date: day }, $event)"
          @shift-dragstart="emit('shift-dragstart', { employeeId: employee.id, date: day }, $event)"
          @shift-dragend="emit('shift-dragend')"
        />
      </div>

      <slot name="state" />
    </div>

    <div class="schedule-grid__row schedule-grid__row--foot">
      <div class="schedule-grid__corner">Покрытие</div>
      <CoverageCell v-for="day in days" :key="day" :count="coverage.get(day) ?? 0" />
    </div>
  </div>
</template>

<style scoped>
.schedule-grid {
  --col-w: calc(var(--cell-w-week) + var(--cell-gap));
  --col-track: minmax(var(--col-w), 1fr);

  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  /* Rows never wrap: in the month view the grid scrolls sideways under a fixed first column. */
  overscroll-behavior: contain;
}

.schedule-grid--month {
  --col-w: calc(var(--cell-w-month) + var(--cell-gap));
  --col-track: var(--col-w);
}

.schedule-grid__body {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  min-width: max-content;
}

.schedule-grid__row {
  display: grid;
  grid-template-columns: var(--grid-employee-w) repeat(var(--cols), var(--col-track));
  min-width: max-content;
  background: var(--c-surface);
}

.schedule-grid__row--alt {
  background: var(--c-row-alt);
}

.schedule-grid__row--head {
  position: sticky;
  top: 0;
  z-index: 4;
  height: var(--grid-head-h);
  border-bottom: 1px solid var(--c-line);
}

.schedule-grid__row--foot {
  position: sticky;
  bottom: 0;
  z-index: 4;
  flex: none;
  border-top: 1px solid var(--c-line);
}

.schedule-grid__corner,
.schedule-grid__employee {
  position: sticky;
  left: 0;
  z-index: 3;
  background: inherit;
}

.schedule-grid__corner {
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: var(--c-text-2);
  font-size: var(--fs-sm);
}

.schedule-grid__day {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--c-text-2);
  font-size: var(--fs-sm);
  transition:
    background-color var(--ease),
    color var(--ease);
}

.schedule-grid__day:hover {
  background: var(--c-neutral);
  color: var(--c-text);
}

.schedule-grid__day.is-today {
  color: var(--c-blue);
  font-weight: 700;
}

.schedule-grid--month .schedule-grid__day {
  flex-direction: column;
  gap: 0;
  font-size: var(--fs-xs);
  line-height: 1.3;
}
</style>
