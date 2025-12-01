import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        persistSession: true, // 🔥 important for auto-login
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  )

  return {
    provide: {
      supabase
    }
  }
})
