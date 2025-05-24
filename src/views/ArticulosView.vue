<script setup lang="ts">
/**
 * Vista de artículos para la aplicación Mochila 85
 * Permite ver y gestionar todos los artículos predefinidos y personalizados
 */
import { ref, computed, onMounted } from 'vue';
import { useMochilaStore } from '../stores/mochila';
import { itemService } from '../services/item.service';
import type { Item, Categoria } from '../types/models';
import ItemForm from '../components/ItemForm.vue';

// Store y estado
const mochilaStore = useMochilaStore();
const categorias = computed(() => mochilaStore.categorias);
const cargando = ref(false);
const error = ref<string | null>(null);

// Filtros
const filtros = ref({
  categoria: '',
  nombre: '',
  mostrarSoloPersonalizados: false,
  mostrarSoloPredefinidos: false
});

// Estado para artículos
const articulos = ref<Item[]>([]);
const articuloSeleccionado = ref<Item | null>(null);
const mostrarFormulario = ref(false);

// Artículos filtrados
const articulosFiltrados = computed(() => {
  return articulos.value.filter(item => {
    // Filtro por nombre
    if (filtros.value.nombre && !item.nombre.toLowerCase().includes(filtros.value.nombre.toLowerCase())) {
      return false;
    }

    // Filtro por categoría
    if (filtros.value.categoria && item.categoria !== filtros.value.categoria) {
      return false;
    }

    // Filtro por tipo (personalizado/predefinido)
    if (filtros.value.mostrarSoloPersonalizados && !item.personalizado) {
      return false;
    }

    if (filtros.value.mostrarSoloPredefinidos && !item.predefinido) {
      return false;
    }

    return true;
  });
});

// Artículos agrupados por categoría
const articulosPorCategoria = computed(() => {
  const result: Record<string, Item[]> = {};

  articulosFiltrados.value.forEach(item => {
    if (!result[item.categoria]) {
      result[item.categoria] = [];
    }
    result[item.categoria].push(item);
  });

  return result;
});

// Cargar datos al montar el componente
onMounted(async () => {
  cargando.value = true;
  try {
    // Asegurar que las categorías están cargadas
    if (categorias.value.length === 0) {
      await mochilaStore.cargarCategorias();
    }

    // Cargar todos los artículos
    articulos.value = await itemService.getAll();
  } catch (err) {
    console.error('Error al cargar artículos', err);
    error.value = 'Error al cargar los artículos';
  } finally {
    cargando.value = false;
  }
});

// Obtener nombre de categoría por ID
const getNombreCategoria = (categoriaId: string): string => {
  const categoria = categorias.value.find(c => c.id === categoriaId);
  return categoria ? categoria.nombre : 'Sin categoría';
};

// Abrir formulario para nuevo artículo
const crearNuevoArticulo = () => {
  articuloSeleccionado.value = null;
  mostrarFormulario.value = true;
};

// Abrir formulario para editar artículo
const editarArticulo = (item: Item) => {
  articuloSeleccionado.value = item;
  mostrarFormulario.value = true;
};

// Eliminar artículo
const eliminarArticulo = async (item: Item) => {
  if (!confirm(`¿Estás seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`)) {
    return;
  }

  cargando.value = true;
  try {
    await itemService.delete(item.id);
    articulos.value = articulos.value.filter(i => i.id !== item.id);
  } catch (err) {
    console.error('Error al eliminar artículo', err);
    error.value = 'Error al eliminar el artículo';
  } finally {
    cargando.value = false;
  }
};

// Guardar artículo (nuevo o editado)
const guardarArticulo = async (item: Item) => {
  cargando.value = true;
  try {
    if (articuloSeleccionado.value) {
      // Actualizar artículo existente
      const articuloActualizado = await itemService.update(item);
      const index = articulos.value.findIndex(i => i.id === item.id);
      if (index !== -1) {
        articulos.value[index] = articuloActualizado;
      }
    } else {
      // Crear nuevo artículo
      const nuevoArticulo = await itemService.create(item);
      articulos.value.push(nuevoArticulo);
    }

    cerrarFormulario();
  } catch (err) {
    console.error('Error al guardar artículo', err);
    error.value = 'Error al guardar el artículo';
  } finally {
    cargando.value = false;
  }
};

