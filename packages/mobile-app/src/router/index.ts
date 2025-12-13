import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import TabsPage from '../views/TabsPage.vue'
import SplashScreen from '../views/SplashScreen.vue'
import SplashTester from '../views/SplashTester.vue'
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
    path: '/splashTester',
    name: 'SplashTester',
    component: SplashTester
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
        path: 'courses',
        component: () => import('@/views/CoursesPage.vue')
      },
      {
        path: 'my-courses',
        component: () => import('@/views/MyCoursesPage.vue')
      },
      {
        path: 'courses/:id',
        component: () => import('@/views/CourseDetailPage.vue')
      },
      {
        path: 'courses/:id/lessons/:lessonId',
        component: () => import('@/views/LessonViewerPage.vue')
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
      },
      {
        path: 'assessments',
        component: () => import('@/views/AssessmentsPage.vue')
      },
      {
        path: 'assessments/history',
        component: () => import('@/views/AssessmentHistoryPage.vue')
      },
      {
        path: 'assessments/:id',
        component: () => import('@/views/TakeAssessmentPage.vue')
      },
      {
        path: 'assessments/results/:resultId',
        component: () => import('@/views/AssessmentResultsPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
