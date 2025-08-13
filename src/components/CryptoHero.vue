<template>
  <section id="home" class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Join the Future of
            <span class="gradient-text">Cryptocurrency</span>
          </h1>
          <p class="hero-subtitle">
            Connect with like-minded crypto enthusiasts, get real-time market insights, 
            and stay ahead of the digital economy revolution.
          </p>
          
          <!-- Market Stats -->
          <div class="market-stats" v-if="!loading && marketData.length > 0">
            <div class="stat-item">
              <div class="stat-value">{{ formatMarketCap(totalMarketCap) }}</div>
              <div class="stat-label">Total Market Cap</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatVolume(totalVolume) }}</div>
              <div class="stat-label">24h Volume</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ marketData.length }}+</div>
              <div class="stat-label">Cryptocurrencies</div>
            </div>
          </div>
          
          <div class="hero-buttons">
            <a href="#features" class="btn">
              <span>🚀</span>
              Get Started
            </a>
            <a href="#about" class="btn btn-outline">
              <span>📚</span>
              Learn More
            </a>
          </div>
          
          <!-- Last Updated -->
          <div class="last-updated" v-if="lastUpdated">
            <span class="update-icon">🔄</span>
            Last updated: {{ formatTime(lastUpdated) }}
          </div>
        </div>
        
        <div class="hero-visual">
          <!-- Live Crypto Cards -->
          <div class="crypto-cards" v-if="!loading && marketData.length > 0">
            <div 
              class="crypto-card" 
              v-for="(coin, index) in marketData.slice(0, 6)" 
              :key="coin.id"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="coin-header">
                <img :src="coin.image" :alt="coin.name" class="coin-image" />
                <div class="coin-info">
                  <h3 class="coin-name">{{ coin.name }}</h3>
                  <span class="coin-symbol">{{ coin.symbol }}</span>
                </div>
                <div class="market-rank">#{{ coin.market_cap_rank }}</div>
              </div>
              
              <div class="coin-price-section">
                <div class="coin-price">{{ formatPrice(coin.current_price) }}</div>
                <div class="price-change" :class="getPriceChangeColor(coin.price_change_percentage_24h)">
                  <span class="change-icon">{{ getPriceChangeIcon(coin.price_change_percentage_24h) }}</span>
                  {{ formatPercentage(coin.price_change_percentage_24h) }}
                </div>
              </div>
              
              <div class="coin-stats">
                <div class="stat">
                  <span class="stat-label">Market Cap:</span>
                  <span class="stat-value">{{ formatMarketCap(coin.market_cap) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Volume:</span>
                  <span class="stat-value">{{ formatVolume(coin.total_volume) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div class="loading-cards" v-else-if="loading">
            <div class="loading-card" v-for="i in 6" :key="i">
              <div class="loading-shimmer"></div>
            </div>
          </div>
          
          <!-- Trending Section -->
          <div class="trending-section" v-if="trendingCoins.length > 0">
            <h3 class="trending-title">🔥 Trending Now</h3>
            <div class="trending-list">
              <div 
                class="trending-item" 
                v-for="coin in trendingCoins.slice(0, 5)" 
                :key="coin.id"
              >
                <img :src="coin.image" :alt="coin.name" class="trending-image" />
                <div class="trending-info">
                  <span class="trending-name">{{ coin.name }}</span>
                  <span class="trending-symbol">{{ coin.symbol }}</span>
                </div>
                <div class="trending-score">{{ coin.score.toFixed(1) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Background Elements -->
    <div class="hero-bg-elements">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>
  </section>
</template>

<script setup>
import { useCrypto } from '../composables/useCrypto.js'

const {
  marketData,
  trendingCoins,
  loading,
  lastUpdated,
  totalMarketCap,
  totalVolume,
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
</script>

<style scoped>
.hero {
  padding: 120px 0 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.gradient-text::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-gradient);
  border-radius: 2px;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Market Stats */
.market-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: var(--glass-bg);
  border-radius: var(--border-radius-small);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: var(--transition);
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.update-icon {
  animation: spin 2s linear infinite;
}

/* Crypto Cards */
.crypto-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 500px;
}

.crypto-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius-small);
  padding: 1.5rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: var(--transition);
  animation: fadeInUp 0.6s ease-out both;
}

.crypto-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-heavy);
}

.coin-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.coin-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.coin-info {
  flex: 1;
}

.coin-name {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
}

.coin-symbol {
  font-size: 0.8rem;
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

.coin-price-section {
  margin-bottom: 1rem;
}

.coin-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 0.5rem;
}

.price-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.change-icon {
  font-size: 1rem;
}

.coin-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.stat-label {
  color: #666;
}

.stat-value {
  color: #333;
  font-weight: 600;
}

/* Loading State */
.loading-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.loading-card {
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-small);
  overflow: hidden;
  position: relative;
}

.loading-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Trending Section */
.trending-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  border-radius: var(--border-radius-small);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.trending-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: var(--transition);
}

.trending-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.trending-image {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.trending-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.trending-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.trending-symbol {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.trending-score {
  background: var(--warning-gradient);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Background Elements */
.hero-bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: var(--accent-gradient);
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 5%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 20%;
  animation-delay: 4s;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .hero-title {
    font-size: clamp(2.5rem, 8vw, 3.5rem);
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .market-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .crypto-cards {
    grid-template-columns: 1fr;
    max-width: 100%;
  }
  
  .trending-section {
    margin-top: 1.5rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>