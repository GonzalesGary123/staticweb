<template>
  <section class="game-dashboard section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-800/50 to-dark-900/50"></div>
    
    <div class="container-custom relative z-10">
      <!-- Game Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 backdrop-blur-sm border border-primary-400/30 rounded-full text-sm font-bold text-primary-400 mb-6">
          <span class="w-2 h-2 bg-accent-400 rounded-full mr-2"></span>
          🎮 CRYPTO GAMING ARENA
        </div>
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          🚀 <span class="text-gradient-primary">TRADING ARENA</span>
        </h2>
        <p class="text-xl text-white/80 max-w-3xl mx-auto">
          Enter the ultimate crypto trading battlefield! Test your skills, unlock achievements, and dominate the leaderboard in this EPIC gaming experience!
        </p>
      </div>

      <!-- Game Controls -->
      <div class="grid lg:grid-cols-3 gap-8 mb-16">
        <!-- Start Game Card -->
        <div class="game-card p-8 text-center border-accent-400 hover:border-accent-400/60">
          <div class="w-20 h-20 bg-gradient-to-br from-accent-500/30 to-accent-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl">🎯</span>
          </div>
          <h3 class="text-2xl font-bold text-accent-400 mb-4">START TRADING</h3>
          <p class="text-white/70 mb-6">
            Begin your crypto trading journey with virtual money
          </p>
          <button 
            @click="startSimulation"
            :disabled="isGameActive"
            class="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isGameActive ? '🎮 GAME ACTIVE' : '🚀 START SIMULATION' }}
          </button>
        </div>

        <!-- Challenges Card -->
        <div class="game-card p-8 text-center border-secondary-400 hover:border-secondary-400/60">
          <div class="w-20 h-20 bg-gradient-to-br from-secondary-500/30 to-secondary-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl">🏆</span>
          </div>
          <h3 class="text-2xl font-bold text-secondary-400 mb-4">CHALLENGES</h3>
          <p class="text-white/70 mb-6">
            Take on timed challenges to earn rewards and badges
          </p>
          <button 
            @click="showChallenges = true"
            class="btn-secondary w-full"
          >
            🏆 VIEW CHALLENGES
          </button>
        </div>

        <!-- Leaderboard Card -->
        <div class="game-card p-8 text-center border-primary-400 hover:border-primary-400/60">
          <div class="w-20 h-20 bg-gradient-to-br from-primary-500/30 to-primary-600/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span class="text-4xl">👑</span>
          </div>
          <h3 class="text-2xl font-bold text-primary-400 mb-4">LEADERBOARD</h3>
          <p class="text-white/70 mb-6">
            Compete with other traders and climb the ranks
          </p>
          <button 
            @click="showLeaderboard = true"
            class="btn-primary w-full"
          >
            👑 VIEW RANKINGS
          </button>
        </div>
      </div>

      <!-- Player Stats -->
      <div class="game-card p-8 mb-16 border-primary-400">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-3xl font-bold text-primary-400">🎮 PLAYER PROFILE</h3>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm text-white/60">RANK</div>
              <div class="text-xl font-bold text-gradient-primary">{{ playerRank }}</div>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Level & Experience -->
          <div class="text-center p-6 bg-white/5 rounded-xl border border-accent-400/30">
            <div class="text-3xl font-bold text-accent-400 mb-2">Level {{ player.level }}</div>
            <div class="text-sm text-white/60 mb-3">EXPERIENCE</div>
            <div class="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                class="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full transition-all duration-200"
                :style="{ width: `${(player.experience / player.experienceToNext) * 100}%` }"
              ></div>
            </div>
            <div class="text-xs text-white/60">{{ player.experience }} / {{ player.experienceToNext }} XP</div>
          </div>

          <!-- Coins -->
          <div class="text-center p-6 bg-white/5 rounded-xl border border-yellow-400/30">
            <div class="text-3xl font-bold text-yellow-400 mb-2">{{ formatCoins(player.coins) }}</div>
            <div class="text-sm text-white/60">AVAILABLE COINS</div>
          </div>

          <!-- Portfolio Value -->
          <div class="text-center p-6 bg-white/5 rounded-xl border border-green-400/30">
            <div class="text-3xl font-bold text-green-400 mb-2">{{ formatCoins(portfolioValue) }}</div>
            <div class="text-sm text-white/60">PORTFOLIO VALUE</div>
            <div class="text-xs" :class="totalProfit >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ totalProfit >= 0 ? '+' : '' }}{{ formatCoins(totalProfit) }} ({{ profitPercentage }}%)
            </div>
          </div>

          <!-- Stats -->
          <div class="text-center p-6 bg-white/5 rounded-xl border border-blue-400/30">
            <div class="text-3xl font-bold text-blue-400 mb-2">{{ player.trades }}</div>
            <div class="text-sm text-white/60">TOTAL TRADES</div>
            <div class="text-xs text-green-400">{{ player.successfulTrades }} successful</div>
          </div>
        </div>

        <!-- Streak & Badges -->
        <div class="grid md:grid-cols-2 gap-6 mt-8">
          <div class="p-6 bg-white/5 rounded-xl border border-orange-400/30">
            <h4 class="text-lg font-bold text-orange-400 mb-4">🔥 CURRENT STREAK</h4>
            <div class="flex items-center space-x-2">
              <span class="text-2xl">{{ '🔥'.repeat(Math.min(player.streak, 5)) }}</span>
              <span class="text-xl font-bold text-orange-400">{{ player.streak }} days</span>
            </div>
          </div>
          
          <div class="p-6 bg-white/5 rounded-xl border border-purple-400/30">
            <h4 class="text-lg font-bold text-purple-400 mb-4">🏅 BADGES</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="badge in player.badges" 
                :key="badge"
                class="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-bold"
              >
                {{ badge.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio -->
      <div class="game-card p-8 mb-16 border-cyan-400">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-3xl font-bold text-cyan-400">💼 PORTFOLIO</h3>
          <div class="text-sm text-white/60">{{ player.portfolio.length }} ASSETS</div>
        </div>

        <div v-if="player.portfolio.length > 0" class="space-y-4">
          <div 
            v-for="asset in player.portfolio" 
            :key="asset.id"
            class="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span class="text-xl">🪙</span>
              </div>
              <div>
                <div class="font-semibold text-white">{{ asset.id.toUpperCase() }}</div>
                <div class="text-sm text-white/60">{{ asset.quantity }} units</div>
              </div>
            </div>
            
            <div class="text-right">
              <div class="font-bold text-white">{{ formatCoins(asset.quantity * asset.currentPrice) }}</div>
              <div class="text-sm text-white/60">@ {{ formatCoins(asset.currentPrice) }}</div>
            </div>
            
            <div class="flex space-x-2">
              <button 
                @click="sellAsset(asset.id, asset.quantity, asset.currentPrice)"
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Sell All
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">📭</div>
          <div class="text-xl text-white/60 mb-4">Portfolio is empty</div>
          <div class="text-white/40">Start trading to build your portfolio!</div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="game-card p-8 border-accent-400">
        <h3 class="text-3xl font-bold text-accent-400 mb-8">🏆 ACHIEVEMENTS</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="achievement in achievements" 
            :key="achievement.id"
            class="p-4 rounded-xl text-center transition-colors duration-200"
            :class="achievement.unlocked ? 'bg-green-900/20 border border-green-400/30' : 'bg-white/5 border border-white/20'"
          >
            <div class="text-3xl mb-2">{{ achievement.icon }}</div>
            <div class="font-bold text-white mb-1">{{ achievement.name.toUpperCase() }}</div>
            <div class="text-xs text-white/60 mb-2">{{ achievement.description }}</div>
            <div class="text-xs font-bold" :class="achievement.unlocked ? 'text-green-400' : 'text-white/40'">
              {{ achievement.unlocked ? '✅ UNLOCKED' : `${achievement.points} XP` }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showChallenges" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="card-glass p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">🏆 Trading Challenges</h3>
          <button @click="showChallenges = false" class="text-white/60 hover:text-white">
            <span class="text-2xl">✕</span>
          </button>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="challenge in challenges" 
            :key="challenge.id"
            class="p-6 bg-white/5 rounded-xl border border-white/10"
          >
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-xl font-semibold text-white">{{ challenge.name }}</h4>
              <span class="px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm rounded-full">
                {{ challenge.difficulty }}
              </span>
            </div>
            <p class="text-white/70 mb-4">{{ challenge.description }}</p>
            <div class="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <div class="text-white/60">Starting</div>
                <div class="text-white font-semibold">{{ formatCoins(challenge.startingCoins) }}</div>
              </div>
              <div>
                <div class="text-white/60">Target</div>
                <div class="text-white font-semibold">{{ formatCoins(challenge.targetCoins) }}</div>
              </div>
              <div>
                <div class="text-white/60">Time</div>
                <div class="text-white font-semibold">{{ Math.floor(challenge.timeLimit / 60) }}m</div>
              </div>
            </div>
            <button 
              @click="startChallenge(challenge.id)"
              :disabled="isGameActive"
              class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isGameActive ? 'Game Active' : 'Start Challenge' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLeaderboard" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="card-glass p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">👑 Leaderboard</h3>
          <button @click="showLeaderboard = false" class="text-white/60 hover:text-white">
            <span class="text-2xl">✕</span>
          </button>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="(player, index) in leaderboard" 
            :key="index"
            class="flex items-center justify-between p-4 bg-white/5 rounded-xl"
          >
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ index + 1 }}
              </div>
              <div>
                <div class="font-semibold text-white">{{ player.name }}</div>
                <div class="text-sm text-white/60">Level {{ player.level }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-white">{{ formatCoins(player.score) }}</div>
              <div class="text-sm text-gradient-primary">{{ player.rank }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { 
  player, 
  isGameActive, 
  leaderboard, 
  achievements, 
  challenges,
  playerRank,
  portfolioValue,
  totalProfit,
  profitPercentage,
  startGame
} = useGameState()

const showChallenges = ref(false)
const showLeaderboard = ref(false)

const startSimulation = () => {
  startGame('simulation')
}

const startChallenge = (challengeId) => {
  startGame('challenge', challengeId)
  showChallenges.value = false
}

const formatCoins = (amount) => {
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`
  return Math.floor(amount).toLocaleString()
}
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>