<template>
  <section class="section crypto-demo">
    <div class="container">
      <h2 class="section-title">🔧 API Demo & Testing</h2>
      
      <div class="demo-content">
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Select Cryptocurrencies:</label>
            <div class="crypto-selector">
              <label class="checkbox-item" v-for="crypto in availableCryptos" :key="crypto.id">
                <input 
                  type="checkbox" 
                  :value="crypto.id" 
                  v-model="selectedCryptos"
                  @change="updateSelection"
                >
                <span class="checkmark"></span>
                <img :src="crypto.image" :alt="crypto.name" class="crypto-thumb">
                {{ crypto.name }}
              </label>
            </div>
          </div>
          
          <div class="control-group">
            <label class="control-label">Auto-refresh Interval:</label>
            <select v-model="refreshInterval" @change="updateRefreshInterval" class="interval-select">
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
              <option value="300000">5 minutes</option>
            </select>
          </div>
          
          <div class="control-actions">
            <button @click="refreshData" :disabled="loading" class="btn">
              <span class="btn-icon">🔄</span>
              {{ loading ? 'Loading...' : 'Refresh Now' }}
            </button>
            <button @click="toggleAutoRefresh" class="btn btn-outline">
              <span class="btn-icon">{{ isAutoRefreshing ? '⏸️' : '▶️' }}</span>
              {{ isAutoRefreshing ? 'Stop Auto-refresh' : 'Start Auto-refresh' }}
            </button>
          </div>
        </div>
        
        <!-- API Status -->
        <div class="api-status">
          <div class="status-item">
            <span class="status-label">API Status:</span>
            <span class="status-value" :class="error ? 'error' : 'success'">
              {{ error ? 'Error' : 'Connected' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">Last Update:</span>
            <span class="status-value">{{ lastUpdated ? formatTime(lastUpdated) : 'Never' }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Data Source:</span>
            <span class="status-value">CoinGecko API</span>
          </div>
        </div>
        
        <!-- Real-time Data Display -->
        <div class="data-display" v-if="marketData.length > 0">
          <h3 class="display-title">📊 Selected Cryptocurrencies</h3>
          <div class="crypto-grid">
            <div 
              class="crypto-item" 
              v-for="coin in marketData" 
              :key="coin.id"
              :class="{ 'positive': coin.price_change_percentage_24h > 0, 'negative': coin.price_change_percentage_24h < 0 }"
            >
              <div class="crypto-header">
                <img :src="coin.image" :alt="coin.name" class="crypto-image">
                <div class="crypto-info">
                  <h4 class="crypto-name">{{ coin.name }}</h4>
                  <span class="crypto-symbol">{{ coin.symbol }}</span>
                </div>
                <div class="market-rank">#{{ coin.market_cap_rank }}</div>
              </div>
              
              <div class="crypto-price">
                <div class="current-price">{{ formatPrice(coin.current_price) }}</div>
                <div class="price-change">
                  <span class="change-icon">{{ getPriceChangeIcon(coin.price_change_percentage_24h) }}</span>
                  {{ formatPercentage(coin.price_change_percentage_24h) }}
                </div>
              </div>
              
              <div class="crypto-stats">
                <div class="stat-row">
                  <span class="stat-label">Market Cap:</span>
                  <span class="stat-value">{{ formatMarketCap(coin.market_cap) }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Volume (24h):</span>
                  <span class="stat-value">{{ formatVolume(coin.total_volume) }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-label">Supply:</span>
                  <span class="stat-value">{{ formatSupply(coin.circulating_supply) }}</span>
                </div>
              </div>
              
              <div class="crypto-chart">
                <div class="chart-placeholder">
                  <span class="chart-icon">📈</span>
                  <span class="chart-text">Price Chart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Error Display -->
        <div class="error-display" v-if="error">
          <div class="error-card">
            <div class="error-icon">⚠️</div>
            <h3 class="error-title">API Error</h3>
            <p class="error-message">{{ error }}</p>
            <button @click="refreshData" class="btn btn-outline">Retry</button>
          </div>
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
  // Trigger refresh with new selection
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
.crypto-demo {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.demo-content {
  max-width: 1000px;
  margin: 0 auto;
}

/* Demo Controls */
.demo-controls {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.control-group {
  margin-bottom: 1.5rem;
}

.control-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.crypto-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.checkbox-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: var(--transition);
}

.checkbox-item input[type="checkbox"]:checked + .checkmark {
  background: var(--accent-gradient);
  border-color: transparent;
}

.checkbox-item input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.crypto-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.interval-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.interval-select:focus {
  outline: none;
  border-color: var(--accent-gradient);
}

.control-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* API Status */
.api-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-item {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: var(--border-radius-small);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-light);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.status-label {
  font-weight: 600;
  color: #666;
}

.status-value {
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.status-value.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-value.error {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

/* Data Display */
.data-display {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.display-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

.crypto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.crypto-item {
  background: white;
  border-radius: var(--border-radius-small);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
  border: 2px solid transparent;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.crypto-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-gradient);
}

.crypto-item.positive {
  border-color: rgba(76, 175, 80, 0.3);
}

.crypto-item.negative {
  border-color: rgba(244, 67, 54, 0.3);
}

.crypto-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
}

.crypto-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.crypto-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.crypto-info {
  flex: 1;
}

.crypto-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
}

.crypto-symbol {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.market-rank {
  background: var(--accent-gradient);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.crypto-price {
  margin-bottom: 1.5rem;
}

.current-price {
  font-size: 1.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 0.5rem;
}

.price-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.change-icon {
  font-size: 1.2rem;
}

.crypto-stats {
  margin-bottom: 1.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.crypto-chart {
  height: 80px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-icon {
  font-size: 1.5rem;
}

.chart-text {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

/* Error Display */
.error-display {
  margin-top: 2rem;
}

.error-card {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: var(--border-radius-small);
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.error-message {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .crypto-selector {
    grid-template-columns: 1fr;
  }
  
  .control-actions {
    flex-direction: column;
  }
  
  .api-status {
    grid-template-columns: 1fr;
  }
  
  .crypto-grid {
    grid-template-columns: 1fr;
  }
  
  .crypto-item {
    padding: 1rem;
  }
  
  .current-price {
    font-size: 1.5rem;
  }
}
</style>