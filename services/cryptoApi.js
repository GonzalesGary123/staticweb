// Crypto API service using local proxy endpoints
const API_BASE = '/api/crypto'

export class CryptoApiService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 30000 // 30 seconds cache
  }

  // Fetch current market data for multiple cryptocurrencies
  async getMarketData(ids = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot']) {
    try {
      const cacheKey = `market_${ids.join(',')}`
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      const response = await fetch(
        `${API_BASE}/markets?ids=${ids.join(',')}&vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const formattedData = data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_1h: coin.price_change_percentage_1h,
        price_change_percentage_7d: coin.price_change_percentage_7d,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        last_updated: coin.last_updated,
        image: coin.image
      }))

      this.setCachedData(cacheKey, formattedData)
      return formattedData
    } catch (error) {
      console.error('Error fetching market data:', error)
      // Return fallback data if API fails
      return this.getFallbackData()
    }
  }

  // Fetch detailed data for a specific cryptocurrency
  async getCoinDetails(id) {
    try {
      const cacheKey = `coin_${id}`
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      const response = await fetch(
        `${API_BASE}/coin/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const formattedData = {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        description: data.description.en,
        current_price: data.market_data.current_price.usd,
        price_change_24h: data.market_data.price_change_24h.usd,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        total_volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply,
        max_supply: data.market_data.max_supply,
        ath: data.market_data.ath.usd,
        ath_date: data.market_data.ath_date.usd,
        atl: data.market_data.atl.usd,
        atl_date: data.market_data.atl_date.usd,
        last_updated: data.last_updated,
        image: data.image.large,
        genesis_date: data.genesis_date,
        categories: data.categories,
        links: data.links
      }

      this.setCachedData(cacheKey, formattedData)
      return formattedData
    } catch (error) {
      console.error('Error fetching coin details:', error)
      return null
    }
  }

  // Fetch trending cryptocurrencies
  async getTrendingCoins() {
    try {
      const cacheKey = 'trending'
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      const response = await fetch(`${API_BASE}/trending`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const formattedData = data.coins.map(coin => ({
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol.toUpperCase(),
        market_cap_rank: coin.item.market_cap_rank,
        price_btc: coin.item.price_btc,
        image: coin.item.large,
        score: coin.item.score
      }))

      this.setCachedData(cacheKey, formattedData)
      return formattedData
    } catch (error) {
      console.error('Error fetching trending coins:', error)
      return []
    }
  }

  // Get global market data
  async getGlobalMarketData() {
    try {
      const cacheKey = 'global'
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      const response = await fetch(`${API_BASE}/global`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const formattedData = {
        total_market_cap: data.data.total_market_cap.usd,
        total_volume: data.data.total_volume.usd,
        market_cap_percentage: data.data.market_cap_percentage,
        market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd,
        active_cryptocurrencies: data.data.active_cryptocurrencies,
        active_exchanges: data.data.active_exchanges,
        total_market_cap_yesterday: data.data.total_market_cap_yesterday_percentage,
        total_volume_yesterday: data.data.total_volume_yesterday_percentage
      }

      this.setCachedData(cacheKey, formattedData)
      return formattedData
    } catch (error) {
      console.error('Error fetching global market data:', error)
      return null
    }
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Fallback data when API is unavailable
  getFallbackData() {
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 43250,
        price_change_24h: 1250,
        price_change_percentage_24h: 2.98,
        price_change_percentage_1h: 0.5,
        price_change_percentage_7d: 5.2,
        market_cap: 850000000000,
        market_cap_rank: 1,
        total_volume: 25000000000,
        high_24h: 44500,
        low_24h: 42000,
        circulating_supply: 19600000,
        total_supply: 21000000,
        max_supply: 21000000,
        last_updated: new Date().toISOString(),
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 2680,
        price_change_24h: -32,
        price_change_percentage_24h: -1.18,
        price_change_percentage_1h: -0.2,
        price_change_percentage_7d: 3.8,
        market_cap: 320000000000,
        market_cap_rank: 2,
        total_volume: 15000000000,
        high_24h: 2750,
        low_24h: 2650,
        circulating_supply: 120000000,
        total_supply: 120000000,
        max_supply: null,
        last_updated: new Date().toISOString(),
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      },
      {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
        current_price: 0.48,
        price_change_24h: 0.026,
        price_change_percentage_24h: 5.73,
        price_change_percentage_1h: 1.2,
        price_change_percentage_7d: 12.5,
        market_cap: 17000000000,
        market_cap_rank: 8,
        total_volume: 800000000,
        high_24h: 0.49,
        low_24h: 0.45,
        circulating_supply: 35500000000,
        total_supply: 45000000000,
        max_supply: 45000000000,
        last_updated: new Date().toISOString(),
        image: 'https://assets.coingecko.com/coins/images/975/large/Cardano_Logo.png'
      }
    ]
  }
}

// Create and export a singleton instance
export const cryptoApi = new CryptoApiService()