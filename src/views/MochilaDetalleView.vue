<script setup lang="ts">
/**
 * Vista de detalle de una mochila
 * Muestra información detallada de la mochila y sus artículos
 * Permite gestionar artículos dentro de la mochila
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMochilaStore } from '../stores/mochila';
import type { Item } from '../types/models';

const route = useRoute();
const router = useRouter();
const mochilaStore = useMochilaStore();

// ID de la mochila desde la ruta
const mochilaId = computed(() => route.params.id as string);

// Estado
const cargando = ref(true);
const error = ref<string | null>(null);
const categoriaSeleccionada = ref<string | null>(null);
const formVisible = ref(false);
const modoEdicion = ref(false);
const itemSeleccionado = ref<Partial<Item>>({});

// Obtener la mochila actual del store
const mochila = computed(() => mochilaStore.mochilaActual);

// Agrupar artículos por categoría
const articulosPorCategoria = computed(() => {
  if (!mochila.value || !mochila.value.articulos) return {};

  const result: Record<string, Item[]> = {};

  mochila.value.articulos.forEach(item => {
    if (!result[item.categoria]) {
      result[item.categoria] = [];
    }
    result[item.categoria].push(item);
  });

  return result;
});

// Lista de categorías disponibles
const categorias = computed(() => {
  return mochilaStore.categorias;
});

// Artículos de la categoría seleccionada
const articulosFiltrados = computed(() => {
  if (!mochila.value || !mochila.value.articulos) return [];
  if (!categoriaSeleccionada.value) return mochila.value.articulos;

  return mochila.value.articulos.filter(item => item.categoria === categoriaSeleccionada.value);
});

// Formatear fecha
const formatearFecha = (fecha: Date | undefined) => {
  if (!fecha) return 'No registrada';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Cargar mochila desde el store
const cargarMochila = async (id: string) => {
  cargando.value = true;
  error.value = null;

  try {
    // Cargar categorías si no existen
    if (mochilaStore.categorias.length === 0) {
      await mochilaStore.cargarCategorias();
    }

    // Cargar mochila
    await mochilaStore.seleccionarMochila(id);

    // Si no hay categoría seleccionada, seleccionar la primera
    if (mochila.value && mochila.value.articulos.length > 0 && !categoriaSeleccionada.value) {
      const categoriasDeMochila = [...new Set(mochila.value.articulos.map(item => item.categoria))];
      if (categoriasDeMochila.length > 0) {
        categoriaSeleccionada.value = categoriasDeMochila[0];
      }
    }
  } catch (err) {
    console.error('Error al cargar mochila:', err);
    error.value = 'Error al cargar la mochila';
  } finally {
    cargando.value = false;
  }
};

// Cargar mochila al montar o cambiar ID
watch(() => mochilaId.value, async (newId) => {
  if (newId) {
    await cargarMochila(newId);
  }
}, { immediate: true });

// Marcar mochila como revisada
const marcarComoRevisada = async () => {
  if (!mochila.value) return;

  cargando.value = true;
  try {
    await mochilaStore.marcarMochilaComoRevisada(mochilaId.value);
    // Mostrar mensaje de éxito (en un entorno real usaríamos un sistema de notificaciones UI)
    alert('Mochila marcada como revisada');
  } catch (err) {
    console.error('Error al marcar como revisada:', err);
  } finally {
    cargando.value = false;
  }
};

// Resetear el formulario de item
const resetearFormulario = () => {
  formVisible.value = false;
  modoEdicion.value = false;
  itemSeleccionado.value = {
    cantidad: 1,
    predefinido: false,
    personalizado: true,
    categoria: categoriaSeleccionada.value || undefined
  };
};

// Abrir formulario para nuevo item
const crearNuevoItem = () => {
  resetearFormulario();
  formVisible.value = true;
};

// Abrir formulario para editar item
const editarItem = (item: Item) => {
  itemSeleccionado.value = { ...item };
  formVisible.value = true;
  modoEdicion.value = true;
};

// Guardar item (crear o actualizar)
const guardarItem = async () => {
  if (!mochila.value) return;

  // Validar campos requeridos
  if (!itemSeleccionado.value.nombre || !itemSeleccionado.value.cantidad || !itemSeleccionado.value.categoria) {
    alert('Los campos nombre, cantidad y categoría son obligatorios');
    return;
  }

  cargando.value = true;

  try {
    if (modoEdicion.value && itemSeleccionado.value.id) {
      // Actualizar item existente
      await mochilaStore.actualizarArticulo(itemSeleccionado.value as Item);
    } else {
      // Crear nuevo item
      await mochilaStore.agregarArticulo({
        nombre: itemSeleccionado.value.nombre!,
        categoria: itemSeleccionado.value.categoria!,
        cantidad: itemSeleccionado.value.cantidad!,
        predefinido: false,
        descripcion: itemSeleccionado.value.descripcion,
        fechaVencimiento: itemSeleccionado.value.fechaVencimiento,
        diasParaRevisar: itemSeleccionado.value.diasParaRevisar,
        estado: itemSeleccionado.value.estado,
        comentarios: itemSeleccionado.value.comentarios
      });
    }

    resetearFormulario();
  } catch (err) {
    console.error('Error al guardar item:', err);
  } finally {
    cargando.value = false;
  }
};

// Eliminar item
const eliminarItem = async (itemId: string) => {
  if (!confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
    return;
  }

  cargando.value = true;
  try {
    await mochilaStore.eliminarArticulo(itemId);
  } catch (err) {
    console.error('Error al eliminar item:', err);
  } finally {
    cargando.value = false;
  }
};

// Marcar item como revisado
const marcarItemComoRevisado = async (itemId: string) => {
  cargando.value = true;
  try {
    await mochilaStore.marcarArticuloComoRevisado(itemId);
  } catch (err) {
    console.error('Error al marcar item como revisado:', err);
  } finally {
    cargando.value = false;
  }
};

// Inicializar al montar
onMounted(() => {
  resetearFormulario();
});
</script>

<template>
  <div>
    <!-- Botón para volver atrás -->
    <button
      @click="router.push('/mochilas')"
      class="mb-4 flex items-center text-primary"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
      </svg>
      Volver a mochilas
    </button>

    <!-- Cargando -->
    <div v-if="cargando" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-danger bg-opacity-10 border border-danger text-danger px-4 py-3 rounded">
      <p>{{ error }}</p>
      <button class="mt-2 px-4 py-2 bg-danger text-white rounded" @click="cargarMochila(mochilaId)">
        Reintentar
      </button>
    </div>

    <!-- Contenido de la mochila -->
    <div v-else-if="mochila">
      <!-- Cabecera de la mochila -->
      <div class="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold">{{ mochila.nombre }}</h1>
            <p v-if="mochila.descripcion" class="text-text-light mt-1">{{ mochila.descripcion }}</p>

            <div class="flex flex-wrap mt-3 text-sm">
              <div class="mr-4 mb-2">
                <span class="text-text-light">Estado:</span>
                <span class="ml-1 font-medium">{{ mochila.estado || 'Nueva' }}</span>
              </div>
              <div class="mr-4 mb-2">
                <span class="text-text-light">Artículos:</span>
                <span class="ml-1 font-medium">{{ mochila.articulos?.length || 0 }}</span>
              </div>
              <div class="mr-4 mb-2">
                <span class="text-text-light">Última revisión:</span>
                <span class="ml-1">{{ formatearFecha(mochila.fechaUltimaRevision) }}</span>
              </div>
            </div>
          </div>

          <button
            @click="marcarComoRevisada"
            class="flex items-center text-success px-3 py-1.5 border border-success rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Marcar como revisada
          </button>
        </div>
      </div>

      <!-- Pestañas de categorías -->
      <div class="mb-4 overflow-x-auto">
        <div class="flex space-x-2 pb-2">
          <button
            @click="categoriaSeleccionada = null"
            :class="[
              'px-3 py-1.5 rounded-md whitespace-nowrap',
              !categoriaSeleccionada
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            ]"
          >
            Todos
          </button>

          <button
            v-for="categoria in categorias"
            :key="categoria.id"
            @click="categoriaSeleccionada = categoria.id"
            :class="[
              'px-3 py-1.5 rounded-md whitespace-nowrap',
              categoriaSeleccionada === categoria.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            ]"
          >
            {{ categoria.nombre }}
          </button>
        </div>
      </div>

      <!-- Lista de artículos -->
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-lg font-medium">
          {{ categoriaSeleccionada ? `Artículos de ${categorias.find(c => c.id === categoriaSeleccionada)?.nombre}` : 'Todos los artículos' }}
        </h2>

        <button
          @click="crearNuevoItem"
          class="btn-primary flex items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar artículo
        </button>
      </div>

      <!-- Mensaje si no hay artículos -->
      <div v-if="articulosFiltrados.length === 0" class="bg-surface rounded-lg p-10 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-text-light">No hay artículos en esta categoría</p>
        <button
          @click="crearNuevoItem"
          class="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          Agregar artículo
        </button>
      </div>

      <!-- Lista de artículos -->
      <div v-else class="space-y-3">
        <div
          v-for="item in articulosFiltrados"
          :key="item.id"
          class="bg-surface rounded-lg border border-border p-3 shadow-sm"
        >
          <div class="flex justify-between">
            <div>
              <div class="flex items-center">
                <h3 class="font-medium">{{ item.nombre }}</h3>
                <span v-if="item.predefinido" class="ml-2 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                  Predefinido
                </span>
              </div>

              <div class="text-sm text-text-light mt-1">
                <span>{{ categorias.find(c => c.id === item.categoria)?.nombre }}</span>
                <span class="mx-1">•</span>
                <span>Cantidad: {{ item.cantidad }}</span>
                <span v-if="item.estado" class="mx-1">•</span>
                <span>{{ item.estado }}</span>
              </div>

              <p v-if="item.descripcion" class="text-sm mt-1">
                {{ item.descripcion }}
              </p>

              <div v-if="item.fechaVencimiento" class="text-sm mt-1">
                <span class="text-text-light">Vence:</span>
                <span :class="new Date(item.fechaVencimiento) < new Date() ? 'text-danger font-medium' : ''">
                  {{ formatearFecha(item.fechaVencimiento) }}
                </span>
              </div>
            </div>

            <div class="flex space-x-1">
              <button
                @click="marcarItemComoRevisado(item.id)"
                class="p-1.5 rounded-full hover:bg-gray-100"
                title="Marcar como revisado"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                @click="editarItem(item)"
                class="p-1.5 rounded-full hover:bg-gray-100"
                title="Editar artículo"
                :disabled="item.predefinido"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="eliminarItem(item.id)"
                class="p-1.5 rounded-full hover:bg-gray-100"
                title="Eliminar artículo"
                :disabled="item.predefinido"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario modal para crear/editar artículo -->
    <div v-if="formVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-surface rounded-lg shadow-xl w-full max-w-md">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-medium">{{ modoEdicion ? 'Editar artículo' : 'Agregar artículo' }}</h2>
        </div>

        <form @submit.prevent="guardarItem" class="p-4">
          <div class="space-y-4">
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                id="nombre"
                v-model="itemSeleccionado.nombre"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Ej: Botella de agua"
                required
                :disabled="itemSeleccionado.predefinido"
              />
            </div>

            <!-- Categoría -->
            <div>
              <label for="categoria" class="block text-sm font-medium mb-1">Categoría *</label>
              <select
                id="categoria"
                v-model="itemSeleccionado.categoria"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                required
                :disabled="itemSeleccionado.predefinido"
              >
                <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>

            <!-- Cantidad -->
            <div>
              <label for="cantidad" class="block text-sm font-medium mb-1">Cantidad *</label>
              <input
                type="number"
                id="cantidad"
                v-model="itemSeleccionado.cantidad"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                min="1"
                required
              />
            </div>

            <!-- Descripción -->
            <div>
              <label for="descripcion" class="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                id="descripcion"
                v-model="itemSeleccionado.descripcion"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                rows="2"
              ></textarea>
            </div>

            <!-- Fecha de vencimiento -->
            <div>
              <label for="fechaVencimiento" class="block text-sm font-medium mb-1">Fecha de vencimiento</label>
              <input
                type="date"
                id="fechaVencimiento"
                v-model="itemSeleccionado.fechaVencimiento"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <!-- Días para revisar -->
            <div>
              <label for="diasParaRevisar" class="block text-sm font-medium mb-1">Días para revisar</label>
              <input
                type="number"
                id="diasParaRevisar"
                v-model="itemSeleccionado.diasParaRevisar"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                min="0"
                placeholder="Ej: 30"
              />
              <p class="text-xs text-text-light mt-1">
                Días después de los cuales se debería revisar este artículo
              </p>
            </div>

            <!-- Estado -->
            <div>
              <label for="estado" class="block text-sm font-medium mb-1">Estado</label>
              <select
                id="estado"
                v-model="itemSeleccionado.estado"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>

            <!-- Comentarios -->
            <div>
              <label for="comentarios" class="block text-sm font-medium mb-1">Comentarios</label>
              <textarea
                id="comentarios"
                v-model="itemSeleccionado.comentarios"
                class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                rows="2"
                placeholder="Información adicional"
              ></textarea>
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
              {{ modoEdicion ? 'Actualizar' : 'Agregar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
