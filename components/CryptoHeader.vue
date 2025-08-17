<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-orange-500/50 shadow-2xl">
    <!-- Scan Line Effect -->
    <div class="scan-line"></div>
    
    <div class="container-custom">
      <nav class="flex items-center justify-between py-4">
        <!-- Logo/Brand -->
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg animate-glow border border-orange-400/50">
            <span class="text-2xl">🎮</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white font-orbitron">CryptoGaming</h1>
            <p class="text-xs text-orange-400 font-medium tracking-wider">ULTIMATE CRYPTO ARENA</p>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-8">
          <a href="#home" class="nav-link text-sm font-medium">HOME</a>
          <a href="#about" class="nav-link text-sm font-medium">ABOUT</a>
          <a href="#features" class="nav-link text-sm font-medium">FEATURES</a>
          <a href="#membership" class="nav-link text-sm font-medium">MEMBERSHIP</a>
          <a href="#testimonials" class="nav-link text-sm font-medium">LEADERBOARD</a>
          <a href="#market" class="nav-link text-sm font-medium">MARKET</a>
          <NuxtLink to="/trade-plans" class="nav-link text-sm font-medium">TRADE PLANS</NuxtLink>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden lg:flex items-center space-x-4">
          <!-- Theme Toggle -->
          <!--<button 
            @click="toggleTheme" 
            class="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors duration-200 text-orange-400 border border-orange-500/30"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          
          <button class="px-4 py-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium border border-orange-500/30 rounded-lg hover:bg-orange-500/10">
            LOGIN
          </button>-->
          <a href="#membership" class="btn-primary text-sm">
            JOIN ARENA
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMobileMenu" 
          class="lg:hidden p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors duration-200 text-orange-400 border border-orange-500/30"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </nav>

      <!-- Mobile Navigation -->
      <div 
        v-show="isMobileMenuOpen" 
        class="lg:hidden py-4 border-t border-orange-500/30 animate-fade-in-down bg-black/95 backdrop-blur-sm rounded-b-lg shadow-2xl"
      >
        <div class="flex flex-col space-y-4">
          <a href="#home" class="nav-link text-base font-medium py-2">HOME</a>
          <a href="#about" class="nav-link text-base font-medium py-2">ABOUT</a>
          <a href="#features" class="nav-link text-base font-medium py-2">FEATURES</a>
          <a href="#membership" class="nav-link text-base font-medium py-2">MEMBERSHIP</a>
          <a href="#testimonials" class="nav-link text-base font-medium py-2">LEADERBOARD</a>
          <a href="#market" class="nav-link text-base font-medium py-2">MARKET</a>
          <NuxtLink to="/trade-plans" class="nav-link text-base font-medium py-2">TRADE PLANS</NuxtLink>
          
          <div class="pt-4 border-t border-orange-500/30">
            <!-- Mobile Theme Toggle -->
            <button 
              @click="toggleTheme" 
              class="w-full flex items-center justify-center p-3 mb-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors duration-200 text-orange-400 border border-orange-500/30"
            >
              <svg v-if="isDark" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              <span class="font-medium">{{ isDark ? 'LIGHT MODE' : 'DARK MODE' }}</span>
            </button>
            
            <a href="#membership" class="w-full btn-primary text-sm mb-3 block text-center">
              JOIN ARENA
            </a>
            <button class="w-full px-4 py-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium border border-orange-500/30 rounded-lg hover:bg-orange-500/10">
              LOGIN
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const { isDark, toggleTheme } = useTheme()
const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu()
</script>

<style scoped>
.nav-link {
  color: #d1d5db;
  transition: all 0.3s;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b35, #ff8c42);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #ff6b35;
}

.nav-link:hover::after {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.8);
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.3s ease-out;
}

/* Gaming font */
.font-orbitron {
  font-family: 'Orbitron', monospace;
}
</style>
