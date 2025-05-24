/**
 * Servicio para la gestión de categorías en IndexedDB
 * Proporciona métodos para crear, leer, actualizar y eliminar categorías
 */

import { v4 as uuidv4 } from 'uuid'
import { BaseDBService } from './database.service'
import type { Categoria } from '../types/models'

/**
 * Servicio para gestionar las categorías en IndexedDB
 * Hereda los métodos base de BaseDBService
 */
class CategoriaService extends BaseDBService<Categoria> {
  constructor() {
    super('categorias')
  }

  /**
   * Crea una nueva categoría
   * @param categoria Datos de la categoría sin ID ni fecha de creación
   * @returns Promise con la categoría creada
   */
  async create(categoria: Omit<Categoria, 'id' | 'fechaCreacion'>): Promise<Categoria> {
    const newCategoria: Categoria = {
      ...categoria,
      id: uuidv4(),
      fechaCreacion: new Date(),
    }

    return this.save(newCategoria)
  }

  /**
   * Actualiza una categoría existente
   * @param categoria Categoría con datos actualizados
   * @returns Promise con la categoría actualizada
   */
  async update(categoria: Categoria): Promise<Categoria> {
    const updatedCategoria = {
      ...categoria,
      fechaModificacion: new Date(),
    }

    return this.save(updatedCategoria)
  }

  /**
   * Inicializa las categorías predeterminadas si no existen
   * @returns Promise que resuelve cuando se han creado las categorías predeterminadas
   */
  async inicializarCategoriasPredeterminadas(): Promise<void> {
    // Importar las categorías predefinidas desde el archivo de datos
    import('../data/categorias').then(async ({ categoriasPredefinidas }) => {
      // Obtener categorías existentes
      const categoriasExistentes = await this.getAll()

      // Crear solo las categorías que no existan
      for (const categoria of categoriasPredefinidas) {
        const exists = categoriasExistentes.some(
          (cat) => cat.nombre.toLowerCase() === categoria.nombre.toLowerCase(),
        )

        if (!exists) {
          await this.create(categoria)
        }
      }
    })
  }
}

// Instancia única del servicio de categorías
export const categoriaService = new CategoriaService()
