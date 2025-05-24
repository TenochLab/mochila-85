<script setup lang="ts">
/**
 * Vista principal de la aplicación Mochila 85
 * Muestra un resumen de mochilas y datos importantes
 */
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMochilaStore } from '../stores/mochila';

const router = useRouter();
const mochilaStore = useMochilaStore();

// Verificar si es la primera vez que el usuario usa la aplicación
const primeraVez = ref(true);
const cargando = ref(false);

// Comprobar estado de alertas
const alertas = computed(() => {
  return {
    mochilasParaRevisar: mochilaStore.mochilasParaRevisar.length,
    itemsPorVencer: mochilaStore.itemsPorVencer.length,
    itemsVencidos: mochilaStore.itemsVencidos.length,
    total: mochilaStore.mochilasParaRevisar.length +
           mochilaStore.itemsPorVencer.length +
           mochilaStore.itemsVencidos.length
  };
});

// Comprobar si hay mochilas creadas
const hayMochilas = computed(() => mochilaStore.mochilas.length > 0);

// Crear mochila de ejemplo para nuevos usuarios
const crearMochilaEjemplo = async () => {
  cargando.value = true;
  try {
    await mochilaStore.crearMochila({
      nombre: 'Mi primera mochila',
      descripcion: 'Mochila de emergencia familiar'
    });
    primeraVez.value = false;

    // Recargar datos
    await mochilaStore.cargarMochilas();
  } catch (error) {
    console.error('Error al crear mochila de ejemplo', error);
  } finally {
    cargando.value = false;
  }
};

// Verificar si es la primera vez que se usa la app
onMounted(() => {
  primeraVez.value = !hayMochilas.value;
});
</script>

<template>
  <div>
    <!-- Pantalla de bienvenida para nuevos usuarios -->
    <div v-if="primeraVez" class="flex flex-col items-center justify-center h-full py-10">
      <img src="../assets/logo.svg" alt="Mochila 85" class="w-32 h-32 mb-6" />

      <h1 class="text-2xl font-bold text-center mb-4">¡Bienvenido a Mochila 85!</h1>

      <p class="text-center mb-8 px-4 max-w-md">
        Gestiona tu inventario de emergencias de forma sencilla y mantén todo organizado.
      </p>

      <button
        @click="crearMochilaEjemplo"
        :disabled="cargando"
        class="bg-primary text-white px-6 py-3 rounded-lg shadow-md hover:bg-primary/90 transition-colors flex items-center"
      >
        <span v-if="cargando" class="inline-block animate-spin mr-2">&#8635;</span>
        <span>Comenzar con mi primera mochila</span>
      </button>

      <p class="mt-4 text-sm text-text-light">
        O puedes <router-link to="/mochilas" class="text-primary">crear una mochila personalizada</router-link>
      </p>
    </div>

    <!-- Pantalla principal para usuarios con mochilas -->
    <div v-else class="space-y-6">
      <!-- Resumen de alertas -->
      <section v-if="alertas.total > 0" class="bg-warning/10 border border-warning rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-warning" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Alertas pendientes
        </h2>

        <div class="mt-3 space-y-2">
          <div v-if="alertas.mochilasParaRevisar > 0" class="flex justify-between items-center py-2 px-3 bg-white rounded border border-gray-200">
            <span>Mochilas por revisar</span>
            <span class="bg-warning text-white px-2 py-0.5 rounded-full text-xs">{{ alertas.mochilasParaRevisar }}</span>
          </div>

          <div v-if="alertas.itemsPorVencer > 0" class="flex justify-between items-center py-2 px-3 bg-white rounded border border-gray-200">
            <span>Artículos por vencer</span>
            <span class="bg-warning text-white px-2 py-0.5 rounded-full text-xs">{{ alertas.itemsPorVencer }}</span>
          </div>

          <div v-if="alertas.itemsVencidos > 0" class="flex justify-between items-center py-2 px-3 bg-white rounded border border-gray-200">
            <span>Artículos vencidos</span>
            <span class="bg-danger text-white px-2 py-0.5 rounded-full text-xs">{{ alertas.itemsVencidos }}</span>
          </div>
        </div>

        <button
          @click="router.push('/notificaciones')"
          class="mt-3 w-full py-2 border border-warning text-warning rounded-md hover:bg-warning hover:text-white transition-colors"
        >
          Ver todas las alertas
        </button>
      </section>

      <!-- Mis mochilas -->
      <section class="bg-surface rounded-lg shadow p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Mis Mochilas</h2>
          <button
            @click="router.push('/mochilas')"
            class="text-primary text-sm"
          >
            Ver todas
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="mochila in mochilaStore.mochilas.slice(0, 3)"
            :key="mochila.id"
            @click="router.push(`/mochila/${mochila.id}`)"
            class="border border-border rounded-md p-3 hover:bg-primary/5 cursor-pointer transition-colors"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium">{{ mochila.nombre }}</h3>
                <p class="text-sm text-text-light">{{ mochila.articulos.length }} artículos</p>
              </div>
              <div class="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                {{ mochila.estado || 'Nueva' }}
              </div>
            </div>
          </div>
        </div>

        <button
          @click="router.push('/mochilas')"
          class="mt-4 w-full bg-primary/10 text-primary py-2 rounded-md hover:bg-primary/20 transition-colors"
        >
          + Crear nueva mochila
        </button>
      </section>

      <!-- Accesos directos -->
      <section class="grid grid-cols-2 gap-4">
        <button
          @click="router.push('/articulos')"
          class="bg-surface p-4 rounded-lg shadow text-center hover:bg-primary/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Ver artículos</span>
        </button>

        <button
          @click="router.push('/categorias')"
          class="bg-surface p-4 rounded-lg shadow text-center hover:bg-primary/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>Ver categorías</span>
        </button>
      </section>
    </div>
  </div>
</template>
