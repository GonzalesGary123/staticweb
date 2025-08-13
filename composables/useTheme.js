export function useTheme() {
  const isDark = ref(true) // Default to dark mode
  
  // Initialize theme from localStorage or system preference
  onMounted(() => {
    const savedTheme = localStorage.getItem('crypto-theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  })
  
  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('crypto-theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }
  
  // Apply theme to document
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }
  
  return {
    isDark: readonly(isDark),
    toggleTheme
  }
}