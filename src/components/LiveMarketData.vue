<template>
  <section class="section live-market">
    <div class="container">
      <h2 class="section-title">📊 Live Market Data</h2>
      
      <!-- Market Overview -->
      <div class="market-overview" v-if="globalData">
        <div class="overview-card">
          <div class="overview-icon">🌍</div>
          <div class="overview-content">
            <h3>Global Market Cap</h3>
            <div class="overview-value">{{ formatMarketCap(globalData.total_market_cap) }}</div>
            <div class="overview-change" :class="getPriceChangeColor(globalData.market_cap_change_percentage_24h)">
              {{ formatPercentage(globalData.market_cap_change_percentage_24h) }}
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">📈</div>
          <div class="overview-content">
            <h3>24h Volume</h3>
            <div class="overview-value">{{ formatVolume(globalData.total_volume) }}</div>
            <div class="overview-change" :class="getPriceChangeColor(globalData.total_volume_yesterday)">
              {{ formatPercentage(globalData.total_volume_yesterday) }}
            </div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">🪙</div>
          <div class="overview-content">
            <h3>Active Coins</h3>
            <div class="overview-value">{{ globalData.active_cryptocurrencies.toLocaleString() }}</div>
            <div class="overview-subtitle">Cryptocurrencies</div>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">🏢</div>
          <div class="overview-content">
            <h3>Exchanges</h3>
            <div class="overview-value">{{ globalData.active_exchanges.toLocaleString() }}</div>
            <div class="overview-subtitle">Active</div>
          </div>
        </div>
      </div>
      
      <!-- Top Performers -->
      <div class="performers-section">
        <div class="performers-grid">
          <!-- Top Gainers -->
          <div class="performers-card gainers">
            <div class="card-header">
              <h3 class="card-title">🚀 Top Gainers (24h)</h3>
              <div class="card-subtitle">Best performing cryptocurrencies</div>
            </div>
            
            <div class="performers-list" v-if="topGainers.length > 0">
              <div 
                class="performer-item" 
                v-for="(coin, index) in topGainers" 
                :key="coin.id"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="performer-rank">{{ index + 1 }}</div>
                <img :src="coin.image" :alt="coin.name" class="performer-image" />
                <div class="performer-info">
                  <div class="performer-name">{{ coin.name }}</div>
                  <div class="performer-symbol">{{ coin.symbol }}</div>
                </div>
                <div class="performer-price">{{ formatPrice(coin.current_price) }}</div>
                <div class="performer-change positive">
                  {{ formatPercentage(coin.price_change_percentage_24h) }}
                </div>
              </div>
            </div>
            
            <div class="loading-placeholder" v-else-if="loading">
              <div class="loading-item" v-for="i in 5" :key="i">
                <div class="loading-shimmer"></div>
              </div>
            </div>
          </div>
          
          <!-- Top Losers -->
          <div class="performers-card losers">
            <div class="card-header">
              <h3 class="card-title">📉 Top Losers (24h)</h3>
              <div class="card-subtitle">Worst performing cryptocurrencies</div>
            </div>
            
            <div class="performers-list" v-if="topLosers.length > 0">
              <div 
                class="performer-item" 
                v-for="(coin, index) in topLosers" 
                :key="coin.id"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="performer-rank">{{ index + 1 }}</div>
                <img :src="coin.image" :alt="coin.name" class="performer-image" />
                <div class="performer-info">
                  <div class="performer-name">{{ coin.name }}</div>
                  <div class="performer-symbol">{{ coin.symbol }}</div>
                </div>
                <div class="performer-price">{{ formatPrice(coin.current_price) }}</div>
                <div class="performer-change negative">
                  {{ formatPercentage(coin.price_change_percentage_24h) }}
                </div>
              </div>
            </div>
            
            <div class="loading-placeholder" v-else-if="loading">
              <div class="loading-item" v-for="i in 5" :key="i">
                <div class="loading-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Market Table -->
      <div class="market-table-section">
        <div class="table-header">
          <h3 class="table-title">📋 All Cryptocurrencies</h3>
          <div class="table-controls">
            <button 
              class="refresh-btn" 
              @click="refreshData"
              :disabled="loading"
              :class="{ loading: loading }"
            >
              <span class="btn-icon">🔄</span>
              Refresh
            </button>
            <div class="last-updated" v-if="lastUpdated">
              Updated: {{ formatTime(lastUpdated) }}
            </div>
          </div>
        </div>
        
        <div class="market-table-container">
          <table class="market-table" v-if="!loading && marketData.length > 0">
            <thead>
              <tr>
                <th>#</th>
                <th>Coin</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Market Cap</th>
                <th>Volume (24h)</th>
                <th>Circulating Supply</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="coin in marketData" 
                :key="coin.id"
                class="table-row"
                :class="{ 'positive-change': coin.price_change_percentage_24h > 0, 'negative-change': coin.price_change_percentage_24h < 0 }"
              >
                <td class="rank-cell">{{ coin.market_cap_rank }}</td>
                <td class="coin-cell">
                  <div class="coin-info">
                    <img :src="coin.image" :alt="coin.name" class="coin-image" />
                    <div class="coin-details">
                      <div class="coin-name">{{ coin.name }}</div>
                      <div class="coin-symbol">{{ coin.symbol }}</div>
                    </div>
                  </div>
                </td>
                <td class="price-cell">{{ formatPrice(coin.current_price) }}</td>
                <td class="change-cell" :class="getPriceChangeColor(coin.price_change_percentage_24h)">
                  <span class="change-icon">{{ getPriceChangeIcon(coin.price_change_percentage_24h) }}</span>
                  {{ formatPercentage(coin.price_change_percentage_24h) }}
                </td>
                <td class="market-cap-cell">{{ formatMarketCap(coin.market_cap) }}</td>
                <td class="volume-cell">{{ formatVolume(coin.total_volume) }}</td>
                <td class="supply-cell">{{ formatSupply(coin.circulating_supply) }}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="loading-table" v-else-if="loading">
            <div class="loading-row" v-for="i in 8" :key="i">
              <div class="loading-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useCrypto } from '../composables/useCrypto.js'

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
  getPriceChangeColor,
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
.live-market {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

/* Market Overview */
.market-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.overview-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: var(--transition);
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-heavy);
}

