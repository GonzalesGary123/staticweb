import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

export function getSupabaseServer(event: H3Event) {
  return serverSupabaseClient(event)
}
