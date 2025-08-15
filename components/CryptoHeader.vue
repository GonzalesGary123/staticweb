<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
    <div class="container-custom">
      <nav class="flex items-center justify-between py-4">
        <!-- Logo/Brand -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-2xl">🚀</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white">CryptoGroup</h1>
            <p class="text-xs text-white/60">Premium Crypto Community</p>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-8">
          <a href="#home" class="nav-link text-sm font-medium">Home</a>
          <a href="#about" class="nav-link text-sm font-medium">About</a>
          <a href="#features" class="nav-link text-sm font-medium">Features</a>
          <a href="#membership" class="nav-link text-sm font-medium">Membership</a>
          <a href="#testimonials" class="nav-link text-sm font-medium">Stories</a>
          <a href="#market" class="nav-link text-sm font-medium">Market</a>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden lg:flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button 
            @click="toggleTheme" 
            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <svg v-if="isDark" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
          
          <button class="px-4 py-2 text-white/80 hover:text-white transition-colors duration-200">
            Sign In
          </button>
          <a href="#membership" class="btn-primary text-sm">
            Join Community
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMobileMenu" 
          class="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </nav>

      <!-- Mobile Navigation -->
      <div 
        v-show="isMobileMenuOpen" 
        class="lg:hidden py-4 border-t border-white/20 animate-fade-in-down"
      >
        <div class="flex flex-col space-y-4">
          <a href="#home" class="nav-link text-base font-medium py-2">Home</a>
          <a href="#about" class="nav-link text-base font-medium py-2">About</a>
          <a href="#features" class="nav-link text-base font-medium py-2">Features</a>
          <a href="#membership" class="nav-link text-base font-medium py-2">Membership</a>
          <a href="#testimonials" class="nav-link text-base font-medium py-2">Stories</a>
          <a href="#market" class="nav-link text-base font-medium py-2">Market</a>
          
          <div class="pt-4 border-t border-white/20">
            <!-- Mobile Theme Toggle -->
            <button 
              @click="toggleTheme" 
              class="w-full flex items-center justify-center p-3 mb-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
            >
              <svg v-if="isDark" class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              <span class="text-white">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
            
            <a href="#membership" class="w-full btn-primary text-sm mb-3 block text-center">
              Join Community
            </a>
            <button class="w-full px-4 py-2 text-white/80 hover:text-white transition-colors duration-200">
              Sign In
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
  @apply text-white/80 hover:text-white transition-colors duration-200;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-1;
}
</style>