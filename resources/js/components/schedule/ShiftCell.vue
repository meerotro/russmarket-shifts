<script setup lang="ts">
import type { CalendarView } from '@/lib/dates';
import type { ShiftView } from '@/lib/shiftView';
import UiIcon from '@/ui/UiIcon.vue';

/**
 * One slot of the grid: empty, selected ("+"), or holding a shift. In the month view only the
 * duration is shown. Purely presentational: pointer handling belongs to the grid.
 */
withDefaults(
  defineProps<{
    view: CalendarView;
    shift?: ShiftView | null;
    selected?: boolean;
    /** The shift exists only in the local draft. */
    pending?: boolean;
    /** A dragged item is over this slot. */
    dropTarget?: boolean;
    /** Validation message from the server for this cell. */
    error?: string | null;
  }>(),
  { shift: null, selected: false, pending: false, dropTarget: false, error: null },
);

defineEmits<{ 'shift-dragstart': [event: DragEvent]; 'shift-dragend': [] }>();
</script>

<template>
  <div
    class="shift-cell"
    :class="[
      `shift-cell--${view}`,
      { 'is-selected': selected, 'is-drop-target': dropTarget, 'has-error': error },
    ]"
    :title="error ?? shift?.title"
  >
    <div
      v-if="shift"
      class="shift-cell__shift"
      :class="[`tone-${shift.tone}`, { 'is-pending': pending }]"
      draggable="true"
      @dragstart="$emit('shift-dragstart', $event)"
      @dragend="$emit('shift-dragend')"
    >
      <template v-if="view === 'week'">
        <span class="shift-cell__time">{{ shift.time }}</span>
        <span class="shift-cell__hours">{{ shift.hours }}</span>
      </template>
      <span v-else class="shift-cell__hours shift-cell__hours--only">{{ shift.hours }}</span>
    </div>
    <div v-else class="shift-cell__empty">
      <span v-if="selected" class="shift-cell__plus"><UiIcon name="plus" :size="10" /></span>
    </div>
  </div>
</template>

<style scoped>
.shift-cell {
  position: relative;
  height: var(--grid-row-h);
  padding: calc(var(--cell-gap) / 2);
  cursor: pointer;
  user-select: none;
}

/* The selection fills the whole slot; half-pixel shadows merge into one line between neighbours. */
.shift-cell.is-selected {
  z-index: 1;
  background: var(--c-select-bg);
  box-shadow:
    inset 0 0 0 0.5px var(--c-select-line),
    0 0 0 0.5px var(--c-select-line);
}

.shift-cell.is-drop-target::after,
.shift-cell.has-error::after {
  content: '';
  position: absolute;
  inset: 1px;
  border: 2px dashed var(--c-blue);
  border-radius: var(--r-md);
  pointer-events: none;
}

.shift-cell.has-error::after {
  border: 2px solid var(--c-danger);
}

.shift-cell__empty,
.shift-cell__shift {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: var(--r-md);
}

.shift-cell__empty {
  border: 1px dashed var(--c-dash);
}

.shift-cell:hover .shift-cell__empty {
  border-color: var(--c-select-line);
}

.shift-cell.is-selected .shift-cell__empty {
  border-color: transparent;
}

.shift-cell__plus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--c-blue);
  color: #fff;
}

.shift-cell__shift {
  position: relative;
  gap: 1px;
  background: var(--tone-bg);
  cursor: grab;
}

.shift-cell__shift:active {
  cursor: grabbing;
}

.shift-cell__shift.is-pending::after {
  content: '';
  position: absolute;
  top: 5px;
  right: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--tone-fg);
}

.shift-cell__time {
  color: var(--tone-text, var(--c-text));
  font-size: var(--fs-sm);
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}

.shift-cell__hours {
  color: var(--tone-fg);
  font-size: var(--fs-2xs);
  line-height: 1.2;
}

.shift-cell__hours--only {
  font-size: var(--fs-sm);
  font-weight: 600;
}

.tone-blue {
  --tone-bg: var(--c-shift-blue-bg);
  --tone-fg: var(--c-shift-blue-fg);
}

.tone-purple {
  --tone-bg: var(--c-shift-purple-bg);
  --tone-fg: var(--c-shift-purple-fg);
}

.tone-mint {
  --tone-bg: var(--c-shift-mint-bg);
  --tone-fg: var(--c-shift-mint-fg);
}

.tone-solid {
  --tone-bg: var(--c-shift-solid-bg);
  --tone-fg: var(--c-shift-solid-sub);
  --tone-text: var(--c-shift-solid-fg);
}

.tone-solid .shift-cell__hours--only {
  color: var(--c-shift-solid-fg);
}
</style>
