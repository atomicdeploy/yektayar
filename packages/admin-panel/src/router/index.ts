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
        component: () => import('../views/PlaceholderView.vue'),
        meta: { title: 'نوبت‌ها' },
      },
      {
        path: 'messages',
        name: 'messages',
        component: () => import('../views/PlaceholderView.vue'),
        meta: { title: 'پیام‌ها' },
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('../views/CoursesView.vue'),
        meta: { title: 'دوره‌ها' },
      },
      {
        path: 'courses/create',
        name: 'courses-create',
        component: () => import('../views/CourseFormView.vue'),
        meta: { title: 'افزودن دوره جدید' },
      },
      {
        path: 'courses/:id/edit',
        name: 'courses-edit',
        component: () => import('../views/CourseFormView.vue'),
        meta: { title: 'ویرایش دوره' },
      },
      {
        path: 'assessments',
        name: 'assessments',
        component: () => import('../views/AssessmentsView.vue'),
        meta: { title: 'آزمون‌ها' },
      },
      {
        path: 'assessments/create',
        name: 'assessments-create',
        component: () => import('../views/AssessmentFormView.vue'),
        meta: { title: 'افزودن آزمون جدید' },
      },
      {
        path: 'assessments/:id/edit',
        name: 'assessments-edit',
        component: () => import('../views/AssessmentFormView.vue'),
        meta: { title: 'ویرایش آزمون' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/PlaceholderView.vue'),
        meta: { title: 'گزارش‌ها' },
      },
      {
        path: 'pages',
        name: 'pages',
        component: () => import('../views/PagesView.vue'),
        meta: { title: 'مدیریت صفحات' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { title: 'تنظیمات' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory((import.meta as any).env?.BASE_URL || '/'),
  routes,
})

// Update document title on route change
router.afterEach((to) => {
  const baseTitle = document.documentElement.lang === 'fa' ? 'یکتایار' : 'YektaYar'
  const tagline = document.documentElement.lang === 'fa' ? 'پلتفرم مراقبت سلامت روان' : 'Mental Health Care Platform'
  const pageTitle = to.meta.title as string | undefined
  
  if (pageTitle) {
    document.title = `${pageTitle} - ${baseTitle} - ${tagline}`
  } else {
    document.title = `${baseTitle} - ${tagline}`
  }
})

export default router
