<script setup lang="ts">
import UiButton from '@/ui/UiButton.vue';
import UiIcon from '@/ui/UiIcon.vue';
import UiTimeInput from '@/ui/UiTimeInput.vue';

/** Start and end of a custom shift. Validation is done by the caller and passed in as `error`. */
withDefaults(
  defineProps<{
    /** Why the times cannot form a shift; null when they can. */
    error?: string | null;
    /** Shown under the fields when there is no error, e.g. the shift length. */
    hint?: string | null;
    canSubmit?: boolean;
    submitLabel?: string;
  }>(),
  { error: null, hint: null, canSubmit: true, submitLabel: 'Поставить в выделенные' },
);

defineEmits<{ submit: [] }>();

const start = defineModel<string>('start', { required: true });
const end = defineModel<string>('end', { required: true });
</script>

<template>
  <form class="custom-shift" @submit.prevent="$emit('submit')">
    <div class="custom-shift__fields">
      <UiTimeInput v-model="start" label="Начало" :invalid="error !== null" />
      <UiTimeInput v-model="end" label="Конец" :invalid="error !== null" />
    </div>
    <p v-if="error" class="custom-shift__note custom-shift__note--error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="custom-shift__note">{{ hint }}</p>
    <UiButton
      type="submit"
      variant="secondary"
      theme="blue"
      block
      :disabled="!canSubmit || error !== null"
    >
      <template #icon-left><UiIcon name="plus" :size="14" /></template>
      {{ submitLabel }}
    </UiButton>
  </form>
</template>

<style scoped>
.custom-shift {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-shift__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.custom-shift__note {
  color: var(--c-text-2);
  font-size: var(--fs-2xs);
  line-height: 1.3;
}

.custom-shift__note--error {
  color: var(--c-danger);
}
</style>
