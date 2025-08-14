<template>
  <section v-if="isGameActive" class="trading-interface fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
    <div class="min-h-screen p-4">
      <!-- Game Header -->
      <div class="container-custom">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <span class="text-3xl">🎮</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-white">Trading Arena</h1>
              <div class="text-white/60">{{ gameMode === 'challenge' ? 'Challenge Mode' : 'Simulation Mode' }}</div>
            </div>
          </div>
          
          <div class="flex items-center space-x-6">
            <!-- Timer -->
            <div v-if="gameMode === 'challenge'" class="text-center">
              <div class="text-2xl font-bold text-white">{{ formatTime(timeRemaining) }}</div>
              <div class="text-sm text-white/60">Time Left</div>
            </div>
            
            <!-- Player Stats -->
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-400">{{ formatCoins(player.coins) }}</div>
              <div class="text-sm text-white/60">Coins</div>
            </div>
            
            <!-- Portfolio Value -->
            <div class="text-center">
              <div class="text-2xl font-bold text-green-400">{{ formatCoins(portfolioValue) }}</div>
              <div class="text-sm text-white/60">Portfolio</div>
            </div>
            
            <!-- End Game Button -->
            <button 
              @click="endGame"
              class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              End Game
            </button>
          </div>
        </div>

        <!-- Game Grid -->
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Market Data -->
          <div class="lg:col-span-2">
            <div class="card-glass p-6 mb-6">
              <h3 class="text-2xl font-bold text-white mb-6">📊 Live Market</h3>
              
              <div v-if="!loading && marketData.length > 0" class="space-y-4">
                <div 
                  v-for="coin in marketData.slice(0, 8)" 
                  :key="coin.id"
                  class="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200"
                >
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span class="text-xl">🪙</span>
                    </div>
                    <div>
                      <div class="font-semibold text-white">{{ coin.symbol.toUpperCase() }}</div>
                      <div class="text-sm text-white/60">{{ coin.name }}</div>
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <div class="font-bold text-white">${{ formatPrice(coin.current_price) }}</div>
                    <div 
                      class="text-sm"
                      :class="coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'"
                    >
                      {{ coin.price_change_percentage_24h > 0 ? '+' : '' }}{{ coin.price_change_percentage_24h.toFixed(2) }}%
                    </div>
                  </div>
                  
                  <div class="flex space-x-2">
                    <button 
                      @click="openTradeModal('buy', coin)"
                      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200"
                    >
                      Buy
                    </button>
                    <button 
                      @click="openTradeModal('sell', coin)"
                      :disabled="!hasAsset(coin.id)"
                      class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else-if="loading" class="space-y-4">
                <div v-for="i in 6" :key="i" class="loading-shimmer h-16"></div>
              </div>
            </div>
          </div>

          <!-- Trading Panel -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="card-glass p-6">
              <h4 class="text-xl font-bold text-white mb-4">📈 Performance</h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-white/60">Total Trades:</span>
                  <span class="text-white font-semibold">{{ player.trades }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/60">Success Rate:</span>
                  <span class="text-white font-semibold">{{ successRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/60">Current Streak:</span>
                  <span class="text-white font-semibold">{{ player.streak }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/60">Total Profit:</span>
                  <span class="font-semibold" :class="totalProfit >= 0 ? 'text-green-400' : 'text-red-400'">
                    {{ totalProfit >= 0 ? '+' : '' }}{{ formatCoins(totalProfit) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Portfolio Summary -->
            <div class="card-glass p-6">
              <h4 class="text-xl font-bold text-white mb-4">💼 Portfolio</h4>
              <div v-if="player.portfolio.length > 0" class="space-y-3">
                <div 
                  v-for="asset in player.portfolio" 
                  :key="asset.id"
                  class="p-3 bg-white/5 rounded-lg"
                >
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-white font-semibold">{{ asset.id.toUpperCase() }}</span>
                    <span class="text-sm text-white/60">{{ asset.quantity }} units</span>
                  </div>
                  <div class="text-sm text-white/60">
                    Avg: ${{ formatPrice(asset.averagePrice) }} | 
                    Current: ${{ formatPrice(asset.currentPrice) }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-white/60">
                No assets in portfolio
              </div>
            </div>

            <!-- Recent Trades -->
            <div class="card-glass p-6">
              <h4 class="text-xl font-bold text-white mb-4">🔄 Recent Trades</h4>
              <div v-if="recentTrades.length > 0" class="space-y-2">
                <div 
                  v-for="trade in recentTrades.slice(0, 5)" 
                  :key="trade.id"
                  class="flex justify-between items-center p-2 bg-white/5 rounded"
                >
                  <div class="text-sm">
                    <span class="text-white">{{ trade.type.toUpperCase() }}</span>
                    <span class="text-white/60 ml-2">{{ trade.asset }}</span>
                  </div>
                  <span class="text-sm" :class="trade.profit >= 0 ? 'text-green-400' : 'text-red-400'">
                    {{ trade.profit >= 0 ? '+' : '' }}{{ formatCoins(trade.profit) }}
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-4 text-white/60">
                No trades yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <div v-if="showTradeModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="card-glass p-8 max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">
            {{ tradeType === 'buy' ? '🟢 Buy' : '🔴 Sell' }} {{ selectedAsset?.symbol?.toUpperCase() }}
          </h3>
          <button @click="closeTradeModal" class="text-white/60 hover:text-white">
            <span class="text-2xl">✕</span>
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Asset Info -->
          <div class="p-4 bg-white/5 rounded-xl">
            <div class="flex justify-between items-center mb-2">
              <span class="text-white/60">Current Price:</span>
              <span class="text-white font-bold">${{ formatPrice(selectedAsset?.current_price) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/60">24h Change:</span>
              <span 
                class="font-semibold"
                :class="selectedAsset?.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ selectedAsset?.price_change_percentage_24h > 0 ? '+' : '' }}{{ selectedAsset?.price_change_percentage_24h?.toFixed(2) }}%
              </span>
            </div>
          </div>

          <!-- Trade Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-white/80 text-sm font-medium mb-2">
                {{ tradeType === 'buy' ? 'Amount to Buy' : 'Amount to Sell' }}
              </label>
              <input 
                v-model.number="tradeAmount"
                type="number"
                :min="0"
                :max="tradeType === 'buy' ? maxBuyAmount : maxSellAmount"
                step="0.01"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                :placeholder="tradeType === 'buy' ? 'Enter amount' : 'Enter amount'"
              >
            </div>
            
            <div class="text-sm text-white/60">
              {{ tradeType === 'buy' ? 'Cost' : 'Revenue' }}: 
              <span class="text-white font-semibold">
                {{ formatCoins(tradeAmount * (selectedAsset?.current_price || 0)) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="closeTradeModal"
              class="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              @click="executeTrade"
              :disabled="!canExecuteTrade"
              class="flex-1 px-4 py-3 font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'"
            >
              {{ tradeType === 'buy' ? 'Buy' : 'Sell' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { 
  player, 
  isGameActive, 
  gameMode, 
  timeLimit,
  portfolioValue,
  totalProfit,
  endGame,
  buyAsset,
  sellAsset
} = useGameState()

const { marketData, loading } = useCrypto()

// Local state
const showTradeModal = ref(false)
const tradeType = ref('buy')
const selectedAsset = ref(null)
const tradeAmount = ref(0)
const timeRemaining = ref(timeLimit)
const recentTrades = ref([])

// Computed properties
const successRate = computed(() => {
  if (player.value.trades === 0) return 0
  return Math.round((player.value.successfulTrades / player.value.trades) * 100)
})

const maxBuyAmount = computed(() => {
  if (!selectedAsset.value) return 0
  return Math.floor(player.value.coins / selectedAsset.value.current_price)
})

const maxSellAmount = computed(() => {
  if (!selectedAsset.value) return 0
  const asset = player.value.portfolio.find(a => a.id === selectedAsset.value.id)
  return asset ? asset.quantity : 0
})

const canExecuteTrade = computed(() => {
  if (tradeType.value === 'buy') {
    return tradeAmount.value > 0 && tradeAmount.value <= maxBuyAmount.value
  } else {
    return tradeAmount.value > 0 && tradeAmount.value <= maxSellAmount.value
  }
})

// Methods
const openTradeModal = (type, asset) => {
  tradeType.value = type
  selectedAsset.value = asset
  tradeAmount.value = 0
  showTradeModal.value = true
}

const closeTradeModal = () => {
  showTradeModal.value = false
  selectedAsset.value = null
  tradeAmount.value = 0
}

const executeTrade = () => {
  if (!selectedAsset.value || !canExecuteTrade.value) return
  
  let success = false
  if (tradeType.value === 'buy') {
    success = buyAsset(selectedAsset.value.id, tradeAmount.value, selectedAsset.value.current_price)
  } else {
    success = sellAsset(selectedAsset.value.id, tradeAmount.value, selectedAsset.value.current_price)
  }
  
  if (success) {
    // Add to recent trades
    const trade = {
      id: Date.now(),
      type: tradeType.value,
      asset: selectedAsset.value.symbol,
      amount: tradeAmount.value,
      price: selectedAsset.value.current_price,
      profit: 0, // Calculate based on trade type
      timestamp: Date.now()
    }
    recentTrades.value.unshift(trade)
    
    // Keep only last 10 trades
    if (recentTrades.value.length > 10) {
      recentTrades.value = recentTrades.value.slice(0, 10)
    }
    
    closeTradeModal()
  }
}

const hasAsset = (assetId) => {
  return player.value.portfolio.some(asset => asset.id === assetId)
}

const formatPrice = (price) => {
  if (!price) return '0.00'
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

const formatCoins = (amount) => {
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`
  return Math.floor(amount).toLocaleString()
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Timer logic
let timer = null

onMounted(() => {
  if (gameMode.value === 'challenge') {
    timer = setInterval(() => {
      timeRemaining.value--
      if (timeRemaining.value <= 0) {
        endGame()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>