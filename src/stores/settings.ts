import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    discord_link: '#',
    x_link: '#',
    instagram_link: '#',
    subscription_link: '#',
    stake_main_link: '#',
    stake_games_link: '#',
    stake_com_link: '#',
    giveaway_enabled: true
  })
  
  const loading = ref(false)
  const fetched = ref(false)

  async function fetchSettings(force = false) {
    if (fetched.value && !force) return
    loading.value = true
    try {
      const { data, error } = await supabase.from('site_settings').select('*')
      if (error) throw error
      if (data) {
        const seen = new Set<string>()
        data.forEach((s: any) => {
          if (!seen.has(s.id) && s.id in settings.value) {
            seen.add(s.id)
            if (s.id === 'giveaway_enabled') {
              (settings.value as any)[s.id] = s.value === true || s.value === 'true'
            } else {
              (settings.value as any)[s.id] = s.value
            }
          }
        })
        fetched.value = true
      }
    } catch (err) {
      //console.error('Store: Error fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  return { settings, loading, fetched, fetchSettings }
})
