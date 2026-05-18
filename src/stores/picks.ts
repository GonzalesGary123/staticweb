import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const usePicksStore = defineStore('picks', () => {
  const livePicks = ref<any[]>([])
  const allStats = ref<any[]>([])
  
  const loadingLive = ref(false)
  const fetchedLive = ref(false)
  
  const loadingStats = ref(false)
  const fetchedStats = ref(false)

  async function fetchLivePicks(force = false) {
    if (fetchedLive.value && !force) return
    loadingLive.value = true
    try {
      const { data, error } = await supabase
        .from('picks')
        .select('id, date, start_time, title, sport, match_name, odds, confidence, is_subscriber_only, is_parlay')
        .eq('is_live', true)
        .order('start_time', { ascending: false })
      if (error) throw error
      if (data) {
        livePicks.value = data
        fetchedLive.value = true
      }
    } catch (err: any) {
      //console.error('Store: Error fetching live picks:', err.message || err)
    } finally {
      loadingLive.value = false
    }
  }

  async function fetchAllStats(force = false) {
    if (fetchedStats.value && !force) return
    loadingStats.value = true
    try {
      // Just fetch the minimal fields needed for stats/reports to prevent huge downloads
      const { data, error } = await supabase
        .from('picks')
        .select('id, date, start_time, result, profit, units_earned, is_live, is_subscriber_only')
      if (error) throw error
      if (data) {
        allStats.value = data
        fetchedStats.value = true
      }
    } catch (err) {
      //console.error('Store: Error fetching stats:', err)
    } finally {
      loadingStats.value = false
    }
  }

  return { 
    livePicks, loadingLive, fetchedLive, fetchLivePicks,
    allStats, loadingStats, fetchedStats, fetchAllStats
  }
})
