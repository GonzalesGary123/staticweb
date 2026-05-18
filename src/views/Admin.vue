<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { useAuth } from '../composables/useAuth'
import { useSettingsStore } from '../stores/settings'
import { usePicksStore } from '../stores/picks'

const router = useRouter()
const { user, profile, loading: loadingAuth, profileLoading } = useAuth()
const settingsStore = useSettingsStore()
const picksStore = usePicksStore()

const picks = ref<any[]>([])
const loadingPicks = ref(true)
const totalPicks = ref(0)
const currentPage = ref(1)
const itemsPerPage = 10;
const uploadLoading = ref(false)
const settingsLoading = ref(false)
const activeTab = ref('picks')
const isDarkMode = ref(document.documentElement.classList.contains('dark'))

// User Management state
const usersList = ref<any[]>([])
const loadingUsers = ref(false)
const isAddUserModalOpen = ref(false)
const newUserEmail = ref('')
const newUserRole = ref('user')

const activityLogs = ref<any[]>([])
const logsLoading = ref(false)
const logsClearing = ref(false)
const logsSearch = ref('')
const logsLimit = ref(200)

const filteredActivityLogs = computed(() => {
  const q = logsSearch.value.trim().toLowerCase()
  if (!q) return activityLogs.value
  return activityLogs.value.filter((log) => {
    const base = `${log?.action || ''} ${log?.message || ''} ${log?.actor_email || ''}`.toLowerCase()
    const meta = JSON.stringify(log?.metadata || {}).toLowerCase()
    return base.includes(q) || meta.includes(q)
  })
})

async function logActivity(action: string, message: string, metadata: any = {}) {
  try {
    await supabase.rpc('log_activity', {
      p_action: action,
      p_message: message,
      p_metadata: metadata
    })
  } catch {}
}

async function fetchActivityLogs() {
  logsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, created_at, actor_id, actor_email, action, message, metadata')
      .order('created_at', { ascending: false })
      .limit(logsLimit.value)
    if (error) throw error
    activityLogs.value = data || []
  } catch {
    activityLogs.value = []
  } finally {
    logsLoading.value = false
  }
}

async function clearLogs() {
  if (!confirm('Delete all logs?')) return
  logsClearing.value = true
  try {
    const { error } = await supabase.rpc('clear_activity_logs', { p_before: null })
    if (error) throw error
    await fetchActivityLogs()
  } finally {
    logsClearing.value = false
  }
}

async function deleteLog(id: number) {
  if (!confirm('Delete this log entry?')) return
  const { error } = await supabase.from('activity_logs').delete().eq('id', id)
  if (!error) {
    activityLogs.value = activityLogs.value.filter((l) => l.id !== id)
  }
}

async function fetchUsers() {
  loadingUsers.value = true
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    usersList.value = data || []
  } catch (err: any) {
    //console.error('Admin: Error fetching users:', err.message)
  } finally {
    loadingUsers.value = false
  }
}

async function updateUserRole(userId: string, newRole: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    
    if (error) throw error
    await fetchUsers()
    await logActivity('admin_update_user_role', `Updated user role to ${newRole}`, { user_id: userId, role: newRole })
    alert('User role updated successfully!')
  } catch (err: any) {
    alert('Error updating user role: ' + err.message)
  }
}

