<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'blue' | 'dark' | 'neutral' }>(), { tone: 'blue' });
</script>

<template>
  <span class="ui-badge" :class="`ui-badge--${tone}`"><slot /></span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: var(--r-pill);
  font-size: var(--fs-xs);
  font-weight: 500;
  white-space: nowrap;
}

.ui-badge--blue {
  background: var(--c-badge-blue);
  color: #fff;
}

.ui-badge--dark {
  background: var(--c-badge-dark);
  color: #fff;
}

.ui-badge--neutral {
  background: var(--c-neutral-hover);
  color: var(--c-text-2);
}
</style>
