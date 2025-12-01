// server/api/test-env.get.ts
export default defineEventHandler(() => {
  return {
    supabaseUrl: process.env.SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
    supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌',
    nodeEnv: process.env.NODE_ENV,
    // Show first 20 chars of URL to verify it's correct
    urlPreview: process.env.SUPABASE_URL?.substring(0, 30) + '...',
  }
})