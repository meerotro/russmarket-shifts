import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'schedule',
      component: () => import('@/pages/SchedulePage.vue'),
    },
  ],
});
