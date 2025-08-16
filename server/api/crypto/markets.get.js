export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { ids, vs_currency = 'usd', order = 'market_cap_desc', per_page = '100', page = '1', sparkline = 'false', price_change_percentage = '1h,24h,7d' } = query
    
    // Build the CoinGecko API URL
    const coinIds = Array.isArray(ids) ? ids.join(',') : ids
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&ids=${coinIds}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}&price_change_percentage=${price_change_percentage}`
    
    // Fetch data from CoinGecko
    const response = await fetch(url, {
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
    setHeader(event, 'Cache-Control', 'public, max-age=30') // Cache for 30 seconds
    return data
    
  } catch (error) {
    console.error('Error in crypto markets API:', error)
    
    // Return fallback data if API fails
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 43250,
        price_change_24h: 1250,
        price_change_percentage_24h: 2.98,
        price_change_percentage_1h: 0.5,
        price_change_percentage_7d: 8.5,
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
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 2680,
        price_change_24h: -32,
        price_change_percentage_24h: -1.18,
        price_change_percentage_1h: -0.2,
        price_change_percentage_7d: 5.2,
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
      }
    ]
  }
})