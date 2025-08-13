<template>
  <section id="demo" class="section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-900/50 to-dark-800/50"></div>
    
    <div class="container-custom relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6">
          <span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
          Try It Out
        </div>
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          🎮 Interactive <span class="text-gradient-primary">Demo</span>
        </h2>
        <p class="text-xl text-white/80 max-w-3xl mx-auto">
          Experience the power of our platform with these interactive demonstrations
        </p>
      </div>

      <!-- Demo Grid -->
      <div class="grid lg:grid-cols-2 gap-8 mb-16">
        <!-- Portfolio Simulator -->
        <div class="card-glass p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">💼 Portfolio Simulator</h3>
            <div class="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
          </div>
          
          <p class="text-white/70 mb-6">
            Test your investment strategy with our risk-free portfolio simulator. See how your choices would perform in real market conditions.
          </p>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span class="text-white">Initial Investment:</span>
              <span class="text-white font-semibold">$10,000</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span class="text-white">Current Value:</span>
              <span class="text-green-400 font-semibold">$12,450</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span class="text-white">Total Return:</span>
              <span class="text-green-400 font-semibold">+24.5%</span>
            </div>
          </div>
          
          <button class="w-full btn-primary mt-6">
            <span class="mr-2">🎯</span>
            Try Simulator
          </button>
        </div>

        <!-- Market Predictor -->
        <div class="card-glass p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-white">🔮 Market Predictor</h3>
            <div class="w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📈</span>
            </div>
          </div>
          
          <p class="text-white/70 mb-6">
            Explore our AI-powered market prediction tools and see how machine learning can help identify potential market trends.
          </p>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span class="text-white">Bitcoin Prediction:</span>
              <span class="text-green-400 font-semibold">Bullish 📈</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span class="text-white">Confidence Level:</span>
              <span class="text-blue-400 font-semibold">78%</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span class="text-white">Time Frame:</span>
              <span class="text-white font-semibold">7 Days</span>
            </div>
          </div>
          
          <button class="w-full btn-primary mt-6">
            <span class="mr-2">🔮</span>
            View Predictions
          </button>
        </div>
      </div>

      <!-- Interactive Chart Demo -->
      <div class="card-glass p-8 mb-16">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-white mb-4">📊 Live Chart Demo</h3>
          <p class="text-white/70">
            Experience our advanced charting tools with real-time data visualization
          </p>
        </div>
        
        <!-- Chart Placeholder -->
        <div class="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-8 text-center border border-white/10">
          <div class="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">📊</span>
          </div>
          <h4 class="text-lg font-semibold text-white mb-2">Interactive Chart</h4>
          <p class="text-white/60 mb-4">
            Real-time price charts with technical indicators, drawing tools, and multiple timeframes
          </p>
          <button class="btn-outline">
            <span class="mr-2">🔧</span>
            Launch Chart
          </button>
        </div>
      </div>

      <!-- Feature Showcase -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">⚡</span>
          </div>
          <h4 class="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
          <p class="text-white/70 text-sm">
            Sub-second data updates and instant chart rendering
          </p>
        </div>
        
        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">📱</span>
          </div>
          <h4 class="text-lg font-semibold text-white mb-2">Mobile Optimized</h4>
          <p class="text-white/70 text-sm">
            Responsive design that works perfectly on all devices
          </p>
        </div>
        
        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">🔒</span>
          </div>
          <h4 class="text-lg font-semibold text-white mb-2">Secure & Private</h4>
          <p class="text-white/70 text-sm">
            Your data is protected with enterprise-grade security
          </p>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="text-center mt-16">
        <div class="card-glass p-12 max-w-4xl mx-auto">
          <h3 class="text-3xl font-bold text-white mb-6">
            Ready to Experience the <span class="text-gradient-primary">Future</span>?
          </h3>
          <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already benefiting from our advanced crypto platform
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="btn-primary text-lg px-8 py-4">
              <span class="mr-2">🚀</span>
              Start Free Trial
            </button>
            <button class="btn-outline text-lg px-8 py-4">
              <span class="mr-2">📞</span>
              Contact Sales
            </button>
          </div>
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