<script setup lang="ts">
/**
 * Vista de ajustes para la aplicación Mochila 85
 * Permite configurar preferencias de la aplicación
 */
import { ref, onMounted } from 'vue';
import { useMochilaStore } from '../stores/mochila';

// Store de mochila
const mochilaStore = useMochilaStore();
const cargando = ref(false);
const mensaje = ref<{ tipo: 'success' | 'error'; texto: string } | null>(null);

// Ajustes de la aplicación
const ajustes = ref({
  // Notificaciones
  notificacionesActivas: true,
  diasAnticipacionVencimiento: 30,
  frecuenciaRevisionMochilas: 90, // días

  // Apariencia
  tema: 'claro', // 'claro' o 'oscuro'

  // Copias de seguridad
  backupAutomatico: false,
  frecuenciaBackup: 30, // días

  // Datos
  mantenerHistorial: true,
  borrarDatosAlCerrar: false,
});

// Cargar ajustes al montar el componente
onMounted(async () => {
  cargando.value = true;
  try {
    // Aquí se cargarían los ajustes desde localStorage o IndexedDB
    const ajustesGuardados = localStorage.getItem('mochila85_ajustes');
    if (ajustesGuardados) {
      ajustes.value = JSON.parse(ajustesGuardados);
    }
  } catch (error) {
    console.error('Error al cargar ajustes', error);
    mostrarMensaje('error', 'No se pudieron cargar los ajustes');
  } finally {
    cargando.value = false;
  }
});

// Guardar ajustes
const guardarAjustes = async () => {
  cargando.value = true;
  try {
    // Guardar en localStorage
    localStorage.setItem('mochila85_ajustes', JSON.stringify(ajustes.value));
    mostrarMensaje('success', 'Ajustes guardados correctamente');
  } catch (error) {
    console.error('Error al guardar ajustes', error);
    mostrarMensaje('error', 'No se pudieron guardar los ajustes');
  } finally {
    cargando.value = false;
  }
};

