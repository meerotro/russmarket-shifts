<script setup lang="ts">
withDefaults(defineProps<{ danger?: boolean; disabled?: boolean }>(), {
  danger: false,
  disabled: false,
});
</script>

<template>
  <button
    class="ui-menu-item"
    :class="{ 'is-danger': danger }"
    type="button"
    role="menuitem"
    :disabled="disabled"
  >
    <slot name="lead" />
    <span class="ui-menu-item__label"><slot /></span>
    <span v-if="$slots.hint" class="ui-menu-item__hint"><slot name="hint" /></span>
  </button>
</template>

<style scoped>
.ui-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 4px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--c-text);
  font-size: var(--fs-sm);
  font-weight: 500;
  text-align: left;
}

.ui-menu-item:hover:not(:disabled),
.ui-menu-item:focus-visible {
  background: var(--c-neutral);
}

.ui-menu-item:disabled {
  color: var(--c-text-disabled);
  cursor: not-allowed;
}

.ui-menu-item.is-danger:not(:disabled) {
  color: var(--c-danger);
}

.ui-menu-item__label {
  flex: 1;
}

.ui-menu-item__hint {
  color: var(--c-text-2);
  font-weight: 400;
  white-space: nowrap;
}
</style>
