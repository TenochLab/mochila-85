/**
 * Servicio de base de datos usando IndexedDB
 * Este servicio se encarga de la inicialización y gestión de la base de datos local
 * @see https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API
 */

import { ref } from 'vue'
import type { Mochila, Categoria, Item } from '../types/models'

// Nombre de la base de datos y versión actual
const DB_NAME = 'mochila85-db'
const DB_VERSION = 1

// Referencia reactiva para controlar cuando la base de datos está lista
export const dbReady = ref(false)

// Instancia de la base de datos
let db: IDBDatabase | null = null

/**
 * Inicializa la base de datos IndexedDB
 * Crea los object stores y los índices necesarios si no existen
 * @returns Promise que resuelve cuando la base de datos está inicializada
 */
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Abrir o crear la base de datos
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    // Este evento se dispara cuando es necesario crear o actualizar la estructura de la BD
    request.onupgradeneeded = (event) => {
      console.log('Creando/actualizando estructura de la base de datos')
      db = request.result

      // Crear object store para mochilas si no existe
      if (!db.objectStoreNames.contains('mochilas')) {
        const mochilasStore = db.createObjectStore('mochilas', { keyPath: 'id' })
        mochilasStore.createIndex('por_nombre', 'nombre', { unique: false })
        mochilasStore.createIndex('por_fecha_revision', 'fechaUltimaRevision', { unique: false })
      }

      // Crear object store para categorías si no existe
      if (!db.objectStoreNames.contains('categorias')) {
        const categoriasStore = db.createObjectStore('categorias', { keyPath: 'id' })
        categoriasStore.createIndex('por_nombre', 'nombre', { unique: false })
      }

      // Crear object store para items (artículos) si no existe
      if (!db.objectStoreNames.contains('items')) {
        const itemsStore = db.createObjectStore('items', { keyPath: 'id' })
        itemsStore.createIndex('por_categoria', 'categoria', { unique: false })
        itemsStore.createIndex('por_fecha_vencimiento', 'fechaVencimiento', { unique: false })
        itemsStore.createIndex('por_mochila', 'mochilaId', { unique: false })
      }
    }

    // Este evento se dispara cuando la base de datos se abre correctamente
    request.onsuccess = () => {
      db = request.result
      dbReady.value = true
      console.log('Base de datos inicializada correctamente')
      resolve()
    }

    // Este evento se dispara si hay un error al abrir la base de datos
    request.onerror = () => {
      console.error('Error al abrir la base de datos', request.error)
      reject(request.error)
    }
  })
}

/**
 * Clase abstracta para operaciones CRUD genéricas en IndexedDB
 * Proporciona métodos base que serán heredados por servicios específicos
 */
abstract class BaseDBService<T> {
  protected storeName: string

  constructor(storeName: string) {
    this.storeName = storeName
  }

  /**
   * Obtiene todos los elementos de un object store
   * @returns Promise con array de elementos
   */
  async getAll(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Base de datos no inicializada'))
        return
      }

      try {
        const transaction = db.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.getAll()

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Obtiene un elemento por su ID
   * @param id Identificador único del elemento
   * @returns Promise con el elemento o undefined si no se encuentra
   */
  async getById(id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Base de datos no inicializada'))
        return
      }

      try {
        const transaction = db.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Guarda un elemento (crear o actualizar)
   * @param item Elemento a guardar
   * @returns Promise con el elemento guardado
   */
  async save(item: T): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Base de datos no inicializada'))
        return
      }

      try {
        const transaction = db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(item)

        request.onsuccess = () => resolve(item)
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Elimina un elemento por su ID
   * @param id Identificador único del elemento a eliminar
   * @returns Promise vacío cuando se completa la eliminación
   */
  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Base de datos no inicializada'))
        return
      }

      try {
        const transaction = db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }
}

export { BaseDBService }
