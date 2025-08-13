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
            Connect with like-minded crypto enthusiasts, share insights, and stay ahead of the market trends. 
            Our community is your gateway to the digital economy revolution.
          </p>
          <div class="hero-buttons">
            <a href="#features" class="btn">Get Started</a>
            <a href="#about" class="btn btn-secondary">Learn More</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="crypto-cards">
            <div class="crypto-card" v-for="(coin, index) in cryptoCoins" :key="index">
              <div class="coin-icon">{{ coin.icon }}</div>
              <div class="coin-info">
                <h3>{{ coin.name }}</h3>
                <p class="coin-price">${{ coin.price }}</p>
                <span class="coin-change" :class="coin.change > 0 ? 'positive' : 'negative'">
                  {{ coin.change > 0 ? '+' : '' }}{{ coin.change }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const cryptoCoins = ref([
  { name: 'Bitcoin', icon: '₿', price: '43,250', change: 2.5 },
  { name: 'Ethereum', icon: 'Ξ', price: '2,680', change: -1.2 },
  { name: 'Cardano', icon: '₳', price: '0.48', change: 5.8 }
])
</script>

<style scoped>
.hero {
  padding: 120px 0 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #fff;
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.crypto-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.crypto-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.crypto-card:hover {
  transform: translateY(-5px);
}

.coin-icon {
  font-size: 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.coin-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.coin-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
}

.coin-change {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.coin-change.positive {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.coin-change.negative {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .crypto-cards {
    width: 100%;
  }
}
</style>