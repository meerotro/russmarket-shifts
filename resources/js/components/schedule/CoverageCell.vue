<script setup lang="ts">
/** Number of shifts on a day: pink while nobody is assigned, blue once somebody is. */
defineProps<{ count: number }>();
</script>

<template>
  <div class="coverage-cell" :class="count > 0 ? 'is-covered' : 'is-empty'">{{ count }}</div>
</template>

<style scoped>
.coverage-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--grid-foot-h);
  font-size: var(--fs-sm);
  font-weight: 500;
  transition:
    background-color var(--ease),
    color var(--ease);
}

.coverage-cell.is-empty {
  background: var(--c-cover-empty-bg);
  color: var(--c-cover-empty-fg);
}

.coverage-cell.is-covered {
  background: var(--c-cover-ok-bg);
  color: var(--c-cover-ok-fg);
}
</style>
