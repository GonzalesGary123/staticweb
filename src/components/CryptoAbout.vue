<template>
  <section id="about" class="section about">
    <div class="container">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title">About Our Crypto Community</h2>
          <p class="about-description">
            Founded in 2023, our crypto group has grown into one of the most vibrant and knowledgeable communities 
            in the digital currency space. We believe in the power of collective intelligence and the democratization 
            of financial knowledge.
          </p>
          
          <div class="stats-grid">
            <div class="stat-item" v-for="stat in stats" :key="stat.label">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          
          <div class="mission-section">
            <h3 class="mission-title">Our Mission</h3>
            <p class="mission-text">
              To empower individuals with the knowledge, tools, and connections needed to navigate the evolving 
              cryptocurrency landscape safely and profitably. We're committed to fostering an inclusive environment 
              where both beginners and experts can learn, grow, and succeed together.
            </p>
          </div>
          
          <div class="values-section">
            <h3 class="values-title">Core Values</h3>
            <ul class="values-list">
              <li v-for="value in values" :key="value">✓ {{ value }}</li>
            </ul>
          </div>
        </div>
        
        <div class="about-visual">
          <div class="community-image">
            <div class="floating-card card-1">
              <span class="card-icon">📈</span>
              <span class="card-text">Market Analysis</span>
            </div>
            <div class="floating-card card-2">
              <span class="card-icon">💡</span>
              <span class="card-text">Expert Tips</span>
            </div>
            <div class="floating-card card-3">
              <span class="card-icon">🔗</span>
              <span class="card-text">Networking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { value: '10K+', label: 'Active Members' },
  { value: '50+', label: 'Daily Discussions' },
  { value: '95%', label: 'Success Rate' },
  { value: '24/7', label: 'Support' }
])

const values = ref([
  'Transparency in all communications',
  'Continuous learning and education',
  'Respectful and inclusive community',
  'Security-first approach',
  'Innovation and forward-thinking'
])
</script>

<style scoped>
.about {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.about-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  align-items: start;
}

.about-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin: 3rem 0;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.mission-section, .values-section {
  margin-top: 2rem;
}

.mission-title, .values-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.mission-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.values-list {
  list-style: none;
  padding: 0;
}

.values-list li {
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 0;
  font-size: 1rem;
}

.about-visual {
  position: relative;
  height: 400px;
}

.community-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.card-2 {
  top: 50%;
  right: 20%;
  animation-delay: 2s;
}

.card-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.card-icon {
  font-size: 2rem;
}

.card-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .about-visual {
    height: 300px;
  }
  
  .floating-card {
    padding: 0.75rem;
  }
  
  .card-icon {
    font-size: 1.5rem;
  }
  
  .card-text {
    font-size: 0.8rem;
  }
}
</style>