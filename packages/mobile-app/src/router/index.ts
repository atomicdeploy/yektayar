import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import TabsPage from '../views/TabsPage.vue'
import SplashScreen from '../views/SplashScreen.vue'
import WelcomeScreen from '../views/WelcomeScreen.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/splash'
  },
  {
    path: '/splash',
    name: 'Splash',
    component: SplashScreen
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: WelcomeScreen
  },
  {
    path: '/icon-test',
    name: 'IconTest',
    component: () => import('@/views/IconTestPage.vue')
  },
  {
    path: '/icon-test-new',
    name: 'IconTestNew',
    component: () => import('@/views/IconTestPageNew.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'chat',
        component: () => import('@/views/ChatPage.vue')
      },
      {
        path: 'appointments',
        component: () => import('@/views/AppointmentsPage.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/ProfilePage.vue')
      },
      {
        path: 'profile/personal-info',
        component: () => import('@/views/PersonalInfoPage.vue')
      },
      {
        path: 'about',
        component: () => import('@/views/AboutUsPage.vue')
      },
      {
        path: 'support',
        component: () => import('@/views/SupportPage.vue')
      },
      {
        path: 'contact',
        component: () => import('@/views/ContactUsPage.vue')
      },
      {
        path: 'chat/ai',
        component: () => import('@/views/AIChatPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
