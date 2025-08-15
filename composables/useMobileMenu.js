export const useMobileMenu = () => {
  const isMobileMenuOpen = ref(false)

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  // Close mobile menu when clicking outside
  onMounted(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.querySelector('[data-mobile-menu]')
      if (mobileMenu && !mobileMenu.contains(event.target)) {
        closeMobileMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
  })

  return {
    isMobileMenuOpen: readonly(isMobileMenuOpen),
    toggleMobileMenu,
    closeMobileMenu
  }
}