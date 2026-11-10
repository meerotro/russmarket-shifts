<script setup lang="ts">
import type { TemplateColor } from '@/api/types';

import TemplateCard from './TemplateCard.vue';

export interface TemplateItem {
  id: number;
  name: string;
  details: string;
  color: TemplateColor;
  count: number;
}

/** Side panel: shift templates on top, the custom shift form (default slot) below. */
defineProps<{ templates: TemplateItem[] }>();

defineEmits<{
  pick: [templateId: number];
  'template-dragstart': [templateId: number, event: DragEvent];
  'template-dragend': [];
}>();
</script>

<template>
  <aside class="templates-panel" aria-label="Шаблоны смен">
    <section>
      <h2 class="templates-panel__title">Шаблоны смен</h2>
      <ul class="templates-panel__list">
        <li v-for="template in templates" :key="template.id">
          <TemplateCard
            :name="template.name"
            :details="template.details"
            :color="template.color"
            :count="template.count"
            :title="`Нажмите, чтобы поставить «${template.name}» в выделенные ячейки, или перетащите в ячейку`"
            @click="$emit('pick', template.id)"
            @dragstart="$emit('template-dragstart', template.id, $event)"
            @dragend="$emit('template-dragend')"
          />
        </li>
      </ul>
    </section>

    <section>
      <h2 class="templates-panel__title">Своя смена</h2>
      <slot />
    </section>
  </aside>
</template>

<style scoped>
.templates-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: var(--panel-w);
  padding: 14px 12px;
  border-radius: var(--r-lg);
  background: var(--c-surface);
  overflow-y: auto;
}

.templates-panel__title {
  margin-bottom: 8px;
  font-size: var(--fs-sm);
  font-weight: 500;
}

.templates-panel__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
