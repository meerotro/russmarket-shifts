<script setup lang="ts">
import { ref } from 'vue';

import UiIcon from './UiIcon.vue';

withDefaults(defineProps<{ variant?: 'grey' | 'white'; placeholder?: string; label?: string }>(), {
  variant: 'grey',
  placeholder: 'Поиск',
  label: 'Поиск',
});

const model = defineModel<string>({ required: true });
const input = ref<HTMLInputElement | null>(null);

function clear(): void {
  model.value = '';
  input.value?.focus();
}
</script>

<template>
  <label class="ui-search" :class="`ui-search--${variant}`">
    <UiIcon name="search" class="ui-search__icon" />
    <input
      ref="input"
      v-model="model"
      class="ui-search__input"
      type="text"
      autocomplete="off"
      spellcheck="false"
      :placeholder="placeholder"
      :aria-label="label"
      @keydown.esc="model !== '' && (clear(), $event.stopPropagation())"
    />
    <button
      v-if="model !== ''"
      class="ui-search__clear"
      type="button"
      aria-label="Очистить поиск"
      @click="clear"
    >
      <UiIcon name="close" />
    </button>
  </label>
</template>

<style scoped>
.ui-search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--control-h);
  padding: 0 8px 0 12px;
  border: 1px solid transparent;
  border-radius: var(--r-md);
  background: var(--c-neutral);
  cursor: text;
  transition: border-color var(--ease);
}

.ui-search--white {
  background: var(--c-surface);
}

.ui-search:focus-within {
  border-color: var(--c-focus);
}

.ui-search__icon {
  color: var(--c-text-3);
}

.ui-search__input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--c-text);
  font-size: var(--fs-md);
}

.ui-search__input::placeholder {
  color: var(--c-text-2);
}

.ui-search__clear {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--c-text-2);
}

.ui-search__clear:hover {
  background: var(--c-neutral-hover);
  color: var(--c-text);
}
</style>
