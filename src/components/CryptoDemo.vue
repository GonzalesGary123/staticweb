<template>
  <section id="demo" class="section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-800/50 to-dark-900/50"></div>
    
    <div class="container-custom relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6">
          <span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
          Interactive Demo
        </div>
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          🔧 API <span class="text-gradient-primary">Demo & Testing</span>
        </h2>
        <p class="text-xl text-white/80 max-w-3xl mx-auto">
          Test our crypto API functionality, customize data selection, and explore real-time features
        </p>
      </div>

      <!-- Demo Controls -->
      <div class="card-glass p-8 mb-12">
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Cryptocurrency Selector -->
          <div>
            <h3 class="text-xl font-bold text-white mb-4">Select Cryptocurrencies</h3>
            <div class="space-y-3">
              <label 
                v-for="crypto in availableCryptos" 
                :key="crypto.id"
                class="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                <input 
                  type="checkbox" 
                  :value="crypto.id" 
                  v-model="selectedCryptos"
                  @change="updateSelection"
                  class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                >
                <img :src="crypto.image" :alt="crypto.name" class="w-6 h-6 rounded-full mx-3">
                <span class="text-white font-medium">{{ crypto.name }}</span>
              </label>
            </div>
          </div>

          <!-- Refresh Controls -->
          <div>
            <h3 class="text-xl font-bold text-white mb-4">Auto-refresh Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-white/80 text-sm font-medium mb-2">Interval</label>
                <select 
                  v-model="refreshInterval" 
                  @change="updateRefreshInterval" 
                  class="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="10000" class="bg-dark-800">10 seconds</option>
                  <option value="30000" class="bg-dark-800">30 seconds</option>
                  <option value="60000" class="bg-dark-800">1 minute</option>
                  <option value="300000" class="bg-dark-800">5 minutes</option>
                </select>
              </div>
              
              <div class="space-y-3">
                <button 
                  @click="refreshData" 
                  :disabled="loading" 
                  class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="mr-2">🔄</span>
                  {{ loading ? 'Loading...' : 'Refresh Now' }}
                </button>
                
                <button 
                  @click="toggleAutoRefresh" 
                  class="w-full btn-outline"
                >
                  <span class="mr-2">{{ isAutoRefreshing ? '⏸️' : '▶️' }}</span>
                  {{ isAutoRefreshing ? 'Stop Auto-refresh' : 'Start Auto-refresh' }}
                </button>
              </div>
            </div>
          </div>

          <!-- API Status -->
          <div>
            <h3 class="text-xl font-bold text-white mb-4">API Status</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span class="text-white/80">Status:</span>
                <span 
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="error ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'"
                >
                  {{ error ? 'Error' : 'Connected' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span class="text-white/80">Last Update:</span>
                <span class="text-white font-medium">{{ lastUpdated ? formatTime(lastUpdated) : 'Never' }}</span>
              </div>
              
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span class="text-white/80">Data Source:</span>
                <span class="text-white font-medium">CoinGecko API</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Data Display -->
      <div v-if="marketData.length > 0" class="card-glass p-8">
        <h3 class="text-2xl font-bold text-white mb-6 text-center">📊 Selected Cryptocurrencies</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="coin in marketData" 
            :key="coin.id"
            class="crypto-card transform transition-all duration-300 hover:scale-105"
            :class="coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <img :src="coin.image" :alt="coin.name" class="w-10 h-10 rounded-full">
                <div>
                  <h4 class="font-semibold text-gray-900">{{ coin.name }}</h4>
                  <span class="text-sm text-gray-600">{{ coin.symbol }}</span>
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
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Market Cap:</span>
                <span class="font-semibold text-gray-900">{{ formatMarketCap(coin.market_cap) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Volume:</span>
                <span class="font-semibold text-gray-900">{{ formatVolume(coin.total_volume) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Supply:</span>
                <span class="font-semibold text-gray-900">{{ formatSupply(coin.circulating_supply) }}</span>
              </div>
            </div>
            
            <div class="mt-4 h-16 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <span class="text-2xl">📈</span>
                <div class="text-xs text-gray-600 mt-1">Price Chart</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-8">
        <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <div class="text-4xl mb-4">⚠️</div>
          <h3 class="text-2xl font-bold text-red-400 mb-4">API Error</h3>
          <p class="text-red-300 mb-6">{{ error }}</p>
          <button @click="refreshData" class="btn-outline">Retry</button>
        </div>
      </div>

      <!-- Features Showcase -->
      <div class="mt-16 grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">⚡</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Real-time Updates</h3>
          <p class="text-white/60">Live data that refreshes automatically with configurable intervals</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🔧</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Interactive Controls</h3>
          <p class="text-white/60">Customize which cryptocurrencies to display and refresh settings</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">📊</span>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Comprehensive Data</h3>
          <p class="text-white/60">Market caps, volumes, price changes, and supply information</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCrypto } from '../composables/useCrypto.js'

const {
  marketData,
  loading,
  error,
  lastUpdated,
  refreshData,
  startAutoRefresh,
  stopAutoRefresh,
  formatPrice,
  formatPercentage,
  formatMarketCap,
  formatVolume,
  getPriceChangeIcon
} = useCrypto()

// Local state
const selectedCryptos = ref(['bitcoin', 'ethereum', 'cardano'])
const refreshInterval = ref(30000)
const isAutoRefreshing = ref(true)

// Available cryptocurrencies for selection
const availableCryptos = ref([
  { id: 'bitcoin', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'cardano', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/Cardano_Logo.png' },
  { id: 'solana', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'polkadot', name: 'Polkadot', image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot_new_logo.png' },
  { id: 'ripple', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
  { id: 'dogecoin', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
  { id: 'avalanche', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/large/avalanche.png' }
])

// Computed
const filteredMarketData = computed(() => {
  return marketData.value.filter(coin => selectedCryptos.value.includes(coin.id))
})

// Methods
const updateSelection = () => {
  refreshData()
}

const updateRefreshInterval = () => {
  if (isAutoRefreshing.value) {
    stopAutoRefresh()
    startAutoRefresh(parseInt(refreshInterval.value))
  }
}

const toggleAutoRefresh = () => {
  if (isAutoRefreshing.value) {
    stopAutoRefresh()
    isAutoRefreshing.value = false
  } else {
    startAutoRefresh(parseInt(refreshInterval.value))
    isAutoRefreshing.value = true
  }
}

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

// Lifecycle
onMounted(() => {
  startAutoRefresh(parseInt(refreshInterval.value))
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>