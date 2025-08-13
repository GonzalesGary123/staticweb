<template>
  <section id="about" class="section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-800/50 to-dark-900/50"></div>
    
    <div class="container-custom relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left Content -->
        <div class="space-y-8">
          <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80">
            <span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
            About Our Community
          </div>
          
          <h2 class="text-4xl md:text-5xl font-bold text-white leading-tight">
            Building the Future of <span class="text-gradient-primary">Finance</span>
          </h2>
          
          <p class="text-xl text-white/80 leading-relaxed">
            CryptoGroup is more than just a platform – it's a global community of innovators, developers, traders, and enthusiasts who believe in the transformative power of blockchain technology.
          </p>
          
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">🌍</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2">Global Reach</h3>
                <p class="text-white/70">
                  Join thousands of members from over 50 countries, sharing knowledge and insights across different time zones and cultures.
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">🚀</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2">Innovation First</h3>
                <p class="text-white/70">
                  We're constantly exploring new technologies, from DeFi protocols to NFT marketplaces, staying ahead of the crypto curve.
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="text-2xl">🤝</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2">Collaborative Learning</h3>
                <p class="text-white/70">
                  Share strategies, discuss market trends, and learn from both beginners and seasoned professionals in our supportive environment.
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <button class="btn-primary text-lg px-8 py-4">
              <span class="mr-2">👥</span>
              Join Community
            </button>
            <button class="btn-outline text-lg px-8 py-4">
              <span class="mr-2">📖</span>
              Read Our Story
            </button>
          </div>
        </div>
        
        <!-- Right Content -->
        <div class="relative">
          <!-- Stats Cards -->
          <div class="grid grid-cols-2 gap-6">
            <div class="card-glass p-6 text-center">
              <div class="text-3xl font-bold text-white mb-2">10K+</div>
              <div class="text-white/60">Active Members</div>
            </div>
            <div class="card-glass p-6 text-center">
              <div class="text-3xl font-bold text-white mb-2">50+</div>
              <div class="text-white/60">Countries</div>
            </div>
            <div class="card-glass p-6 text-center">
              <div class="text-3xl font-bold text-white mb-2">24/7</div>
              <div class="text-white/60">Support</div>
            </div>
            <div class="card-glass p-6 text-center">
              <div class="text-3xl font-bold text-white mb-2">100+</div>
              <div class="text-white/60">Daily Discussions</div>
            </div>
          </div>
          
          <!-- Floating Elements -->
          <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 animate-float"></div>
          <div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full opacity-20 animate-float" style="animation-delay: 2s;"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Component logic can be added here
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>