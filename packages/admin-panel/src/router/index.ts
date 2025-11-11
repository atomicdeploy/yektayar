import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: 'داشبورد' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('../views/UsersView.vue'),
        meta: { title: 'مدیریت کاربران' },
      },
      // Placeholder routes for other sections
      {
        path: 'appointments',
        name: 'appointments',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'نوبت‌ها' },
      },
      {
        path: 'messages',
        name: 'messages',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'پیام‌ها' },
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'دوره‌ها' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'گزارش‌ها' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'تنظیمات' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory((import.meta as any).env?.BASE_URL || '/'),
  routes,
})

export default router
