import './assets/main.css'

import { initAccentThemeFromStorage } from './composables/useAccentTheme'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

initAccentThemeFromStorage()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
