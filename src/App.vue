<script setup>
import CryptoHeader from './components/CryptoHeader.vue'
import CryptoHero from './components/CryptoHero.vue'
import CryptoFeatures from './components/CryptoFeatures.vue'
import CryptoAbout from './components/CryptoAbout.vue'
import CryptoFooter from './components/CryptoFooter.vue'
</script>

<template>
  <div id="app">
    <CryptoHeader />
    <main>
      <CryptoHero />
      <CryptoFeatures />
      <CryptoAbout />
    </main>
    <CryptoFooter />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

main {
  flex: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  padding: 80px 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .section {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>
