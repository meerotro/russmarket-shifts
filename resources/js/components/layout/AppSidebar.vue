<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

import type { IconName } from '@/ui/icons';
import UiIcon from '@/ui/UiIcon.vue';

const STORAGE_KEY = 'crm.sidebar.collapsed';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/home', label: 'Главная', icon: 'home' },
  { to: '/', label: 'Смены', icon: 'calendar' },
];

const collapsed = ref(localStorage.getItem(STORAGE_KEY) === '1');

watch(collapsed, (value) => localStorage.setItem(STORAGE_KEY, value ? '1' : '0'));
</script>

<template>
  <nav class="app-sidebar" :class="{ 'is-collapsed': collapsed }" aria-label="Основное меню">
    <div class="app-sidebar__brand">
      <span class="app-sidebar__logo">CRM</span>
      <button class="app-sidebar__bell" type="button" aria-label="Уведомления">
        <UiIcon name="bell" :size="18" />
      </button>
    </div>

    <ul class="app-sidebar__nav">
      <li v-for="item in NAV" :key="item.to">
        <RouterLink
          class="app-sidebar__link"
          :to="item.to"
          exact-active-class="is-active"
          :title="item.label"
        >
          <UiIcon :name="item.icon" :size="18" />
          <span class="app-sidebar__label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <button
      class="app-sidebar__link app-sidebar__toggle"
      type="button"
      :aria-expanded="!collapsed"
      :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
      @click="collapsed = !collapsed"
    >
      <UiIcon name="sidebar" :size="18" />
      <span class="app-sidebar__label">Свернуть меню</span>
    </button>
  </nav>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 16px;
  width: var(--sidebar-w);
  padding: 16px 11px;
  border-right: 1px solid var(--c-line);
  background: var(--c-bg);
  transition: width 160ms ease;
}

.app-sidebar.is-collapsed {
  width: var(--sidebar-w-collapsed);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 4px 0 8px;
}

.app-sidebar__logo {
  font-size: 18px;
  font-weight: 600;
}

.app-sidebar__bell {
  display: inline-flex;
  padding: 4px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--c-text);
}

.app-sidebar__bell:hover {
  background: var(--c-neutral-hover);
}

.app-sidebar__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--c-text);
  font-size: var(--fs-md);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
}

.app-sidebar__link:hover {
  background: var(--c-neutral-hover);
}

.app-sidebar__link.is-active {
  background: var(--c-surface);
}

.is-collapsed .app-sidebar__label,
.is-collapsed .app-sidebar__logo {
  display: none;
}

.is-collapsed .app-sidebar__brand {
  justify-content: center;
  padding: 0;
}

.is-collapsed .app-sidebar__link {
  justify-content: center;
  padding: 0;
}
</style>
