<script setup lang="ts">
import { computed } from 'vue';

import { plural } from '@/lib/plural';
import UiIcon from '@/ui/UiIcon.vue';

const props = defineProps<{
  cells: number;
  employees: number;
  days: number;
  /** "Изменить" and "Очистить" need at least one selected shift. */
  hasShifts: boolean;
}>();

/** Menu-opening actions pass their button so the page can anchor a popover to it. */
defineEmits<{
  'apply-template': [anchor: HTMLElement];
  edit: [anchor: HTMLElement];
  clear: [];
  deselect: [];
}>();

const cellsLabel = computed(
  () => `${props.cells} ${plural(props.cells, ['ячейка', 'ячейки', 'ячеек'])}`,
);
const employeesLabel = computed(
  () => `${props.employees} ${plural(props.employees, ['сотрудник', 'сотрудника', 'сотрудников'])}`,
);
</script>

<template>
  <div class="selection-bar" role="toolbar" aria-label="Действия с выделенными ячейками">
    <span class="selection-bar__summary">
      Выделено:
      <span class="selection-bar__chip">{{ cellsLabel }}</span>
      {{ employeesLabel }} · {{ days }} дн.
    </span>

    <button
      class="selection-bar__action"
      type="button"
      @click="$emit('apply-template', $event.currentTarget as HTMLElement)"
    >
      <UiIcon name="grid" :size="14" /> Применить шаблон
    </button>
    <button
      class="selection-bar__action"
      type="button"
      :disabled="!hasShifts"
      @click="$emit('edit', $event.currentTarget as HTMLElement)"
    >
      <UiIcon name="edit" :size="14" /> Изменить
    </button>
    <button
      class="selection-bar__action"
      type="button"
      :disabled="!hasShifts"
      @click="$emit('clear')"
    >
      <UiIcon name="trash" :size="14" /> Очистить
    </button>
    <button class="selection-bar__action" type="button" @click="$emit('deselect')">
      <UiIcon name="close" :size="14" /> Снять
    </button>
  </div>
</template>

<style scoped>
.selection-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  padding: 0 6px 0 10px;
  border-radius: var(--r-md);
  background: var(--c-dark-hover);
  color: #fff;
  font-size: var(--fs-xs);
}

.selection-bar__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: auto;
  white-space: nowrap;
}

.selection-bar__chip {
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: var(--c-dark-chip);
}

.selection-bar__action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: var(--fs-xs);
  font-weight: 500;
  white-space: nowrap;
}

.selection-bar__action:hover:not(:disabled) {
  background: var(--c-dark-chip);
}

.selection-bar__action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
