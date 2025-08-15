<template>
  <div class="min-h-screen transition-colors duration-300 bg-black text-white overflow-hidden">
    <!-- Gaming Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Hexagonal Grid Pattern -->
      <div class="absolute inset-0 opacity-20">
        <div class="w-full h-full" style="background-image: repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px); background-size: 60px 60px;"></div>
      </div>
      
      <!-- Neon Accent Lines -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div>
      <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div>
      <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60"></div>
      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60"></div>
      
      <!-- Floating Gaming Elements -->
      <div class="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-400/5 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
      
      <!-- Circuit Board Lines -->
      <div class="absolute top-1/4 left-0 w-32 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div>
      <div class="absolute top-1/4 right-0 w-32 h-0.5 bg-gradient-to-l from-orange-500 to-transparent"></div>
      <div class="absolute bottom-1/4 left-0 w-32 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div>
      <div class="absolute bottom-1/4 right-0 w-32 h-0.5 bg-gradient-to-l from-orange-500 to-transparent"></div>
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
  font-family: 'Orbitron', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
  background: #000;
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
  background: rgba(255, 107, 53, 0.1);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ff5722, #ff7043);
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 107, 53, 0.6); }
}

@keyframes neon-pulse {
  0%, 100% { text-shadow: 0 0 5px #ff6b35, 0 0 10px #ff6b35, 0 0 15px #ff6b35; }
  50% { text-shadow: 0 0 10px #ff6b35, 0 0 20px #ff6b35, 0 0 30px #ff6b35; }
}

@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
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

.animate-neon {
  animation: neon-pulse 2s ease-in-out infinite;
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
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gaming-specific styles */
.gaming-card {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.gaming-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.1), transparent);
  transition: left 0.5s;
}

.gaming-card:hover::before {
  left: 100%;
}

.gaming-card:hover {
  border-color: rgba(255, 107, 53, 0.8);
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.3), inset 0 0 30px rgba(255, 107, 53, 0.1);
  transform: translateY(-5px);
}

.gaming-border {
  border: 2px solid rgba(255, 107, 53, 0.5);
}

.gaming-accent {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
}

/* Neon text effect */
.neon-text {
  color: #ff6b35;
  text-shadow: 0 0 5px #ff6b35, 0 0 10px #ff6b35, 0 0 15px #ff6b35;
}

/* Scan line effect */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff6b35, transparent);
  animation: scan-line 3s linear infinite;
  opacity: 0.6;
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