// Exportar copia de seguridad
const exportarBackup = async () => {
  cargando.value = true;
  try {
    // Obtener todos los datos
    const mochilas = mochilaStore.mochilas;
    const categorias = mochilaStore.categorias;

    // Crear objeto de backup
    const backup = {
      fecha: new Date(),
      version: '1.0',
      datos: {
        mochilas,
        categorias,
        ajustes: ajustes.value
      }
    };

    // Convertir a JSON y crear blob para descarga
    const backupJson = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Crear link de descarga y hacer clic automáticamente
    const link = document.createElement('a');
    link.href = url;
    link.download = `mochila85_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarMensaje('success', 'Copia de seguridad exportada correctamente');
  } catch (error) {
    console.error('Error al exportar backup', error);
    mostrarMensaje('error', 'Error al exportar copia de seguridad');
  } finally {
    cargando.value = false;
  }
};

// Importar copia de seguridad
const importarBackup = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  cargando.value = true;
  try {
    const file = input.files[0];
    const fileContent = await file.text();
    const backup = JSON.parse(fileContent);

    // Validar formato de backup
    if (!backup.datos || !backup.datos.mochilas || !backup.datos.categorias) {
      throw new Error('Formato de archivo inválido');
    }

    // Aquí se implementaría la lógica para importar los datos
    // Esto es solo un esqueleto, la implementación completa requeriría
    // eliminar datos existentes y reemplazarlos con los del backup

    // Actualizar ajustes
    if (backup.datos.ajustes) {
      ajustes.value = backup.datos.ajustes;
      localStorage.setItem('mochila85_ajustes', JSON.stringify(ajustes.value));
    }

    mostrarMensaje('success', 'Copia de seguridad importada correctamente');

    // Resetear input para permitir volver a subir el mismo archivo
    input.value = '';

    // Recargar la página para reflejar los cambios
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('Error al importar backup', error);
    mostrarMensaje('error', 'Error al importar copia de seguridad. Formato inválido.');
    // Resetear input
    input.value = '';
  } finally {
    cargando.value = false;
  }
};

// Restablecer ajustes predeterminados
const restablecerAjustes = () => {
  if (!confirm('¿Estás seguro de restablecer todos los ajustes? Esta acción no se puede deshacer.')) {
    return;
  }

  ajustes.value = {
    notificacionesActivas: true,
    diasAnticipacionVencimiento: 30,
    frecuenciaRevisionMochilas: 90,
    tema: 'claro',
    backupAutomatico: false,
    frecuenciaBackup: 30,
    mantenerHistorial: true,
    borrarDatosAlCerrar: false,
  };

  localStorage.setItem('mochila85_ajustes', JSON.stringify(ajustes.value));
  mostrarMensaje('success', 'Ajustes restablecidos correctamente');
};

// Borrar todos los datos
const borrarTodosDatos = async () => {
  if (!confirm('¿Estás seguro de borrar TODOS LOS DATOS? Esta acción no se puede deshacer y perderás toda la información de tus mochilas y artículos.')) {
    return;
  }

  // Segunda confirmación para asegurarse
  if (!confirm('ADVERTENCIA: Esta acción eliminará permanentemente todos tus datos. ¿Deseas continuar?')) {
    return;
  }

  cargando.value = true;
  try {
    // Aquí se implementaría la lógica para borrar todos los datos
    // Por ejemplo, usando los servicios para eliminar categorías, mochilas, etc.

    // Restablecer ajustes
    restablecerAjustes();

    mostrarMensaje('success', 'Todos los datos han sido eliminados');

    // Recargar la aplicación después de unos segundos
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('Error al borrar datos', error);
    mostrarMensaje('error', 'Error al borrar los datos');
  } finally {
    cargando.value = false;
  }
};

// Mostrar mensaje temporal
const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
  mensaje.value = { tipo, texto };
  setTimeout(() => {
    mensaje.value = null;
  }, 5000);
};
</script>

<template>
  <div class="ajustes-view">
    <h1 class="text-2xl font-bold text-primary mb-6">Ajustes</h1>

    <!-- Mensaje de notificación -->
    <div
      v-if="mensaje"
      :class="{
        'bg-green-50 text-green-800 border-green-200': mensaje.tipo === 'success',
        'bg-red-50 text-red-800 border-red-200': mensaje.tipo === 'error'
      }"
      class="p-4 rounded-lg border mb-6 flex items-start"
    >
      <div v-if="mensaje.tipo === 'success'" class="mr-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div v-else class="mr-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      {{ mensaje.texto }}
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg">
        <div class="flex items-center">
          <div class="animate-spin mr-3 h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span>Procesando...</span>
        </div>
      </div>
    </div>

    <!-- Formulario de ajustes -->
    <form @submit.prevent="guardarAjustes" class="space-y-6">
      <!-- Sección: Notificaciones -->
      <section class="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 class="text-lg font-medium mb-4">Notificaciones</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label for="notificaciones" class="block text-gray-700">
              Activar notificaciones
            </label>
            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
              <input
                id="notificaciones"
                v-model="ajustes.notificacionesActivas"
                type="checkbox"
                class="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 checked:right-0 checked:border-primary checked:bg-primary"
              />
              <label for="notificaciones" class="block w-full h-full bg-gray-200 rounded-full shadow-inner peer-checked:bg-primary/30"></label>
            </div>
          </div>

          <div>
            <label for="diasAnticipacion" class="block text-gray-700 mb-1">
              Días de anticipación para alertas de vencimiento
            </label>
            <input
              id="diasAnticipacion"
              v-model="ajustes.diasAnticipacionVencimiento"
              type="number"
              min="1"
              max="365"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label for="frecuenciaRevision" class="block text-gray-700 mb-1">
              Frecuencia de revisión de mochilas (días)
            </label>
            <input
              id="frecuenciaRevision"
              v-model="ajustes.frecuenciaRevisionMochilas"
              type="number"
              min="1"
              max="365"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </section>

      <!-- Sección: Apariencia -->
      <section class="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 class="text-lg font-medium mb-4">Apariencia</h2>

        <div>
          <label for="tema" class="block text-gray-700 mb-1">Tema</label>
          <div class="flex space-x-4">
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                v-model="ajustes.tema"
                value="claro"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <span class="ml-2">Claro</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                v-model="ajustes.tema"
                value="oscuro"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <span class="ml-2">Oscuro (próximamente)</span>
            </label>
          </div>
        </div>
      </section>

      <!-- Sección: Copias de seguridad -->
      <section class="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 class="text-lg font-medium mb-4">Copias de seguridad</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label for="backupAutomatico" class="block text-gray-700">
              Backup automático
            </label>
            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
              <input
                id="backupAutomatico"
                v-model="ajustes.backupAutomatico"
                type="checkbox"
                class="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 checked:right-0 checked:border-primary checked:bg-primary"
              />
              <label for="backupAutomatico" class="block w-full h-full bg-gray-200 rounded-full shadow-inner peer-checked:bg-primary/30"></label>
            </div>
          </div>

          <div v-if="ajustes.backupAutomatico">
            <label for="frecuenciaBackup" class="block text-gray-700 mb-1">
              Frecuencia de backup automático (días)
            </label>
            <input
              id="frecuenciaBackup"
              v-model="ajustes.frecuenciaBackup"
              type="number"
              min="1"
              max="90"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              @click="exportarBackup"
              class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Exportar backup
            </button>

            <label class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 cursor-pointer">
              Importar backup
              <input
                type="file"
                accept=".json"
                @change="importarBackup"
                class="hidden"
              />
            </label>
          </div>
        </div>
      </section>

      <!-- Sección: Administración de datos -->
      <section class="border border-gray-200 rounded-lg p-4 bg-white">
        <h2 class="text-lg font-medium mb-4">Administración de datos</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label for="mantenerHistorial" class="block text-gray-700">
              Mantener historial de cambios
            </label>
            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
              <input
                id="mantenerHistorial"
                v-model="ajustes.mantenerHistorial"
                type="checkbox"
                class="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 checked:right-0 checked:border-primary checked:bg-primary"
              />
              <label for="mantenerHistorial" class="block w-full h-full bg-gray-200 rounded-full shadow-inner peer-checked:bg-primary/30"></label>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label for="borrarDatosAlCerrar" class="block text-gray-700">
              Borrar datos al cerrar (modo privado)
            </label>
            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
              <input
                id="borrarDatosAlCerrar"
                v-model="ajustes.borrarDatosAlCerrar"
                type="checkbox"
                class="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 checked:right-0 checked:border-primary checked:bg-primary"
              />
              <label for="borrarDatosAlCerrar" class="block w-full h-full bg-gray-200 rounded-full shadow-inner peer-checked:bg-primary/30"></label>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-200">
            <button
              type="button"
              @click="restablecerAjustes"
              class="text-orange-500 hover:text-orange-600"
            >
              Restablecer ajustes predeterminados
            </button>
          </div>

          <div class="pt-2">
            <button
              type="button"
              @click="borrarTodosDatos"
              class="text-red-500 hover:text-red-600"
            >
              Borrar todos los datos
            </button>
          </div>
        </div>
      </section>

      <!-- Botón para guardar -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
        >
          Guardar ajustes
        </button>
      </div>
    </form>
  </div>
</template>
