<script setup lang="ts">
/**
 * Vista de gestión de mochilas
 * Permite ver, crear, editar y eliminar mochilas
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMochilaStore } from '../stores/mochila';
import type { Mochila } from '../types/models';

const router = useRouter();
const mochilaStore = useMochilaStore();

// Estado del formulario para crear/editar mochilas
const formVisible = ref(false);
const modoEdicion = ref(false);
const mochilaSeleccionada = ref<Partial<Mochila>>({});
const cargando = ref(false);
const errorFormulario = ref<string | null>(null);

// Resetear el formulario
const resetearFormulario = () => {
  formVisible.value = false;
  modoEdicion.value = false;
  mochilaSeleccionada.value = {};
  errorFormulario.value = null;
};

// Abrir el formulario para crear nueva mochila
const crearNuevaMochila = () => {
  resetearFormulario();
  formVisible.value = true;
};

// Abrir el formulario para editar mochila
const editarMochila = (mochila: Mochila) => {
  mochilaSeleccionada.value = { ...mochila };
  formVisible.value = true;
  modoEdicion.value = true;
};

// Guardar mochila (crear o actualizar)
const guardarMochila = async () => {
  errorFormulario.value = null;
  cargando.value = true;

  try {
    // Validar campos requeridos
    if (!mochilaSeleccionada.value.nombre) {
      errorFormulario.value = 'El nombre es obligatorio';
      return;
    }

    if (modoEdicion.value && mochilaSeleccionada.value.id) {
      // Actualizar mochila existente
      await mochilaStore.actualizarMochila(mochilaSeleccionada.value as Mochila);
    } else {
      // Crear nueva mochila
      await mochilaStore.crearMochila({
        nombre: mochilaSeleccionada.value.nombre as string,
        descripcion: mochilaSeleccionada.value.descripcion,
        estado: mochilaSeleccionada.value.estado
      });
    }

    resetearFormulario();
  } catch (error) {
    console.error('Error al guardar mochila:', error);
    errorFormulario.value = 'Error al guardar la mochila';
  } finally {
    cargando.value = false;
  }
};

// Confirmar eliminación de mochila
const confirmarEliminar = (mochila: Mochila) => {
  if (confirm(`¿Estás seguro de eliminar la mochila "${mochila.nombre}"? Esta acción no se puede deshacer.`)) {
    eliminarMochila(mochila.id);
  }
};

// Eliminar mochila
const eliminarMochila = async (id: string) => {
  cargando.value = true;
  try {
    await mochilaStore.eliminarMochila(id);
  } catch (error) {
    console.error('Error al eliminar mochila:', error);
  } finally {
    cargando.value = false;
  }
};

// Marcar como revisada
const marcarComoRevisada = async (id: string) => {
  cargando.value = true;
  try {
    await mochilaStore.marcarMochilaComoRevisada(id);
  } catch (error) {
    console.error('Error al marcar como revisada:', error);
  } finally {
    cargando.value = false;
  }
};

// Formatear fecha
const formatearFecha = (fecha: Date | undefined) => {
  if (!fecha) return 'No registrada';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Verificar si una mochila necesita revisión
const necesitaRevision = (mochila: Mochila) => {
  if (!mochila.fechaUltimaRevision) return true;

  const fechaRevision = new Date(mochila.fechaUltimaRevision);
  const hoy = new Date();
  const diasDesdeUltimaRevision = Math.floor(
    (hoy.getTime() - fechaRevision.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diasDesdeUltimaRevision >= 30;
};

// Cargar datos al montar el componente
onMounted(async () => {
  if (mochilaStore.mochilas.length === 0) {
    cargando.value = true;
    await mochilaStore.cargarMochilas();
    cargando.value = false;
  }
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold">Mis Mochilas</h1>
      <button
        @click="crearNuevaMochila"
        class="btn-primary flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Mochila
      </button>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="cargando" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Mensaje si no hay mochilas -->
    <div v-else-if="mochilaStore.mochilas.length === 0" class="text-center py-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 mx-auto mb-4 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-lg text-text-light">No tienes ninguna mochila creada</p>
      <button
        @click="crearNuevaMochila"
        class="mt-4 btn-primary"
      >
        Crear mi primera mochila
      </button>
    </div>

    <!-- Lista de mochilas -->
    <div v-else class="space-y-4">
      <div
        v-for="mochila in mochilaStore.mochilas"
        :key="mochila.id"
        class="bg-surface rounded-lg shadow-sm border border-border overflow-hidden"
      >
        <div class="p-4">
          <div class="flex justify-between items-start">
            <div @click="router.push(`/mochila/${mochila.id}`)" class="flex-grow cursor-pointer">
              <h3 class="font-medium text-lg">{{ mochila.nombre }}</h3>
              <p v-if="mochila.descripcion" class="text-text-light text-sm">{{ mochila.descripcion }}</p>
            </div>

            <div class="flex space-x-2">
              <button
                @click="editarMochila(mochila)"
                class="p-1.5 rounded-full hover:bg-gray-100"
                title="Editar mochila"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmarEliminar(mochila)"
                class="p-1.5 rounded-full hover:bg-gray-100"
                title="Eliminar mochila"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap justify-between text-sm">
            <div class="flex items-center mr-4 mb-2">
              <span class="text-text-light mr-1">Estado:</span>
              <span class="font-medium">{{ mochila.estado || 'Nueva' }}</span>
            </div>
            <div class="flex items-center mr-4 mb-2">
              <span class="text-text-light mr-1">Artículos:</span>
              <span class="font-medium">{{ mochila.articulos?.length || 0 }}</span>
            </div>
            <div class="flex items-center mb-2 text-text-light">
              <span class="mr-1">Última revisión:</span>
              <span :class="{'text-danger font-medium': necesitaRevision(mochila)}">
                {{ formatearFecha(mochila.fechaUltimaRevision) }}
              </span>
            </div>
          </div>

          <div class="flex justify-between mt-3 pt-3 border-t border-border">
            <button
              @click="router.push(`/mochila/${mochila.id}`)"
              class="flex items-center text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver detalles
            </button>

            <button
              @click="marcarComoRevisada(mochila.id)"
              class="flex items-center text-success"
              :disabled="cargando"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Marcar como revisada
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario modal para crear/editar mochila -->
    <div v-if="formVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-lg shadow-xl w-full max-w-md">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-medium">{{ modoEdicion ? 'Editar mochila' : 'Crear nueva mochila' }}</h2>
        </div>

        <form @submit.prevent="guardarMochila" class="p-4">
          <div class="space-y-4">
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                id="nombre"
                v-model="mochilaSeleccionada.nombre"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Ej: Mochila familiar"
                required
              />
            </div>

            <!-- Descripción -->
            <div>
              <label for="descripcion" class="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                id="descripcion"
                v-model="mochilaSeleccionada.descripcion"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Ej: Para emergencias en el hogar"
                rows="3"
              ></textarea>
            </div>

            <!-- Estado -->
            <div>
              <label for="estado" class="block text-sm font-medium mb-1">Estado</label>
              <select
                id="estado"
                v-model="mochilaSeleccionada.estado"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="nueva">Nueva</option>
                <option value="usada">Usada</option>
              </select>
            </div>

            <!-- Mensaje de error -->
            <div v-if="errorFormulario" class="bg-danger/10 text-danger px-4 py-2 rounded-md">
              {{ errorFormulario }}
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="resetearFormulario"
              class="px-4 py-2 border border-border rounded-md"
              :disabled="cargando"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="cargando"
            >
              <span v-if="cargando" class="inline-block animate-spin mr-2">&#8635;</span>
              {{ modoEdicion ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
