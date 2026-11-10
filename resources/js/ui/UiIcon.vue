<script setup lang="ts">
import { type IconName, ICONS } from './icons';

withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 16 });
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- the markup comes from the static ICONS table -->
  <svg
    class="ui-icon"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.25"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="ICONS[name]"
  />
</template>

<style scoped>
.ui-icon {
  flex: none;
  display: block;
}
</style>
