<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signInWithDiscord } = useAuth()
const email = ref('')
const password = ref('')
const code = ref('')
const isVipFlow = ref(false)
const codeSent = ref(false)
const loading = ref(false)
const resendTimer = ref(0)
const resendInterval = ref<any>(null)
const error = ref<string | null>(null)
const turnstileToken = ref<string | null>(null)

function startResendTimer() {
  resendTimer.value = 60
  if (resendInterval.value) clearInterval(resendInterval.value)
  resendInterval.value = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      if (resendInterval.value) clearInterval(resendInterval.value)
    }
  }, 1000)
}

// Watch email to check VIP status automatically
let checkTimeout: any = null
watch(email, (newEmail) => {
  if (checkTimeout) clearTimeout(checkTimeout)
  if (!newEmail || !newEmail.includes('@')) {
    isVipFlow.value = false
    return
  }
  
  checkTimeout = setTimeout(async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', newEmail.toLowerCase())
        .single()
      
      isVipFlow.value = data?.role === 'uservip'
    } catch (e) {
      isVipFlow.value = false
    }
  }, 500)
})

async function checkVipStatus() {
  if (!email.value) return
  
  try {
    loading.value = true
    // Attempt to check role. This requires RLS to allow reading roles by email.
    // If it fails, we'll just fall back to password login.
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email.value.toLowerCase())
      .single()
    
    if (data?.role === 'uservip') {
      isVipFlow.value = true
      await sendOtp()
    } else {
      isVipFlow.value = false
    }
  } catch (e) {
    // Fallback to normal flow if we can't check
    isVipFlow.value = false
  } finally {
    loading.value = false
  }
}

async function sendOtp() {
  try {
    loading.value = true
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        captchaToken: turnstileToken.value || undefined,
        shouldCreateUser: true
      }
    })
    if (otpError) throw otpError
    codeSent.value = true
    startResendTimer()
    alert('A login code has been sent to your email!')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleVipLogin() {
  try {
    loading.value = true
    error.value = null
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.value,
      token: code.value,
      type: 'email' 
    })
    if (verifyError) throw verifyError
    router.push('/')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  if (isVipFlow.value && codeSent.value) {
    return handleVipLogin()
  }

  try {
    loading.value = true
    error.value = null

    // First check if user is uservip
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email.value.toLowerCase())
      .single()

    if (profileData?.role === 'uservip' && !codeSent.value) {
      isVipFlow.value = true
      await sendOtp()
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
      options: {
        captchaToken: turnstileToken.value || undefined
      }
    })
    
    if (authError) {
      throw authError
    }
    
    router.push('/')
  } catch (e: any) {
    error.value = e.message || 'An error occurred during login'
    if (e.message?.includes('Email not confirmed')) {
      error.value = 'Please confirm your email or disable email confirmation in Supabase Auth settings.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 flex items-center justify-center p-6 transition-colors duration-500">
    <div class="max-w-md w-full relative">
      <div class="mb-10 text-center">
        <router-link to="/" class="inline-block mb-6">
          <span class="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white">Marko Picks</span>
        </router-link>
        <h2 class="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Welcome <span class="text-indigo-500">Back</span></h2>
        <p class="mt-3 text-gray-500 dark:text-gray-400 font-medium">Only for Dubclub subscribers.</p>
        <p class="mt-3 text-gray-500 dark:text-gray-400 font-medium">For assistance, contact us thru discord.</p>
      </div>

      <div class="bg-white dark:bg-[#18181b] p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl shadow-black/5">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                v-model="email"
                :disabled="codeSent"
                autocomplete="email"
                class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium disabled:opacity-50"
                placeholder="name@example.com"
              />
            </div>
            <div v-if="!isVipFlow">
              <label for="password" class="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-1">Password</label>
              <input
                id="password"
                type="password"
                v-model="password"
                autocomplete="current-password"
                class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            <div v-if="isVipFlow && codeSent">
              <label for="code" class="block text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-1">Verification Code</label>
              <input
                id="code"
                type="text"
                required
                v-model="code"
                class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                placeholder="123456"
              />
              <p class="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-wider px-1">A 6-digit code has been sent to your email.</p>
            </div>
          </div>

          <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
            {{ error }}
          </div>

          <!-- Cloudflare Turnstile -->
          <div v-if="!codeSent" class="flex justify-center py-2">
            <div class="cf-turnstile" 
                 data-sitekey="0x4AAAAAADL-A8wOh_AfDpw4" 
                 data-callback="onTurnstileSuccess"
                 data-theme="auto"></div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            <template v-if="loading">
              {{ isVipFlow && !codeSent ? 'Sending code...' : 'Signing in...' }}
            </template>
            <template v-else>
              {{ isVipFlow && !codeSent ? 'Send Login Code' : (codeSent ? 'Verify & Sign In' : 'Sign In') }}
            </template>
            <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </button>
          
          <button v-if="isVipFlow && codeSent" @click="isVipFlow = false; codeSent = false" type="button" class="w-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
            Use Password Instead
          </button>

          <div v-if="isVipFlow && codeSent" class="text-center">
            <button 
              type="button" 
              @click="sendOtp" 
              :disabled="loading || resendTimer > 0"
              class="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 disabled:text-gray-500 transition-colors"
            >
              {{ resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code Now' }}
            </button>
          </div>
        </form>

        <div class="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
          <button
            type="button"
            @click="signInWithDiscord"
            class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black uppercase tracking-wider transition-all transform active:scale-[0.98]"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with Discord
          </button>
          
          <div class="text-center pt-2">
            <router-link to="/" class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Home
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
