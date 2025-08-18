<template>
  <section id="market-status" class="section-padding bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="w-full h-full" style="background-image: repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px); background-size: 60px 60px;"></div>
    </div>

    <!-- Content -->
    <div class="container-custom relative z-10">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-6 text-gradient-primary">
          Global Market Status
        </h2>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          Real-time status of major financial markets and crypto exchanges worldwide
        </p>
      </div>

      <!-- Market Status Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Crypto Market (Always Open) -->
        <div class="gaming-card p-6 text-center border-2 border-green-500/50">
          <div class="text-4xl mb-4">{{ cryptoMarket.icon }}</div>
          <h3 class="text-xl font-semibold mb-2 text-green-400">{{ cryptoMarket.name }}</h3>
          <p class="text-gray-400 mb-3">{{ cryptoMarket.country }}</p>
          <div class="flex items-center justify-center gap-2 mb-3">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-green-400 font-semibold">24/7 OPEN</span>
          </div>
          <div class="text-sm text-gray-400">
            <div>Open: {{ cryptoMarket.openTime }}</div>
            <div>Close: {{ cryptoMarket.closeTime }}</div>
          </div>
        </div>

        <!-- Major Markets -->
        <div 
          v-for="market in markets" 
          :key="market.id"
          class="gaming-card p-6 text-center"
          :class="market.isOpen ? 'border-2 border-green-500/50' : 'border-2 border-red-500/50'"
        >
          <div class="text-4xl mb-4">{{ market.icon }}</div>
          <h3 class="text-xl font-semibold mb-2" :class="market.isOpen ? 'text-green-400' : 'text-red-400'">
            {{ market.name }}
          </h3>
          <p class="text-gray-400 mb-3">{{ market.country }}</p>
          
          <!-- Status Indicator -->
          <div class="flex items-center justify-center gap-2 mb-3">
            <div 
              class="w-3 h-3 rounded-full"
              :class="market.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
            ></div>
            <span 
              class="font-semibold"
              :class="market.isOpen ? 'text-green-400' : 'text-red-400'"
            >
              {{ market.isOpen ? 'OPEN' : 'CLOSED' }}
            </span>
          </div>

          <!-- Current Time -->
          <div class="text-lg font-mono mb-2" :class="market.isOpen ? 'text-green-400' : 'text-gray-400'">
            {{ formatMarketTime(market.currentTime) }}
          </div>

          <!-- Trading Hours -->
          <div class="text-sm text-gray-400">
            <div>Open: {{ market.openTime }}</div>
            <div>Close: {{ market.closeTime }}</div>
          </div>

          <!-- Time Until Open (if closed) -->
          <div v-if="!market.isOpen" class="mt-3 p-2 bg-red-500/10 rounded-lg">
            <div class="text-xs text-gray-400 mb-1">Opens in:</div>
            <div class="text-sm font-semibold text-red-400">
              {{ market.countdown || '--' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Market Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Open Markets -->
        <div class="gaming-card p-6 text-center">
          <div class="text-3xl font-bold text-green-400 mb-2">{{ openMarkets.length + 1 }}</div>
          <div class="text-gray-400">Markets Open</div>
          <div class="text-sm text-gray-500 mt-2">Including Crypto</div>
        </div>

        <!-- Closed Markets -->
        <div class="gaming-card p-6 text-center">
          <div class="text-3xl font-bold text-red-400 mb-2">{{ closedMarkets.length }}</div>
          <div class="text-gray-400">Markets Closed</div>
          <div class="text-sm text-gray-500 mt-2">Traditional Markets</div>
        </div>

        <!-- Next Market to Open -->
        <div class="gaming-card p-6 text-center">
          <div class="text-3xl font-bold text-blue-400 mb-2">
            {{ nextMarketToOpen ? nextMarketToOpen.icon : '⏰' }}
          </div>
          <div class="text-gray-400">
            {{ nextMarketToOpen ? nextMarketToOpen.name : 'No Markets' }}
          </div>
          <div v-if="nextMarketToOpen && timeUntilNextOpen" class="text-sm text-blue-400 mt-2">
            Opens in {{ timeUntilNextOpen }}
          </div>
        </div>
      </div>

      <!-- GMT+8 Timezone Highlight -->
      <div class="gaming-card p-6 mb-8 border-2 border-blue-500/50">
        <h3 class="text-xl font-semibold mb-4 text-blue-400">🌏 GMT+8 Trading Hub</h3>
        <p class="text-gray-300 mb-4 text-center">
          The GMT+8 timezone is one of the most active trading regions globally, covering major financial centers in Asia.
          This region is crucial for crypto trading as it bridges the gap between Asian and Western markets.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div class="text-2xl mb-2">🇸🇬</div>
            <div class="font-semibold text-blue-400">Singapore</div>
            <div class="text-sm text-gray-400">09:00 - 17:00</div>
            <div class="text-xs text-blue-400 mt-1">Major Financial Hub</div>
          </div>
          
          <div class="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div class="text-2xl mb-2">🇭🇰</div>
            <div class="font-semibold text-blue-400">Hong Kong</div>
            <div class="text-sm text-gray-400">09:30 - 16:00</div>
            <div class="text-xs text-blue-400 mt-1">Asia's Wall Street</div>
          </div>
          
          <div class="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div class="text-2xl mb-2">🇨🇳</div>
            <div class="font-semibold text-blue-400">Shanghai</div>
            <div class="text-sm text-gray-400">09:30 - 15:00</div>
            <div class="text-xs text-blue-400 mt-1">World's 2nd Largest</div>
          </div>
        </div>
      </div>

      <!-- Trading Session Info -->
      <div class="gaming-card p-6">
        <h3 class="text-xl font-semibold mb-4 text-gradient-primary">Trading Sessions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-gray-800/50 rounded-lg">
            <div class="text-2xl mb-2">🌅</div>
            <div class="font-semibold text-blue-400">Asian Session</div>
            <div class="text-sm text-gray-400">Singapore, Hong Kong, Shanghai, Tokyo, Sydney</div>
            <div class="text-xs text-gray-500 mt-1">00:00 - 09:00 UTC</div>
          </div>
          
          <div class="text-center p-4 bg-gray-800/50 rounded-lg">
            <div class="text-2xl mb-2">🌍</div>
            <div class="font-semibold text-green-400">European Session</div>
            <div class="text-sm text-gray-400">London</div>
            <div class="text-xs text-gray-500 mt-1">08:00 - 16:30 UTC</div>
          </div>
          
          <div class="text-center p-4 bg-gray-800/50 rounded-lg">
            <div class="text-2xl mb-2">🌎</div>
            <div class="font-semibold text-orange-400">American Session</div>
            <div class="text-sm text-gray-400">New York</div>
            <div class="text-xs text-gray-500 mt-1">13:30 - 20:00 UTC</div>
          </div>
          
          <div class="text-center p-4 bg-gray-800/50 rounded-lg">
            <div class="text-2xl mb-2">🌐</div>
            <div class="font-semibold text-purple-400">Crypto Session</div>
            <div class="text-sm text-gray-400">Global</div>
            <div class="text-xs text-gray-500 mt-1">24/7 Always Open</div>
          </div>
        </div>
      </div>

      <!-- Market Overlap Periods -->
      <div class="gaming-card p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4 text-gradient-primary">🌍 Market Overlap Periods</h3>
        <p class="text-gray-300 mb-4 text-center">
          These are the most volatile and active trading periods when multiple markets are open simultaneously.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div class="text-2xl mb-2">🌅🌍</div>
            <div class="font-semibold text-green-400">Asian-European</div>
            <div class="text-sm text-gray-400">08:00 - 09:00 UTC</div>
            <div class="text-xs text-green-400 mt-1">High Volatility</div>
          </div>
          
          <div class="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div class="text-2xl mb-2">🌍🌎</div>
            <div class="font-semibold text-orange-400">European-American</div>
            <div class="text-sm text-gray-400">13:30 - 16:30 UTC</div>
            <div class="text-xs text-orange-400 mt-1">Peak Activity</div>
          </div>
          
          <div class="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div class="text-2xl mb-2">🌅🌎</div>
            <div class="font-semibold text-blue-400">Asian-American</div>
            <div class="text-sm text-gray-400">13:30 - 15:00 UTC</div>
            <div class="text-xs text-blue-400 mt-1">Cross-Pacific</div>
          </div>
        </div>
      </div>

      <!-- Last Updated -->
      <div class="text-center text-gray-500 text-sm mt-8">
        Last updated: {{ new Date().toLocaleTimeString() }}
        <br>
        <span class="text-xs">Updates every minute</span>
      </div>
    </div>
  </section>
</template>

<script setup>
// Use composables
const { 
  markets, 
  cryptoMarket,
  openMarkets,
  closedMarkets,
  nextMarketToOpen,
  timeUntilNextOpen,
  formatMarketTime
} = useMarketStatus()


</script>

<style scoped>
.section-padding {
  padding: 5rem 1rem;
}

.container-custom {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-gradient-primary {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gaming-card {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.gaming-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.1), transparent);
  transition: left 0.5s;
}

.gaming-card:hover::before {
  left: 100%;
}

.gaming-card:hover {
  border-color: rgba(255, 107, 53, 0.8);
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.3), inset 0 0 30px rgba(255, 107, 53, 0.1);
  transform: translateY(-5px);
}
</style>