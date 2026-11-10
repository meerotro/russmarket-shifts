<script setup lang="ts">
import { useId } from 'vue';

withDefaults(defineProps<{ label: string; invalid?: boolean; disabled?: boolean }>(), {
  invalid: false,
  disabled: false,
});

/** "HH:MM", or an empty string while the field is incomplete. */
const model = defineModel<string>({ required: true });
const id = useId();
</script>

<template>
  <div class="ui-time" :class="{ 'is-invalid': invalid }">
    <label class="ui-time__label" :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      class="ui-time__input"
      type="time"
      :disabled="disabled"
      :aria-invalid="invalid"
    />
  </div>
</template>

<style scoped>
.ui-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ui-time__label {
  color: var(--c-text-3);
  font-size: var(--fs-2xs);
  line-height: 1.2;
}

.ui-time__input {
  width: 100%;
  height: var(--control-h);
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: var(--r-md);
  outline: 0;
  background: var(--c-neutral);
  color: var(--c-text-2);
  font-size: var(--fs-md);
  transition:
    border-color var(--ease),
    color var(--ease);
}

.ui-time__input:focus {
  border-color: var(--c-focus);
  color: var(--c-text);
}

.ui-time.is-invalid .ui-time__input {
  border-color: var(--c-danger);
}

/* The native clock button does not fit the compact field; typing and arrow keys still work. */
.ui-time__input::-webkit-calendar-picker-indicator {
  display: none;
}
</style>
