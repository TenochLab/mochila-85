/**
 * Servicio para gestionar el almacenamiento de archivos (imágenes) usando Capacitor
 * @see https://capacitorjs.com/docs/apis/filesystem
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { isPlatform } from '@ionic/vue'
import { v4 as uuidv4 } from 'uuid'

/**
 * Clase para gestionar el almacenamiento de archivos
 * Proporciona métodos para guardar, recuperar y eliminar imágenes
 */
class StorageService {
  /**
   * Guarda una imagen en el almacenamiento local
   * @param base64Data Datos de la imagen en formato base64
   * @param fileName Nombre del archivo (opcional, se genera automáticamente si no se proporciona)
   * @returns Promise con la URI o URL de la imagen guardada
   */
  async saveImage(base64Data: string, fileName?: string): Promise<string> {
    // Eliminar el prefijo de datos (si existe)
    const base64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data

    // Generar nombre de archivo único si no se proporciona
    const name = fileName || `img_${uuidv4()}.jpeg`

    try {
      if (isPlatform('capacitor')) {
        // Guardar archivo en dispositivo nativo usando Filesystem API
        const result = await Filesystem.writeFile({
          path: name,
          data: base64,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        })

        return result.uri
      } else {
        // En navegador, simplemente devolver el base64 data URL
        return `data:image/jpeg;base64,${base64}`
      }
    } catch (error) {
      console.error('Error al guardar imagen:', error)
      throw new Error('No se pudo guardar la imagen')
    }
  }

  /**
   * Lee una imagen del almacenamiento local
   * @param path Ruta o URI de la imagen
   * @returns Promise con los datos de la imagen en formato base64
   */
  async readImage(path: string): Promise<string> {
    // Si la ruta ya es una URL de datos base64, devolverla directamente
    if (path.startsWith('data:image')) {
      return path
    }

    try {
      if (isPlatform('capacitor')) {
        // Leer archivo en dispositivo nativo usando Filesystem API
        const result = await Filesystem.readFile({
          path,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        })

        return `data:image/jpeg;base64,${result.data}`
      } else {
        // En navegador, la ruta ya debería ser base64
        return path
      }
    } catch (error) {
      console.error('Error al leer imagen:', error)
      throw new Error('No se pudo leer la imagen')
    }
  }

  /**
   * Elimina una imagen del almacenamiento local
   * @param path Ruta o URI de la imagen
   * @returns Promise que se resuelve cuando la imagen se elimina
   */
  async deleteImage(path: string): Promise<void> {
    // No hacer nada si es una URL de datos
    if (path.startsWith('data:image')) {
      return
    }

    try {
      if (isPlatform('capacitor')) {
        await Filesystem.deleteFile({
          path,
          directory: Directory.Data,
        })
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
    }
  }

  /**
   * Toma una foto desde la cámara o selecciona desde la galería
   * @param fromCamera Si es true, usa la cámara; si es false, usa la galería
   * @returns Promise con los datos de la imagen en formato base64
   */
  async takePicture(fromCamera: boolean = true): Promise<string> {
    try {
      // En un entorno real, usaríamos Camera de Capacitor
      // pero para simplificar, mostrar un mensaje de log
      console.log(`Simulando captura de imagen desde ${fromCamera ? 'cámara' : 'galería'}`)

      // Devolver una imagen de ejemplo (simulación)
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/...'
    } catch (error) {
      console.error('Error al capturar imagen:', error)
      throw new Error('No se pudo capturar la imagen')
    }
  }
}

// Exportar instancia única del servicio
export const storageService = new StorageService()
