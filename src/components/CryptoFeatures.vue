<template>
  <section id="features" class="section features">
    <div class="container">
      <h2 class="section-title">Why Join Our Crypto Group?</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.id">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    id: 1,
    icon: '💬',
    title: 'Community Discussions',
    description: 'Engage in meaningful conversations about blockchain technology, trading strategies, and market analysis with experienced crypto enthusiasts.'
  },
  {
    id: 2,
    icon: '📊',
    title: 'Market Insights',
    description: 'Get real-time market updates, price alerts, and expert analysis to make informed investment decisions.'
  },
  {
    id: 3,
    icon: '🎓',
    title: 'Educational Resources',
    description: 'Access tutorials, guides, and webinars to expand your knowledge about cryptocurrencies and blockchain technology.'
  },
  {
    id: 4,
    icon: '🤝',
    title: 'Networking',
    description: 'Connect with developers, investors, and entrepreneurs in the crypto space to build valuable relationships.'
  },
  {
    id: 5,
    icon: '🔒',
    title: 'Security Tips',
    description: 'Learn best practices for securing your digital assets and protecting yourself from scams and fraud.'
  },
  {
    id: 6,
    icon: '🚀',
    title: 'Early Access',
    description: 'Be among the first to discover promising new projects, airdrops, and investment opportunities.'
  }
])
</script>

<style scoped>
.features {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  display: block;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.feature-description {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 2rem;
  }
  
  .feature-icon {
    font-size: 3rem;
  }
}
</style>