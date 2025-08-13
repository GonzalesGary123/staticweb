<template>
  <section id="features" class="section features">
    <div class="container">
      <h2 class="section-title">Why Join Our Crypto Group?</h2>
      <div class="features-grid">
        <div 
          class="feature-card" 
          v-for="(feature, index) in features" 
          :key="feature.id"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
          <div class="feature-badge">{{ feature.badge }}</div>
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
    description: 'Engage in meaningful conversations about blockchain technology, trading strategies, and market analysis with experienced crypto enthusiasts.',
    badge: 'Most Popular'
  },
  {
    id: 2,
    icon: '📊',
    title: 'Real-Time Market Data',
    description: 'Get live market updates, price alerts, and expert analysis to make informed investment decisions with our integrated crypto API.',
    badge: 'Live Data'
  },
  {
    id: 3,
    icon: '🎓',
    title: 'Educational Resources',
    description: 'Access tutorials, guides, and webinars to expand your knowledge about cryptocurrencies and blockchain technology.',
    badge: 'Learn'
  },
  {
    id: 4,
    icon: '🤝',
    title: 'Networking',
    description: 'Connect with developers, investors, and entrepreneurs in the crypto space to build valuable relationships.',
    badge: 'Connect'
  },
  {
    id: 5,
    icon: '🔒',
    title: 'Security Tips',
    description: 'Learn best practices for securing your digital assets and protecting yourself from scams and fraud.',
    badge: 'Secure'
  },
  {
    id: 6,
    icon: '🚀',
    title: 'Early Access',
    description: 'Be among the first to discover promising new projects, airdrops, and investment opportunities.',
    badge: 'Exclusive'
  }
])
</script>

<style scoped>
.features {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 3rem 2.5rem;
  text-align: center;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out both;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.6s;
}

.feature-card:hover::before {
  left: 100%;
}

.feature-card:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: var(--shadow-heavy);
}

.feature-icon {
  font-size: 4.5rem;
  margin-bottom: 2rem;
  display: block;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: var(--transition);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
}

.feature-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--accent-gradient);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.feature-card:hover .feature-title::after {
  width: 60px;
}

.feature-description {
  color: #666;
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.feature-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--success-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: var(--shadow-light);
}

/* Responsive */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .feature-card {
    padding: 2.5rem 2rem;
  }
  
  .feature-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
  }
  
  .feature-title {
    font-size: 1.4rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>