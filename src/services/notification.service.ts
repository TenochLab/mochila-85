/**
 * Servicio para gestionar notificaciones utilizando Capacitor
 * @see https://capacitorjs.com/docs/apis/local-notifications
 */

import { LocalNotifications } from '@capacitor/local-notifications'
import { isPlatform } from '@ionic/vue'

/**
 * Clase para gestionar notificaciones locales
 * Proporciona métodos para crear y programar notificaciones
 */
class NotificationService {
  /**
   * Comprueba si las notificaciones están habilitadas y solicita permiso si es necesario
   * @returns Promise que resuelve a true si hay permisos o false si no hay
   */
  async checkPermisos(): Promise<boolean> {
    // Solo verificar permisos en dispositivos nativos
    if (!isPlatform('capacitor')) return true

    try {
      const { display } = await LocalNotifications.checkPermissions()

      // Si ya tiene permisos, retornar true
      if (display === 'granted') {
        return true
      }

      // Solicitar permisos
      const { display: nuevoPermiso } = await LocalNotifications.requestPermissions()
      return nuevoPermiso === 'granted'
    } catch (error) {
      console.error('Error al verificar permisos de notificaciones:', error)
      return false
    }
  }

  /**
   * Programa una notificación para revisar una mochila
   * @param mochilaId ID de la mochila
   * @param nombre Nombre de la mochila
   * @param diasParaRevision Días para programar la notificación (por defecto 30)
   */
  async programarRevisionMochila(
    mochilaId: string,
    nombre: string,
    diasParaRevision: number = 30,
  ): Promise<void> {
    // Verificar si estamos en un dispositivo nativo y tenemos permisos
    if (!isPlatform('capacitor')) {
      console.log('Notificaciones solo disponibles en dispositivos nativos')
      return
    }

    const tienePermisos = await this.checkPermisos()
    if (!tienePermisos) {
      console.warn('No hay permisos para mostrar notificaciones')
      return
    }

    try {
      const fechaNotificacion = new Date()
      fechaNotificacion.setDate(fechaNotificacion.getDate() + diasParaRevision)

      // Crear notificación
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(`1${mochilaId.slice(0, 8)}`, 16), // Generar ID único basado en el ID de la mochila
            title: '¡Hora de revisar tu mochila!',
            body: `Es tiempo de revisar tu mochila "${nombre}" para asegurarte de que todo esté en orden.`,
            schedule: { at: fechaNotificacion },
            extra: {
              tipo: 'revision-mochila',
              mochilaId,
            },
          },
        ],
      })

      console.log(`Notificación programada para ${fechaNotificacion.toLocaleDateString()}`)
    } catch (error) {
      console.error('Error al programar notificación:', error)
    }
  }

  /**
   * Programa una notificación para un artículo por vencer
   * @param itemId ID del artículo
   * @param nombre Nombre del artículo
   * @param fechaVencimiento Fecha de vencimiento del artículo
   * @param diasAntes Días antes del vencimiento para notificar (por defecto 7)
   */
  async programarNotificacionVencimiento(
    itemId: string,
    nombre: string,
    fechaVencimiento: Date,
    diasAntes: number = 7,
  ): Promise<void> {
    // Verificar si estamos en un dispositivo nativo
    if (!isPlatform('capacitor')) {
      console.log('Notificaciones solo disponibles en dispositivos nativos')
      return
    }

    const tienePermisos = await this.checkPermisos()
    if (!tienePermisos) {
      console.warn('No hay permisos para mostrar notificaciones')
      return
    }

    try {
      // Calcular fecha de notificación (N días antes del vencimiento)
      const fechaVence = new Date(fechaVencimiento)
      const fechaNotificacion = new Date(fechaVence)
      fechaNotificacion.setDate(fechaVence.getDate() - diasAntes)

      // Si la fecha ya pasó, no programar notificación
      if (fechaNotificacion <= new Date()) {
        return
      }

      // Crear notificación
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(`2${itemId.slice(0, 8)}`, 16), // Generar ID único basado en el ID del item
            title: '¡Artículo por vencer!',
            body: `Tu artículo "${nombre}" vencerá en ${diasAntes} días (${fechaVence.toLocaleDateString()}).`,
            schedule: { at: fechaNotificacion },
            extra: {
              tipo: 'item-vencimiento',
              itemId,
            },
          },
        ],
      })

      console.log(
        `Notificación de vencimiento programada para ${fechaNotificacion.toLocaleDateString()}`,
      )
    } catch (error) {
      console.error('Error al programar notificación de vencimiento:', error)
    }
  }

  /**
   * Muestra una notificación inmediata
   * @param titulo Título de la notificación
   * @param mensaje Mensaje de la notificación
   * @param datos Datos adicionales (opcional)
   */
  async mostrarNotificacion(titulo: string, mensaje: string, datos?: any): Promise<void> {
    // Verificar si estamos en un dispositivo nativo
    if (!isPlatform('capacitor')) {
      console.log('Notificaciones solo disponibles en dispositivos nativos')
      return
    }

    const tienePermisos = await this.checkPermisos()
    if (!tienePermisos) {
      console.warn('No hay permisos para mostrar notificaciones')
      return
    }

    try {
      // Generar ID único
      const id = Math.floor(Math.random() * 10000000)

      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: titulo,
            body: mensaje,
            schedule: { at: new Date() }, // Mostrar inmediatamente
            extra: datos,
          },
        ],
      })
    } catch (error) {
      console.error('Error al mostrar notificación:', error)
    }
  }

  /**
   * Cancela una notificación programada
   * @param id ID de la notificación a cancelar
   */
  async cancelarNotificacion(id: number): Promise<void> {
    if (!isPlatform('capacitor')) return

    try {
      await LocalNotifications.cancel({ notifications: [{ id }] })
    } catch (error) {
      console.error('Error al cancelar notificación:', error)
    }
  }

  /**
   * Cancela todas las notificaciones pendientes
   */
  async cancelarTodasNotificaciones(): Promise<void> {
    if (!isPlatform('capacitor')) return

    try {
      await LocalNotifications.cancelAll()
    } catch (error) {
      console.error('Error al cancelar todas las notificaciones:', error)
    }
  }
}

// Exportar instancia única del servicio
export const notificationService = new NotificationService()
