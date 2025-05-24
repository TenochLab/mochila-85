/**
 * Interfaces para los modelos de datos de la aplicación Mochila 85
 * Estas interfaces definen la estructura de los datos que se almacenarán en IndexedDB
 */

/**
 * Interfaz para representar una mochila de emergencia
 */
export interface Mochila {
  id: string // Identificador único de la mochila
  nombre: string // Nombre de la mochila
  descripcion?: string // Descripción opcional de la mochila
  fechaCreacion: Date // Fecha de creación de la mochila
  fechaModificacion?: Date // Fecha de la última modificación de la mochila
  fechaUltimaRevision?: Date // Fecha de la última revisión de la mochila
  articulos: Item[] // Lista de artículos en la mochila
  estado?: 'nueva' | 'usada' // Estado de la mochila (nueva, usada)
  foto?: string // URL de foto de la mochila. Preferentemente que se vea la ubicación exacta
}

/**
 * Interfaz para representar una categoría de artículos
 */
export interface Categoria {
  id: string // Identificador único de la categoría
  nombre: string // Nombre de la categoría
  descripcion?: string // Descripción opcional de la categoría
  emojis?: string[] // Emojis asociados a la categoría (opcional)
  fechaCreacion: Date // Fecha de creación de la categoría
  fechaModificacion?: Date // Fecha de la última modificación de la categoría
  articulosPredefinidos?: Item[] // Lista de artículos predefinidos en la categoría (opcional)
}

/**
 * Interfaz para representar un artículo dentro de una mochila
 */
export interface Item {
  id: string // Identificador único del artículo
  nombre: string // Nombre del artículo
  categoria: string // Categoría del artículo (Alimentos, Agua, Medicamentos, etc.)
  cantidad: number // Cantidad del artículo
  descripcion?: string // Descripción opcional del artículo
  personalizado?: boolean // Indica si el artículo es personalizado por el usuario
  predefinido: boolean // Indica si el artículo es predefinido (no personalizado). Si es predefinido, no se puede eliminar, cambiar el nombre o la categoría.
  fechaCreacion: Date // Fecha de creación del artículo
  fechaModificacion?: Date // Fecha de la última modificación del artículo
  fechaUltimaRevision?: Date // Fecha de la última revisión del artículo
  fechaVencimiento?: Date // Fecha de vencimiento del artículo (si aplica)
  diasParaRevisar?: number // Días restantes para revisar el artículo (si aplica)
  comentarios?: string // Comentarios adicionales sobre el artículo
  estado?: 'nuevo' | 'usado' | 'vencido' // Estado del artículo (nuevo, usado, vencido)
  imagen?: string // URL de la imagen del artículo (opcional)
  mochilaId?: string // ID de la mochila a la que pertenece
}
