<template>
  <section id="market" class="section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-800/50 to-dark-900/50"></div>
    
    <div class="container-custom relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6">
          <span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
          Live Market Data
        </div>
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          📊 Real-Time <span class="text-gradient-primary">Crypto Market</span>
        </h2>
        <p class="text-xl text-white/80 max-w-3xl mx-auto">
          Stay updated with live cryptocurrency prices, market trends, and performance metrics
        </p>
      </div>

      <!-- Market Overview Cards -->
      <div v-if="globalData" class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">🌍</span>
          </div>
          <h3 class="text-lg font-semibold text-white/90 mb-2">Global Market Cap</h3>
          <div class="text-2xl font-bold text-white mb-2">{{ formatMarketCap(globalData.total_market_cap) }}</div>
          <div 
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="globalData.market_cap_change_percentage_24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
          >
            <span class="mr-1">{{ globalData.market_cap_change_percentage_24h >= 0 ? '📈' : '📉' }}</span>
            {{ formatPercentage(globalData.market_cap_change_percentage_24h) }}
          </div>
        </div>

        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">📈</span>
          </div>
          <h3 class="text-lg font-semibold text-white/90 mb-2">24h Volume</h3>
          <div class="text-2xl font-bold text-white mb-2">{{ formatVolume(globalData.total_volume) }}</div>
          <div 
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="globalData.total_volume_yesterday >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
          >
            <span class="mr-1">{{ globalData.total_volume_yesterday >= 0 ? '📈' : '📉' }}</span>
            {{ formatPercentage(globalData.total_volume_yesterday) }}
          </div>
        </div>

        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">🪙</span>
          </div>
          <h3 class="text-lg font-semibold text-white/90 mb-2">Active Coins</h3>
          <div class="text-2xl font-bold text-white mb-2">{{ globalData.active_cryptocurrencies.toLocaleString() }}</div>
          <div class="text-sm text-white/60">Cryptocurrencies</div>
        </div>

        <div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <span class="text-3xl">🏢</span>
          </div>
          <h3 class="text-lg font-semibold text-white/90 mb-2">Exchanges</h3>
          <div class="text-2xl font-bold text-white mb-2">{{ globalData.active_exchanges.toLocaleString() }}</div>
          <div class="text-sm text-white/60">Active</div>
        </div>
      </div>

      <!-- Top Performers Section -->
      <div class="grid lg:grid-cols-2 gap-8 mb-16">
        <!-- Top Gainers -->
        <div class="card-glass p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">🚀 Top Gainers (24h)</h3>
              <p class="text-white/60">Best performing cryptocurrencies</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📈</span>
            </div>
          </div>
          
          <div v-if="topGainers.length > 0" class="space-y-4">
            <div 
              v-for="(coin, index) in topGainers" 
              :key="coin.id"
              class="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                {{ index + 1 }}
              </div>
              <img :src="coin.image" :alt="coin.name" class="w-10 h-10 rounded-full mr-4">
              <div class="flex-1">
                <div class="font-semibold text-white">{{ coin.name }}</div>
                <div class="text-sm text-white/60">{{ coin.symbol }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-white">{{ formatPrice(coin.current_price) }}</div>
                <div class="text-sm text-green-400 font-medium">
                  +{{ formatPercentage(coin.price_change_percentage_24h) }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="loading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="loading-shimmer h-16"></div>
          </div>
        </div>

        <!-- Top Losers -->
        <div class="card-glass p-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-white mb-2">📉 Top Losers (24h)</h3>
              <p class="text-white/60">Worst performing cryptocurrencies</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📉</span>
            </div>
          </div>
          
          <div v-if="topLosers.length > 0" class="space-y-4">
            <div 
              v-for="(coin, index) in topLosers" 
              :key="coin.id"
              class="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                {{ index + 1 }}
              </div>
              <img :src="coin.image" :alt="coin.name" class="w-10 h-10 rounded-full mr-4">
              <div class="flex-1">
                <div class="font-semibold text-white">{{ coin.name }}</div>
                <div class="text-sm text-white/60">{{ coin.symbol }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-white">{{ formatPrice(coin.current_price) }}</div>
                <div class="text-sm text-red-400 font-medium">
                  {{ formatPercentage(coin.price_change_percentage_24h) }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="loading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="loading-shimmer h-16"></div>
          </div>
        </div>
      </div>

      <!-- Market Table Section -->
      <div class="card-glass p-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h3 class="text-2xl font-bold text-white mb-2">📋 All Cryptocurrencies</h3>
            <p class="text-white/60">Comprehensive market data and performance metrics</p>
          </div>
          <div class="flex items-center space-x-4 mt-4 lg:mt-0">
            <button 
              @click="refreshData"
              :disabled="loading"
              class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="mr-2">🔄</span>
              {{ loading ? 'Refreshing...' : 'Refresh Data' }}
            </button>
            <div v-if="lastUpdated" class="text-sm text-white/60">
              Updated: {{ formatTime(lastUpdated) }}
            </div>
          </div>
        </div>
        
        <!-- Market Table -->
        <div class="overflow-x-auto">
          <table class="w-full" v-if="!loading && marketData.length > 0">
            <thead>
              <tr class="border-b border-white/20">
                <th class="text-left py-4 px-4 text-white/80 font-semibold">#</th>
                <th class="text-left py-4 px-4 text-white/80 font-semibold">Coin</th>
                <th class="text-left py-4 px-4 text-white/80 font-semibold">Price</th>
                <th class="text-left py-4 px-4 text-white/80 font-semibold">24h Change</th>
                <th class="text-left py-4 px-4 text-white/80 font-semibold">Market Cap</th>
                <th class="text-left py-4 px-4 text-white/80 font-semibold">Volume (24h)</th>
                <th class="text-left py-4 px-4 text-white/80 font-semibold">Circulating Supply</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="coin in marketData" 
                :key="coin.id"
                class="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                :class="{ 'bg-green-500/5': coin.price_change_percentage_24h > 0, 'bg-red-500/5': coin.price_change_percentage_24h < 0 }"
              >
                <td class="py-4 px-4 text-white/60 font-medium">{{ coin.market_cap_rank }}</td>
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-3">
                    <img :src="coin.image" :alt="coin.name" class="w-8 h-8 rounded-full">
                    <div>
                      <div class="font-semibold text-white">{{ coin.name }}</div>
                      <div class="text-sm text-white/60">{{ coin.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 font-bold text-white">{{ formatPrice(coin.current_price) }}</td>
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg">{{ getPriceChangeIcon(coin.price_change_percentage_24h) }}</span>
                    <span 
                      class="font-semibold"
                      :class="coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'"
                    >
                      {{ formatPercentage(coin.price_change_percentage_24h) }}
                    </span>
                  </div>
                </td>
                <td class="py-4 px-4 font-semibold text-white">{{ formatMarketCap(coin.market_cap) }}</td>
                <td class="py-4 px-4 font-semibold text-white">{{ formatVolume(coin.total_volume) }}</td>
                <td class="py-4 px-4 font-semibold text-white">{{ formatSupply(coin.circulating_supply) }}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- Loading State -->
          <div v-else-if="loading" class="space-y-4">
            <div v-for="i in 8" :key="i" class="loading-shimmer h-16"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const {
  marketData,
  topGainers,
  topLosers,
  globalData,
  loading,
  lastUpdated,
  refreshData,
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

const formatSupply = (supply) => {
  if (!supply) return 'N/A'
  
  if (supply >= 1e9) {
    return `${(supply / 1e9).toFixed(2)}B`
  } else if (supply >= 1e6) {
    return `${(supply / 1e6).toFixed(2)}M`
  } else if (supply >= 1e3) {
    return `${(supply / 1e3).toFixed(2)}K`
  } else {
    return supply.toLocaleString()
  }
}
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>