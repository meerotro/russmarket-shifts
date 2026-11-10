import { createRouter, createWebHistory } from 'vue-router';

import AppLayout from '@/components/layout/AppLayout.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'schedule', component: () => import('@/pages/SchedulePage.vue') },
        { path: 'home', name: 'home', component: () => import('@/pages/HomePage.vue') },
      ],
    },
    { path: '/ui-kit', name: 'ui-kit', component: () => import('@/pages/UiKitPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
