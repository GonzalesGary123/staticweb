<template>
  <footer id="contact" class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">🚀 CryptoGroup</h3>
          <p class="footer-description">
            Your gateway to the future of finance. Join thousands of crypto enthusiasts 
            and stay ahead of the digital economy revolution.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" v-for="social in socialLinks" :key="social.name">
              <span class="social-icon">{{ social.icon }}</span>
            </a>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Quick Links</h4>
          <ul class="footer-links">
            <li v-for="link in quickLinks" :key="link.name">
              <a :href="link.href" class="footer-link">{{ link.name }}</a>
            </li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Resources</h4>
          <ul class="footer-links">
            <li v-for="resource in resources" :key="resource.name">
              <a :href="resource.href" class="footer-link">{{ resource.name }}</a>
            </li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-subtitle">Contact Us</h4>
          <div class="contact-info">
            <p class="contact-item">
              <span class="contact-icon">📧</span>
              <a href="mailto:hello@cryptogroup.com" class="contact-link">hello@cryptogroup.com</a>
            </p>
            <p class="contact-item">
              <span class="contact-icon">💬</span>
              <a href="#" class="contact-link">Join Discord</a>
            </p>
            <p class="contact-item">
              <span class="contact-icon">📱</span>
              <a href="#" class="contact-link">Telegram Group</a>
            </p>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">
          © 2024 CryptoGroup. All rights reserved. | 
          <a href="#" class="footer-link">Privacy Policy</a> | 
          <a href="#" class="footer-link">Terms of Service</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const socialLinks = ref([
  { name: 'Twitter', icon: '🐦' },
  { name: 'Discord', icon: '🎮' },
  { name: 'Telegram', icon: '📱' },
  { name: 'YouTube', icon: '📺' },
  { name: 'LinkedIn', icon: '💼' }
])

const quickLinks = ref([
  { name: 'Home', href: '#home' },
  { name: 'Features', href: '#features' },
  { name: 'About', href: '#about' },
  { name: 'Join Community', href: '#' }
])

const resources = ref([
  { name: 'Crypto Guide', href: '#' },
  { name: 'Market Analysis', href: '#' },
  { name: 'Security Tips', href: '#' },
  { name: 'FAQ', href: '#' }
])
</script>

<style scoped>
.footer {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 0 2rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
}

.footer-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: inline-block;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.social-icon {
  font-size: 1.2rem;
}

.footer-subtitle {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #fff;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.contact-icon {
  font-size: 1.1rem;
}

.contact-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #fff;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
}

.copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.copyright .footer-link {
  color: rgba(255, 255, 255, 0.6);
}

.copyright .footer-link:hover {
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer {
    padding: 3rem 0 2rem;
  }
  
  .social-links {
    justify-content: center;
  }
}
</style>