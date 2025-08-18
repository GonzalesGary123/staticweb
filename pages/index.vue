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
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <CryptoHeader />
      <main>
        <CryptoHero />
        <MarketStatus />
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
// Set page title
useHead({
  title: 'CryptoGroup - Join the Future of Cryptocurrency',
  meta: [
    { name: 'description', content: 'Join the future of cryptocurrency with CryptoGroup - your gateway to the digital economy revolution. Connect with crypto enthusiasts, get market insights, and stay ahead of trends.' }
  ]
})

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
  
  // Smooth scrolling fallback for browsers that don't support CSS scroll-behavior
  if (!CSS.supports('scroll-behavior', 'smooth')) {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })
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
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
}

/* Enhanced smooth scrolling for all scrollable elements */
* {
  scroll-behavior: smooth;
}

/* Smooth scrolling for specific elements */
.smooth-scroll {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
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