import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Admin from '../views/Admin.vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { requiresAuth: true, requiresSuperuser: true }
    }
  ]
})

router.beforeEach(async (to) => {
  const { user, profile, initialize, loading } = useAuth()
  
  // Ensure auth is initialized before any route check
  await initialize()

  // Wait for loading to finish if it's still true
  if (loading.value) {
    // console.log('Router: Waiting for auth loading...')
  }

  const isLoggedIn = !!user.value
  
  try {
    // 1. Handle Protected Routes
    if (to.meta.requiresAuth && !isLoggedIn) {
      return '/login'
    }

    // 2. Handle Superuser Routes
    if (to.meta.requiresSuperuser) {
      if (!isLoggedIn) return '/login'
      
      // Use the already loaded profile role
      if (profile.value?.role !== 'superuser') {
        return '/'
      }
    }

    // 3. Handle Auth Pages
    if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
      return '/'
    }
    
    return true
  } catch (err) {
    return (to.path === '/' || to.path === '/login') ? true : '/'
  }
})

export default router
