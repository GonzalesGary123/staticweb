<template>
  <section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    <!-- Background Elements -->
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
    </div>

    <div class="container-custom relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left Content -->
        <div class="text-center lg:text-left space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 shadow-lg">
            <span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse"></span>
            Join 10,000+ Crypto Enthusiasts
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span class="text-gray-900">Join the Ultimate</span>
            <br>
            <span class="text-gradient-primary">Crypto Group</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Connect with crypto experts, get exclusive insights, and access premium opportunities in our thriving community of traders, developers, and investors.
          </p>

          <!-- Community Stats -->
          <div class="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div class="community-stat">
              <div class="text-2xl font-bold text-sky-600">10K+</div>
              <div class="text-sm text-gray-600">Active Members</div>
            </div>
            <div class="community-stat">
              <div class="text-2xl font-bold text-sky-600">50+</div>
              <div class="text-sm text-gray-600">Countries</div>
            </div>
            <div class="community-stat">
              <div class="text-2xl font-bold text-sky-600">24/7</div>
              <div class="text-sm text-gray-600">Support</div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#membership" class="btn-primary inline-flex items-center justify-center">
              <span class="mr-2">🚀</span>
              Join Community
            </a>
            <a href="#features" class="btn-outline inline-flex items-center justify-center">
              <span class="mr-2">🔍</span>
              Explore Features
            </a>
          </div>

          <!-- Trust Indicators -->
          <div class="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
            <div class="flex items-center">
              <span class="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
              Verified Members Only
            </div>
            <div class="flex items-center">
              <span class="w-4 h-4 bg-sky-500 rounded-full mr-2"></span>
              Secure & Private
            </div>
          </div>
        </div>

        <!-- Right Content -->
        <div class="relative">
          <!-- Community Preview Cards -->
          <div class="space-y-4">
            <!-- Discord Card -->
            <div class="community-preview-card discord">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-white text-xl">💬</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Discord Community</h3>
                    <p class="text-sm text-gray-600">5,000+ online now</p>
                  </div>
                </div>
                <div class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Live
                </div>
              </div>
              <div class="text-sm text-gray-600">
                <p>🔥 Hot discussion: Bitcoin ETF impact</p>
                <p>📊 24 new market alerts today</p>
              </div>
            </div>

            <!-- Telegram Card -->
            <div class="community-preview-card telegram">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-white text-xl">📱</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Telegram Groups</h3>
                    <p class="text-sm text-gray-600">3,000+ members</p>
                  </div>
                </div>
                <div class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
              <div class="text-sm text-gray-600">
                <p>💎 New presale opportunity</p>
                <p>🎯 Expert trading signals</p>
              </div>
            </div>

            <!-- Forum Card -->
            <div class="community-preview-card forum">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-white text-xl">📚</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Knowledge Forum</h3>
                    <p class="text-sm text-gray-600">1,000+ topics</p>
                  </div>
                </div>
                <div class="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Updated
                </div>
              </div>
              <div class="text-sm text-gray-600">
                <p>📖 New DeFi guide published</p>
                <p>🎓 Beginner course available</p>
              </div>
            </div>
          </div>

          <!-- Floating Elements -->
          <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full opacity-20 animate-float"></div>
          <div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-300 rounded-full opacity-20 animate-float" style="animation-delay: 2s;"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
.community-stat {
  @apply text-center p-4 bg-white/80 backdrop-blur-sm border border-sky-200/50 rounded-xl shadow-lg;
}

.community-preview-card {
  @apply bg-white/90 backdrop-blur-sm border border-sky-200/50 rounded-xl p-4 transform transition-all duration-200 hover:scale-105 shadow-lg;
}

.community-preview-card.discord {
  @apply border-indigo-300/50;
}

.community-preview-card.telegram {
  @apply border-blue-300/50;
}

.community-preview-card.forum {
  @apply border-purple-300/50;
}

.btn-primary {
  @apply bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/25 transform hover:-translate-y-1 hover:scale-105;
}

.btn-outline {
  @apply border-2 border-sky-500/50 text-sky-600 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:bg-sky-500 hover:text-white hover:border-sky-500 hover:shadow-lg;
}
</style>