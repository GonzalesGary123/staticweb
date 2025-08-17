<template>
  <div class="min-h-screen transition-colors duration-300 bg-black text-white overflow-hidden">
    <!-- Gaming Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Hexagonal Grid Pattern -->
      <div class="absolute inset-0 opacity-20">
        <div class="w-full h-full" style="background-image: repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px); background-size: 60px 60px;"></div>
      </div>
      
      <!-- Neon Accent Lines -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div>
      <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div>
      <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60"></div>
      <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="container-custom py-8">
        <div class="text-center mb-12">
          <h1 class="text-5xl md:text-6xl font-bold mb-4 text-gradient-primary">
            Daily Trade Plans
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Track your trading performance, analyze win rates, and optimize your strategy with comprehensive daily trade planning.
          </p>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="gaming-card p-6 text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">{{ totalTrades }}</div>
            <div class="text-gray-400">Total Trades</div>
          </div>
          <div class="gaming-card p-6 text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">{{ totalWins }}</div>
            <div class="text-gray-400">Wins</div>
          </div>
          <div class="gaming-card p-6 text-center">
            <div class="text-3xl font-bold text-red-400 mb-2">{{ totalLosses }}</div>
            <div class="text-gray-400">Losses</div>
          </div>
          <div class="gaming-card p-6 text-center">
            <div class="text-3xl font-bold text-blue-400 mb-2">{{ winRate }}%</div>
            <div class="text-gray-400">Win Rate</div>
          </div>
        </div>

        <!-- Profit Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div class="gaming-card p-6">
            <h3 class="text-xl font-semibold mb-4 text-gradient-primary">Total Profit/Loss</h3>
            <div class="text-3xl font-bold" :class="totalProfit >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ totalProfit >= 0 ? '+' : '' }}${{ totalProfit.toFixed(2) }}
            </div>
            <div class="text-gray-400 mt-2">
              {{ totalProfitPercentage >= 0 ? '+' : '' }}{{ totalProfitPercentage }}% ROI
            </div>
          </div>
          <div class="gaming-card p-6">
            <h3 class="text-xl font-semibold mb-4 text-gradient-primary">Monthly Performance</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">Trades:</span>
                <span class="font-semibold">{{ monthlyStats.trades }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Win Rate:</span>
                <span class="font-semibold text-blue-400">{{ monthlyStats.winRate }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Wins:</span>
                <span class="font-semibold text-green-400">{{ monthlyStats.wins }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Losses:</span>
                <span class="font-semibold text-red-400">{{ monthlyStats.losses }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-4 mb-12 justify-center">
          <button 
            @click="showCreatePlanModal = true"
            class="gaming-accent px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            📝 Create New Plan
          </button>
          <button 
            @click="showAddTradeModal = true"
            class="gaming-accent px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            ➕ Add Trade
          </button>
          <button 
            @click="exportTradeData"
            class="gaming-border px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            📊 Export Data
          </button>
          <button 
            @click="showImportModal = true"
            class="gaming-border px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200"
          >
            📥 Import Data
          </button>
        </div>

        <!-- Trade Plans List -->
        <div class="space-y-6">
          <h2 class="text-3xl font-bold text-gradient-primary mb-6">Your Trade Plans</h2>
          
          <div v-if="tradePlans.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📈</div>
            <h3 class="text-2xl font-semibold mb-2">No trade plans yet</h3>
            <p class="text-gray-400 mb-6">Create your first trade plan to start tracking your performance</p>
            <button 
              @click="showCreatePlanModal = true"
              class="gaming-accent px-6 py-3 rounded-lg font-semibold"
            >
              Create First Plan
            </button>
          </div>

          <div v-else class="space-y-6">
            <div 
              v-for="plan in sortedTradePlans" 
              :key="plan.id"
              class="gaming-card p-6"
            >
              <div class="flex flex-wrap items-center justify-between mb-4">
                <div>
                  <h3 class="text-xl font-semibold text-gradient-primary">{{ formatDate(plan.date) }}</h3>
                  <p class="text-gray-400">{{ plan.notes || 'No notes' }}</p>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="editPlan(plan)"
                    class="gaming-border px-4 py-2 rounded text-sm hover:scale-105 transition-transform"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    @click="deleteTradePlan(plan.id)"
                    class="gaming-border px-4 py-2 rounded text-sm hover:scale-105 transition-transform text-red-400"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <!-- Plan Stats -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="text-center">
                  <div class="text-lg font-semibold text-blue-400">{{ plan.trades.length }}</div>
                  <div class="text-sm text-gray-400">Trades</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-green-400">
                    {{ plan.trades.filter(t => t.result === 'win').length }}
                  </div>
                  <div class="text-sm text-gray-400">Wins</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-red-400">
                    {{ plan.trades.filter(t => t.result === 'loss').length }}
                  </div>
                  <div class="text-sm text-gray-400">Losses</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-yellow-400">
                    {{ plan.trades.filter(t => t.result === 'pending').length }}
                  </div>
                  <div class="text-sm text-gray-400">Pending</div>
                </div>
              </div>

              <!-- Trades List -->
              <div class="space-y-3">
                <div 
                  v-for="trade in plan.trades" 
                  :key="trade.id"
                  class="gaming-border p-4 rounded-lg"
                >
                  <div class="flex flex-wrap items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="font-semibold text-lg">{{ trade.symbol }}</span>
                        <span 
                          class="px-2 py-1 rounded text-xs font-semibold"
                          :class="getResultClass(trade.result)"
                        >
                          {{ trade.result.toUpperCase() }}
                        </span>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span class="text-gray-400">Entry:</span>
                          <span class="font-semibold">${{ trade.entryPrice }}</span>
                        </div>
                        <div>
                          <span class="text-gray-400">Exit:</span>
                          <span class="font-semibold">{{ trade.exitPrice ? '$' + trade.exitPrice : 'Pending' }}</span>
                        </div>
                        <div>
                          <span class="text-gray-400">Quantity:</span>
                          <span class="font-semibold">{{ trade.quantity }}</span>
                        </div>
                        <div>
                          <span class="text-gray-400">P&L:</span>
                          <span 
                            class="font-semibold"
                            :class="getTradePnL(trade) >= 0 ? 'text-green-400' : 'text-red-400'"
                          >
                            {{ trade.exitPrice ? (getTradePnL(trade) >= 0 ? '+' : '') + '$' + getTradePnL(trade).toFixed(2) : 'Pending' }}
                          </span>
                        </div>
                      </div>
                      <div v-if="trade.notes" class="mt-2 text-gray-400 text-sm">
                        {{ trade.notes }}
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button 
                        v-if="trade.result === 'pending'"
                        @click="updateTradeResult(plan.id, trade.id, 'win', prompt('Enter exit price:') || trade.entryPrice)"
                        class="gaming-border px-3 py-1 rounded text-xs hover:scale-105 transition-transform text-green-400"
                      >
                        ✅ Win
                      </button>
                      <button 
                        v-if="trade.result === 'pending'"
                        @click="updateTradeResult(plan.id, trade.id, 'loss', prompt('Enter exit price:') || trade.entryPrice)"
                        class="gaming-border px-3 py-1 rounded text-xs hover:scale-105 transition-transform text-red-400"
                      >
                        ❌ Loss
                      </button>
                      <button 
                        @click="deleteTrade(plan.id, trade.id)"
                        class="gaming-border px-3 py-1 rounded text-xs hover:scale-105 transition-transform text-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Trade Button -->
              <button 
                @click="addTradeToPlan(plan)"
                class="w-full mt-4 gaming-border py-3 rounded-lg hover:scale-105 transition-transform duration-200"
              >
                ➕ Add Trade to This Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Plan Modal -->
    <div v-if="showCreatePlanModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="gaming-card p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-6 text-gradient-primary">Create New Trade Plan</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Date</label>
            <input 
              v-model="newPlanDate" 
              type="date" 
              class="w-full gaming-border p-3 rounded bg-black text-white"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              v-model="newPlanNotes" 
              rows="3"
              class="w-full gaming-border p-3 rounded bg-black text-white"
              placeholder="Enter your trading plan notes..."
            ></textarea>
          </div>
          <div class="flex gap-4">
            <button 
              @click="createNewPlan"
              class="flex-1 gaming-accent py-3 rounded font-semibold"
            >
              Create Plan
            </button>
            <button 
              @click="showCreatePlanModal = false"
              class="flex-1 gaming-border py-3 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Trade Modal -->
    <div v-if="showAddTradeModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="gaming-card p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-6 text-gradient-primary">Add New Trade</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Select Plan</label>
            <select 
              v-model="selectedPlanId"
              class="w-full gaming-border p-3 rounded bg-black text-white"
            >
              <option value="">Choose a plan...</option>
              <option v-for="plan in tradePlans" :key="plan.id" :value="plan.id">
                {{ formatDate(plan.date) }} - {{ plan.notes || 'No notes' }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Symbol</label>
            <input 
              v-model="newTrade.symbol" 
              type="text" 
              class="w-full gaming-border p-3 rounded bg-black text-white"
              placeholder="e.g., BTC/USDT"
            >
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Entry Price</label>
              <input 
                v-model="newTrade.entryPrice" 
                type="number" 
                step="0.01"
                class="w-full gaming-border p-3 rounded bg-black text-white"
                placeholder="0.00"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Quantity</label>
              <input 
                v-model="newTrade.quantity" 
                type="number" 
                step="0.0001"
                class="w-full gaming-border p-3 rounded bg-black text-white"
                placeholder="0.0000"
              >
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              v-model="newTrade.notes" 
              rows="2"
              class="w-full gaming-border p-3 rounded bg-black text-white"
              placeholder="Trade notes..."
            ></textarea>
          </div>
          <div class="flex gap-4">
            <button 
              @click="addNewTrade"
              class="flex-1 gaming-accent py-3 rounded font-semibold"
            >
              Add Trade
            </button>
            <button 
              @click="showAddTradeModal = false"
              class="flex-1 gaming-border py-3 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="gaming-card p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-6 text-gradient-primary">Import Trade Data</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">JSON Data</label>
            <textarea 
              v-model="importData" 
              rows="8"
              class="w-full gaming-border p-3 rounded bg-black text-white"
              placeholder="Paste your JSON trade data here..."
            ></textarea>
          </div>
          <div class="flex gap-4">
            <button 
              @click="handleImportTradeData"
              class="flex-1 gaming-accent py-3 rounded font-semibold"
            >
              Import
            </button>
            <button 
              @click="showImportModal = false"
              class="flex-1 gaming-border py-3 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Home Button -->
    <div class="fixed bottom-6 right-6 z-40">
      <NuxtLink 
        to="/"
        class="gaming-accent p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
      >
        🏠
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Set page title
useHead({
  title: 'Daily Trade Plans - CryptoGroup',
  meta: [
    { name: 'description', content: 'Track your daily trading performance, analyze win rates, and optimize your strategy with comprehensive trade planning tools.' }
  ]
})

// Use composables
const { 
  tradePlans, 
  currentPlan,
  totalTrades,
  totalWins,
  totalLosses,
  totalPending,
  winRate,
  totalProfit,
  totalProfitPercentage,
  monthlyStats,
  createTradePlan,
  addTrade,
  updateTradeResult,
  deleteTrade,
  deleteTradePlan,
  exportTradeData,
  importTradeData,
  initializeSampleData
} = useTradePlans()

// Local state
const showCreatePlanModal = ref(false)
const showAddTradeModal = ref(false)
const showImportModal = ref(false)
const newPlanDate = ref(new Date().toISOString().split('T')[0])
const newPlanNotes = ref('')
const selectedPlanId = ref('')
const importData = ref('')
const newTrade = ref({
  symbol: '',
  entryPrice: '',
  quantity: '',
  notes: ''
})

// Computed
const sortedTradePlans = computed(() => {
  return [...tradePlans.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getResultClass = (result) => {
  switch (result) {
    case 'win': return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'loss': return 'bg-red-500/20 text-red-400 border border-red-500/30'
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

const getTradePnL = (trade) => {
  if (!trade.exitPrice) return 0
  return (trade.exitPrice - trade.entryPrice) * trade.quantity
}

const createNewPlan = () => {
  if (newPlanDate.value && newPlanNotes.value.trim()) {
    createTradePlan(newPlanDate.value, newPlanNotes.value.trim())
    newPlanDate.value = new Date().toISOString().split('T')[0]
    newPlanNotes.value = ''
    showCreatePlanModal.value = false
  }
}

const addNewTrade = () => {
  if (selectedPlanId.value && newTrade.value.symbol && newTrade.value.entryPrice && newTrade.value.quantity) {
    addTrade(selectedPlanId.value, {
      symbol: newTrade.value.symbol,
      entryPrice: newTrade.value.entryPrice,
      quantity: newTrade.value.quantity,
      notes: newTrade.value.notes
    })
    
    // Reset form
    selectedPlanId.value = ''
    newTrade.value = { symbol: '', entryPrice: '', quantity: '', notes: '' }
    showAddTradeModal.value = false
  }
}

const addTradeToPlan = (plan) => {
  selectedPlanId.value = plan.id
  showAddTradeModal.value = true
}

const editPlan = (plan) => {
  // For now, just allow editing notes via a simple prompt
  const newNotes = prompt('Edit plan notes:', plan.notes || '')
  if (newNotes !== null) {
    plan.notes = newNotes
    plan.updatedAt = new Date().toISOString()
  }
}

const handleImportTradeData = () => {
  if (importData.value.trim()) {
    const success = importTradeData(importData.value.trim())
    if (success) {
      importData.value = ''
      showImportModal.value = false
      alert('Trade data imported successfully!')
    } else {
      alert('Failed to import trade data. Please check the format.')
    }
  }
}

// Initialize sample data on mount
onMounted(() => {
  initializeSampleData()
})
</script>

<style scoped>
/* Additional custom styles for this page */
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

.gaming-border {
  border: 2px solid rgba(255, 107, 53, 0.5);
}

.gaming-accent {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
}

.text-gradient-primary {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.container-custom {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>