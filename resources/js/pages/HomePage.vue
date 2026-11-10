<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="home-page">
    <h1>Главная</h1>
    <p>
      Раздел вне рамок тестового задания. Рабочий экран —
      <RouterLink to="/">график смен</RouterLink>, компоненты —
      <RouterLink to="/ui-kit">витрина UI-кита</RouterLink>.
    </p>
  </main>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--page-pad);
}

.home-page h1 {
  font-size: var(--fs-title);
  font-weight: 500;
}

.home-page a {
  color: var(--c-blue-text);
}
</style>
