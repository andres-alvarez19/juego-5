import type { RouteRecordRaw } from 'vue-router';

export const dddRoutes: RouteRecordRaw[] = [
  {
    path: '/ddd',
    name: 'ddd-menu',
    component: () => import('@/views/ddd/MenuView.vue'),
    meta: {
      title: 'Daring Dungeon Delver',
    },
  },
  {
    path: '/ddd/level-selector',
    name: 'ddd-level-selector',
    component: () => import('@/views/ddd/LevelSelectorView.vue'),
    meta: {
      title: 'Level Selector - Daring Dungeon Delver',
    },
  },
  {
    path: '/ddd/play/:level?',
    name: 'ddd-play',
    component: () => import('@/views/ddd/GameView.vue'),
    meta: {
      title: 'Play - Daring Dungeon Delver',
      requiresAuth: true,
    },
    props: true,
  },
  {
    path: '/ddd/scores',
    name: 'ddd-scores',
    component: () => import('@/views/ddd/ScoresView.vue'),
    meta: {
      title: 'Scores - Daring Dungeon Delver',
    },
  },
];
