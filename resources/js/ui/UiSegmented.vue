<script setup lang="ts" generic="T extends string">
defineProps<{ options: readonly { value: T; label: string }[]; label: string }>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <div class="ui-segmented" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      class="ui-segmented__item"
      :class="{ 'is-selected': option.value === model }"
      type="button"
      role="radio"
      :aria-checked="option.value === model"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.ui-segmented {
  display: inline-flex;
  height: var(--control-h);
  border-radius: var(--r-md);
  background: var(--c-neutral);
}

.ui-segmented__item {
  min-width: 117px;
  padding: 0 16px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--c-text);
  font-size: var(--fs-md);
  font-weight: 600;
  transition:
    background-color var(--ease),
    color var(--ease);
}

.ui-segmented__item:hover:not(.is-selected) {
  background: var(--c-neutral-hover);
}

.ui-segmented__item.is-selected {
  background: var(--c-dark-hover);
  color: #fff;
}
</style>
