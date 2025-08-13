<template>
  <footer class="relative overflow-hidden border-t border-white/10">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-900 to-dark-800"></div>
    
    <div class="container-custom relative z-10 py-16">
      <div class="grid lg:grid-cols-4 gap-8 mb-12">
        <!-- Company Info -->
        <div class="lg:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-2xl">🚀</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">CryptoGroup</h3>
              <p class="text-sm text-white/60">Future of Finance</p>
            </div>
          </div>
          <p class="text-white/70 mb-6 max-w-md">
            Join the most innovative crypto community and stay ahead of the digital economy revolution with real-time insights and expert analysis.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200">
              <span class="text-white">📱</span>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200">
              <span class="text-white">🐦</span>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200">
              <span class="text-white">💬</span>
            </a>
            <a href="#" class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200">
              <span class="text-white">📧</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold text-white mb-6">Quick Links</h4>
          <ul class="space-y-3">
            <li><a href="#home" class="text-white/70 hover:text-white transition-colors duration-200">Home</a></li>
            <li><a href="#market" class="text-white/70 hover:text-white transition-colors duration-200">Market Data</a></li>
            <li><a href="#features" class="text-white/70 hover:text-white transition-colors duration-200">Features</a></li>
            <li><a href="#about" class="text-white/70 hover:text-white transition-colors duration-200">About</a></li>
            <li><a href="#demo" class="text-white/70 hover:text-white transition-colors duration-200">Demo</a></li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="text-lg font-semibold text-white mb-6">Resources</h4>
          <ul class="space-y-3">
            <li><a href="#" class="text-white/70 hover:text-white transition-colors duration-200">Help Center</a></li>
            <li><a href="#" class="text-white/70 hover:text-white transition-colors duration-200">API Documentation</a></li>
            <li><a href="#" class="text-white/70 hover:text-white transition-colors duration-200">Trading Guide</a></li>
            <li><a href="#" class="text-white/70 hover:text-white transition-colors duration-200">Security</a></li>
            <li><a href="#" class="text-white/70 hover:text-white transition-colors duration-200">Blog</a></li>
          </ul>
        </div>
      </div>

      <!-- Newsletter -->
      <div class="card-glass p-8 mb-12">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-white mb-4">
            Stay Updated with <span class="text-gradient-primary">Crypto Trends</span>
          </h3>
          <p class="text-white/70 mb-6 max-w-2xl mx-auto">
            Get the latest crypto news, market insights, and exclusive updates delivered directly to your inbox.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-primary-500 transition-colors duration-200"
            >
            <button class="btn-primary px-8 py-3">
              <span class="mr-2">📧</span>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-white/10">
        <div class="text-white/60 text-sm mb-4 md:mb-0">
          © 2024 CryptoGroup. All rights reserved.
        </div>
        <div class="flex space-x-6 text-sm">
          <a href="#" class="text-white/60 hover:text-white transition-colors duration-200">Privacy Policy</a>
          <a href="#" class="text-white/60 hover:text-white transition-colors duration-200">Terms of Service</a>
          <a href="#" class="text-white/60 hover:text-white transition-colors duration-200">Cookie Policy</a>
        </div>
      </div>
    </div>

    <!-- Floating Elements -->
    <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-10 animate-float"></div>
    <div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full opacity-10 animate-float" style="animation-delay: 2s;"></div>
  </footer>
</template>

<script setup>
// Component logic can be added here
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>