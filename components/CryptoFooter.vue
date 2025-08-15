<template>
  <footer class="border-t border-orange-500/50 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="w-full h-full" style="background-image: repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px); background-size: 60px 60px;"></div>
    </div>
    
    <div class="container-custom relative z-10 py-16">
      <div class="grid lg:grid-cols-4 gap-8 mb-12">
        <!-- Brand Section -->
        <div class="lg:col-span-1">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg animate-glow border border-orange-400/50">
              <span class="text-2xl">🎮</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white font-orbitron">CryptoGaming</h3>
              <p class="text-sm text-orange-400 font-medium tracking-wider">ULTIMATE CRYPTO ARENA</p>
            </div>
          </div>
          
          <p class="text-gray-300 mb-6 leading-relaxed">
            Join the most elite crypto gaming arena where warriors become legends. Access expert strategies, real-time signals, and an exclusive community of crypto professionals.
          </p>
          
          <div class="flex space-x-4">
            <a href="#" class="social-icon">
              <span class="text-xl">📱</span>
            </a>
            <a href="#" class="social-icon">
              <span class="text-xl">💬</span>
            </a>
            <a href="#" class="social-icon">
              <span class="text-xl">📧</span>
            </a>
            <a href="#" class="social-icon">
              <span class="text-xl">🎥</span>
            </a>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold text-white mb-6 font-orbitron">Quick Links</h4>
          <ul class="space-y-3">
            <li><a href="#home" class="footer-link">Home</a></li>
            <li><a href="#about" class="footer-link">About Arena</a></li>
            <li><a href="#features" class="footer-link">Features</a></li>
            <li><a href="#membership" class="footer-link">Membership</a></li>
            <li><a href="#testimonials" class="footer-link">Leaderboard</a></li>
            <li><a href="#market" class="footer-link">Market Data</a></li>
          </ul>
        </div>
        
        <!-- Community Links -->
        <div>
          <h4 class="text-lg font-semibold text-white mb-6 font-orbitron">Community</h4>
          <ul class="space-y-3">
            <li><a href="#" class="footer-link">Discord Server</a></li>
            <li><a href="#" class="footer-link">Telegram Groups</a></li>
            <li><a href="#" class="footer-link">Forum</a></li>
            <li><a href="#" class="footer-link">Events</a></li>
            <li><a href="#" class="footer-link">Blog</a></li>
            <li><a href="#" class="footer-link">Support</a></li>
          </ul>
        </div>
        
        <!-- Newsletter -->
        <div>
          <h4 class="text-lg font-semibold text-white mb-6 font-orbitron">Stay Updated</h4>
          <p class="text-gray-300 mb-4">
            Get the latest crypto gaming strategies and arena updates delivered to your inbox.
          </p>
          
          <div class="space-y-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              class="newsletter-input"
            >
            <button class="btn-primary w-full">
              <span class="mr-2">📬</span>
              Subscribe
            </button>
          </div>
          
          <p class="text-xs text-gray-400 mt-3">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-orange-500/30 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-gray-400 text-sm">
            © 2024 CryptoGaming Arena. All rights reserved. | 
            <a href="#" class="hover:text-orange-400 transition-colors duration-200">Privacy Policy</a> | 
            <a href="#" class="hover:text-orange-400 transition-colors duration-200">Terms of Service</a>
          </div>
          
          <div class="flex items-center space-x-6 text-sm">
            <span class="text-gray-400">Made with ⚔️ for crypto warriors</span>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span class="text-green-400">Arena Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
.social-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: #ff6b35;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1);
}

.social-icon:hover {
  background: rgba(255, 107, 53, 0.2);
  border-color: rgba(255, 107, 53, 0.8);
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.3);
  transform: translateY(-2px);
}

.footer-link {
  color: #9ca3af;
  transition: all 0.3s;
  font-weight: 500;
}

.footer-link:hover {
  color: #ff6b35;
  transform: translateX(5px);
}

.newsletter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  color: #f9fafb;
  transition: all 0.3s;
  backdrop-filter: blur(8px);
}

.newsletter-input::placeholder {
  color: #9ca3af;
}

.newsletter-input:focus {
  outline: none;
  border-color: rgba(255, 107, 53, 0.8);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.8);
}

.font-orbitron {
  font-family: 'Orbitron', monospace;
}
</style>