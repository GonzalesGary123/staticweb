<template>
  <footer class="relative overflow-hidden border-t border-sky-200/50 bg-gradient-to-br from-sky-50 to-blue-50">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-sky-100/30 to-blue-100/30"></div>
    
    <div class="container-custom relative z-10 py-16">
      <div class="grid lg:grid-cols-4 gap-8 mb-12">
        <!-- Company Info -->
        <div class="lg:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-glow">
              <span class="text-2xl">🚀</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">CryptoGroup</h3>
              <p class="text-sm text-sky-600 font-medium">Premium Crypto Community</p>
            </div>
          </div>
          <p class="text-gray-600 mb-6 max-w-md">
            Join the most innovative crypto community and connect with thousands of enthusiasts, traders, and experts from around the world.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg">
              <span class="text-lg">📱</span>
            </a>
            <a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg">
              <span class="text-lg">🐦</span>
            </a>
            <a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg">
              <span class="text-lg">💬</span>
            </a>
            <a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg">
              <span class="text-lg">📧</span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-6">Quick Links</h4>
          <ul class="space-y-3">
            <li><a href="#home" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Home</a></li>
            <li><a href="#about" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">About</a></li>
            <li><a href="#features" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Features</a></li>
            <li><a href="#membership" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Membership</a></li>
            <li><a href="#testimonials" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Success Stories</a></li>
          </ul>
        </div>

        <!-- Community -->
        <div>
          <h4 class="text-lg font-semibold text-gray-900 mb-6">Community</h4>
          <ul class="space-y-3">
            <li><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Discord Server</a></li>
            <li><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Telegram Groups</a></li>
            <li><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Forum</a></li>
            <li><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Events</a></li>
            <li><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200">Blog</a></li>
          </ul>
        </div>
      </div>

      <!-- Newsletter -->
      <div class="card-glass p-8 mb-12">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            Join Our <span class="text-gradient-primary">Crypto Community</span>
          </h3>
          <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get exclusive access to crypto insights, trading signals, and community updates. Join thousands of successful crypto enthusiasts.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              class="flex-1 px-4 py-3 bg-white/80 border border-sky-200/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors duration-200 shadow-lg"
            >
            <button class="btn-primary px-8 py-3">
              <span class="mr-2">🚀</span>
              Join Now
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-sky-200/50">
        <div class="text-gray-500 text-sm mb-4 md:mb-0">
          © 2024 CryptoGroup. All rights reserved.
        </div>
        <div class="flex space-x-6 text-sm">
          <a href="#" class="text-gray-500 hover:text-sky-600 transition-colors duration-200">Privacy Policy</a>
          <a href="#" class="text-gray-500 hover:text-sky-600 transition-colors duration-200">Terms of Service</a>
          <a href="#" class="text-gray-500 hover:text-sky-600 transition-colors duration-200">Cookie Policy</a>
        </div>
      </div>
    </div>

    <!-- Floating Elements -->
    <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full opacity-10 animate-float"></div>
    <div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-300 rounded-full opacity-10 animate-float" style="animation-delay: 2s;"></div>
  </footer>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
.card-glass {
  @apply bg-white/80 backdrop-blur-sm border border-sky-200/50 rounded-2xl shadow-xl;
}

.btn-primary {
  @apply bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25 transform hover:-translate-y-1 hover:scale-105;
}
</style>