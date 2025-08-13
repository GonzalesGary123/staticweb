<template>
  <section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    <!-- Background Elements -->
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
    </div>

    <div class="container-custom relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left Content -->
        <div class="text-center lg:text-left space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80">
            <span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
            Live Crypto Data • Real-time Updates
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span class="text-white">Join the Future of</span>
            <br>
            <span class="text-gradient-primary">Cryptocurrency</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Connect with crypto enthusiasts, get real-time market insights, and stay ahead of the digital economy revolution.
          </p>

          <!-- Market Stats -->
          <div v-if="!loading && marketData.length > 0" class="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div class="market-stat">
              <div class="text-2xl font-bold text-white">{{ formatMarketCap(totalMarketCap) }}</div>
              <div class="text-sm text-white/60">Market Cap</div>
            </div>
            <div class="market-stat">
              <div class="text-2xl font-bold text-white">{{ formatVolume(totalVolume) }}</div>
              <div class="text-sm text-white/60">24h Volume</div>
            </div>
            <div class="market-stat">
              <div class="text-2xl font-bold text-white">{{ marketData.length }}+</div>
              <div class="text-sm text-white/60">Coins</div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#market" class="btn-primary inline-flex items-center justify-center">
              <span class="mr-2">🚀</span>
              Explore Market
            </a>
            <a href="#demo" class="btn-outline inline-flex items-center justify-center">
              <span class="mr-2">🔧</span>
              Try Demo
            </a>
          </div>

          <!-- Last Updated -->
          <div v-if="lastUpdated" class="flex items-center justify-center lg:justify-start text-sm text-white/60">
            <div class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></div>
            Last updated: {{ formatTime(lastUpdated) }}
          </div>
        </div>

        <!-- Right Content - Crypto Cards -->
        <div class="relative">
          <!-- Live Crypto Cards -->
          <div v-if="!loading && marketData.length > 0" class="space-y-4">
            <div 
              v-for="(coin, index) in marketData.slice(0, 6)" 
              :key="coin.id"
              class="crypto-card transform transition-all duration-300 hover:scale-105"
              :class="coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <img :src="coin.image" :alt="coin.name" class="w-10 h-10 rounded-full">
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ coin.name }}</h3>
                    <p class="text-sm text-gray-600">{{ coin.symbol }}</p>
                  </div>
                </div>
                <div class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  #{{ coin.market_cap_rank }}
                </div>
              </div>
              
              <div class="mb-4">
                <div class="text-2xl font-bold text-gray-900 mb-2">{{ formatPrice(coin.current_price) }}</div>
                <div class="flex items-center space-x-2">
                  <span class="text-lg">{{ getPriceChangeIcon(coin.price_change_percentage_24h) }}</span>
                  <span 
                    class="font-semibold text-sm"
                    :class="coin.price_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ formatPercentage(coin.price_change_percentage_24h) }}
                  </span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Market Cap:</span>
                  <div class="font-semibold text-gray-900">{{ formatMarketCap(coin.market_cap) }}</div>
                </div>
                <div>
                  <span class="text-gray-600">Volume:</span>
                  <div class="font-semibold text-gray-900">{{ formatVolume(coin.total_volume) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loading" class="space-y-4">
            <div v-for="i in 6" :key="i" class="loading-shimmer h-32"></div>
          </div>

          <!-- Floating Elements -->
          <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 animate-float"></div>
          <div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full opacity-20 animate-float" style="animation-delay: 2s;"></div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
        <div class="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div class="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useCrypto } from '../composables/useCrypto.js'

const {
  marketData,
  loading,
  lastUpdated,
  totalMarketCap,
  totalVolume,
  formatPrice,
  formatPercentage,
  formatMarketCap,
  formatVolume,
  getPriceChangeIcon
} = useCrypto()

const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>