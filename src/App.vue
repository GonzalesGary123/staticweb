<script setup>
import CryptoHeader from './components/CryptoHeader.vue'
import CryptoHero from './components/CryptoHero.vue'
import LiveMarketData from './components/LiveMarketData.vue'
import CryptoFeatures from './components/CryptoFeatures.vue'
import CryptoAbout from './components/CryptoAbout.vue'
import CryptoDemo from './components/CryptoDemo.vue'
import CryptoFooter from './components/CryptoFooter.vue'
</script>

<template>
  <div id="app">
    <CryptoHeader />
    <main>
      <CryptoHero />
      <LiveMarketData />
      <CryptoFeatures />
      <CryptoAbout />
      <CryptoDemo />
    </main>
    <CryptoFooter />
  </div>
</template>

<style>
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --dark-bg: rgba(0, 0, 0, 0.8);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.9);
  --text-muted: rgba(255, 255, 255, 0.7);
  --shadow-light: 0 8px 32px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 20px 40px rgba(0, 0, 0, 0.15);
  --shadow-heavy: 0 25px 50px rgba(0, 0, 0, 0.25);
  --border-radius: 20px;
  --border-radius-small: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--primary-gradient);
  min-height: 100vh;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

#app {
  min-height: 100vh;
  position: relative;
}

main {
  flex: 1;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  padding: 100px 0;
  position: relative;
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  text-align: center;
  margin-bottom: 4rem;
  color: var(--text-primary);
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: var(--accent-gradient);
  border-radius: 2px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: var(--accent-gradient);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: var(--transition);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
}

.btn-secondary {
  background: var(--success-gradient);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--glass-border);
  color: var(--text-primary);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: var(--glass-bg);
  border-color: var(--text-primary);
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-heavy);
}

.glass-card {
  background: var(--glass-bg);
  border-radius: var(--border-radius);
  padding: 2rem;
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-light);
}

/* Modern scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-gradient);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-gradient);
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

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.float {
  animation: float 6s ease-in-out infinite;
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .section {
    padding: 80px 0;
  }
  
  .section-title {
    font-size: clamp(2rem, 8vw, 3rem);
    margin-bottom: 3rem;
  }
  
  .btn {
    padding: 14px 28px;
    font-size: 0.9rem;
  }
}

/* Loading states */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--glass-border);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