async function handleAddUser() {
  if (!newUserEmail.value) return
  
  loadingUsers.value = true
  try {
    // Generate a random UUID for the profile since we don't have the auth ID yet
    const tempId = crypto.randomUUID()
    
    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: tempId,
          email: newUserEmail.value.toLowerCase(), 
          role: newUserRole.value,
          created_at: new Date().toISOString()
        }
      ])
    
    if (error) {
      if (error.code === '23505') throw new Error('A user with this email already exists.')
      throw error
    }

    alert(`User ${newUserEmail.value} pre-registered as ${newUserRole.value}! They can now login using the "Send Code" flow.`)
    await logActivity('admin_add_user', `Pre-registered user ${newUserEmail.value.toLowerCase()}`, { email: newUserEmail.value.toLowerCase(), role: newUserRole.value })
    isAddUserModalOpen.value = false
    newUserEmail.value = ''
    newUserRole.value = 'user'
    await fetchUsers()
  } catch (err: any) {
    alert('Error registering user: ' + err.message)
  } finally {
    loadingUsers.value = false
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'users') {
    fetchUsers()
  }
  if (newTab === 'logs') {
    fetchActivityLogs()
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const formatExternalLink = (url: string) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// Settings state
const settings = ref({
  discord_link: '',
  x_link: '',
  instagram_link: '',
  subscription_link: '',
  stake_main_link: '',
  stake_games_link: '',
  stake_com_link: '',
  giveaway_enabled: true
})
const giveawayControlLoading = ref(false)
const giveawayRoundId = ref<number | null>(null)
const giveawayWinnerEntryId = ref<number | null>(null)
const giveawayWinnerStakeId = ref('')
const giveawayName = ref('Community Giveaway')
const giveawayPrize = ref('TBD')
const giveawayMaxEntries = ref(20)
const giveawayWinnerCount = ref(1)
const giveawayDrawAfterMinutes = ref(720)
const giveawayDrawDelayUnit = ref<'minutes' | 'hours'>('hours')

const giveawayDrawDelayValue = computed({
  get() {
    if (giveawayDrawDelayUnit.value === 'hours') return Math.max(Math.round(giveawayDrawAfterMinutes.value / 60), 1)
    return Math.max(giveawayDrawAfterMinutes.value, 1)
  },
  set(v: number) {
    const clean = Number.isFinite(v) ? Math.max(Math.floor(v), 1) : 1
    giveawayDrawAfterMinutes.value = giveawayDrawDelayUnit.value === 'hours' ? clean * 60 : clean
  }
})

async function fetchSettings() {
  await settingsStore.fetchSettings()
  Object.assign(settings.value, settingsStore.settings)
  await fetchGiveawayControlStatus()
}

async function fetchGiveawayControlStatus() {
  const { data, error } = await supabase.rpc('get_giveaway_status', {
    p_entry_token: '',
    p_device_fingerprint: ''
  })
  if (error) throw error

  settings.value.giveaway_enabled = Boolean(data?.is_active)
  giveawayRoundId.value = data?.giveaway_round_id ?? null
  giveawayWinnerEntryId.value = data?.winner_entry_id ?? null
  giveawayWinnerStakeId.value = data?.winner_stake_id || ''
  giveawayName.value = data?.name || 'Community Giveaway'
  giveawayPrize.value = data?.prize || 'TBD'
  giveawayMaxEntries.value = Number(data?.slots_total || 20)
  giveawayWinnerCount.value = Number(data?.winner_count || 1)
  if (data?.draw_after_minutes !== null && data?.draw_after_minutes !== undefined) {
    giveawayDrawAfterMinutes.value = Number(data.draw_after_minutes || 720)
  } else {
    giveawayDrawAfterMinutes.value = Number(data?.draw_after_hours || 12) * 60
  }
}

async function createGiveawayRound() {
  giveawayControlLoading.value = true
  try {
    const { error } = await supabase.rpc('create_giveaway_round', {
      p_name: giveawayName.value,
      p_prize: giveawayPrize.value,
      p_max_entries: giveawayMaxEntries.value,
      p_winner_count: giveawayWinnerCount.value,
      p_draw_after_minutes: giveawayDrawAfterMinutes.value,
      p_start_active: settings.value.giveaway_enabled
    })
    if (error) throw error
    await fetchGiveawayControlStatus()
    await logActivity('admin_create_giveaway_round', `Created giveaway round "${giveawayName.value}"`, {
      name: giveawayName.value,
      prize: giveawayPrize.value,
      max_entries: giveawayMaxEntries.value,
      winner_count: giveawayWinnerCount.value,
      draw_after_minutes: giveawayDrawAfterMinutes.value
    })
    alert('Giveaway round created successfully!')
  } catch (err: any) {
    alert('Error creating giveaway: ' + err.message)
  } finally {
    giveawayControlLoading.value = false
  }
}

async function toggleGiveawayEnabled() {
  const nextValue = !settings.value.giveaway_enabled
  giveawayControlLoading.value = true
  try {
    const { error: giveawayError } = await supabase.rpc('set_giveaway_active', {
      p_active: nextValue
    })
    if (giveawayError) throw giveawayError

    const { error: settingError } = await supabase
      .from('site_settings')
      .upsert(
        {
          id: 'giveaway_enabled',
          value: String(nextValue),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      )
    if (settingError) throw settingError

    settings.value.giveaway_enabled = nextValue
    ;(settingsStore.settings as any).giveaway_enabled = nextValue
    await fetchGiveawayControlStatus()
    await logActivity('admin_toggle_giveaway', `Set giveaway enabled to ${String(nextValue)}`, { giveaway_enabled: nextValue })
  } catch (err: any) {
    alert('Error updating giveaway status: ' + err.message)
  } finally {
    giveawayControlLoading.value = false
  }
}

const adminTabs = [
  { id: 'picks', name: 'Manage Picks', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { id: 'reports', name: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'users', name: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'logs', name: 'Logs', icon: 'M9 17v-2a4 4 0 014-4h8m0 0l-3-3m3 3l-3 3M3 7h10M3 11h6M3 15h4' },
  { id: 'settings', name: 'Site Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

const selectedHour = ref('12')
const selectedMinute = ref('00')
const editSelectedHour = ref('12')
const editSelectedMinute = ref('00')

watch([selectedHour, selectedMinute], ([h, m]) => {
  formData.value.start_time = `${h}:${m}`
})

watch([editSelectedHour, editSelectedMinute], ([h, m]) => {
  modalFormData.value.start_time = `${h}:${m}`
})

// Modal state
const isModalOpen = ref(false)
const isAddModalOpen = ref(false)
const addModalTab = ref<'single' | 'parlay'>('single')

const parlayLegs = ref<{title: string, odds: number}[]>([
  { title: '', odds: 1.00 },
  { title: '', odds: 1.00 }
])

const addParlayLeg = () => {
  parlayLegs.value.push({ title: '', odds: 1.00 })
}

const removeParlayLeg = (index: number) => {
  if (parlayLegs.value.length > 2) {
    parlayLegs.value.splice(index, 1)
  }
}

// Auto-calculate parlay odds (Changed to multiplication as per user request)
watch(parlayLegs, (newLegs) => {
  if (addModalTab.value === 'parlay' || (isModalOpen.value && modalFormData.value.is_parlay)) {
    const totalOdds = newLegs.reduce((acc, leg) => acc * (parseFloat(leg.odds.toString()) || 1), 1);
    if (isAddModalOpen.value) {
      formData.value.odds = parseFloat(totalOdds.toFixed(2));
    } else if (isModalOpen.value) {
      modalFormData.value.odds = parseFloat(totalOdds.toFixed(2));
    }
  }
}, { deep: true })

const modalFormData = ref({
  date: '',
  start_time: '12:00',
  title: '',
  sport: 'Tennis',
  match_name: '',
  odds: 1.0,
  wager: 0,
  units: 1.0,
  u_payout: 0,
  payout: 0,
  result: 'Upcoming',
  confidence: 'Medium',
  is_live: false,
  is_subscriber_only: false,
  is_parlay: false,
  profit: 0,
  units_earned: 0,
  bet_type: 'Moneyline'
})

// Form state
const formData = ref({
  date: new Date().toISOString().split('T')[0],
  start_time: '12:00',
  title: '',
  sport: 'Tennis',
  match_name: '',
  odds: 1.0,
  wager: 0,
  units: 1.0,
  u_payout: 0,
  payout: 0,
  result: 'Upcoming',
  confidence: 'Medium',
  is_live: false,
  is_subscriber_only: false,
  is_parlay: false,
  profit: 0,
  units_earned: 0,
  bet_type: 'Moneyline'
})

async function checkRole() {
  // Wait for auth to finish loading if it's still initializing
  if (loadingAuth.value) {
    // console.log('Admin: Auth still loading, skipping role check');
    return;
  }

  // Ensure we have a user
  if (!user.value) {
    // console.warn('Admin: No user session. Redirecting to home.');
    router.push('/');
    return;
  }

  // If profile is still loading, wait a bit
  if (profileLoading.value) {
    // console.log('Admin: Profile still loading, waiting...');
    return;
  }

  // If we have a user and profile, check role
  if (profile.value) {
    if (profile.value.role !== 'superuser') {
      // console.warn('Admin: Access Denied. Required superuser, found:', profile.value.role);
      router.push('/');
    }
  } else {
    // No profile found for the user after loading finished
    // console.error('Admin: No profile record found for user');
    router.push('/');
  }
}

async function saveSettings() {
  settingsLoading.value = true
  try {
    const updates = Object.entries(settings.value).map(([id, value]) => ({
      id,
      value: id === 'giveaway_enabled' ? String(Boolean(value)) : value,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('site_settings')
      .upsert(updates, { onConflict: 'id' })
    if (error) throw error

    giveawayControlLoading.value = true
    const { error: giveawayError } = await supabase.rpc('set_giveaway_active', {
      p_active: settings.value.giveaway_enabled
    })
    if (giveawayError) throw giveawayError
    
    // Update store
    Object.assign(settingsStore.settings, settings.value)
    await fetchGiveawayControlStatus()
    await logActivity('admin_save_settings', 'Saved site settings', { giveaway_enabled: settings.value.giveaway_enabled })
    alert('Settings saved successfully!')
  } catch (err: any) {
    alert('Error saving settings: ' + err.message)
  } finally {
    settingsLoading.value = false
    giveawayControlLoading.value = false
  }
}

const allPicksForReports = computed(() => picksStore.allStats);

// Reports Logic
const getStatsForPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const now = new Date()
  // Create a localized YYYY-MM-DD string for today
  const todayStr = now.toISOString().split('T')[0]
  
  const filtered = allPicksForReports.value.filter(pick => {
    // pick.date is already YYYY-MM-DD from Supabase
    const pickDateStr = pick.date 
    const pickDate = new Date(pick.date)
    
    if (period === 'daily') {
      return pickDateStr === todayStr
    } else if (period === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      return pickDate >= weekAgo
    } else if (period === 'monthly') {
      // Compare month and year using UTC to avoid timezone shifts
      const pDate = new Date(pick.date)
      return pDate.getUTCMonth() === now.getUTCMonth() && pDate.getUTCFullYear() === now.getUTCFullYear()
    } else if (period === 'yearly') {
      const pDate = new Date(pick.date)
      return pDate.getUTCFullYear() === now.getUTCFullYear()
    }
    return false
  })

  const totalPicksCount = allPicksForReports.value.length
  const settled = filtered.filter(p => p.result !== 'Upcoming')
  const wins = settled.filter(p => p.result === 'Win').length
  const totalProfit = filtered.reduce((sum, p) => sum + Number(p.profit), 0)
  const totalUnits = filtered.reduce((sum, p) => sum + Number(p.units_earned), 0)
  const winRate = settled.length > 0 ? Math.round((wins / settled.length) * 100) : 0

  return {
    count: filtered.length,
    wins,
    losses: settled.length - wins,
    profit: totalProfit,
    units: totalUnits,
    winRate
  }
}

async function fetchAllPicksForReports() {
  await picksStore.fetchAllStats(true); // force refresh on admin
}

async function fetchPicks() {
  try {
    loadingPicks.value = true
    //console.log(`Admin: Fetching picks page ${currentPage.value}...`);
    
    const from = (currentPage.value - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Optimized: Fetch only needed columns instead of '*'
    const { data, error, count } = await supabase
      .from('picks')
      .select('id, date, start_time, title, sport, match_name, odds, wager, units, profit, units_earned, result, is_live, is_subscriber_only, is_parlay', { count: 'estimated' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      if (error.code === '42501') {
        //console.error('Admin: Permission denied (RLS) when fetching picks. Check Supabase policies.');
      }
      throw error
    }
    
    if (data) {
      picks.value = data
      if (count !== null) totalPicks.value = count;
      //console.log('Admin: Successfully fetched', data.length, 'picks, total:', count);
    }
  } catch (err: any) {
    //console.error('Admin: Error fetching picks:', err.message || err)
  } finally {
    loadingPicks.value = false
  }
}

function changePage(page: number) {
  if (page < 1 || page > Math.ceil(totalPicks.value / itemsPerPage)) return;
  currentPage.value = page;
  fetchPicks();
}

function resetForm() {
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    start_time: '12:00',
    title: '',
    sport: 'Tennis',
    match_name: '',
    odds: 1.0,
    wager: 0,
    units: 1.0,
    u_payout: 0,
    payout: 0,
    result: 'Upcoming',
    confidence: 'Medium',
    is_live: false,
    is_subscriber_only: false,
    is_parlay: false,
    profit: 0,
    units_earned: 0,
    bet_type: 'Moneyline'
  }
  selectedHour.value = '12'
  selectedMinute.value = '00'
}

async function handleSubmit() {
  if (!user.value) return

  const dataToSubmit = { ...formData.value };

  if (addModalTab.value === 'parlay') {
    dataToSubmit.is_parlay = true;
    dataToSubmit.title = parlayLegs.value
      .filter(leg => leg.title.trim() !== '')
      .map(leg => `${leg.title.trim()} (${parseFloat(leg.odds.toString() || '1').toFixed(2)})`)
      .join(' + ');
    dataToSubmit.sport = 'Multiple';
    dataToSubmit.match_name = 'Parlay Play';
  } else {
    dataToSubmit.is_parlay = false;
  }

  const { error } = await supabase
    .from('picks')
    .insert([dataToSubmit])
  
  if (error) {
    alert(error.message)
  } else {
    await logActivity('admin_add_pick', `Added pick: ${String(dataToSubmit.title || '').slice(0, 120)}`, {
      date: dataToSubmit.date,
      title: dataToSubmit.title,
      sport: dataToSubmit.sport,
      result: dataToSubmit.result,
      is_live: dataToSubmit.is_live,
      is_subscriber_only: dataToSubmit.is_subscriber_only,
      is_parlay: dataToSubmit.is_parlay
    })
    resetForm()
    parlayLegs.value = [{ title: '', odds: 1.00 }, { title: '', odds: 1.00 }]; // Reset legs with correct structure
    isAddModalOpen.value = false
    currentPage.value = 1 
    await fetchPicks()
    await fetchAllPicksForReports()
    await picksStore.fetchLivePicks(true)
  }
}

function editPick(pick: any) {
  modalFormData.value = { ...pick }
  currentPickId.value = pick.id
  
  if (pick.is_parlay && pick.title) {
    // Populate parlay legs from title, extracting odds if present
    const rawLegs = pick.title.split(/\s*\+\s*|\n/).map((p: string) => p.trim()).filter((p: string) => p.length > 0);
    
    parlayLegs.value = rawLegs.map((legStr: string) => {
      // Look for odds pattern like "(2.00)" at the end
      const oddsMatch = legStr.match(/\(([^)]+)\)$/);
      if (oddsMatch) {
        const title = legStr.replace(/\(([^)]+)\)$/, '').trim();
        const odds = parseFloat(oddsMatch[1] || '1.00');
        return { title, odds: isNaN(odds) ? 1.00 : odds };
      }
      return { title: legStr, odds: 1.00 };
    });

    if (parlayLegs.value.length < 2) {
      parlayLegs.value = [{ title: '', odds: 1.00 }, { title: '', odds: 1.00 }];
    }
  } else {
    parlayLegs.value = [{ title: '', odds: 1.00 }, { title: '', odds: 1.00 }];
  }

  if (pick.start_time && pick.start_time.includes(':')) {
    const [h, m] = pick.start_time.split(':')
    editSelectedHour.value = h.padStart(2, '0')
    editSelectedMinute.value = m.padStart(2, '0')
  } else {
    editSelectedHour.value = '12'
    editSelectedMinute.value = '00'
  }
  isModalOpen.value = true
}

const currentPickId = ref<string | null>(null)

async function handleUpdate() {
  if (!user.value || !currentPickId.value) return

  const dataToUpdate = { ...modalFormData.value };
  
  if (dataToUpdate.is_parlay) {
    dataToUpdate.title = parlayLegs.value
      .filter((leg: {title: string, odds: number}) => leg.title.trim() !== '')
      .map((leg: {title: string, odds: number}) => `${leg.title.trim()} (${parseFloat(leg.odds.toString() || '1').toFixed(2)})`)
      .join(' + ');
    dataToUpdate.sport = 'Multiple';
    dataToUpdate.match_name = 'Parlay Play';
  }

  const { error } = await supabase
    .from('picks')
    .update(dataToUpdate)
    .eq('id', currentPickId.value)
  
  if (error) {
    alert(error.message)
  } else {
    await logActivity('admin_update_pick', `Updated pick: ${String(dataToUpdate.title || '').slice(0, 120)}`, {
      id: currentPickId.value,
      date: dataToUpdate.date,
      title: dataToUpdate.title,
      sport: dataToUpdate.sport,
      result: dataToUpdate.result,
      is_live: dataToUpdate.is_live,
      is_subscriber_only: dataToUpdate.is_subscriber_only,
      is_parlay: dataToUpdate.is_parlay
    })
    isModalOpen.value = false
    // Refresh data immediately on current page
    await fetchPicks()
    await fetchAllPicksForReports()
    await picksStore.fetchLivePicks(true)
  }
}
async function deletePick(id: string) {
  if (!confirm('Are you sure you want to delete this pick?')) return
  const { error } = await supabase.from('picks').delete().eq('id', id)
  if (error) {
    alert(error.message)
    return
  }
  await logActivity('admin_delete_pick', `Deleted pick ${id}`, { id })
  await fetchPicks()
  await fetchAllPicksForReports()
  await picksStore.fetchLivePicks(true)
}

onMounted(async () => {
  try {
    await checkRole()
    await Promise.all([
      fetchPicks(),
      fetchSettings(),
      fetchAllPicksForReports()
    ])
  } catch (err) {
    //console.error('Admin: Error in onMounted initialization:', err)
  }
})

// Watch for changes in odds, wager, units, and result to auto-calculate profit and units_earned for ADD form
watch(
  () => [formData.value.odds, formData.value.wager, formData.value.units, formData.value.result],
  ([odds, wager, units, result]) => {
    const o = Number(odds) || 0
    const w = Number(wager) || 0
    const u = Number(units) || 0

    if (result === 'Win') {
      formData.value.profit = Number((w * (o - 1)).toFixed(2))
      formData.value.units_earned = Number((u * (o - 1)).toFixed(2))
      formData.value.payout = Number((w * o).toFixed(2))
      formData.value.u_payout = Number((u * o).toFixed(2))
    } else if (result === 'Loss') {
      formData.value.profit = -Math.abs(w)
      formData.value.units_earned = -Math.abs(u)
      formData.value.payout = 0
      formData.value.u_payout = 0
    } else if (result === 'Refund') {
      formData.value.profit = 0
      formData.value.units_earned = 0
      formData.value.payout = w
      formData.value.u_payout = u
    } else {
      formData.value.profit = 0
      formData.value.units_earned = 0
      formData.value.payout = 0
      formData.value.u_payout = 0
    }
  },
  { deep: true }
)

// Watch for changes in odds, wager, units, and result to auto-calculate profit and units_earned for EDIT modal
watch(
  () => [modalFormData.value.odds, modalFormData.value.wager, modalFormData.value.units, modalFormData.value.result],
  ([odds, wager, units, result]) => {
    const o = Number(odds) || 0
    const w = Number(wager) || 0
    const u = Number(units) || 0

    if (result === 'Win') {
      modalFormData.value.profit = Number((w * (o - 1)).toFixed(2))
      modalFormData.value.units_earned = Number((u * (o - 1)).toFixed(2))
      modalFormData.value.payout = Number((w * o).toFixed(2))
      modalFormData.value.u_payout = Number((u * o).toFixed(2))
    } else if (result === 'Loss') {
      modalFormData.value.profit = -Math.abs(w)
      modalFormData.value.units_earned = -Math.abs(u)
      modalFormData.value.payout = 0
      modalFormData.value.u_payout = 0
    } else if (result === 'Refund') {
      modalFormData.value.profit = 0
      modalFormData.value.units_earned = 0
      modalFormData.value.payout = w
      modalFormData.value.u_payout = u
    } else {
      modalFormData.value.profit = 0
      modalFormData.value.units_earned = 0
      modalFormData.value.payout = 0
      modalFormData.value.u_payout = 0
    }
  },
  { deep: true }
)

// Watch for auth state changes to re-check role
watch([loadingAuth, profileLoading, profile], async () => {
  if (!loadingAuth.value && !profileLoading.value) {
    await checkRole()
  }
})
</script>

<template>
  <div class="admin-page-container">
    <!-- Loading State -->
    <div v-if="loadingAuth || profileLoading" class="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-gray-500 font-bold uppercase tracking-widest text-xs">
          {{ loadingAuth ? 'Authenticating...' : 'Loading Profile...' }}
        </p>
      </div>
    </div>

    <!-- Admin Dashboard (Superuser only) -->
    <div v-else-if="profile?.role === 'superuser'" class="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 p-6 md:p-12 transition-colors duration-500">
      <div class="max-w-7xl mx-auto space-y-12 relative">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <h1 class="text-5xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">
              Admin <span class="text-indigo-500">Dashboard</span>
            </h1>
            <p class="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Manage your picks and community</p>
          </div>
          <div class="flex items-center gap-4">
            <!-- Mobile Tab Navigation -->
            <div class="md:hidden flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar max-w-[200px]">
              <button 
                v-for="tab in adminTabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-shrink-0 flex items-center justify-center p-2 rounded-lg transition-all"
                :class="activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500'"
                :title="tab.name"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="tab.icon"></path></svg>
              </button>
            </div>

            <!-- Desktop Tab Navigation -->
            <div class="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 mr-4">
              <button 
                v-for="tab in adminTabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                :class="activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="tab.icon"></path></svg>
                {{ tab.name }}
              </button>
            </div>
            
            <div @click="toggleDarkMode" class="w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300 border mr-2" :class="isDarkMode ? 'bg-[#18181b] border-white/10' : 'bg-gray-200 border-gray-300'">
              <div class="w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 flex items-center justify-center" :class="isDarkMode ? 'translate-x-6' : 'translate-x-0'">
                <svg v-if="!isDarkMode" class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>
                <svg v-else class="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
              </div>
            </div>

            <router-link to="/" class="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase text-xs tracking-widest">
              VIEW SITE
            </router-link>
          </div>
        </div>

        <!-- Quick Stats -->
        <div v-if="activeTab === 'picks'" class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white dark:bg-[#18181b] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Picks</p>
            <p class="text-4xl font-black text-gray-900 dark:text-white">{{ totalPicks }}</p>
          </div>
          <div class="bg-white dark:bg-[#18181b] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Wins</p>
            <p class="text-4xl font-black text-green-500">{{ allPicksForReports.filter(p => p.result === 'Win').length }}</p>
          </div>
          <div class="bg-white dark:bg-[#18181b] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Losses</p>
            <p class="text-4xl font-black text-red-500">{{ allPicksForReports.filter(p => p.result === 'Loss').length }}</p>
          </div>
          <div class="bg-white dark:bg-[#18181b] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Upcoming</p>
            <p class="text-4xl font-black text-indigo-500">{{ allPicksForReports.filter(p => p.result === 'Upcoming').length }}</p>
          </div>
        </div>

        <div class="space-y-12">
          <!-- Site Settings Tab -->
          <div v-if="activeTab === 'settings'" class="max-w-4xl mx-auto bg-white dark:bg-[#18181b] p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl shadow-black/5">
            <div class="flex items-center justify-between mb-10">
              <h2 class="text-2xl font-black italic uppercase">Site <span class="text-indigo-500">Settings</span></h2>
            </div>
            <form @submit.prevent="saveSettings" class="space-y-8">
              <div class="space-y-6">
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Giveaway Status</label>
                  <div class="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
                    <div>
                      <p class="text-xs font-black uppercase tracking-widest" :class="settings.giveaway_enabled ? 'text-green-500' : 'text-red-500'">
                        {{ settings.giveaway_enabled ? 'Running' : 'Stopped' }}
                      </p>
                      <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Toggle to start or stop giveaway entries
                      </p>
                      <p v-if="giveawayRoundId !== null" class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                        Giveaway ID: #{{ giveawayRoundId }}
                      </p>
                      <p v-if="giveawayWinnerEntryId !== null" class="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Winner Entry ID: #{{ giveawayWinnerEntryId }} <span v-if="giveawayWinnerStakeId">({{ giveawayWinnerStakeId }})</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      @click="toggleGiveawayEnabled"
                      :disabled="giveawayControlLoading"
                      class="w-14 h-8 rounded-full p-1 transition-colors border"
                      :class="settings.giveaway_enabled ? 'bg-green-500/20 border-green-500/40' : 'bg-red-500/20 border-red-500/40'"
                    >
                      <span
                        class="block w-6 h-6 rounded-full bg-white transition-transform"
                        :class="settings.giveaway_enabled ? 'translate-x-6' : 'translate-x-0'"
                      ></span>
                    </button>
                  </div> 
                </div>
                <div class="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <h4 class="text-sm font-black uppercase tracking-widest text-amber-500">Giveaway Setup</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2 md:col-span-2">
                      <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Giveaway Name</label>
                      <input type="text" v-model="giveawayName" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none" />
                    </div>
                    <div class="space-y-2 md:col-span-2">
                      <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Prize</label>
                      <input type="text" v-model="giveawayPrize" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Max Entries</label>
                      <input type="number" min="1" v-model.number="giveawayMaxEntries" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Number of Winners</label>
                      <input type="number" min="1" v-model.number="giveawayWinnerCount" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Draw After</label>
                      <div class="flex gap-3">
                        <input type="number" min="1" v-model.number="giveawayDrawDelayValue" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none" />
                        <select v-model="giveawayDrawDelayUnit" class="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] outline-none">
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="createGiveawayRound"
                    :disabled="giveawayControlLoading"
                    class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-[#09090b] font-black rounded-xl uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {{ giveawayControlLoading ? 'Creating...' : 'Create New Giveaway Round' }}
                  </button>
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Discord Link</label>
                  <input type="text" v-model="settings.discord_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="https://discord.gg/..." />
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Subscription Link</label>
                  <input type="text" v-model="settings.subscription_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="https://whop.com/..." />
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">X (Twitter) Link</label>
                  <input type="text" v-model="settings.x_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="https://x.com/..." />
                </div>
                <div class="space-y-3">
                  <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Instagram Link</label>
                  <input type="text" v-model="settings.instagram_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="https://instagram.com/..." />
                </div>
              </div>

              <div class="pt-8 border-t border-gray-100 dark:border-white/5">
                <h3 class="text-xl font-black mb-6 italic uppercase text-blue-500">Stake <span class="text-gray-400">Partner Links</span></h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-3 md:col-span-2">
                    <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Stake Main Link (Join Now)</label>
                    <input type="text" v-model="settings.stake_main_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://stake.com/?c=..." />
                  </div>
                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Stake.games Link</label>
                    <input type="text" v-model="settings.stake_games_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://stake.games/..." />
                  </div>
                  <div class="space-y-3">
                    <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Stake.com Link</label>
                    <input type="text" v-model="settings.stake_com_link" class="w-full px-6 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://stake.com/..." />
                  </div>
                </div>
              </div>

              <button type="submit" :disabled="settingsLoading" class="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-50">
                {{ settingsLoading ? 'Saving...' : 'Save All Settings' }}
              </button>
            </form>
          </div>

          <!-- Reports Tab -->
          <div v-else-if="activeTab === 'reports'" class="space-y-8">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-2xl font-black italic uppercase">Performance <span class="text-indigo-500">Reports</span></h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div v-for="period in ['daily', 'weekly', 'monthly', 'yearly']" :key="period" class="bg-white dark:bg-[#18181b] p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl">
                <h3 class="text-xl font-black uppercase italic mb-6 text-indigo-500">{{ period }} Report</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Profit</p>
                    <p class="text-xl font-black" :class="getStatsForPeriod(period as any).profit >= 0 ? 'text-green-500' : 'text-red-500'">
                      {{ getStatsForPeriod(period as any).profit >= 0 ? '+' : '' }}${{ getStatsForPeriod(period as any).profit.toFixed(2) }}
                    </p>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Win Rate</p>
                    <p class="text-xl font-black text-indigo-500">{{ getStatsForPeriod(period as any).winRate }}%</p>
                  </div>
                  <div class="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-center col-span-2 flex justify-around">
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Wins</p>
                      <p class="text-lg font-black text-green-500">{{ getStatsForPeriod(period as any).wins }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Losses</p>
                      <p class="text-lg font-black text-red-500">{{ getStatsForPeriod(period as any).losses }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Units</p>
                      <p class="text-lg font-black text-gray-900 dark:text-white">{{ getStatsForPeriod(period as any).units.toFixed(1) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Users Tab -->
          <div v-else-if="activeTab === 'users'" class="space-y-8">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-black italic uppercase">User <span class="text-indigo-500">Management</span></h2>
              <button 
                @click="isAddUserModalOpen = true"
                class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Register User
              </button>
            </div>
            
            <div v-if="loadingUsers" class="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse border border-gray-200 dark:border-white/10">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Users...</span>
            </div>
            
            <div v-else class="bg-white dark:bg-[#18181b] rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discord</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr v-for="u in usersList" :key="u.id" class="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td class="px-6 py-5">
                        <span class="text-sm font-bold text-gray-900 dark:text-white">{{ u.email || 'No Email' }}</span>
                      </td>
                      <td class="px-6 py-5">
                        <span class="text-[11px] font-bold text-gray-400">{{ u.discord_username || '-' }}</span>
                      </td>
                      <td class="px-6 py-5">
                        <select 
                          @change="updateUserRole(u.id, ($event.target as HTMLSelectElement).value)"
                          class="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                          :class="{
                            'text-indigo-500': u.role === 'superuser',
                            'text-amber-500': u.role === 'uservip',
                            'text-blue-500': u.role === 'vip' || u.role === 'subscriber',
                            'text-gray-400': u.role === 'user'
                          }"
                        >
                          <option value="user" :selected="u.role === 'user'">USER</option>
                          <option value="uservip" :selected="u.role === 'uservip'">USERVIP</option>
                          <!-- <option value="vip" :selected="u.role === 'vip'">VIP</option>
                          <option value="subscriber" :selected="u.role === 'subscriber'">SUBSCRIBER</option> -->
                          <option value="superuser" :selected="u.role === 'superuser'">SUPERUSER</option>
                        </select>
                      </td>
                      <td class="px-6 py-5">
                        <span class="text-[11px] font-bold text-gray-400">{{ new Date(u.created_at).toLocaleDateString() }}</span>
                      </td>
                      <td class="px-6 py-5 text-right">
                        <!-- Add any user specific actions here -->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Logs Tab -->
          <div v-else-if="activeTab === 'logs'" class="space-y-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 class="text-2xl font-black italic uppercase">Activity <span class="text-indigo-500">Logs</span></h2>
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  v-model="logsSearch"
                  type="text"
                  placeholder="Search logs..."
                  class="w-full sm:w-72 px-5 py-3 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl font-bold outline-none"
                />
                <button
                  @click="fetchActivityLogs"
                  :disabled="logsLoading"
                  class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {{ logsLoading ? 'Loading...' : 'Refresh' }}
                </button>
                <button
                  @click="clearLogs"
                  :disabled="logsClearing"
                  class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {{ logsClearing ? 'Clearing...' : 'Clear Logs' }}
                </button>
              </div>
            </div>

            <div v-if="logsLoading" class="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse border border-gray-200 dark:border-white/10">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Logs...</span>
            </div>

            <div v-else class="bg-white dark:bg-[#18181b] rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actor</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr v-for="log in filteredActivityLogs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td class="px-6 py-5 whitespace-nowrap">
                        <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400">{{ new Date(log.created_at).toLocaleString() }}</span>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex flex-col">
                          <span class="text-[11px] font-bold text-gray-900 dark:text-white">{{ log.actor_email || 'Anonymous' }}</span>
                          <span v-if="log.actor_id" class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ String(log.actor_id).slice(0, 8) }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <span class="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest">
                          {{ log.action }}
                        </span>
                      </td>
                      <td class="px-6 py-5 max-w-[420px]">
                        <p class="text-[11px] font-bold text-gray-700 dark:text-gray-300 break-words">
                          {{ log.message || '-' }}
                        </p>
                      </td>
                      <td class="px-6 py-5 max-w-[420px]">
                        <p class="text-[10px] font-bold text-gray-400 break-words">
                          {{ log.metadata ? JSON.stringify(log.metadata) : '{}' }}
                        </p>
                      </td>
                      <td class="px-6 py-5 text-right">
                        <button
                          @click="deleteLog(log.id)"
                          class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr v-if="filteredActivityLogs.length === 0">
                      <td colspan="6" class="px-6 py-10 text-center">
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">No logs found</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Manage History Tab -->
          <div v-else-if="activeTab === 'picks'" class="space-y-8">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-black italic uppercase">Manage <span class="text-indigo-500">History</span></h2>
              <div class="flex items-center gap-4">
                <button 
                  @click="isAddModalOpen = true; addModalTab = 'single'"
                  class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  New Selection
                </button>
                <span class="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-black">{{ totalPicks }} Total</span>
              </div>
            </div>
            
            <div v-if="loadingPicks" class="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse border border-gray-200 dark:border-white/10">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing with Supabase...</span>
            </div>
            
            <div v-else class="bg-white dark:bg-[#18181b] rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date/Time</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sport/Match</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Odds</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Wager</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Profit</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Result</th>
                      <th class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr v-for="pick in picks" :key="pick.id" class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td class="px-6 py-5">
                        <div class="flex flex-col">
                          <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400">{{ pick.date }}</span>
                          <span v-if="pick.start_time" class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{{ pick.start_time }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="flex items-center gap-3">
                          <div v-if="pick.is_live" class="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <p class="text-sm font-black text-gray-900 dark:text-white leading-tight">{{ pick.title }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="space-y-1">
                          <p class="text-[10px] font-black text-indigo-500 uppercase">{{ pick.sport }}</p>
                          <p class="text-[11px] font-bold text-gray-400 truncate max-w-[150px]">{{ pick.match_name }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <span class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
                          :class="pick.is_subscriber_only ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-500/10 text-gray-500'">
                          {{ pick.is_subscriber_only ? 'VIP' : 'FREE' }}
                        </span>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <span class="text-sm font-black text-gray-900 dark:text-white">@{{ Number(pick.odds).toFixed(2) }}</span>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <div class="space-y-0.5">
                          <p class="text-sm font-black text-gray-900 dark:text-white">${{ pick.wager }}</p>
                          <p class="text-[10px] font-bold text-gray-400 uppercase">{{ pick.units }}U</p>
                        </div>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <div class="space-y-0.5">
                          <p class="text-sm font-black" :class="Number(pick.profit) >= 0 ? 'text-green-500' : 'text-red-500'">
                            {{ Number(pick.profit) >= 0 ? '+' : '' }}${{ Number(pick.profit).toFixed(2) }}
                          </p>
                          <p class="text-[10px] font-bold" :class="Number(pick.units_earned) >= 0 ? 'text-green-500' : 'text-red-500'">
                            {{ Number(pick.units_earned) >= 0 ? '+' : '' }}{{ Number(pick.units_earned).toFixed(1) }}U
                          </p>
                        </div>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                          :class="{
                            'bg-green-500/10 text-green-500': pick.result === 'Win',
                            'bg-red-500/10 text-red-500': pick.result === 'Loss',
                            'bg-indigo-500/10 text-indigo-500': pick.result === 'Upcoming',
                            'bg-gray-500/10 text-gray-500': pick.result === 'Refund'
                          }">
                          {{ pick.result }}
                        </span>
                      </td>
                      <td class="px-6 py-5 text-right whitespace-nowrap">
                        <div class="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            @click="editPick(pick)"
                            title="Edit pick"
                            class="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 transition-all shadow-sm"
                          >
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          <button
                            type="button"
                            @click="deletePick(pick.id)"
                            title="Delete pick"
                            class="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/15 transition-all shadow-sm"
                          >
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer -->
              <div v-if="!loadingPicks && totalPicks > itemsPerPage" class="px-8 py-6 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalPicks) }} of {{ totalPicks }} picks
                </p>
                <div class="flex gap-2">
                  <button 
                    @click="changePage(currentPage - 1)" 
                    :disabled="currentPage === 1"
                    class="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-indigo-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-all shadow-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button 
                    @click="changePage(currentPage + 1)" 
                    :disabled="currentPage === Math.ceil(totalPicks / itemsPerPage)"
                    class="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-indigo-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-all shadow-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="!loadingPicks && picks.length === 0" class="text-center py-32 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10">
              <div class="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">No picks found in your database</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Denied / Redirecting -->
    <div v-else class="min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto flex items-center justify-center">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <p class="text-gray-500 font-bold uppercase tracking-widest text-xs">Access Denied</p>
        <router-link to="/" class="inline-block text-indigo-500 font-bold text-xs uppercase tracking-widest hover:underline">Return Home</router-link>
      </div>
    </div>

    <!-- Add/Bulk Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="isAddModalOpen = false"></div>
      
      <div class="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-8 border-b border-gray-100 dark:border-white/5">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-black italic uppercase text-indigo-500">New <span class="text-gray-900 dark:text-white">Selection</span></h2>
            <button @click="isAddModalOpen = false" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <!-- Modal Tabs -->
          <div class="flex gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            <button 
              @click="addModalTab = 'single'"
              class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              :class="addModalTab === 'single' ? 'bg-white dark:bg-white/10 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'"
            >
              Single Pick
            </button>
            <button 
              @click="addModalTab = 'parlay'"
              class="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              :class="addModalTab === 'parlay' ? 'bg-white dark:bg-white/10 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'"
            >
              Parlay Pick
            </button>
          </div>
        </div>

        <!-- Manual Add Body -->
        <div v-if="addModalTab === 'single' || addModalTab === 'parlay'" class="p-8 overflow-y-auto custom-scrollbar">
          <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Date</label>
              <input type="date" v-model="formData.date" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Start Time (24h)</label>
              <div class="flex items-center gap-2">
                <select v-model="selectedHour" class="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                </select>
                <span class="font-black">:</span>
                <select v-model="selectedMinute" class="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
            </div>

            <!-- Single Pick Title/Sport -->
            <template v-if="addModalTab === 'single'">
              <div class="space-y-2 md:col-span-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pick Title</label>
                <input type="text" v-model="formData.title" placeholder="e.g. Lakers ML" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Sport</label>
                <input type="text" v-model="formData.sport" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Match Name</label>
                <input type="text" v-model="formData.match_name" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Bet Type</label>
                <select v-model="formData.bet_type" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option value="Moneyline">Moneyline</option>
                  <option value="Spread">Spread</option>
                </select>
              </div>
            </template>

            <!-- Parlay Legs -->
            <div v-else class="md:col-span-2 space-y-4">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Parlay Legs</label>
              <div v-for="(leg, idx) in parlayLegs" :key="idx" class="flex flex-col md:flex-row gap-3">
                <div class="flex-[3] relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500/50 uppercase">Leg {{ idx + 1 }}</span>
                  <input type="text" v-model="leg.title" placeholder="e.g. Lakers ML" class="w-full pl-16 pr-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all" required />
                </div>
                <div class="flex-1 relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Odds</span>
                  <input type="number" step="0.01" v-model="leg.odds" class="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all text-center" required />
                </div>
                <button v-if="parlayLegs.length > 2" @click="removeParlayLeg(idx)" type="button" class="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              <button @click="addParlayLeg" type="button" class="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add Another Leg
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-3 md:col-span-2">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center block">Odds</label>
                <input type="number" step="0.01" v-model="formData.odds" class="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-center" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center block">Wager ($)</label>
                <input type="number" step="0.01" v-model="formData.wager" class="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-center" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center block">Units</label>
                <input type="number" step="0.1" v-model="formData.units" class="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-center" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Result</label>
                <select v-model="formData.result" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option value="Win" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Win</option>
                  <option value="Loss" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Loss</option>
                  <option value="Upcoming" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Upcoming</option>
                  <option value="Refund" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Refund</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Confidence</label>
                <select v-model="formData.confidence" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option value="High" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">High</option>
                  <option value="Medium" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Medium</option>
                  <option value="Low" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Low</option>
                </select>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-6 pt-2 md:col-span-2">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="w-12 h-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center px-1 transition-colors" :class="formData.is_live ? 'bg-red-500 border-red-500' : 'bg-gray-100 dark:bg-white/5'">
                  <div class="w-3 h-3 rounded-full bg-white transition-transform duration-300" :class="formData.is_live ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
                <span class="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-red-500 transition-colors">LIVE PLAY</span>
                <input type="checkbox" v-model="formData.is_live" class="hidden" />
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="w-12 h-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center px-1 transition-colors" :class="formData.is_subscriber_only ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-100 dark:bg-white/5'">
                  <div class="w-3 h-3 rounded-full bg-white transition-transform duration-300" :class="formData.is_subscriber_only ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
                <span class="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-500 transition-colors">VIP ONLY</span>
                <input type="checkbox" v-model="formData.is_subscriber_only" class="hidden" />
              </label>
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div v-if="addModalTab === 'single' || addModalTab === 'parlay'" class="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
          <button @click="isAddModalOpen = false" class="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button @click="handleSubmit" class="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs">
            Post Selection
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="isModalOpen = false"></div>
      
      <!-- Modal Content -->
      <div class="bg-white dark:bg-[#18181b] w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 class="text-2xl font-black italic uppercase text-indigo-500">Edit <span class="text-gray-900 dark:text-white">Selection</span></h2>
          <button @click="isModalOpen = false" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <!-- Form Body -->
        <div class="p-8 overflow-y-auto custom-scrollbar">
          <form @submit.prevent="handleUpdate" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Date</label>
              <input type="date" v-model="modalFormData.date" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Start Time (24h)</label>
              <div class="flex items-center gap-2">
                <select v-model="editSelectedHour" class="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                </select>
                <span class="font-black">:</span>
                <select v-model="editSelectedMinute" class="flex-1 px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
            </div>
            <div v-if="!modalFormData.is_parlay" class="space-y-2 md:col-span-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pick Title</label>
              <input type="text" v-model="modalFormData.title" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
            </div>
            <div v-if="!modalFormData.is_parlay" class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Sport</label>
              <input type="text" v-model="modalFormData.sport" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div v-if="!modalFormData.is_parlay" class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Match Name</label>
              <input type="text" v-model="modalFormData.match_name" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>

            <div v-if="!modalFormData.is_parlay" class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Bet Type</label>
              <select v-model="modalFormData.bet_type" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                <option value="Moneyline">Moneyline</option>
                <option value="Spread">Spread</option>
                <option value="Total">Total</option>
              </select>
            </div>

            <!-- Edit Parlay Legs -->
            <div v-if="modalFormData.is_parlay" class="md:col-span-2 space-y-4">
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Parlay Legs</label>
              <div v-for="(leg, idx) in parlayLegs" :key="idx" class="flex flex-col md:flex-row gap-3">
                <div class="flex-[3] relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500/50 uppercase">Leg {{ idx + 1 }}</span>
                  <input type="text" v-model="leg.title" placeholder="e.g. Lakers ML" class="w-full pl-16 pr-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all" required />
                </div>
                <div class="flex-1 relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Odds</span>
                  <input type="number" step="0.01" v-model="leg.odds" class="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all text-center" required />
                </div>
                <button v-if="parlayLegs.length > 2" @click="removeParlayLeg(idx)" type="button" class="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              <button @click="addParlayLeg" type="button" class="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add Another Leg
              </button>
            </div>
            
            <div class="grid grid-cols-3 gap-3 md:col-span-2">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center block">Odds</label>
                <input type="number" step="0.01" v-model="modalFormData.odds" class="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-center" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center block">Wager ($)</label>
                <input type="number" step="0.01" v-model="modalFormData.wager" class="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-center" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 text-center block">Units</label>
                <input type="number" step="0.1" v-model="modalFormData.units" class="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-center" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Result</label>
                <select v-model="modalFormData.result" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option value="Win" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Win</option>
                  <option value="Loss" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Loss</option>
                  <option value="Upcoming" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Upcoming</option>
                  <option value="Refund" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Refund</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Confidence</label>
                <select v-model="modalFormData.confidence" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
                  <option value="High" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">High</option>
                  <option value="Medium" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Medium</option>
                  <option value="Low" class="bg-white dark:bg-[#18181b] text-gray-900 dark:text-white">Low</option>
                </select>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-6 pt-2 md:col-span-2">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="w-12 h-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center px-1 transition-colors" :class="modalFormData.is_live ? 'bg-red-500 border-red-500' : 'bg-gray-100 dark:bg-white/5'">
                  <div class="w-3 h-3 rounded-full bg-white transition-transform duration-300" :class="modalFormData.is_live ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
                <span class="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-red-500 transition-colors">LIVE PLAY</span>
                <input type="checkbox" v-model="modalFormData.is_live" class="hidden" />
              </label>

              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="w-12 h-6 rounded-full border-2 border-gray-200 dark:border-white/10 flex items-center px-1 transition-colors" :class="modalFormData.is_subscriber_only ? 'bg-indigo-500 border-indigo-500' : 'bg-gray-100 dark:bg-white/5'">
                  <div class="w-3 h-3 rounded-full bg-white transition-transform duration-300" :class="modalFormData.is_subscriber_only ? 'translate-x-6' : 'translate-x-0'"></div>
                </div>
                <span class="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-500 transition-colors">VIP ONLY</span>
                <input type="checkbox" v-model="modalFormData.is_subscriber_only" class="hidden" />
              </label>
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div class="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
          <button @click="isModalOpen = false" class="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            Discard Changes
          </button>
          <button @click="handleUpdate" class="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs">
            Save Updates
          </button>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="isAddUserModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="isAddUserModalOpen = false"></div>
      
      <div class="bg-white dark:bg-[#18181b] w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col">
        <div class="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 class="text-2xl font-black italic uppercase text-indigo-500">Register <span class="text-gray-900 dark:text-white">User</span></h2>
          <button @click="isAddUserModalOpen = false" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</label>
            <input type="email" v-model="newUserEmail" placeholder="user@example.com" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Initial Role</label>
            <select v-model="newUserRole" class="w-full px-5 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold outline-none text-gray-900 dark:text-white">
              <option value="user">USER</option>
              <option value="uservip">USERVIP (CODE LOGIN)</option>
              <!-- <option value="vip">VIP</option>
              <option value="subscriber">SUBSCRIBER</option> -->
              <option value="superuser">SUPERUSER</option>
            </select>
          </div>

          <div class="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <p class="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase leading-relaxed tracking-wider">
              Note: This pre-registers the user. They will officially be created in Auth when they login for the first time via the email code flow.
            </p>
          </div>
        </div>

        <div class="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
          <button @click="isAddUserModalOpen = false" class="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 font-black rounded-2xl uppercase tracking-widest text-xs">
            Cancel
          </button>
          <button @click="handleAddUser" :disabled="loadingUsers" class="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs disabled:opacity-50">
            {{ loadingUsers ? 'Registering...' : 'Register User' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 10px;
}

/* Fix for dark mode dropdown options */
select option {
  background-color: white;
  color: #111827;
}

.dark select option {
  background-color: #18181b;
  color: white;
}
</style>
