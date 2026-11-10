<script setup lang="ts">
import UiAvatar from '@/ui/UiAvatar.vue';

defineProps<{ name: string; position: string; hours: string; avatarUrl?: string | null }>();
</script>

<template>
  <div class="employee-cell">
    <UiAvatar :name="name" :src="avatarUrl" />
    <div class="employee-cell__text">
      <div class="employee-cell__name" :title="name">{{ name }}</div>
      <div class="employee-cell__meta">{{ position }} · {{ hours }}</div>
    </div>
  </div>
</template>

<style scoped>
.employee-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 0 0 0 5px;
}

.employee-cell__text {
  min-width: 0;
}

.employee-cell__name {
  overflow: hidden;
  font-size: var(--fs-sm);
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-cell__meta {
  color: var(--c-text-2);
  font-size: var(--fs-2xs);
  line-height: 1.3;
  white-space: nowrap;
}
</style>
