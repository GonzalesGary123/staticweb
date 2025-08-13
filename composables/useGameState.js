import { ref, computed, readonly } from 'vue'

export function useGameState() {
  // Player state
  const player = ref({
    id: 'player_' + Date.now(),
    name: 'Crypto Trader',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    coins: 10000, // Starting coins
    portfolio: [],
    totalValue: 10000,
    trades: 0,
    successfulTrades: 0,
    streak: 0,
    achievements: [],
    rank: 'Bronze',
    badges: ['newbie'],
    joinDate: new Date()
  })

  // Game mechanics
  const gameMode = ref('simulation') // simulation, challenge, tournament
  const difficulty = ref('normal') // easy, normal, hard, expert
  const timeLimit = ref(300) // 5 minutes
  const isGameActive = ref(false)
  const gameStartTime = ref(null)
  const currentChallenge = ref(null)
  const showResults = ref(false)
  const gameStats = ref(null)

  // Leaderboard
  const leaderboard = ref([
    { name: 'CryptoKing', score: 150000, level: 25, rank: 'Diamond' },
    { name: 'BlockchainBoss', score: 120000, level: 22, rank: 'Platinum' },
    { name: 'DeFiMaster', score: 95000, level: 20, rank: 'Gold' },
    { name: 'SatoshiFan', score: 78000, level: 18, rank: 'Gold' },
    { name: 'AltcoinHunter', score: 65000, level: 16, rank: 'Silver' }
  ])

  // Achievements system
  const achievements = ref([
    { id: 'first_trade', name: 'First Trade', description: 'Complete your first trade', icon: '🎯', unlocked: false, points: 10 },
    { id: 'profit_master', name: 'Profit Master', description: 'Make 10 profitable trades in a row', icon: '💰', unlocked: false, points: 50 },
    { id: 'portfolio_diversifier', name: 'Portfolio Diversifier', description: 'Hold 5 different cryptocurrencies', icon: '📊', unlocked: false, points: 30 },
    { id: 'streak_king', name: 'Streak King', description: 'Maintain a 7-day profit streak', icon: '🔥', unlocked: false, points: 100 },
    { id: 'millionaire', name: 'Crypto Millionaire', description: 'Reach 1,000,000 coins', icon: '👑', unlocked: false, points: 200 },
    { id: 'speed_trader', name: 'Speed Trader', description: 'Complete 50 trades in one session', icon: '⚡', unlocked: false, points: 75 },
    { id: 'risk_taker', name: 'Risk Taker', description: 'Invest 80% of your portfolio in one asset', icon: '🎲', unlocked: false, points: 40 },
    { id: 'hodler', name: 'HODLer', description: 'Hold an asset for 24 hours', icon: '💎', unlocked: false, points: 25 }
  ])

  // Trading challenges
  const challenges = ref([
    {
      id: 'beginner_challenge',
      name: 'Beginner Challenge',
      description: 'Turn 10,000 into 15,000 in 5 minutes',
      startingCoins: 10000,
      targetCoins: 15000,
      timeLimit: 300,
      difficulty: 'easy',
      reward: { experience: 100, coins: 1000, badge: 'beginner' }
    },
    {
      id: 'intermediate_challenge',
      name: 'Intermediate Challenge',
      description: 'Turn 20,000 into 35,000 in 8 minutes',
      startingCoins: 20000,
      targetCoins: 35000,
      timeLimit: 480,
      difficulty: 'normal',
      reward: { experience: 250, coins: 2500, badge: 'intermediate' }
    },
    {
      id: 'expert_challenge',
      name: 'Expert Challenge',
      description: 'Turn 50,000 into 100,000 in 10 minutes',
      startingCoins: 50000,
      targetCoins: 100000,
      timeLimit: 600,
      difficulty: 'hard',
      reward: { experience: 500, coins: 5000, badge: 'expert' }
    }
  ])

  // Computed properties
  const playerRank = computed(() => {
    const exp = player.value.experience
    if (exp < 1000) return 'Bronze'
    if (exp < 5000) return 'Silver'
    if (exp < 15000) return 'Gold'
    if (exp < 50000) return 'Platinum'
    return 'Diamond'
  })

  const portfolioValue = computed(() => {
    return player.value.portfolio.reduce((total, asset) => {
      return total + (asset.quantity * asset.currentPrice)
    }, 0)
  })

  const totalProfit = computed(() => {
    return portfolioValue.value - player.value.coins
  })

  const profitPercentage = computed(() => {
    if (player.value.coins === 0) return 0
    return ((totalProfit.value / player.value.coins) * 100).toFixed(2)
  })

  // Game actions
  const startGame = (mode = 'simulation', challengeId = null) => {
    isGameActive.value = true
    gameMode.value = mode
    gameStartTime.value = Date.now()
    
    if (challengeId) {
      currentChallenge.value = challenges.value.find(c => c.id === challengeId)
      player.value.coins = currentChallenge.value.startingCoins
      timeLimit.value = currentChallenge.value.timeLimit
    }
  }

  const endGame = () => {
    isGameActive.value = false
    gameStartTime.value = null
    
    // Calculate final score and rewards
    calculateGameResults()
    
    // Calculate game stats for results screen
    const timeUsed = gameStartTime.value ? Math.floor((Date.now() - gameStartTime.value) / 1000) : 0
    const startingCoins = currentChallenge.value ? currentChallenge.value.startingCoins : 10000
    const finalCoins = player.value.coins + portfolioValue.value
    const profit = finalCoins - startingCoins
    const profitPercentage = ((profit / startingCoins) * 100).toFixed(2)
    const successRate = player.value.trades > 0 ? Math.round((player.value.successfulTrades / player.value.trades) * 100) : 0
    
    gameStats.value = {
      startingCoins,
      finalCoins,
      profit,
      profitPercentage: parseFloat(profitPercentage),
      trades: player.value.trades,
      successRate,
      timeUsed,
      timeLimit: timeLimit.value,
      challengeSuccess: currentChallenge.value ? finalCoins >= currentChallenge.value.targetCoins : false,
      experienceGained: 0, // Will be calculated by calculateGameResults
      coinsEarned: 0, // Will be calculated by calculateGameResults
      newAchievements: [] // Will be populated by calculateGameResults
    }
    
    currentChallenge.value = null
    showResults.value = true
  }

  const buyAsset = (assetId, quantity, price) => {
    const cost = quantity * price
    if (cost > player.value.coins) return false
    
    player.value.coins -= cost
    
    const existingAsset = player.value.portfolio.find(a => a.id === assetId)
    if (existingAsset) {
      existingAsset.quantity += quantity
      existingAsset.averagePrice = ((existingAsset.averagePrice * existingAsset.quantity) + cost) / (existingAsset.quantity + quantity)
    } else {
      player.value.portfolio.push({
        id: assetId,
        quantity,
        averagePrice: price,
        currentPrice: price,
        buyTime: Date.now()
      })
    }
    
    player.value.trades++
    return true
  }

  const sellAsset = (assetId, quantity, price) => {
    const asset = player.value.portfolio.find(a => a.id === assetId)
    if (!asset || asset.quantity < quantity) return false
    
    const revenue = quantity * price
    player.value.coins += revenue
    
    asset.quantity -= quantity
    if (asset.quantity === 0) {
      player.value.portfolio = player.value.portfolio.filter(a => a.id !== assetId)
    }
    
    // Calculate profit/loss
    const profit = revenue - (quantity * asset.averagePrice)
    if (profit > 0) {
      player.value.successfulTrades++
      player.value.streak++
    } else {
      player.value.streak = 0
    }
    
    player.value.trades++
    return true
  }

  const addExperience = (amount) => {
    player.value.experience += amount
    
    // Level up check
    while (player.value.experience >= player.value.experienceToNext) {
      player.value.level++
      player.value.experience -= player.value.experienceToNext
      player.value.experienceToNext = Math.floor(player.value.experienceToNext * 1.5)
      
      // Level up rewards
      player.value.coins += player.value.level * 100
    }
  }

  const checkAchievements = () => {
    achievements.value.forEach(achievement => {
      if (achievement.unlocked) return
      
      let unlocked = false
      switch (achievement.id) {
        case 'first_trade':
          unlocked = player.value.trades > 0
          break
        case 'profit_master':
          unlocked = player.value.streak >= 10
          break
        case 'portfolio_diversifier':
          unlocked = player.value.portfolio.length >= 5
          break
        case 'streak_king':
          unlocked = player.value.streak >= 7
          break
        case 'millionaire':
          unlocked = player.value.coins >= 1000000
          break
        case 'speed_trader':
          unlocked = player.value.trades >= 50
          break
        case 'hodler':
          unlocked = player.value.portfolio.some(asset => 
            Date.now() - asset.buyTime >= 24 * 60 * 60 * 1000
          )
          break
      }
      
      if (unlocked) {
        achievement.unlocked = true
        player.value.achievements.push(achievement.id)
        addExperience(achievement.points)
        player.value.coins += achievement.points * 10
      }
    })
  }

  const calculateGameResults = () => {
    if (gameStats.value) {
      // Calculate experience and coins earned
      let experienceGained = 0
      let coinsEarned = 0
      
      if (currentChallenge.value) {
        const success = (player.value.coins + portfolioValue.value) >= currentChallenge.value.targetCoins
        if (success) {
          const reward = currentChallenge.value.reward
          experienceGained = reward.experience
          coinsEarned = reward.coins
          addExperience(reward.experience)
          player.value.coins += reward.coins
          player.value.badges.push(reward.badge)
        }
      }
      
      // Check for achievements
      const achievementsBefore = [...player.value.achievements]
      checkAchievements()
      const achievementsAfter = [...player.value.achievements]
      const newAchievements = achievements.value.filter(achievement => 
        achievementsAfter.includes(achievement.id) && !achievementsBefore.includes(achievement.id)
      )
      
      // Update game stats
      gameStats.value.experienceGained = experienceGained
      gameStats.value.coinsEarned = coinsEarned
      gameStats.value.newAchievements = newAchievements
    }
  }

  const resetGame = () => {
    player.value = {
      ...player.value,
      coins: 10000,
      portfolio: [],
      trades: 0,
      successfulTrades: 0,
      streak: 0
    }
  }

  const closeResults = () => {
    showResults.value = false
    gameStats.value = null
  }

  const playAgain = () => {
    showResults.value = false
    gameStats.value = null
    resetGame()
    startGame('simulation')
  }

  return {
    // State
    player: readonly(player),
    gameMode: readonly(gameMode),
    difficulty: readonly(difficulty),
    timeLimit: readonly(timeLimit),
    isGameActive: readonly(isGameActive),
    leaderboard: readonly(leaderboard),
    achievements: readonly(achievements),
    challenges: readonly(challenges),
    showResults: readonly(showResults),
    gameStats: readonly(gameStats),
    
    // Computed
    playerRank,
    portfolioValue,
    totalProfit,
    profitPercentage,
    
    // Actions
    startGame,
    endGame,
    buyAsset,
    sellAsset,
    addExperience,
    checkAchievements,
    resetGame,
    closeResults,
    playAgain
  }
}