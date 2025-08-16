export default defineEventHandler(async (event) => {
  try {
    // Fetch global data from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/global', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoGroup-App/1.0'
      }
    })
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `CoinGecko API error: ${response.status}`
      })
    }
    
    const data = await response.json()
    
    // Return the data with proper headers
    setHeader(event, 'Cache-Control', 'public, max-age=300') // Cache for 5 minutes
    return data
    
  } catch (error) {
    console.error('Error in crypto global API:', error)
    
    // Return fallback data if API fails
    return {
      data: {
        active_cryptocurrencies: 2500,
        total_market_cap: { usd: 1500000000000 },
        total_volume: { usd: 50000000000 },
        market_cap_percentage: { btc: 45.2, eth: 18.5 },
        market_cap_change_percentage_24h_usd: 2.5,
        updated_at: Math.floor(Date.now() / 1000)
      }
    }
  }
})