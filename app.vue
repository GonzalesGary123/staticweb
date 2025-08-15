<template>
  <div class="min-h-screen transition-colors duration-300 dark:bg-gradient-to-br dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:text-white text-gray-900">
    <!-- Simple Gaming Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Simple Neon Accents -->
      <div class="absolute -top-40 -right-40 w-60 h-60 bg-primary-500/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-40 -left-40 w-60 h-60 bg-secondary-500/10 rounded-full blur-2xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-500/5 rounded-full blur-2xl"></div>
    </div>
    
    <!-- Content -->
    <div class="relative z-10">
      <CryptoHeader />
      <main>
        <CryptoHero />
        <CryptoAbout />
        <CryptoFeatures />
        <CryptoMembership />
        <CryptoTestimonials />
        <LiveMarketData />
        <CryptoDemo />
      </main>
      <CryptoFooter />
    </div>
  </div>
</template>

<script setup>
// Nuxt.js will auto-import components from the components directory
const { isDark } = useTheme()
const { 
  showResults, 
  gameMode, 
  gameStats, 
  closeResults, 
  playAgain 
} = useGameState()

// Initialize theme on mount
onMounted(() => {
  // Apply initial theme
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.add('light')
  }
  
  // Performance optimization: Reduce animations on low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.documentElement.classList.add('reduce-motion')
  }
  
  // Performance optimization: Reduce blur effects on mobile
  if (window.innerWidth < 768) {
    document.documentElement.classList.add('reduce-blur')
  }
})
</script>

<style>
/* Global styles */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0284c7, #7c3aed);
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Utility classes */
.section-padding {
  @apply py-20 px-4;
}

.container-custom {
  @apply max-w-7xl mx-auto px-4;
}

.text-gradient-primary {
  @apply bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent;
}

.card-glass {
  @apply bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-1;
}

.btn-outline {
  @apply border-2 border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/40;
}

/* Dark mode overrides */
.dark .card-glass {
  @apply bg-dark-800/50 border-dark-700/50;
}

/* Responsive design */
@media (max-width: 768px) {
  .section-padding {
    @apply py-16 px-4;
  }
  
  .container-custom {
    @apply px-4;
  }
}

/* Performance optimizations */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.reduce-blur * {
  backdrop-filter: none !important;
  filter: none !important;
}
</style>