<script setup lang="ts">
import { onMounted } from 'vue'
import AccentThemeRail from './components/AccentThemeRail.vue'
import { useAuth } from './composables/useAuth'

const { initialize, startListener, loading } = useAuth()

function handleRetry() {
  window.location.reload()
}

onMounted(() => {
  initialize()
})
</script>

<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
    <div class="text-center space-y-6">
      <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div class="space-y-2">
        <p class="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Marko Picks...</p>
        <p class="text-gray-400 text-[10px] uppercase tracking-tighter">Connecting...</p>
      </div>
      <button 
        @click="handleRetry" 
        class="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
      >
        Trouble loading? Retry
      </button>
    </div>
  </div>
  <template v-else>
    <router-view></router-view>
    <AccentThemeRail />
  </template>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
