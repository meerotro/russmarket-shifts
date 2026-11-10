<template>
  <div class="ui-menu" role="menu"><slot /></div>
</template>

<style scoped>
.ui-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 200px;
  padding: 6px;
}

.ui-menu :deep(hr) {
  width: 100%;
  height: 1px;
  margin: 4px 0;
  border: 0;
  background: var(--c-line);
}
</style>
