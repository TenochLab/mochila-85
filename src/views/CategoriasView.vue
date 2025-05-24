<script setup lang="ts">
/**
 * Vista de gestión de categorías para la aplicación Mochila 85
 * Permite ver, crear, editar y eliminar categorías
 */
import { ref, onMounted, computed } from 'vue';
import { useMochilaStore } from '../stores/mochila';
import { categoriaService } from '../services/categoria.service';
import type { Categoria } from '../types/models';

// Store y estado
const mochilaStore = useMochilaStore();
const categorias = computed(() => mochilaStore.categorias);
const cargando = ref(false);
const error = ref<string | null>(null);

// Estado para el formulario de categorías
const mostrarFormulario = ref(false);
const editando = ref<Categoria | null>(null);
const nuevaCategoria = ref({
  nombre: '',
  descripcion: '',
  emojis: [] as string[]
});

// Emojis disponibles para selección
const emojisDisponibles = [
  '🍞', '🥫', '🍪', '💧', '🚰', '🧴', '💊', '🩹', '🧪',
  '📻', '📱', '🔋', '📄', '📝', '🗂️', '🔧', '🔦', '🧰',
  '🧼', '🧻', '🪥', '👕', '🧥', '👖', '📦', '🧳', '🛠️',
  '🔥', '⛺', '🧯', '🔪', '🧶', '📢', '🔍', '⚠️', '🧠'
];

// Cargar categorías al montar el componente
onMounted(async () => {
  if (categorias.value.length === 0) {
    await mochilaStore.cargarCategorias();
  }
});

// Métodos para gestión de categorías
const abrirFormulario = (categoria?: Categoria) => {
  if (categoria) {
    editando.value = categoria;
    nuevaCategoria.value = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      emojis: categoria.emojis || []
    };
  } else {
    editando.value = null;
    nuevaCategoria.value = {
      nombre: '',
      descripcion: '',
      emojis: []
    };
  }
  mostrarFormulario.value = true;
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  editando.value = null;
};

const toggleEmoji = (emoji: string) => {
  if (nuevaCategoria.value.emojis.includes(emoji)) {
    nuevaCategoria.value.emojis = nuevaCategoria.value.emojis.filter(e => e !== emoji);
  } else {
    if (nuevaCategoria.value.emojis.length < 3) {
      nuevaCategoria.value.emojis.push(emoji);
    }
  }
};

const guardarCategoria = async () => {
  if (!nuevaCategoria.value.nombre.trim()) {
    error.value = 'El nombre de la categoría es obligatorio';
    return;
  }

  cargando.value = true;
  error.value = null;

  try {
    if (editando.value) {
      // Actualizar categoría existente
      await categoriaService.update({
        ...editando.value,
        nombre: nuevaCategoria.value.nombre,
        descripcion: nuevaCategoria.value.descripcion || undefined,
        emojis: nuevaCategoria.value.emojis.length > 0 ? nuevaCategoria.value.emojis : undefined
      });
    } else {
      // Crear nueva categoría
      await categoriaService.create({
        nombre: nuevaCategoria.value.nombre,
        descripcion: nuevaCategoria.value.descripcion || undefined,
        emojis: nuevaCategoria.value.emojis.length > 0 ? nuevaCategoria.value.emojis : undefined
      });
    }

    // Recargar categorías
    await mochilaStore.cargarCategorias();
    cerrarFormulario();
  } catch (err) {
    console.error('Error al guardar categoría', err);
    error.value = 'Error al guardar la categoría';
  } finally {
    cargando.value = false;
  }
};

const eliminarCategoria = async (categoria: Categoria) => {
  if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  cargando.value = true;
  error.value = null;

  try {
    await categoriaService.delete(categoria.id);
    await mochilaStore.cargarCategorias();
  } catch (err) {
    console.error('Error al eliminar categoría', err);
    error.value = 'Error al eliminar la categoría';
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="categorias-view">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-primary">Categorías</h1>
      <button
        @click="abrirFormulario()"
        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Nueva Categoría
      </button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
      {{ error }}
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center items-center py-8">
      <div class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- Lista de categorías -->
    <div v-else-if="categorias.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="categoria in categorias"
        :key="categoria.id"
        class="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-medium">{{ categoria.nombre }}</h3>
          <div class="flex space-x-1">
            <button
              @click="abrirFormulario(categoria)"
              class="text-primary hover:text-primary/80"
              title="Editar categoría"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              @click="eliminarCategoria(categoria)"
              class="text-red-500 hover:text-red-700"
              title="Eliminar categoría"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="categoria.descripcion" class="text-sm text-gray-600 mb-2">
          {{ categoria.descripcion }}
        </p>

        <div v-if="categoria.emojis && categoria.emojis.length" class="flex space-x-2 mt-2">
          <span
            v-for="(emoji, index) in categoria.emojis"
            :key="index"
            class="text-xl"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>

    <!-- Mensaje sin categorías -->
    <div v-else class="flex flex-col items-center justify-center py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-gray-500">No hay categorías disponibles.</p>
      <button
        @click="abrirFormulario()"
        class="mt-4 text-primary hover:underline"
      >
        Crear la primera categoría
      </button>
    </div>

    <!-- Modal de formulario -->
    <div v-if="mostrarFormulario" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 class="text-xl font-bold mb-4">
          {{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>

        <div class="space-y-4">
          <!-- Nombre de categoría -->
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span class="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              v-model="nuevaCategoria.nombre"
              type="text"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              v-model="nuevaCategoria.descripcion"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Descripción de la categoría"
              rows="3"
            ></textarea>
          </div>

          <!-- Emojis -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Emojis (máximo 3)
            </label>
            <div class="border border-gray-300 rounded-md p-3 h-32 overflow-y-auto">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="emoji in emojisDisponibles"
                  :key="emoji"
                  @click="toggleEmoji(emoji)"
                  class="w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-gray-100"
                  :class="{ 'bg-primary/10 border border-primary': nuevaCategoria.emojis.includes(emoji) }"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
            <div class="mt-2 flex space-x-2">
              <span
                v-for="(emoji, index) in nuevaCategoria.emojis"
                :key="index"
                class="text-xl"
              >
                {{ emoji }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="cerrarFormulario"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="guardarCategoria"
            :disabled="cargando"
            class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:bg-gray-400"
          >
            <span v-if="cargando" class="inline-block animate-spin mr-2">&#8635;</span>
            {{ editando ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
