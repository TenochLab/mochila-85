<script setup lang="ts">
/**
 * Componente principal de la aplicación Mochila 85
 * Inicializa la aplicación y establece el layout principal
 */
import { RouterView, useRouter } from 'vue-router'
import { onMounted, ref, watch, computed } from 'vue'
import { useMochilaStore } from './stores/mochila'

// Store de Pinia para la gestión de mochilas
const mochilaStore = useMochilaStore()
const router = useRouter()
const cargandoInicial = ref(true)
const errorInicial = ref<string | null>(null)

// Comprobar si hay notificaciones pendientes
const hayNotificaciones = computed(() => {
  return (
    mochilaStore.mochilasParaRevisar.length > 0 ||
    mochilaStore.itemsPorVencer.length > 0 ||
    mochilaStore.itemsVencidos.length > 0
  )
})

// Inicializar la aplicación al cargar
onMounted(async () => {
  try {
    await mochilaStore.inicializar()
    cargandoInicial.value = false
  } catch (error) {
    console.error('Error al inicializar la app:', error)
    errorInicial.value = 'Error al cargar la aplicación. Intente reiniciarla.'
    cargandoInicial.value = false
  }
})

// Observar cambios en el estado de carga
watch(() => mochilaStore.error, (newError) => {
  if (newError) {
    errorInicial.value = newError
  }
})
</script>

<template>
  <div class="app bg-background text-text-primary min-h-screen">
    <!-- Cabecera de la aplicación -->
    <header class="bg-primary text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Mochila 85</h1>

        <!-- Botón de notificaciones -->
        <div v-if="!cargandoInicial" class="flex items-center space-x-4">
          <button
            v-if="hayNotificaciones"
            class="relative p-2"
            @click="router.push('/notificaciones')"
          >
            <span class="sr-only">Notificaciones</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger"></span>
          </button>

          <!-- Menú de usuario -->
          <button class="p-2" @click="router.push('/ajustes')">
            <span class="sr-only">Ajustes</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="container mx-auto p-4 pb-20">
      <!-- Pantalla de carga inicial -->
      <div v-if="cargandoInicial" class="flex flex-col items-center justify-center h-64">
        <svg class="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-lg">Cargando Mochila 85...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="errorInicial" class="bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded">
        <p>{{ errorInicial }}</p>
        <button class="mt-2 px-4 py-2 bg-danger text-white rounded" @click="mochilaStore.inicializar()">
          Reintentar
        </button>
      </div>

      <!-- Vista principal -->
      <RouterView v-else />
    </main>

    <!-- Barra de navegación inferior -->
    <nav v-if="!cargandoInicial && !errorInicial" class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2 shadow-lg">
      <div class="container mx-auto flex justify-around">
        <router-link to="/" class="flex flex-col items-center py-1 px-3" active-class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs">Inicio</span>
        </router-link>
        <router-link to="/mochilas" class="flex flex-col items-center py-1 px-3" active-class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="text-xs">Mochilas</span>
        </router-link>
        <router-link to="/articulos" class="flex flex-col items-center py-1 px-3" active-class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-xs">Artículos</span>
        </router-link>
        <router-link to="/categorias" class="flex flex-col items-center py-1 px-3" active-class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="text-xs">Categorías</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style>
@import './assets/base.css';
@import './assets/main.css';

/* Estilos adicionales específicos para la aplicación */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Estilo para botones principales */
/* .btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors;
} */

/* Altura mínima para contenido principal (considera la barra inferior) */
main {
  min-height: calc(100vh - 64px - 64px);
}
</style>
