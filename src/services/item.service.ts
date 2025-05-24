/**
 * Servicio para la gestión de items (artículos) en IndexedDB
 * Proporciona métodos para crear, leer, actualizar y eliminar items
 */

import { v4 as uuidv4 } from 'uuid'
import { BaseDBService } from './database.service'
import { categoriaService } from './categoria.service'
import type { Item } from '../types/models'

/**
 * Servicio para gestionar los items en IndexedDB
 * Hereda los métodos base de BaseDBService
 */
class ItemService extends BaseDBService<Item> {
  constructor() {
    super('items')
  }

  /**
   * Crea un nuevo item
   * @param item Datos del item sin ID ni fecha de creación
   * @returns Promise con el item creado
   */
  async create(item: Omit<Item, 'id' | 'fechaCreacion'>): Promise<Item> {
    const newItem: Item = {
      ...item,
      id: uuidv4(),
      fechaCreacion: new Date(),
      personalizado: item.personalizado !== undefined ? item.personalizado : true,
      predefinido: item.predefinido !== undefined ? item.predefinido : false,
    }

    return this.save(newItem)
  }

  /**
   * Actualiza un item existente
   * @param item Item con datos actualizados
   * @returns Promise con el item actualizado
   */
  async update(item: Item): Promise<Item> {
    const updatedItem = {
      ...item,
      fechaModificacion: new Date(),
    }

    return this.save(updatedItem)
  }

  /**
   * Marca un item como revisado
   * @param id ID del item
   * @returns Promise con el item actualizado
   */
  async marcarComoRevisado(id: string): Promise<Item | undefined> {
    const item = await this.getById(id)
    if (!item) return undefined

    const updatedItem = {
      ...item,
      fechaUltimaRevision: new Date(),
      fechaModificacion: new Date(),
    }

    return this.save(updatedItem)
  }

  /**
   * Obtiene items por categoría
   * @param categoriaId ID de la categoría
   * @returns Promise con array de items de la categoría especificada
   */
  async getItemsPorCategoria(categoriaId: string): Promise<Item[]> {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Base de datos no inicializada'))
        return
      }

      try {
        const transaction = db.transaction(['items'], 'readonly')
        const store = transaction.objectStore('items')
        const index = store.index('por_categoria')
        const request = index.getAll(categoriaId)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Obtiene items por mochila
   * @param mochilaId ID de la mochila
   * @returns Promise con array de items de la mochila especificada
   */
  async getItemsPorMochila(mochilaId: string): Promise<Item[]> {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Base de datos no inicializada'))
        return
      }

      try {
        const transaction = db.transaction(['items'], 'readonly')
        const store = transaction.objectStore('items')
        const index = store.index('por_mochila')
        const request = index.getAll(mochilaId)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Obtiene items por vencer
   * @param diasLimite Días límite para considerar que un item está por vencer (default: 30)
   * @returns Promise con array de items por vencer
   */
  async getItemsPorVencer(diasLimite: number = 30): Promise<Item[]> {
    const items = await this.getAll()
    const hoy = new Date()

    return items.filter((item) => {
      if (!item.fechaVencimiento) return false

      const fechaVencimiento = new Date(item.fechaVencimiento)
      const diasRestantes = Math.floor(
        (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      )

      return diasRestantes >= 0 && diasRestantes <= diasLimite
    })
  }

  /**
   * Obtiene items vencidos
   * @returns Promise con array de items vencidos
   */
  async getItemsVencidos(): Promise<Item[]> {
    const items = await this.getAll()
    const hoy = new Date()

    return items.filter((item) => {
      if (!item.fechaVencimiento) return false

      const fechaVencimiento = new Date(item.fechaVencimiento)
      return fechaVencimiento < hoy
    })
  }

  /**
   * Obtiene items que necesitan revisión
   * @returns Promise con array de items que necesitan revisión
   */
  async getItemsParaRevisar(): Promise<Item[]> {
    const items = await this.getAll()
    const hoy = new Date()

    return items.filter((item) => {
      if (!item.diasParaRevisar || !item.fechaUltimaRevision) return false

      const fechaUltimaRevision = new Date(item.fechaUltimaRevision)
      const diasDesdeUltimaRevision = Math.floor(
        (hoy.getTime() - fechaUltimaRevision.getTime()) / (1000 * 60 * 60 * 24),
      )

      return diasDesdeUltimaRevision >= item.diasParaRevisar
    })
  }

  /**
   * Inicializa los items predeterminados para cada categoría
   * Este método crea artículos predefinidos para las categorías estándar
   * @param categoriaId ID de la categoría para la que inicializar artículos (opcional)
   * @returns Promise que resuelve cuando se han creado los items predeterminados
   */
  async inicializarItemsPredeterminados(categoriaId?: string): Promise<void> {
    try {
      // Importar los artículos predefinidos desde el archivo de datos
      const { articulosPredefinidos } = await import('../data/articulos')

      // Si se especifica una categoría, solo inicializar para esa
      if (categoriaId) {
        // Buscar la categoría
        const categoria = await categoriaService.getById(categoriaId)
        if (!categoria) return

        // Buscar artículos predefinidos para esta categoría
        const nombreCategoria = categoria.nombre
        const articulosCategoria = articulosPredefinidos[nombreCategoria]

        if (articulosCategoria) {
          // Crear los artículos predefinidos si no existen ya
          for (const articulo of articulosCategoria) {
            articulo.categoria = categoriaId // Asignar el ID de categoría correcto
          }

          // Guardar los artículos predefinidos en la categoría
          await categoriaService.update({
            ...categoria,
            articulosPredefinidos: articulosCategoria as Item[],
          })
        }
      } else {
        // Inicializar para todas las categorías
        const categorias = await categoriaService.getAll()

        for (const categoria of categorias) {
          const articulosCategoria = articulosPredefinidos[categoria.nombre]

          if (articulosCategoria) {
            // Ajustar el ID de categoría para cada artículo
            const articulosConCategoria = articulosCategoria.map((articulo) => ({
              ...articulo,
              categoria: categoria.id,
            }))

            // Guardar los artículos predefinidos en la categoría
            await categoriaService.update({
              ...categoria,
              articulosPredefinidos: articulosConCategoria as Item[],
            })
          }
        }
      }
    } catch (error) {
      console.error('Error al inicializar artículos predefinidos', error)
    }
  }
}

// Instancia única del servicio de items
export const itemService = new ItemService()
