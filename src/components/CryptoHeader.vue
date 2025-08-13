<template>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="nav-brand">
          <h1 class="brand-title">🚀 CryptoGroup</h1>
        </div>
        <ul class="nav-menu">
          <li><a href="#home" class="nav-link">Home</a></li>
          <li><a href="#features" class="nav-link">Features</a></li>
          <li><a href="#about" class="nav-link">About</a></li>
          <li><a href="#contact" class="nav-link">Contact</a></li>
        </ul>
        <div class="nav-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.nav-brand .brand-title {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 25px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .nav-toggle {
    display: flex;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
}
</style>