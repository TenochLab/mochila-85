<script setup lang="ts">
/**
 * Vista "Acerca de" para la aplicación Mochila 85
 * Muestra información sobre la aplicación, licencia y desarrolladores
 */
import { ref } from 'vue';

const version = ref('1.0.0');
const actualizando = ref(false);

// Comprobar actualizaciones (simulado)
const comprobarActualizaciones = () => {
  actualizando.value = true;

  // Simulación de comprobación de actualizaciones
  setTimeout(() => {
    actualizando.value = false;
    alert('La aplicación está actualizada');
  }, 2000);
};
</script>

<template>
  <div class="about-view">
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex flex-col items-center mb-6">
        <img src="../assets/logo.svg" alt="Mochila 85 Logo" class="w-24 h-24 mb-4" />
        <h1 class="text-2xl font-bold text-center text-primary">Mochila 85</h1>
        <p class="text-gray-600">Versión {{ version }}</p>
      </div>

      <p class="text-gray-700 mb-4">
        Mochila 85 es una aplicación diseñada para ayudarte a gestionar el inventario de tus mochilas de emergencia.
        Te permite organizar artículos por categorías, recibir notificaciones de vencimiento y mantener siempre
        tu equipo listo para cualquier situación.
      </p>

      <div class="mb-6">
        <h2 class="text-lg font-medium mb-2">Características principales:</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li>Gestión de múltiples mochilas</li>
          <li>Categorización de artículos</li>
          <li>Alertas de vencimiento</li>
          <li>Recordatorios de revisión</li>
          <li>Funcionamiento offline</li>
          <li>Backup y restauración de datos</li>
        </ul>
      </div>

      <button
        @click="comprobarActualizaciones"
        :disabled="actualizando"
        class="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 disabled:bg-gray-400 flex items-center justify-center"
      >
        <span v-if="actualizando" class="animate-spin mr-2">&#8635;</span>
        {{ actualizando ? 'Comprobando...' : 'Comprobar actualizaciones' }}
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-medium mb-3">Equipo de desarrollo</h2>
      <p class="text-gray-700 mb-4">
        Mochila 85 fue desarrollada por un equipo apasionado por la preparación ante emergencias
        y el desarrollo de software.
      </p>
      <p class="text-gray-600 text-sm">
        © 2025 Mochila 85 Team
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-medium mb-3">Licencia</h2>
      <p class="text-gray-700 mb-2">
        Esta aplicación se distribuye bajo licencia MIT.
      </p>
      <p class="text-gray-700">
        El contenido y código fuente están disponibles en GitHub.
      </p>

      <div class="mt-4">
        <a
          href="https://github.com/mochila-85/app"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Ver código fuente
        </a>
      </div>
    </div>
  </div>
</template>
