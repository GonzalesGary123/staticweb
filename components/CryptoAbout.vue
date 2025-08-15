<template>
  <section id="about" class="section-padding relative overflow-hidden">
    <div class="container-custom relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left Content -->
        <div class="space-y-8">
          <div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 shadow-lg">
            <span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
            About Our Crypto Arena
          </div>
          
          <h2 class="text-4xl md:text-5xl font-bold text-white leading-tight font-orbitron">
            The Ultimate <span class="text-gradient-primary">Crypto Gaming</span> Arena
          </h2>
          
          <p class="text-xl text-gray-200 leading-relaxed">
            CryptoGaming is the premier destination for crypto warriors, traders, developers, and investors. We're not just a platform – we're a thriving gaming ecosystem where strategy meets opportunity, and where rookies become legends.
          </p>
          
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <span class="text-2xl">🌍</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2 font-orbitron">Global Arena</h3>
                <p class="text-gray-300">
                  Join thousands of warriors from over 50 battle zones, sharing strategies and insights across different time zones and cultures. Our diverse community brings unique perspectives from every corner of the crypto world.
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <span class="text-2xl">🚀</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2 font-orbitron">Innovation Hub</h3>
                <p class="text-gray-300">
                  We're constantly exploring new technologies, from DeFi protocols to NFT marketplaces, staying ahead of the crypto curve. Our members are often the first to discover and discuss emerging trends.
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                <span class="text-2xl">🤝</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2 font-orbitron">Collaborative Gaming</h3>
                <p class="text-gray-300">
                  Share strategies, discuss market trends, and learn from both beginners and seasoned professionals in our supportive environment. Every warrior has something valuable to contribute.
                </p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <span class="text-2xl">💎</span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white mb-2 font-orbitron">Exclusive Rewards</h3>
                <p class="text-gray-300">
                  Get early access to promising projects, presales, and investment opportunities shared exclusively within our arena. Our network of experts and insiders provides access you won't find elsewhere.
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="#membership" class="btn-primary text-lg px-8 py-4">
              <span class="mr-2">⚔️</span>
              Join Our Arena
            </a>
            <a href="#testimonials" class="btn-outline text-lg px-8 py-4">
              <span class="mr-2">🏆</span>
              View Leaderboard
            </a>
          </div>
        </div>
        
        <!-- Right Content -->
        <div class="relative">
          <!-- Stats Cards -->
          <div class="grid grid-cols-2 gap-6">
            <div class="gaming-stat-card">
              <div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron">10K+</div>
              <div class="text-gray-300">ACTIVE WARRIORS</div>
            </div>
            <div class="gaming-stat-card">
              <div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron">50+</div>
              <div class="text-gray-300">BATTLE ZONES</div>
            </div>
            <div class="gaming-stat-card">
              <div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron">24/7</div>
              <div class="text-gray-300">SUPPORT</div>
            </div>
            <div class="gaming-stat-card">
              <div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron">100+</div>
              <div class="text-gray-300">DAILY BATTLES</div>
            </div>
          </div>
          
          <!-- Arena Activity -->
          <div class="mt-8 gaming-activity-card">
            <h4 class="text-lg font-semibold text-white mb-4 font-orbitron">Live Arena Activity</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-300">Discord Online</span>
                <span class="text-orange-400 font-semibold">5,247</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-300">New Messages (24h)</span>
                <span class="text-orange-400 font-semibold">12,843</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-300">Active Threads</span>
                <span class="text-orange-400 font-semibold">156</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-300">New Warriors Today</span>
                <span class="text-orange-400 font-semibold">47</span>
              </div>
            </div>
          </div>
          
          <!-- Floating Elements -->
          <div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full opacity-20 animate-float"></div>
          <div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-20 animate-float" style="animation-delay: 2s;"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
.gaming-stat-card {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
}

.gaming-activity-card {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
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

.btn-outline {
  border: 2px solid rgba(255, 107, 53, 0.5);
  color: #ff6b35;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-outline:hover {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}

.font-orbitron {
  font-family: 'Orbitron', monospace;
}
</style>