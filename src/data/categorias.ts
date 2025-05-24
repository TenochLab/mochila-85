/**
 * Datos predefinidos para las categorías de artículos
 * Estos datos se utilizan para inicializar la base de datos
 */
import type { Categoria } from '../types/models'

/**
 * Lista de categorías predefinidas para la aplicación
 */
export const categoriasPredefinidas: Array<Omit<Categoria, 'id' | 'fechaCreacion'>> = [
  {
    nombre: 'Alimentos',
    descripcion: 'Alimentos no perecederos y de larga duración',
    emojis: ['🍞', '🥫', '🍪'],
  },
  {
    nombre: 'Agua',
    descripcion: 'Agua y elementos para purificar agua',
    emojis: ['💧', '🚰', '🧴'],
  },
  {
    nombre: 'Medicamentos',
    descripcion: 'Medicamentos esenciales y kit de primeros auxilios',
    emojis: ['💊', '🩹', '🧪'],
  },
  {
    nombre: 'Comunicación',
    descripcion: 'Elementos para comunicación de emergencia',
    emojis: ['📻', '📱', '🔋'],
  },
  {
    nombre: 'Documentos',
    descripcion: 'Documentos importantes y copias de respaldo',
    emojis: ['📄', '📝', '🗂️'],
  },
  {
    nombre: 'Herramientas',
    descripcion: 'Herramientas útiles en situaciones de emergencia',
    emojis: ['🔧', '🔦', '🧰'],
  },
  {
    nombre: 'Higiene',
    descripcion: 'Artículos de higiene personal',
    emojis: ['🧼', '🧻', '🪥'],
  },
  {
    nombre: 'Ropa',
    descripcion: 'Ropa y elementos para protección',
    emojis: ['👕', '🧥', '👖'],
  },
  {
    nombre: 'Otros',
    descripcion: 'Otros elementos importantes',
    emojis: ['📦', '🧳', '🛠️'],
  },
]
