import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cryptoApi } from '../services/cryptoApi.js'

export function useCrypto() {
  // Reactive state
  const marketData = ref([])
  const trendingCoins = ref([])
  const globalData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)
  
  // Auto-refresh interval
  let refreshInterval = null

  // Computed properties
  const topGainers = computed(() => {
    return [...marketData.value]
      .filter(coin => coin.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5)
  })

  const topLosers = computed(() => {
    return [...marketData.value]
      .filter(coin => coin.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 5)
  })

  const totalMarketCap = computed(() => {
    return marketData.value.reduce((total, coin) => total + (coin.market_cap || 0), 0)
  })

  const totalVolume = computed(() => {
    return marketData.value.reduce((total, coin) => total + (coin.total_volume || 0), 0)
  })

  // Methods
  const fetchMarketData = async (ids = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot', 'ripple', 'dogecoin', 'avalanche']) => {
    try {
      loading.value = true
      error.value = null
      
      const data = await cryptoApi.getMarketData(ids)
      marketData.value = data
      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err.message
      console.error('Error fetching market data:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTrendingCoins = async () => {
    try {
      const data = await cryptoApi.getTrendingCoins()
      trendingCoins.value = data
    } catch (err) {
      console.error('Error fetching trending coins:', err)
    }
  }

  const fetchGlobalData = async () => {
    try {
      const data = await cryptoApi.getGlobalMarketData()
      globalData.value = data
    } catch (err) {
      console.error('Error fetching global data:', err)
    }
  }

  const refreshData = async () => {
    await Promise.all([
      fetchMarketData(),
      fetchTrendingCoins(),
      fetchGlobalData()
    ])
  }

  const startAutoRefresh = (intervalMs = 30000) => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    
    refreshInterval = setInterval(refreshData, intervalMs)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  const formatPrice = (price) => {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price)
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 8
      }).format(price)
    }
  }

  const formatPercentage = (percentage) => {
    if (!percentage) return '0.00%'
    
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(2)}%`
  }

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '$0'
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`
    } else {
      return `$${marketCap.toFixed(2)}`
    }
  }

  const formatVolume = (volume) => {
    if (!volume) return '$0'
    
    if (volume >= 1e12) {
      return `$${(volume / 1e12).toFixed(2)}T`
    } else if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`
    } else {
      return `$${volume.toFixed(2)}`
    }
  }

  const getPriceChangeColor = (percentage) => {
    if (!percentage) return 'text-gray-500'
    return percentage >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const getPriceChangeIcon = (percentage) => {
    if (!percentage) return '➖'
    return percentage >= 0 ? '📈' : '📉'
  }

  // Lifecycle
  onMounted(() => {
    refreshData()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // State
    marketData,
    trendingCoins,
    globalData,
    loading,
    error,
    lastUpdated,
    
    // Computed
    topGainers,
    topLosers,
    totalMarketCap,
    totalVolume,
    
    // Methods
    fetchMarketData,
    fetchTrendingCoins,
    fetchGlobalData,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Utilities
    formatPrice,
    formatPercentage,
    formatMarketCap,
    formatVolume,
    getPriceChangeColor,
    getPriceChangeIcon
  }
}