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
              <GameDashboard />
              <LiveMarketData />
              <CryptoFeatures />
              <CryptoAbout />
              <CryptoDemo />
            </main>
                  <CryptoFooter />
          </div>
        </div>
        
        <!-- Game Interface -->
        <TradingInterface />
        
        <!-- Game Results -->
        <GameResults 
          :show-results="showResults"
          :game-mode="gameMode"
          :game-stats="gameStats"
          @close="closeResults"
          @play-again="playAgain"
        />
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

/* Selection styling */
::selection {
  background: rgba(14, 165, 233, 0.3);
  color: #ffffff;
}

/* Focus styles for accessibility */
*:focus {
  outline: 2px solid rgba(14, 165, 233, 0.5);
  outline-offset: 2px;
}

/* Animation utilities */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

.animate-fade-in-left {
  animation: fadeInLeft 0.8s ease-out;
}

.animate-fade-in-right {
  animation: fadeInRight 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Loading animation */
.loading-shimmer {
  position: relative;
  overflow: hidden;
  background: #e5e7eb;
  border-radius: 0.375rem;
}

.loading-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Floating animation */
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Pulse animation */
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Bounce animation */
.animate-bounce-slow {
  animation: bounce 2s infinite;
}

/* Scale animation */
.animate-scale-in {
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide animations */
.animate-slide-in-right {
  animation: slideInRight 0.6s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* Glass effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text */
.text-gradient-primary {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-secondary {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-accent {
  background: linear-gradient(135deg, #10b981, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Responsive utilities */
@media (max-width: 640px) {
  .container-custom {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .section-padding {
    padding-top: 4rem;
    padding-bottom: 4rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .container-custom {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  .section-padding {
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
}

@media (min-width: 1025px) {
  .container-custom {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  
  .section-padding {
    padding-top: 8rem;
    padding-bottom: 8rem;
  }
}
</style>