<script setup lang="ts">
/**
 * Vista 404 para rutas no encontradas en la aplicación Mochila 85
 */
import { useRouter } from 'vue-router';

const router = useRouter();

// Volver a la página de inicio
const volverAInicio = () => {
  router.push('/');
};
</script>

<template>
  <div class="not-found-view flex flex-col items-center justify-center py-20 px-4 text-center">
    <div class="mb-8">
      <div class="text-5xl sm:text-6xl font-bold text-primary mb-2">404</div>
      <h1 class="text-2xl font-bold mb-2">Página no encontrada</h1>
      <p class="text-gray-600">
        La página que buscas no existe o ha sido movida.
      </p>
    </div>

    <div class="max-w-md mb-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="w-48 h-48 mx-auto text-gray-400"
      >
        <path
          fill="currentColor"
          d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208-93.3 208-208 208zm0-128c-13.25 0-24 10.75-24 24s10.75 24 24 24 24-10.75 24-24-10.75-24-24-24zm0-192c-17.67 0-32 14.33-32 32v112c0 17.67 14.33 32 32 32s32-14.33 32-32V176c0-17.67-14.33-32-32-32z"
        />
      </svg>
    </div>

    <div class="flex flex-wrap justify-center gap-4">
      <button
        @click="volverAInicio"
        class="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
      >
        Volver al inicio
      </button>

      <router-link
        to="/mochilas"
        class="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
      >
        Ver mis mochilas
      </router-link>
    </div>
  </div>
</template>
