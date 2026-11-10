<script setup lang="ts">
import UiMenu from '@/ui/UiMenu.vue';
import UiMenuItem from '@/ui/UiMenuItem.vue';

import type { TemplateItem } from './TemplatesPanel.vue';

/** Quick shift picker shown for a cell, a whole day or the current selection. */
withDefaults(
  defineProps<{
    templates: TemplateItem[];
    /** Details of the custom shift from the side panel, e.g. "09:00 - 17:00 · 8 ч"; null hides the item. */
    customDetails?: string | null;
    /** Label of the remove action; null hides it. */
    clearLabel?: string | null;
  }>(),
  { customDetails: null, clearLabel: null },
);

defineEmits<{ template: [templateId: number]; custom: []; clear: [] }>();
</script>

<template>
  <UiMenu>
    <UiMenuItem
      v-for="template in templates"
      :key="template.id"
      @click="$emit('template', template.id)"
    >
      <template #lead
        ><span class="quick-assign__dot" :class="`quick-assign__dot--${template.color}`"
      /></template>
      {{ template.name }}
      <template #hint>{{ template.details }}</template>
    </UiMenuItem>

    <template v-if="customDetails">
      <hr />
      <UiMenuItem @click="$emit('custom')">
        <template #lead><span class="quick-assign__dot quick-assign__dot--solid" /></template>
        Своя смена
        <template #hint>{{ customDetails }}</template>
      </UiMenuItem>
    </template>

    <template v-if="clearLabel">
      <hr />
      <UiMenuItem danger @click="$emit('clear')">{{ clearLabel }}</UiMenuItem>
    </template>
  </UiMenu>
</template>

<style scoped>
.quick-assign__dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.quick-assign__dot--blue {
  background: var(--c-stripe-blue);
}

.quick-assign__dot--purple {
  background: var(--c-stripe-purple);
}

.quick-assign__dot--mint {
  background: var(--c-stripe-mint);
}

.quick-assign__dot--solid {
  background: var(--c-blue);
}
</style>
