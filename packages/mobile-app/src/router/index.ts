import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import TabsPage from '../views/TabsPage.vue'
import SplashScreen from '../views/SplashScreen.vue'
import WelcomeScreen from '../views/WelcomeScreen.vue'
import { useSessionStore } from '../stores/session'
import { logger } from '@yektayar/shared'

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

const WELCOME_SHOWN_KEY = 'yektayar_welcome_shown'
const SESSION_TOKEN_KEY = 'yektayar_session_token'

// Navigation guard to check session and welcome screen status
router.beforeEach(async (to, _from, next) => {
  // Allow access to splash and welcome screens without checks
  if (to.path === '/splash' || to.path === '/welcome' || to.path === '/') {
    next()
    return
  }

  // For all other routes (tabs/*), check prerequisites
  if (to.path.startsWith('/tabs/')) {
    const sessionStore = useSessionStore()
    
    // Check if session exists (either in store or localStorage)
    const hasStoredToken = !!localStorage.getItem(SESSION_TOKEN_KEY)
    if (!sessionStore.hasSession && !hasStoredToken) {
      logger.warn('No valid session found, redirecting to splash')
      next('/splash')
      return
    }

    // Check if welcome screen has been shown
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY) === 'true'
    if (!welcomeShown) {
      logger.info('Welcome screen not shown yet, redirecting to welcome')
      // Store the intended destination to navigate back after welcome
      sessionStorage.setItem('intended_route', to.fullPath)
      next('/welcome')
      return
    }

    // All checks passed, allow navigation
    next()
  } else {
    // For any other routes, allow navigation
    next()
  }
})

export default router
