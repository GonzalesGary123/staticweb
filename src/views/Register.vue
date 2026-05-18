<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Disable registration, redirect to home
  router.push('/')
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#09090b] flex items-center justify-center">
    <p class="text-gray-500">Redirecting...</p>
  </div>
</template>
