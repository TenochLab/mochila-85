/**
 * Store de Pinia para gestionar el estado de las mochilas
 * Centraliza la lógica de negocio relacionada con las mochilas
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { initDatabase } from '../services/database.service'
import { mochilaService } from '../services/mochila.service'
import { categoriaService } from '../services/categoria.service'
import { itemService } from '../services/item.service'
import type { Mochila, Categoria, Item } from '../types/models'

export const useMochilaStore = defineStore('mochilaStore', () => {
  // Estado
  const mochilas = ref<Mochila[]>([])
  const categorias = ref<Categoria[]>([])
  const itemsPorVencer = ref<Item[]>([])
  const itemsVencidos = ref<Item[]>([])
  const itemsParaRevisar = ref<Item[]>([])
  const cargando = ref(true)
  const error = ref<string | null>(null)
  const mochilaActual = ref<Mochila | null>(null)

  // Getters
  const mochilasParaRevisar = computed(() => {
    return mochilas.value.filter((mochila) => {
      if (!mochila.fechaUltimaRevision) return true

      const fechaRevision = new Date(mochila.fechaUltimaRevision)
      const hoy = new Date()
      const diasDesdeUltimaRevision = Math.floor(
        (hoy.getTime() - fechaRevision.getTime()) / (1000 * 60 * 60 * 24),
      )

      return diasDesdeUltimaRevision >= 30 // Por defecto, revisar cada 30 días
    })
  })

  const itemsPorCategoria = computed(() => {
    if (!mochilaActual.value) return {}

    const result: Record<string, Item[]> = {}

    mochilaActual.value.articulos.forEach((item) => {
      if (!result[item.categoria]) {
        result[item.categoria] = []
      }
      result[item.categoria].push(item)
    })

    return result
  })

  // Acciones

  /**
   * Inicializa la base de datos y carga los datos iniciales
   */
  async function inicializar() {
    cargando.value = true
    error.value = null

    try {
      // Inicializar la base de datos
      await initDatabase()

      // Inicializar categorías predeterminadas
      await categoriaService.inicializarCategoriasPredeterminadas()

      // Cargar datos
      await Promise.all([cargarMochilas(), cargarCategorias(), cargarItemsEspeciales()])
    } catch (err) {
      console.error('Error al inicializar la base de datos', err)
      error.value = 'Error al inicializar la base de datos'
    } finally {
      cargando.value = false
    }
  }

  /**
   * Carga las mochilas desde la base de datos
   */
  async function cargarMochilas() {
    try {
      mochilas.value = await mochilaService.getAll()
    } catch (err) {
      console.error('Error al cargar mochilas', err)
      error.value = 'Error al cargar mochilas'
    }
  }

  /**
   * Carga las categorías desde la base de datos
   */
  async function cargarCategorias() {
    try {
      categorias.value = await categoriaService.getAll()
    } catch (err) {
      console.error('Error al cargar categorías', err)
      error.value = 'Error al cargar categorías'
    }
  }

  /**
   * Carga los items especiales (por vencer, vencidos, para revisar)
   */
  async function cargarItemsEspeciales() {
    try {
      itemsPorVencer.value = await itemService.getItemsPorVencer()
      itemsVencidos.value = await itemService.getItemsVencidos()
      itemsParaRevisar.value = await itemService.getItemsParaRevisar()
    } catch (err) {
      console.error('Error al cargar items especiales', err)
      error.value = 'Error al cargar items especiales'
    }
  }

  /**
   * Establece la mochila actual para trabajar con ella
   * @param mochilaId ID de la mochila
   */
  async function seleccionarMochila(mochilaId: string) {
    try {
      const mochila = await mochilaService.getById(mochilaId)
      if (mochila) {
        // Cargar los artículos de la mochila
        const articulos = await itemService.getItemsPorMochila(mochilaId)
        mochilaActual.value = {
          ...mochila,
          articulos,
        }
      } else {
        mochilaActual.value = null
        throw new Error('No se encontró la mochila')
      }
    } catch (err) {
      console.error('Error al seleccionar mochila', err)
      error.value = 'Error al seleccionar mochila'
    }
  }

  /**
   * Crea una nueva mochila
   * @param datos Datos de la nueva mochila
   */
  async function crearMochila(datos: Omit<Mochila, 'id' | 'fechaCreacion' | 'articulos'>) {
    try {
      const nuevaMochila = await mochilaService.create(datos)
      mochilas.value.push(nuevaMochila)
      return nuevaMochila
    } catch (err) {
      console.error('Error al crear mochila', err)
      error.value = 'Error al crear mochila'
      throw err
    }
  }

  /**
   * Actualiza una mochila existente
   * @param mochila Mochila con datos actualizados
   */
  async function actualizarMochila(mochila: Mochila) {
    try {
      const mochilaActualizada = await mochilaService.update(mochila)
      const index = mochilas.value.findIndex((m) => m.id === mochila.id)
      if (index !== -1) {
        mochilas.value[index] = mochilaActualizada
      }

      // Si es la mochila actual, actualizarla
      if (mochilaActual.value && mochilaActual.value.id === mochila.id) {
        mochilaActual.value = mochilaActualizada
      }

      return mochilaActualizada
    } catch (err) {
      console.error('Error al actualizar mochila', err)
      error.value = 'Error al actualizar mochila'
      throw err
    }
  }

  /**
   * Elimina una mochila
   * @param mochilaId ID de la mochila a eliminar
   */
  async function eliminarMochila(mochilaId: string) {
    try {
      await mochilaService.delete(mochilaId)
      mochilas.value = mochilas.value.filter((m) => m.id !== mochilaId)

      // Si es la mochila actual, limpiarla
      if (mochilaActual.value && mochilaActual.value.id === mochilaId) {
        mochilaActual.value = null
      }
    } catch (err) {
      console.error('Error al eliminar mochila', err)
      error.value = 'Error al eliminar mochila'
      throw err
    }
  }

  /**
   * Marca una mochila como revisada
   * @param mochilaId ID de la mochila
   */
  async function marcarMochilaComoRevisada(mochilaId: string) {
    try {
      const mochilaRevisada = await mochilaService.marcarComoRevisada(mochilaId)
      if (mochilaRevisada) {
        const index = mochilas.value.findIndex((m) => m.id === mochilaId)
        if (index !== -1) {
          mochilas.value[index] = mochilaRevisada
        }

        // Si es la mochila actual, actualizarla
        if (mochilaActual.value && mochilaActual.value.id === mochilaId) {
          mochilaActual.value = mochilaRevisada
        }
      }
      return mochilaRevisada
    } catch (err) {
      console.error('Error al marcar mochila como revisada', err)
      error.value = 'Error al marcar mochila como revisada'
      throw err
    }
  }

  /**
   * Agrega un artículo a la mochila actual
   * @param item Datos del nuevo artículo
   */
  async function agregarArticulo(item: Omit<Item, 'id' | 'fechaCreacion'>) {
    if (!mochilaActual.value) {
      error.value = 'No hay una mochila seleccionada'
      throw new Error('No hay una mochila seleccionada')
    }

    try {
      const nuevoItem = await itemService.create({
        ...item,
        mochilaId: mochilaActual.value.id,
      })

      // Actualizar la mochila actual
      if (mochilaActual.value) {
        mochilaActual.value.articulos.push(nuevoItem)
      }

      // Actualizar listas especiales si corresponde
      await cargarItemsEspeciales()

      return nuevoItem
    } catch (err) {
      console.error('Error al agregar artículo', err)
      error.value = 'Error al agregar artículo'
      throw err
    }
  }

  /**
   * Actualiza un artículo existente
   * @param item Artículo con datos actualizados
   */
  async function actualizarArticulo(item: Item) {
    try {
      const articuloActualizado = await itemService.update(item)

      // Actualizar el artículo en la mochila actual si corresponde
      if (mochilaActual.value) {
        const index = mochilaActual.value.articulos.findIndex((a) => a.id === item.id)
        if (index !== -1) {
          mochilaActual.value.articulos[index] = articuloActualizado
        }
      }

      // Actualizar listas especiales si corresponde
      await cargarItemsEspeciales()

      return articuloActualizado
    } catch (err) {
      console.error('Error al actualizar artículo', err)
      error.value = 'Error al actualizar artículo'
      throw err
    }
  }

  /**
   * Elimina un artículo
   * @param itemId ID del artículo a eliminar
   */
  async function eliminarArticulo(itemId: string) {
    try {
      await itemService.delete(itemId)

      // Eliminar el artículo de la mochila actual si corresponde
      if (mochilaActual.value) {
        mochilaActual.value.articulos = mochilaActual.value.articulos.filter((a) => a.id !== itemId)
      }

      // Actualizar listas especiales
      await cargarItemsEspeciales()
    } catch (err) {
      console.error('Error al eliminar artículo', err)
      error.value = 'Error al eliminar artículo'
      throw err
    }
  }

  /**
   * Marca un artículo como revisado
   * @param itemId ID del artículo
   */
  async function marcarArticuloComoRevisado(itemId: string) {
    try {
      const articuloRevisado = await itemService.marcarComoRevisado(itemId)

      // Actualizar el artículo en la mochila actual si corresponde
      if (mochilaActual.value && articuloRevisado) {
        const index = mochilaActual.value.articulos.findIndex((a) => a.id === itemId)
        if (index !== -1) {
          mochilaActual.value.articulos[index] = articuloRevisado
        }
      }

      // Actualizar listas especiales
      await cargarItemsEspeciales()

      return articuloRevisado
    } catch (err) {
      console.error('Error al marcar artículo como revisado', err)
      error.value = 'Error al marcar artículo como revisado'
      throw err
    }
  }

  return {
    // Estado
    mochilas,
    categorias,
    itemsPorVencer,
    itemsVencidos,
    itemsParaRevisar,
    cargando,
    error,
    mochilaActual,

    // Getters
    mochilasParaRevisar,
    itemsPorCategoria,

    // Acciones
    inicializar,
    cargarMochilas,
    cargarCategorias,
    cargarItemsEspeciales,
    seleccionarMochila,
    crearMochila,
    actualizarMochila,
    eliminarMochila,
    marcarMochilaComoRevisada,
    agregarArticulo,
    actualizarArticulo,
    eliminarArticulo,
    marcarArticuloComoRevisado,
  }
})
