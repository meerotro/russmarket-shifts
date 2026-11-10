<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppSidebar from './AppSidebar.vue';
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-layout__main">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100%;
  min-width: 1100px;
}

.app-layout__main {
  flex: 1;
  min-width: 0;
  height: 100%;
}
</style>
