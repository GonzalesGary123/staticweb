import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useMarketStatus() {
  // Market data
  const markets = ref([
    {
      id: 'singapore',
      name: 'Singapore',
      country: 'Singapore',
      timezone: 'Asia/Singapore',
      openTime: '09:00',
      closeTime: '17:00',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: 8, // UTC+8
      icon: '🇸🇬'
    },
    {
      id: 'hongkong',
      name: 'Hong Kong',
      country: 'Hong Kong',
      timezone: 'Asia/Hong_Kong',
      openTime: '09:30',
      closeTime: '16:00',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: 8, // UTC+8
      icon: '🇭🇰'
    },
    {
      id: 'shanghai',
      name: 'Shanghai',
      country: 'China',
      timezone: 'Asia/Shanghai',
      openTime: '09:30',
      closeTime: '15:00',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: 8, // UTC+8
      icon: '🇨🇳'
    },
    {
      id: 'sydney',
      name: 'Sydney',
      country: 'Australia',
      timezone: 'Australia/Sydney',
      openTime: '09:00',
      closeTime: '17:00',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: 10, // UTC+10
      icon: '🇦🇺'
    },
    {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
      timezone: 'Asia/Tokyo',
      openTime: '09:00',
      closeTime: '15:00',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: 9, // UTC+9
      icon: '🇯🇵'
    },
    {
      id: 'london',
      name: 'London',
      country: 'UK',
      timezone: 'Europe/London',
      openTime: '08:00',
      closeTime: '16:30',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: 0, // UTC+0 (varies with DST)
      icon: '🇬🇧'
    },
    {
      id: 'newyork',
      name: 'New York',
      country: 'USA',
      timezone: 'America/New_York',
      openTime: '09:30',
      closeTime: '16:00',
      isOpen: false,
      currentTime: null,
      countdown: null,
      offset: -5, // UTC-5 (varies with DST)
      icon: '🇺🇸'
    }
  ])

  // Crypto market status (always open)
  const cryptoMarket = ref({
    id: 'crypto',
    name: 'Crypto',
    country: 'Global',
    timezone: 'UTC',
    openTime: '00:00',
    closeTime: '23:59',
    isOpen: true,
    currentTime: null,
    offset: 0,
    icon: '🌐',
    alwaysOpen: true
  })

  // Computed properties
  const openMarkets = computed(() => {
    return markets.value.filter(market => market.isOpen)
  })

  const closedMarkets = computed(() => {
    return markets.value.filter(market => !market.isOpen)
  })

  const nextMarketToOpen = computed(() => {
    const now = new Date()
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    
    let nextMarket = null
    let shortestTime = Infinity
    
    markets.value.forEach(market => {
      if (!market.isOpen) {
        const marketTime = getMarketTime(market)
        const openTime = new Date(marketTime)
        openTime.setHours(parseInt(market.openTime.split(':')[0]), parseInt(market.openTime.split(':')[1]), 0, 0)
        
        // If market opens tomorrow
        if (openTime <= marketTime) {
          openTime.setDate(openTime.getDate() + 1)
        }
        
        const timeUntilOpen = openTime - marketTime
        if (timeUntilOpen < shortestTime) {
          shortestTime = timeUntilOpen
          nextMarket = market
        }
      }
    })
    
    return nextMarket
  })

  const timeUntilNextOpen = computed(() => {
    const nextMarket = nextMarketToOpen.value
    if (!nextMarket) return null
    
    const now = new Date()
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const marketTime = getMarketTime(nextMarket)
    const openTime = new Date(marketTime)
    openTime.setHours(parseInt(nextMarket.openTime.split(':')[0]), parseInt(nextMarket.openTime.split(':')[1]), 0, 0)
    
    // If market opens tomorrow
    if (openTime <= marketTime) {
      openTime.setDate(openTime.getDate() + 1)
    }
    
    const timeUntilOpen = openTime - marketTime
    return formatTimeRemaining(timeUntilOpen)
  })

  // Helper functions
  const getMarketTime = (market) => {
    const now = new Date()
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    
    // Handle DST for London and New York
    let offset = market.offset
    if (market.id === 'london') {
      // Check if London is in DST (BST)
      const londonTime = new Date(utcNow.getTime() + (offset * 60 * 60 * 1000))
      const jan = new Date(londonTime.getFullYear(), 0, 1)
      const jul = new Date(londonTime.getFullYear(), 6, 1)
      const isDST = Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) === londonTime.getTimezoneOffset()
      offset = isDST ? 1 : 0
    } else if (market.id === 'newyork') {
      // Check if New York is in DST (EDT)
      const nyTime = new Date(utcNow.getTime() + (offset * 60 * 60 * 1000))
      const jan = new Date(nyTime.getFullYear(), 0, 1)
      const jul = new Date(nyTime.getFullYear(), 6, 1)
      const isDST = Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) === nyTime.getTimezoneOffset()
      offset = isDST ? -4 : -5
    }
    
    return new Date(utcNow.getTime() + (offset * 60 * 60 * 1000))
  }

  const checkMarketStatus = (market) => {
    if (market.alwaysOpen) {
      market.isOpen = true
      market.currentTime = new Date()
      return
    }
    
    const marketTime = getMarketTime(market)
    market.currentTime = marketTime
    
    const currentTime = marketTime.getTime()
    const openTime = new Date(marketTime)
    openTime.setHours(parseInt(market.openTime.split(':')[0]), parseInt(market.openTime.split(':')[1]), 0, 0)
    const closeTime = new Date(marketTime)
    closeTime.setHours(parseInt(market.closeTime.split(':')[0]), parseInt(market.closeTime.split(':')[1]), 0, 0)
    
    // Check if market is open
    market.isOpen = currentTime >= openTime.getTime() && currentTime <= closeTime.getTime()
  }

  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatMarketTime = (date) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  // Update market status
  const updateMarketStatus = () => {
    markets.value.forEach(checkMarketStatus)
    checkMarketStatus(cryptoMarket.value)
  }

  // Auto-update every minute
  let updateInterval = null

  const startAutoUpdate = () => {
    updateMarketStatus()
    updateInterval = setInterval(updateMarketStatus, 60000) // Update every minute
  }

  // Real-time countdown timer
  let countdownInterval = null
  
  const startCountdown = () => {
    countdownInterval = setInterval(() => {
      // Update countdown every second
      markets.value.forEach(market => {
        if (!market.isOpen) {
          market.countdown = getTimeUntilOpen(market)
        }
      })
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  // Helper function to get time until market opens
  const getTimeUntilOpen = (market) => {
    if (market.isOpen) return null
    
    const now = new Date()
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    
    // Handle DST for London and New York
    let offset = market.offset
    if (market.id === 'london') {
      const londonTime = new Date(utcNow.getTime() + (offset * 60 * 60 * 1000))
      const jan = new Date(londonTime.getFullYear(), 0, 1)
      const jul = new Date(londonTime.getFullYear(), 6, 1)
      const isDST = Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) === londonTime.getTimezoneOffset()
      offset = isDST ? 1 : 0
    } else if (market.id === 'newyork') {
      const nyTime = new Date(utcNow.getTime() + (offset * 60 * 60 * 1000))
      const jan = new Date(nyTime.getFullYear(), 0, 1)
      const jul = new Date(nyTime.getFullYear(), 6, 1)
      const isDST = Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) === nyTime.getTimezoneOffset()
      offset = -4
    }
    
    const marketTime = new Date(utcNow.getTime() + (offset * 60 * 60 * 1000))
    const openTime = new Date(marketTime)
    openTime.setHours(parseInt(market.openTime.split(':')[0]), parseInt(market.openTime.split(':')[1]), 0, 0)
    
    // If market opens tomorrow
    if (openTime <= marketTime) {
      openTime.setDate(openTime.getDate() + 1)
    }
    
    const timeUntilOpen = openTime - marketTime
    return formatTimeRemaining(timeUntilOpen)
  }

  const stopAutoUpdate = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  // Lifecycle
  onMounted(() => {
    startAutoUpdate()
    startCountdown()
  })

  onUnmounted(() => {
    stopAutoUpdate()
    stopCountdown()
  })

  return {
    markets: readonly(markets),
    cryptoMarket: readonly(cryptoMarket),
    openMarkets,
    closedMarkets,
    nextMarketToOpen,
    timeUntilNextOpen,
    formatMarketTime,
    updateMarketStatus
  }
}