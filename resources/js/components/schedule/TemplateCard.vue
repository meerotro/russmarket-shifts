<script setup lang="ts">
import type { TemplateColor } from '@/api/types';

/** A shift template in the side panel: click to apply, or drag onto a cell. */
withDefaults(
  defineProps<{
    name: string;
    /** "07:00 - 15:00 · 8 ч" */
    details: string;
    color: TemplateColor;
    /** How many shifts of the visible period use the template. */
    count: number;
    draggable?: boolean;
  }>(),
  { draggable: true },
);
</script>

<template>
  <button
    class="template-card"
    :class="`template-card--${color}`"
    type="button"
    :draggable="draggable"
  >
    <span class="template-card__name">{{ name }}</span>
    <span class="template-card__details">{{ details }}</span>
    <span class="template-card__count" :aria-label="`Смен в периоде: ${count}`">{{ count }}</span>
  </button>
</template>

<style scoped>
.template-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  width: 100%;
  height: 50px;
  padding: 0 34px 0 14px;
  border: 0;
  border-radius: var(--r-md);
  background: var(--c-neutral);
  box-shadow: inset 3px 0 0 var(--stripe);
  color: var(--c-text);
  text-align: left;
  cursor: grab;
  transition: background-color var(--ease);
}

.template-card:hover {
  background: var(--c-neutral-hover);
}

.template-card:active {
  cursor: grabbing;
}

.template-card--blue {
  --stripe: var(--c-stripe-blue);
}

.template-card--purple {
  --stripe: var(--c-stripe-purple);
}

.template-card--mint {
  --stripe: var(--c-stripe-mint);
}

.template-card__name {
  font-size: var(--fs-sm);
  font-weight: 700;
  line-height: 1.25;
}

.template-card__details {
  font-size: var(--fs-sm);
  line-height: 1.25;
  white-space: nowrap;
}

.template-card__count {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--r-sm);
  background: var(--c-surface);
  font-size: var(--fs-2xs);
  font-weight: 600;
}
</style>
