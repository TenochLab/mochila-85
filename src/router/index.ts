/**
 * Router de Vue para Mochila 85
 * Define las rutas disponibles en la aplicación
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Inicio - Mochila 85',
      },
    },
    {
      path: '/mochilas',
      name: 'mochilas',
      component: () => import('../views/MochilasView.vue'),
      meta: {
        title: 'Mis Mochilas - Mochila 85',
      },
    },
    {
      path: '/mochila/:id',
      name: 'mochila-detalle',
      component: () => import('../views/MochilaDetalleView.vue'),
      props: true,
      meta: {
        title: 'Detalle de Mochila - Mochila 85',
      },
    },
    {
      path: '/articulos',
      name: 'articulos',
      component: () => import('../views/ArticulosView.vue'),
      meta: {
        title: 'Artículos - Mochila 85',
      },
    },
    {
      path: '/categorias',
      name: 'categorias',
      component: () => import('../views/CategoriasView.vue'),
      meta: {
        title: 'Categorías - Mochila 85',
      },
    },
    {
      path: '/notificaciones',
      name: 'notificaciones',
      component: () => import('../views/NotificacionesView.vue'),
      meta: {
        title: 'Notificaciones - Mochila 85',
      },
    },
    {
      path: '/ajustes',
      name: 'ajustes',
      component: () => import('../views/AjustesView.vue'),
      meta: {
        title: 'Ajustes - Mochila 85',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'Acerca de - Mochila 85',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: 'Página no encontrada - Mochila 85',
      },
    },
  ],
})

// Cambiar el título de la página según la ruta
router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Mochila 85'
  next()
})

export default router