// Cerrar formulario
const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  articuloSeleccionado.value = null;
};

// Limpiar filtros
const limpiarFiltros = () => {
  filtros.value = {
    categoria: '',
    nombre: '',
    mostrarSoloPersonalizados: false,
    mostrarSoloPredefinidos: false
  };
};
</script>

<template>
  <div class="articulos-view">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-primary">Artículos</h1>
      <button
        @click="crearNuevoArticulo"
        class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Nuevo Artículo
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h2 class="text-lg font-medium mb-3">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="filtroNombre" class="block text-sm font-medium text-gray-700 mb-1">
            Buscar por nombre
          </label>
          <input
            id="filtroNombre"
            v-model="filtros.nombre"
            type="text"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nombre del artículo"
          />
        </div>

        <div>
          <label for="filtroCategoria" class="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            id="filtroCategoria"
            v-model="filtros.categoria"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todas las categorías</option>
            <option
              v-for="categoria in categorias"
              :key="categoria.id"
              :value="categoria.id"
            >
              {{ categoria.nombre }}
            </option>
          </select>
        </div>

        <div class="flex space-x-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="filtros.mostrarSoloPersonalizados"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Solo personalizados</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="filtros.mostrarSoloPredefinidos"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Solo predefinidos</span>
          </label>
        </div>

        <div class="flex items-end">
          <button
            @click="limpiarFiltros"
            class="text-primary hover:text-primary/80"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="bg-red-50 text-red-500 p-4 rounded-lg mb-4">
      {{ error }}
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center items-center py-8">
      <div class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- Lista de artículos agrupados por categoría -->
    <div v-else-if="articulosFiltrados.length" class="space-y-6">
      <div
        v-for="(items, categoriaId) in articulosPorCategoria"
        :key="categoriaId"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 class="font-medium">{{ getNombreCategoria(categoriaId) }}</h3>
        </div>

        <div class="divide-y divide-gray-200">
          <div
            v-for="item in items"
            :key="item.id"
            class="p-4 hover:bg-gray-50 flex justify-between items-center"
          >
            <div>
              <div class="flex items-center">
                <h4 class="font-medium">{{ item.nombre }}</h4>
                <span
                  v-if="item.predefinido"
                  class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  Predefinido
                </span>
                <span
                  v-if="item.personalizado"
                  class="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  Personalizado
                </span>
              </div>

              <p v-if="item.descripcion" class="text-sm text-gray-600 mt-1">
                {{ item.descripcion }}
              </p>

              <div class="flex items-center mt-1 text-xs text-gray-500">
                <span v-if="item.fechaVencimiento" class="mr-3">
                  Vencimiento: {{ new Date(item.fechaVencimiento).toLocaleDateString() }}
                </span>
                <span v-if="item.diasParaRevisar" class="mr-3">
                  Revisar cada {{ item.diasParaRevisar }} días
                </span>
              </div>
            </div>

            <div class="flex space-x-2">
              <button
                @click="editarArticulo(item)"
                class="text-primary hover:text-primary/80"
                title="Editar artículo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>

              <button
                @click="eliminarArticulo(item)"
                class="text-red-500 hover:text-red-700"
                title="Eliminar artículo"
                :disabled="item.predefinido && !item.personalizado"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje sin artículos -->
    <div v-else class="flex flex-col items-center justify-center py-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-500 mb-2">No se encontraron artículos.</p>
      <p class="text-gray-500 text-sm">
        {{ filtros.nombre || filtros.categoria ? 'Prueba a cambiar los filtros de búsqueda.' : '' }}
      </p>
      <button
        @click="crearNuevoArticulo"
        class="mt-4 text-primary hover:underline"
      >
        Crear un nuevo artículo
      </button>
    </div>

    <!-- Modal de formulario -->
    <div v-if="mostrarFormulario">
      <ItemForm
        v-model="articuloSeleccionado || {
          nombre: '',
          categoria: filtros.categoria || '',
          cantidad: 1,
          descripcion: '',
          personalizado: true,
          predefinido: false,
          estado: 'nuevo'
        }"
        :categorias="categorias"
        :modoEdicion="!!articuloSeleccionado"
        v-model:visible="mostrarFormulario"
        @guardar="guardarArticulo"
        @cancelar="cerrarFormulario"
      />
    </div>
  </div>
</template>
