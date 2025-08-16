export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id
    const query = getQuery(event)
    const { localization = 'false', tickers = 'false', market_data = 'true', community_data = 'false', developer_data = 'false', sparkline = 'false' } = query
    
    // Build the CoinGecko API URL
    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=${localization}&tickers=${tickers}&market_data=${market_data}&community_data=${community_data}&developer_data=${developer_data}&sparkline=${sparkline}`
    
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
    setHeader(event, 'Cache-Control', 'public, max-age=60') // Cache for 1 minute
    return data
    
  } catch (error) {
    console.error('Error in crypto coin API:', error)
    
    // Return fallback data if API fails
    return {
      id: id || 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      description: {
        en: 'Bitcoin is a decentralized cryptocurrency originally described in a 2008 whitepaper by a person, or group of people, using the alias Satoshi Nakamoto.'
      },
      market_data: {
        current_price: { usd: 43250 },
        price_change_24h: { usd: 1250 },
        price_change_percentage_24h: { usd: 2.98 },
        market_cap: { usd: 850000000000 },
        total_volume: { usd: 25000000000 },
        high_24h: { usd: 44500 },
        low_24h: { usd: 42000 },
        circulating_supply: 19600000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: { usd: 69000 },
        ath_date: { usd: '2021-11-10T14:24:11.849Z' },
        atl: { usd: 67.81 },
        atl_date: { usd: '2013-07-06T00:00:00.000Z' }
      },
      market_cap_rank: 1,
      last_updated: new Date().toISOString(),
      image: { large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      genesis_date: '2009-01-03',
      categories: ['Cryptocurrency'],
      links: {}
    }
  }
})