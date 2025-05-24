<script setup lang="ts">
/**
 * Vista de notificaciones
 * Muestra alertas sobre mochilas que necesitan revisión, artículos por vencer o vencidos
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMochilaStore } from '../stores/mochila';

const router = useRouter();
const mochilaStore = useMochilaStore();

// Estado
const cargando = ref(false);

// Formatear fecha
const formatearFecha = (fecha: Date | undefined) => {
  if (!fecha) return 'No registrada';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calcular días restantes para vencer
const diasParaVencer = (fecha: Date | undefined) => {
  if (!fecha) return 0;

  const hoy = new Date();
  const fechaVence = new Date(fecha);
  const diferencia = fechaVence.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

// Agrupar alertas
const alertas = computed(() => {
  return {
    mochilasParaRevisar: mochilaStore.mochilasParaRevisar,
    itemsPorVencer: mochilaStore.itemsPorVencer,
    itemsVencidos: mochilaStore.itemsVencidos,
    hayAlertas:
      mochilaStore.mochilasParaRevisar.length > 0 ||
      mochilaStore.itemsPorVencer.length > 0 ||
      mochilaStore.itemsVencidos.length > 0
  };
});

// Marcar mochila como revisada
const marcarMochilaComoRevisada = async (id: string) => {
  cargando.value = true;
  try {
    await mochilaStore.marcarMochilaComoRevisada(id);
  } catch (error) {
    console.error('Error al marcar mochila como revisada:', error);
  } finally {
    cargando.value = false;
  }
};

// Marcar artículo como revisado
const marcarItemComoRevisado = async (id: string) => {
  cargando.value = true;
  try {
    await mochilaStore.marcarArticuloComoRevisado(id);
  } catch (error) {
    console.error('Error al marcar artículo como revisado:', error);
  } finally {
    cargando.value = false;
  }
};

// Cargar datos actualizados al montar
onMounted(async () => {
  cargando.value = true;
  await Promise.all([
    mochilaStore.cargarMochilas(),
    mochilaStore.cargarItemsEspeciales()
  ]);
  cargando.value = false;
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">Notificaciones</h1>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="cargando" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Sin notificaciones -->
    <div v-else-if="!alertas.hayAlertas" class="text-center py-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 class="text-lg font-medium mb-2">Todo en orden</h2>
      <p class="text-text-light">No tienes notificaciones pendientes</p>
    </div>

    <!-- Lista de notificaciones -->
    <div v-else class="space-y-6">
      <!-- Mochilas por revisar -->
      <section v-if="alertas.mochilasParaRevisar.length > 0" class="bg-warning/10 rounded-lg p-4 border border-warning/30">
        <h2 class="flex items-center text-lg font-medium mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-warning" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Mochilas por revisar
        </h2>

        <div class="space-y-2">
          <div
            v-for="mochila in alertas.mochilasParaRevisar"
            :key="mochila.id"
            class="bg-white rounded border border-gray-200 p-3"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ mochila.nombre }}</h3>
                <p class="text-sm text-text-light">
                  <span v-if="mochila.fechaUltimaRevision">
                    Última revisión: {{ formatearFecha(mochila.fechaUltimaRevision) }}
                  </span>
                  <span v-else>
                    Nunca revisada
                  </span>
                </p>
              </div>

              <div class="flex space-x-2">
                <button
                  @click="router.push(`/mochila/${mochila.id}`)"
                  class="px-2.5 py-1.5 text-sm bg-primary/10 text-primary rounded"
                >
                  Ver
                </button>
                <button
                  @click="marcarMochilaComoRevisada(mochila.id)"
                  class="px-2.5 py-1.5 text-sm bg-success/10 text-success rounded"
                >
                  Marcar revisada
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Artículos por vencer -->
      <section v-if="alertas.itemsPorVencer.length > 0" class="bg-warning/10 rounded-lg p-4 border border-warning/30">
        <h2 class="flex items-center text-lg font-medium mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-warning" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
          Artículos por vencer
        </h2>

        <div class="space-y-2">
          <div
            v-for="item in alertas.itemsPorVencer"
            :key="item.id"
            class="bg-white rounded border border-gray-200 p-3"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ item.nombre }}</h3>
                <p class="text-sm">
                  <span class="text-warning font-medium">Vence en {{ diasParaVencer(item.fechaVencimiento) }} días</span>
                  ({{ formatearFecha(item.fechaVencimiento) }})
                </p>
              </div>

              <div class="flex space-x-2">
                <button
                  @click="router.push(`/mochila/${item.mochilaId}`)"
                  class="px-2.5 py-1.5 text-sm bg-primary/10 text-primary rounded"
                >
                  Ver
                </button>
                <button
                  @click="marcarItemComoRevisado(item.id)"
                  class="px-2.5 py-1.5 text-sm bg-success/10 text-success rounded"
                >
                  Revisar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Artículos vencidos -->
      <section v-if="alertas.itemsVencidos.length > 0" class="bg-danger/10 rounded-lg p-4 border border-danger/30">
        <h2 class="flex items-center text-lg font-medium mb-2 text-danger">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Artículos vencidos
        </h2>

        <div class="space-y-2">
          <div
            v-for="item in alertas.itemsVencidos"
            :key="item.id"
            class="bg-white rounded border border-gray-200 p-3"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">{{ item.nombre }}</h3>
                <p class="text-sm">
                  <span class="text-danger font-medium">Venció el {{ formatearFecha(item.fechaVencimiento) }}</span>
                </p>
              </div>

              <div class="flex space-x-2">
                <button
                  @click="router.push(`/mochila/${item.mochilaId}`)"
                  class="px-2.5 py-1.5 text-sm bg-primary/10 text-primary rounded"
                >
                  Ver
                </button>
                <button
                  @click="marcarItemComoRevisado(item.id)"
                  class="px-2.5 py-1.5 text-sm bg-danger/10 text-danger rounded"
                >
                  Reemplazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
