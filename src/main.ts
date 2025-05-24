/**
 * Punto de entrada principal para la aplicación Mochila 85
 * Inicializa Vue, Pinia, Router y Capacitor
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar } from '@capacitor/status-bar'

import App from './App.vue'
import router from './router'

// Configurar Capacitor para dispositivos nativos
if (Capacitor.isNativePlatform()) {
  // Ocultar pantalla de carga cuando la app esté lista
  SplashScreen.hide()

  // Configurar barra de estado para dispositivos móviles
  StatusBar.setBackgroundColor({ color: '#3b82f6' }) // Primary color
}

// Crear instancia de la aplicación Vue
const app = createApp(App)

// Registrar plugins
app.use(createPinia())
app.use(router)

// Montar app en el DOM
app.mount('#app')
