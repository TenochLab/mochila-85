/**
 * Servicio para la gestión de mochilas en IndexedDB
 * Proporciona métodos para crear, leer, actualizar y eliminar mochilas
 */

import { v4 as uuidv4 } from 'uuid'
import { BaseDBService } from './database.service'
import type { Mochila } from '../types/models'

/**
 * Servicio para gestionar las mochilas en IndexedDB
 * Hereda los métodos base de BaseDBService
 */
class MochilaService extends BaseDBService<Mochila> {
  constructor() {
    super('mochilas')
  }

  /**
   * Crea una nueva mochila
   * @param mochila Datos de la mochila sin ID ni fecha de creación
   * @returns Promise con la mochila creada
   */
  async create(mochila: Omit<Mochila, 'id' | 'fechaCreacion' | 'articulos'>): Promise<Mochila> {
    const newMochila: Mochila = {
      ...mochila,
      id: uuidv4(),
      fechaCreacion: new Date(),
      articulos: [],
    }

    return this.save(newMochila)
  }

  /**
   * Actualiza una mochila existente
   * @param mochila Mochila con datos actualizados
   * @returns Promise con la mochila actualizada
   */
  async update(mochila: Mochila): Promise<Mochila> {
    const updatedMochila = {
      ...mochila,
      fechaModificacion: new Date(),
    }

    return this.save(updatedMochila)
  }

  /**
   * Marca una mochila como revisada
   * @param id ID de la mochila
   * @returns Promise con la mochila actualizada
   */
  async marcarComoRevisada(id: string): Promise<Mochila | undefined> {
    const mochila = await this.getById(id)
    if (!mochila) return undefined

    const updatedMochila = {
      ...mochila,
      fechaUltimaRevision: new Date(),
      fechaModificacion: new Date(),
    }

    return this.save(updatedMochila)
  }

  /**
   * Obtiene las mochilas que requieren revisión
   * @param diasLimite Días límite para considerar que una mochila necesita revisión (default: 30)
   * @returns Promise con array de mochilas que necesitan revisión
   */
  async getMochilasPorRevisar(diasLimite: number = 30): Promise<Mochila[]> {
    const mochilas = await this.getAll()
    const hoy = new Date()

    return mochilas.filter((mochila) => {
      if (!mochila.fechaUltimaRevision) return true

      const fechaRevision = new Date(mochila.fechaUltimaRevision)
      const diasDesdeUltimaRevision = Math.floor(
        (hoy.getTime() - fechaRevision.getTime()) / (1000 * 60 * 60 * 24),
      )

      return diasDesdeUltimaRevision >= diasLimite
    })
  }
}

// Instancia única del servicio de mochilas
export const mochilaService = new MochilaService()
