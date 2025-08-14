<template>
  <div v-if="showResults" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="card-glass p-8 max-w-2xl w-full text-center">
      <!-- Game Results Header -->
      <div class="mb-8">
        <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-5xl">{{ gameResult.icon }}</span>
        </div>
        <h2 class="text-4xl font-bold text-white mb-4">{{ gameResult.title }}</h2>
        <p class="text-xl text-white/80">{{ gameResult.message }}</p>
      </div>

      <!-- Results Grid -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Final Stats -->
        <div class="p-6 bg-white/5 rounded-xl">
          <h3 class="text-xl font-bold text-white mb-4">📊 Final Stats</h3>
          <div class="space-y-3 text-left">
            <div class="flex justify-between">
              <span class="text-white/60">Starting Coins:</span>
              <span class="text-white font-semibold">{{ formatCoins(gameStats.startingCoins) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/60">Final Coins:</span>
              <span class="text-white font-semibold">{{ formatCoins(gameStats.finalCoins) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/60">Total Profit:</span>
              <span class="font-semibold" :class="gameStats.profit >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ gameStats.profit >= 0 ? '+' : '' }}{{ formatCoins(gameStats.profit) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/60">Profit %:</span>
              <span class="font-semibold" :class="gameStats.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ gameStats.profitPercentage >= 0 ? '+' : '' }}{{ gameStats.profitPercentage }}%
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/60">Trades Made:</span>
              <span class="text-white font-semibold">{{ gameStats.trades }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/60">Success Rate:</span>
              <span class="text-white font-semibold">{{ gameStats.successRate }}%</span>
            </div>
          </div>
        </div>

        <!-- Rewards & Achievements -->
        <div class="p-6 bg-white/5 rounded-xl">
          <h3 class="text-xl font-bold text-white mb-4">🏆 Rewards</h3>
          <div class="space-y-4">
            <!-- Experience Gained -->
            <div class="p-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl">
              <div class="text-2xl font-bold text-white mb-2">+{{ gameStats.experienceGained }} XP</div>
              <div class="text-white/60">Experience Gained</div>
            </div>

            <!-- Coins Earned -->
            <div class="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl">
              <div class="text-2xl font-bold text-yellow-400 mb-2">+{{ formatCoins(gameStats.coinsEarned) }}</div>
              <div class="text-white/60">Coins Earned</div>
            </div>

            <!-- New Achievements -->
            <div v-if="gameStats.newAchievements.length > 0" class="p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
              <div class="text-lg font-bold text-white mb-2">{{ gameStats.newAchievements.length }} New Achievement{{ gameStats.newAchievements.length > 1 ? 's' : '' }}</div>
              <div class="text-sm text-white/60">
                <div v-for="achievement in gameStats.newAchievements" :key="achievement.id" class="flex items-center space-x-2">
                  <span>{{ achievement.icon }}</span>
                  <span>{{ achievement.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Challenge Results (if applicable) -->
      <div v-if="gameMode === 'challenge'" class="mb-8">
        <div class="p-6 bg-white/5 rounded-xl">
          <h3 class="text-xl font-bold text-white mb-4">🎯 Challenge Results</h3>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-white">{{ formatTime(gameStats.timeUsed) }}</div>
              <div class="text-white/60">Time Used</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white">{{ formatTime(gameStats.timeLimit) }}</div>
              <div class="text-white/60">Time Limit</div>
            </div>
          </div>
          
          <div class="mt-4 p-4 rounded-xl" :class="gameStats.challengeSuccess ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'">
            <div class="text-lg font-bold text-white">
              {{ gameStats.challengeSuccess ? '🎉 Challenge Completed!' : '❌ Challenge Failed' }}
            </div>
            <div class="text-white/60">
              {{ gameStats.challengeSuccess ? 'You reached the target amount!' : 'You did not reach the target amount' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4 justify-center">
        <button 
          @click="playAgain"
          class="btn-primary px-8 py-4"
        >
          🎮 Play Again
        </button>
        <button 
          @click="closeResults"
          class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors duration-200"
        >
          🏠 Back to Menu
        </button>
      </div>

      <!-- Share Results -->
      <div class="mt-8 pt-6 border-t border-white/20">
        <p class="text-white/60 mb-4">Share your results with friends!</p>
        <div class="flex space-x-4 justify-center">
          <button class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200">
            📘 Facebook
          </button>
          <button class="p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200">
            🐦 Twitter
          </button>
          <button class="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200">
            📱 WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  showResults: Boolean,
  gameMode: String,
  gameStats: Object
})

const emit = defineEmits(['close', 'playAgain'])

const gameResult = computed(() => {
  if (!props.gameStats) return { icon: '🎮', title: 'Game Over', message: 'Thanks for playing!' }
  
  const { profit, profitPercentage, challengeSuccess } = props.gameStats
  
  if (props.gameMode === 'challenge') {
    if (challengeSuccess) {
      return {
        icon: '🏆',
        title: 'Challenge Completed!',
        message: 'Amazing! You successfully completed the challenge!'
      }
    } else {
      return {
        icon: '💪',
        title: 'Challenge Failed',
        message: 'Better luck next time! Keep practicing!'
      }
    }
  }
  
  if (profit > 0) {
    if (profitPercentage > 50) {
      return {
        icon: '🚀',
        title: 'Trading Master!',
        message: 'Incredible performance! You\'re a trading genius!'
      }
    } else {
      return {
        icon: '💰',
        title: 'Profitable Session!',
        message: 'Great job! You made a profit!'
      }
    }
  } else if (profit < 0) {
    if (profitPercentage < -20) {
      return {
        icon: '📉',
        title: 'Learning Experience',
        message: 'Don\'t worry! Every loss is a lesson learned.'
      }
    } else {
      return {
        icon: '🤔',
        title: 'Close Call',
        message: 'Almost there! Keep practicing your strategy!'
      }
    }
  } else {
    return {
      icon: '⚖️',
      title: 'Break Even',
      message: 'Not bad! You maintained your position.'
    }
  }
})

const formatCoins = (amount) => {
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`
  return Math.floor(amount).toLocaleString()
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const closeResults = () => {
  emit('close')
}

const playAgain = () => {
  emit('playAgain')
}
</script>

<style scoped>
/* Component-specific styles can be added here if needed */
</style>