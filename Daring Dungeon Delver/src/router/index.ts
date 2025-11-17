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

export default router;
