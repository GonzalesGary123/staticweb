import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref<any>(null)
const profile = ref<any>(null)
const loading = ref(true)
const profileLoading = ref(false)
const isInitialized = ref(false)
let authListener: any = null

export function useAuth() {
  const fetchProfile = async (userId: string) => {
    if (profileLoading.value) return
    
    try {
      profileLoading.value = true
      //console.log('Auth: Fetching profile for:', userId)
      
      // Add a 5 second timeout to the profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any
      
      if (error) {
        // If it's a real error (not just missing profile), log it
        if (error.code !== 'PGRST116') {
           //console.error('Auth: DB Error fetching profile:', error)
        }
        throw error
      }
      
      profile.value = data
      //console.log('Auth: Profile loaded:', data?.role)
    } catch (err) {
      //console.error('Auth: Error fetching profile:', err)
      profile.value = null
    } finally {
      profileLoading.value = false
    }
  }

  const initialize = async () => {
    if (isInitialized.value) return
    
    try {
      loading.value = true
      
      // 1. Start the listener first
      startListener()

      // 2. Quick check from session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      } else if (window.location.hash.includes('access_token=')) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession?.user) {
          user.value = retrySession.user
          await fetchProfile(retrySession.user.id)
        }
      }
      
    } catch (err) {
      //console.error('Auth: Initialization error:', err)
    } finally {
      isInitialized.value = true
      // CRITICAL: Ensure loading is false so the app can render
      loading.value = false
    }
  }

  const startListener = () => {
    if (authListener) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      //console.log('Auth State Change:', event, session?.user?.email)
      
      if (session?.user) {
        user.value = session.user
        // Always fetch profile on significant events to ensure sync
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await fetchProfile(session.user.id)
        } else if (!profile.value) {
          await fetchProfile(session.user.id)
        }
      } else {
        user.value = null
        profile.value = null
      }
      
      loading.value = false
    })
    
    authListener = subscription
  }

  return {
    user,
    profile,
    loading,
    profileLoading,
    initialize,
    startListener,
    isSuperuser: () => profile.value?.role === 'superuser',
    signInWithDiscord: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    },
    logout: async () => {
      await supabase.auth.signOut()
      user.value = null
      profile.value = null
      localStorage.clear()
    }
  }
}
