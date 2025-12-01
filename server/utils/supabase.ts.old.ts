// server/utils/supabase.ts
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase not initialized. This is a sync function.')
  }
  return supabaseClient
}

export async function initSupabase(): Promise<SupabaseClient> {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  console.log('🔍 Initializing Supabase...')
  console.log('  URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '❌ NOT SET')
  console.log('  Key:', supabaseKey ? `Set (${supabaseKey.length} chars)` : '❌ NOT SET')

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file')
  }

  try {
    // Use dynamic import instead of require
    const { createClient } = await import('@supabase/supabase-js')
    supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase initialized successfully')
    return supabaseClient
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error)
    throw error
  }
}