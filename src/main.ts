import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { inject } from '@vercel/analytics'

// Initialize Vercel analytics
inject()

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