.overview-icon {
  font-size: 3rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.overview-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
}

.overview-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 0.5rem;
}

.overview-change {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  display: inline-block;
}

.overview-change.positive {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.overview-change.negative {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.overview-subtitle {
  font-size: 0.9rem;
  color: #666;
}

/* Performers Section */
.performers-section {
  margin-bottom: 4rem;
}

.performers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.performers-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.card-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  color: #666;
  font-size: 0.9rem;
}

.performers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: var(--transition);
  animation: fadeInUp 0.6s ease-out both;
}

.performer-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(5px);
}

.performer-rank {
  width: 30px;
  height: 30px;
  background: var(--accent-gradient);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.performer-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.performer-info {
  flex: 1;
}

.performer-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.performer-symbol {
  font-size: 0.8rem;
  color: #666;
}

.performer-price {
  font-weight: 700;
  color: #333;
  margin-right: 1rem;
}

.performer-change {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.performer-change.positive {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.performer-change.negative {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

/* Market Table */
.market-table-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

.last-updated {
  color: #666;
  font-size: 0.9rem;
}

/* Table Styles */
.market-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.market-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.market-table th {
  background: var(--accent-gradient);
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.market-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.9rem;
}

.table-row:hover {
  background: rgba(0, 0, 0, 0.02);
}

.rank-cell {
  font-weight: 700;
  color: #666;
  width: 60px;
}

.coin-cell {
  min-width: 200px;
}

.coin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.coin-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.coin-details {
  display: flex;
  flex-direction: column;
}

.coin-name {
  font-weight: 600;
  color: #333;
}

.coin-symbol {
  font-size: 0.8rem;
  color: #666;
}

.price-cell {
  font-weight: 700;
  color: #333;
  min-width: 120px;
}

.change-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  min-width: 120px;
}

.change-icon {
  font-size: 1rem;
}

.market-cap-cell,
.volume-cell,
.supply-cell {
  font-weight: 600;
  color: #333;
  min-width: 120px;
}

.positive-change {
  color: #4caf50;
}

.negative-change {
  color: #f44336;
}

/* Loading States */
.loading-placeholder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-item {
  height: 60px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.loading-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
}

.loading-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading-row {
  height: 60px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .market-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .overview-card {
    padding: 1.5rem;
  }
  
  .overview-icon {
    font-size: 2rem;
  }
  
  .overview-value {
    font-size: 1.5rem;
  }
  
  .performers-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .market-table th,
  .market-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .coin-cell {
    min-width: 150px;
  }
  
  .price-cell,
  .change-cell,
  .market-cap-cell,
  .volume-cell,
  .supply-cell {
    min-width: 80px;
  }
}
</style>