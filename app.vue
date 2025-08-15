<template>
  <div class="min-h-screen transition-colors duration-300 bg-gradient-to-br from-sky-50 via-white to-sky-100 text-gray-900">
    <!-- Gaming Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Geometric Gaming Patterns -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      
      <!-- Gaming Grid Pattern -->
      <div class="absolute inset-0 opacity-30">
        <div class="w-full h-full" style="background-image: radial-gradient(circle at 1px 1px, #e0f2fe 1px, transparent 0); background-size: 60px 60px;"></div>
      </div>
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
  background: rgba(14, 165, 233, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0284c7, #2563eb);
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.3); }
  50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.6); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

/* Custom utility classes */
.card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(186, 230, 253, 0.5);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover {
  box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px) scale(1.05);
}

.btn-outline {
  border: 2px solid rgba(14, 165, 233, 0.5);
  color: #0ea5e9;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Utility classes */
.section-padding {
  padding: 5rem 1rem;
}

.container-custom {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-gradient-primary {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gaming-specific styles */
.gaming-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(186, 230, 253, 0.5);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.gaming-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  transform: scale(1.05);
}

.gaming-border {
  border: 2px solid rgba(186, 230, 253, 0.5);
}

.gaming-accent {
  background: linear-gradient(135deg, #38bdf8, #3b82f6);
}

/* Responsive design */
@media (max-width: 768px) {
  .section-padding {
    padding: 4rem 1rem;
  }
  
  .container-custom {
    padding: 0 1rem;
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