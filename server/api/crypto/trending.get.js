export default defineEventHandler(async (event) => {
  try {
    // Fetch trending data from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending', {
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
    console.error('Error in crypto trending API:', error)
    
    // Return fallback data if API fails
    return {
      coins: [
        {
          item: {
            id: 'bitcoin',
            coin_id: 1,
            name: 'Bitcoin',
            symbol: 'BTC',
            market_cap_rank: 1,
            thumb: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
            small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
            large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            slug: 'bitcoin',
            price_btc: 1,
            score: 0
          }
        },
        {
          item: {
            id: 'ethereum',
            coin_id: 279,
            name: 'Ethereum',
            symbol: 'ETH',
            market_cap_rank: 2,
            thumb: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            small: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
            large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            slug: 'ethereum',
            price_btc: 0.062,
            score: 1
          }
        }
      ]
    }
  }
})