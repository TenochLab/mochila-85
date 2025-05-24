<script setup lang="ts">
/**
 * Componente para crear o editar artículos (items)
 */
import { computed, ref, onMounted, watch } from 'vue';
import type { Item, Categoria } from '../types/models';

// Props
const props = defineProps<{
  modelValue: Partial<Item>;
  categorias: Categoria[];
  modoEdicion: boolean;
  visible: boolean;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<Item>): void;
  (e: 'update:visible', value: boolean): void;
  (e: 'guardar'): void;
  (e: 'cancelar'): void;
}>();

// Estado local
const form = ref<Partial<Item>>({ ...props.modelValue });
const error = ref<string | null>(null);

// Actualizar formulario cuando cambia el modelo
watch(() => props.modelValue, (newValue) => {
  form.value = { ...newValue };
}, { deep: true });

// Actualizar modelo cuando cambia el formulario
watch(form, (newValue) => {
  emit('update:modelValue', { ...newValue });
}, { deep: true });

// Título del formulario
const titulo = computed(() => {
  return props.modoEdicion ? 'Editar artículo' : 'Agregar artículo';
});

// Botón de acción
const textoBoton = computed(() => {
  return props.modoEdicion ? 'Actualizar' : 'Agregar';
});

// Cerrar modal
const cerrar = () => {
  emit('update:visible', false);
  emit('cancelar');
};

// Validar formulario y enviar
const enviarFormulario = () => {
  // Validar campos requeridos
  error.value = null;

  if (!form.value.nombre) {
    error.value = 'El nombre es obligatorio';
    return;
  }

  if (!form.value.categoria) {
    error.value = 'La categoría es obligatoria';
    return;
  }

  if (!form.value.cantidad || form.value.cantidad < 1) {
    error.value = 'La cantidad debe ser al menos 1';
    return;
  }

  // Validar fecha de vencimiento
  if (form.value.fechaVencimiento) {
    const fecha = new Date(form.value.fechaVencimiento);
    if (isNaN(fecha.getTime())) {
      error.value = 'La fecha de vencimiento no es válida';
      return;
    }
  }

  // Validar días para revisar
  if (form.value.diasParaRevisar !== undefined && form.value.diasParaRevisar < 0) {
    error.value = 'Los días para revisar deben ser un número positivo';
    return;
  }

  // Emitir evento de guardar
  emit('guardar');
};

// Inicializar al montar
onMounted(() => {
  // Asegurarse que la cantidad sea al menos 1
  if (!form.value.cantidad || form.value.cantidad < 1) {
    form.value.cantidad = 1;
  }

  // Establecer valores predeterminados
  if (form.value.predefinido === undefined) {
    form.value.predefinido = false;
  }

  if (form.value.estado === undefined) {
    form.value.estado = 'nuevo';
  }
});
</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-surface rounded-lg shadow-xl w-full max-w-md">
      <div class="border-b border-border p-4">
        <h2 class="text-lg font-medium">{{ titulo }}</h2>
      </div>

      <form @submit.prevent="enviarFormulario" class="p-4">
        <div class="space-y-4">
          <!-- Nombre -->
          <div>
            <label for="nombre" class="block text-sm font-medium mb-1">Nombre *</label>
            <input
              type="text"
              id="nombre"
              v-model="form.nombre"
              class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Ej: Botella de agua"
              required
              :disabled="form.predefinido"
            />
          </div>

          <!-- Categoría -->
          <div>
            <label for="categoria" class="block text-sm font-medium mb-1">Categoría *</label>
            <select
              id="categoria"
              v-model="form.categoria"
              class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
              required
              :disabled="form.predefinido"
            >
              <option value="" disabled>Seleccionar categoría</option>
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
              v-model.number="form.cantidad"
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
              v-model="form.descripcion"
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
              v-model="form.fechaVencimiento"
              class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          <!-- Días para revisar -->
          <div>
            <label for="diasParaRevisar" class="block text-sm font-medium mb-1">Días para revisar</label>
            <input
              type="number"
              id="diasParaRevisar"
              v-model.number="form.diasParaRevisar"
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
              v-model="form.estado"
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
              v-model="form.comentarios"
              class="w-full rounded-md border-border px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
              rows="2"
              placeholder="Información adicional"
            ></textarea>
          </div>

          <!-- Mensaje de error -->
          <div v-if="error" class="bg-danger/10 text-danger px-4 py-2 rounded-md">
            {{ error }}
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="cerrar"
            class="px-4 py-2 border border-border rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
          >
            {{ textoBoton }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
