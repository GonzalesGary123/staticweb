<template>
  <section id="home" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
    <!-- Background Elements -->
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-400/5 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
    </div>

    <div class="container-custom relative z-10">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left Content -->
        <div class="text-center lg:text-left space-y-8">
          <!-- Badge -->
          <div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 shadow-lg animate-glow">
            <span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
            JOIN 10,000+ CRYPTO WARRIORS
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-orbitron">
            <span class="text-white">ENTER THE</span>
            <br>
            <span class="text-gradient-primary animate-neon">CRYPTO ARENA</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Dominate the crypto battlefield with expert strategies, real-time signals, and an elite community of traders. Level up your crypto game.
          </p>

          <!-- Gaming Stats -->
          <div class="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div class="gaming-stat">
              <div class="text-2xl font-bold text-orange-400 font-orbitron">10K+</div>
              <div class="text-sm text-gray-400">ACTIVE PLAYERS</div>
            </div>
            <div class="gaming-stat">
              <div class="text-2xl font-bold text-orange-400 font-orbitron">50+</div>
              <div class="text-sm text-gray-400">BATTLE ZONES</div>
            </div>
            <div class="gaming-stat">
              <div class="text-2xl font-bold text-orange-400 font-orbitron">24/7</div>
              <div class="text-sm text-gray-400">SUPPORT</div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#membership" class="btn-primary inline-flex items-center justify-center text-lg px-8 py-4">
              <span class="mr-2">⚔️</span>
              ENTER ARENA
            </a>
            <a href="#features" class="btn-outline inline-flex items-center justify-center text-lg px-8 py-4">
              <span class="mr-2">🎯</span>
              VIEW SKILLS
            </a>
          </div>

          <!-- Gaming Features -->
          <div class="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-400">
            <div class="flex items-center">
              <span class="w-4 h-4 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              VERIFIED PLAYERS ONLY
            </div>
            <div class="flex items-center">
              <span class="w-4 h-4 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              SECURE & PRIVATE
            </div>
          </div>
        </div>
        
        <!-- Right Content -->
        <div class="relative">
          <!-- Gaming Interface Preview -->
          <div class="space-y-4">
            <!-- Trading Terminal Card -->
            <div class="gaming-interface-card trading">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg border border-green-500/50">
                    <span class="text-white text-xl">📈</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-white font-orbitron">TRADING TERMINAL</h3>
                    <p class="text-sm text-green-400">LIVE BATTLE STATION</p>
                  </div>
                </div>
                <div class="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full font-orbitron">
                  ONLINE
                </div>
              </div>
              <div class="text-sm text-gray-300">
                <p>🔥 HOT: Bitcoin ETF momentum</p>
                <p>⚡ 24 new signals today</p>
              </div>
            </div>

            <!-- Leaderboard Card -->
            <div class="gaming-interface-card leaderboard">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg border border-orange-500/50">
                    <span class="text-white text-xl">🏆</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-white font-orbitron">LEADERBOARD</h3>
                    <p class="text-sm text-orange-400">TOP PERFORMERS</p>
                  </div>
                </div>
                <div class="bg-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full font-orbitron">
                  LIVE
                </div>
              </div>
              <div class="text-sm text-gray-300">
                <p>🥇 #1: CryptoMaster - +450%</p>
                <p>🥈 #2: TradingNinja - +320%</p>
              </div>
            </div>

            <!-- Arena Chat Card -->
            <div class="gaming-interface-card chat">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/50">
                    <span class="text-white text-xl">💬</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-white font-orbitron">ARENA CHAT</h3>
                    <p class="text-sm text-purple-400">STRATEGY ROOM</p>
                  </div>
                </div>
                <div class="bg-purple-500 text-black text-xs font-bold px-2 py-1 rounded-full font-orbitron">
                  ACTIVE
                </div>
              </div>
              <div class="text-sm text-gray-300">
                <p>🎮 New DeFi strategy shared</p>
                <p>⚔️ Battle plan for ETH</p>
              </div>
            </div>
          </div>

          <!-- Floating Gaming Elements -->
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
.gaming-stat {
  text-align: center;
  padding: 1rem;
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
}

.gaming-interface-card {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  transform: transition-all duration-200;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
}

.gaming-interface-card:hover {
  transform: scale(1.05);
  border-color: rgba(255, 107, 53, 0.8);
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.3), inset 0 0 30px rgba(255, 107, 53, 0.1);
}

.gaming-interface-card.trading {
  border-color: rgba(34, 197, 94, 0.3);
}

.gaming-interface-card.trading:hover {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3), inset 0 0 30px rgba(34, 197, 94, 0.1);
}

.gaming-interface-card.leaderboard {
  border-color: rgba(255, 107, 53, 0.3);
}

.gaming-interface-card.chat {
  border-color: rgba(147, 51, 234, 0.3);
}

.gaming-interface-card.chat:hover {
  border-color: rgba(147, 51, 234, 0.8);
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.3), inset 0 0 30px rgba(147, 51, 234, 0.1);
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