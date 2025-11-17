import { createRouter, createWebHistory } from 'vue-router';
import { dddRoutes } from './routes/dddRoutes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/ddd',
    },
    ...dddRoutes,
  ],
});

router.afterEach((to) => {
  const baseTitle = import.meta.env.VITE_GAME_NAME || 'Daring Dungeon Delver';
  const routeTitle = (to.meta && (to.meta as any).title) || baseTitle;
  if (typeof document !== 'undefined') {
    document.title = routeTitle;
  }
});

export default router;
