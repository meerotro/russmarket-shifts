<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ name: string; src?: string | null; size?: number }>(), {
  src: null,
  size: 32,
});

/** "Сергеев Олег" → "СО": first letters of the first two words. */
const initials = computed(() =>
  props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join(''),
);
</script>

<template>
  <span
    class="ui-avatar"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.38)}px` }"
  >
    <img v-if="src" :src="src" :alt="name" />
    <span v-else aria-hidden="true">{{ initials }}</span>
  </span>
</template>

<style scoped>
.ui-avatar {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(160deg, #7fb0f7 0%, #5b8def 100%);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.02em;
  user-select: none;
}

.ui-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
