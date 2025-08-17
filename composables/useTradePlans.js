import { ref, computed, readonly } from 'vue'

export function useTradePlans() {
  // Trade plans state
  const tradePlans = ref([])
  const currentPlan = ref(null)

  // Computed properties
  const totalTrades = computed(() => {
    return tradePlans.value.reduce((total, plan) => total + plan.trades.length, 0)
  })

  const totalWins = computed(() => {
    return tradePlans.value.reduce((total, plan) => {
      return total + plan.trades.filter(trade => trade.result === 'win').length
    }, 0)
  })

  const totalLosses = computed(() => {
    return tradePlans.value.reduce((total, plan) => {
      return total + plan.trades.filter(trade => trade.result === 'loss').length
    }, 0)
  })

  const totalPending = computed(() => {
    return tradePlans.value.reduce((total, plan) => {
      return total + plan.trades.filter(trade => trade.result === 'pending').length
    }, 0)
  })

  const winRate = computed(() => {
    if (totalTrades.value === 0) return 0
    return ((totalWins.value / (totalWins.value + totalLosses.value)) * 100).toFixed(2)
  })

  const totalProfit = computed(() => {
    return tradePlans.value.reduce((total, plan) => {
      return total + plan.trades.reduce((planTotal, trade) => {
        if (trade.result === 'win') {
          return planTotal + (trade.entryPrice * trade.quantity * (trade.exitPrice / trade.entryPrice - 1))
        } else if (trade.result === 'loss') {
          return planTotal + (trade.entryPrice * trade.quantity * (trade.exitPrice / trade.entryPrice - 1))
        }
        return planTotal
      }, 0)
    }, 0)
  })

  const totalProfitPercentage = computed(() => {
    if (totalTrades.value === 0) return 0
    const totalInvested = tradePlans.value.reduce((total, plan) => {
      return total + plan.trades.reduce((planTotal, trade) => {
        return planTotal + (trade.entryPrice * trade.quantity)
      }, 0)
    }, 0)
    
    if (totalInvested === 0) return 0
    return ((totalProfit.value / totalInvested) * 100).toFixed(2)
  })

  const monthlyStats = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const monthlyTrades = tradePlans.value.reduce((total, plan) => {
      const planDate = new Date(plan.date)
      if (planDate.getMonth() === currentMonth && planDate.getFullYear() === currentYear) {
        return total + plan.trades.length
      }
      return total
    }, 0)
    
    const monthlyWins = tradePlans.value.reduce((total, plan) => {
      const planDate = new Date(plan.date)
      if (planDate.getMonth() === currentMonth && planDate.getFullYear() === currentYear) {
        return total + plan.trades.filter(trade => trade.result === 'win').length
      }
      return total
    }, 0)
    
    const monthlyLosses = tradePlans.value.reduce((total, plan) => {
      const planDate = new Date(plan.date)
      if (planDate.getMonth() === currentMonth && planDate.getFullYear() === currentYear) {
        return total + plan.trades.filter(trade => trade.result === 'loss').length
      }
      return total
    }, 0)
    
    const monthlyWinRate = monthlyTrades > 0 ? ((monthlyWins / (monthlyWins + monthlyLosses)) * 100).toFixed(2) : 0
    
    return {
      trades: monthlyTrades,
      wins: monthlyWins,
      losses: monthlyLosses,
      winRate: parseFloat(monthlyWinRate)
    }
  })

  // Actions
  const createTradePlan = (date, notes = '') => {
    const newPlan = {
      id: 'plan_' + Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      notes,
      trades: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    tradePlans.value.push(newPlan)
    currentPlan.value = newPlan
    return newPlan
  }

  const addTrade = (planId, tradeData) => {
    const plan = tradePlans.value.find(p => p.id === planId)
    if (!plan) return false
    
    const newTrade = {
      id: 'trade_' + Date.now(),
      symbol: tradeData.symbol,
      entryPrice: parseFloat(tradeData.entryPrice),
      exitPrice: parseFloat(tradeData.exitPrice) || null,
      quantity: parseFloat(tradeData.quantity),
      result: tradeData.result || 'pending', // 'pending', 'win', 'loss'
      notes: tradeData.notes || '',
      entryTime: tradeData.entryTime || new Date().toISOString(),
      exitTime: tradeData.exitTime || null,
      createdAt: new Date().toISOString()
    }
    
    plan.trades.push(newTrade)
    plan.updatedAt = new Date().toISOString()
    
    return newTrade
  }

  const updateTradeResult = (planId, tradeId, result, exitPrice = null, exitTime = null) => {
    const plan = tradePlans.value.find(p => p.id === planId)
    if (!plan) return false
    
    const trade = plan.trades.find(t => t.id === tradeId)
    if (!trade) return false
    
    trade.result = result
    if (exitPrice) trade.exitPrice = parseFloat(exitPrice)
    if (exitTime) trade.exitTime = exitTime
    plan.updatedAt = new Date().toISOString()
    
    return true
  }

  const deleteTrade = (planId, tradeId) => {
    const plan = tradePlans.value.find(p => p.id === planId)
    if (!plan) return false
    
    plan.trades = plan.trades.filter(t => t.id !== tradeId)
    plan.updatedAt = new Date().toISOString()
    
    return true
  }

  const deleteTradePlan = (planId) => {
    const index = tradePlans.value.findIndex(p => p.id === planId)
    if (index === -1) return false
    
    tradePlans.value.splice(index, 1)
    
    if (currentPlan.value && currentPlan.value.id === planId) {
      currentPlan.value = null
    }
    
    return true
  }

  const getTradePlan = (planId) => {
    return tradePlans.value.find(p => p.id === planId)
  }

  const getTradePlansByDate = (date) => {
    return tradePlans.value.filter(p => p.date === date)
  }

  const exportTradeData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalPlans: tradePlans.value.length,
      totalTrades: totalTrades.value,
      totalWins: totalWins.value,
      totalLosses: totalLosses.value,
      winRate: winRate.value,
      totalProfit: totalProfit.value,
      totalProfitPercentage: totalProfitPercentage.value,
      plans: tradePlans.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trade-plans-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTradeData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.plans && Array.isArray(data.plans)) {
        tradePlans.value = data.plans
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing trade data:', error)
      return false
    }
  }

  // Initialize with some sample data for demonstration
  const initializeSampleData = () => {
    if (tradePlans.value.length === 0) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Today's plan
      const todayPlan = createTradePlan(today, 'Focus on BTC and ETH momentum trades')
      addTrade(todayPlan.id, {
        symbol: 'BTC/USDT',
        entryPrice: 45000,
        exitPrice: 46500,
        quantity: 0.1,
        result: 'win',
        notes: 'Breakout trade from key resistance'
      })
      addTrade(todayPlan.id, {
        symbol: 'ETH/USDT',
        entryPrice: 3200,
        exitPrice: 3150,
        quantity: 1.5,
        result: 'loss',
        notes: 'Failed support test'
      })
      
      // Yesterday's plan
      const yesterdayPlan = createTradePlan(yesterday, 'Scalping opportunities in altcoins')
      addTrade(yesterdayPlan.id, {
        symbol: 'SOL/USDT',
        entryPrice: 95,
        exitPrice: 98,
        quantity: 10,
        result: 'win',
        notes: 'Quick scalp on volume spike'
      })
      addTrade(yesterdayPlan.id, {
        symbol: 'ADA/USDT',
        entryPrice: 0.45,
        exitPrice: 0.47,
        quantity: 1000,
        result: 'win',
        notes: 'Trend following trade'
      })
      
      currentPlan.value = todayPlan
    }
  }

  return {
    // State
    tradePlans: readonly(tradePlans),
    currentPlan: readonly(currentPlan),
    
    // Computed
    totalTrades,
    totalWins,
    totalLosses,
    totalPending,
    winRate,
    totalProfit,
    totalProfitPercentage,
    monthlyStats,
    
    // Actions
    createTradePlan,
    addTrade,
    updateTradeResult,
    deleteTrade,
    deleteTradePlan,
    getTradePlan,
    getTradePlansByDate,
    exportTradeData,
    importTradeData,
    initializeSampleData
  }
}