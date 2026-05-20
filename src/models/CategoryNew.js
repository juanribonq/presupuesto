/**
 * Nuevo modelo de Categorías con jerarquía de 3 niveles
 *
 * Estructura:
 * - Categoría Principal (Gastos Fijos, Gastos Variables, Ahorros)
 *   - Subcategoría (Transporte, Comida, etc.) [TIENE PRESUPUESTO]
 *     - Detalle (Gasolina, Uber, etc.) [Solo en registro de gasto]
 */

/**
 * Categorías principales (fijas, no editables)
 */
export const MAIN_CATEGORIES = [
  {
    id: 'gastos-fijos',
    name: 'Gastos Fijos',
    icon: '📌',
    color: '#ef4444',
    order: 1
  },
  {
    id: 'gastos-variables',
    name: 'Gastos Variables',
    icon: '💸',
    color: '#f59e0b',
    order: 2
  },
  {
    id: 'ahorros',
    name: 'Ahorros',
    icon: '💰',
    color: '#10b981',
    order: 3
  }
]

/**
 * Subcategorías predeterminadas (tienen presupuesto)
 */
export const DEFAULT_SUBCATEGORIES = [
  // Gastos Fijos
  {
    mainCategoryId: 'gastos-fijos',
    name: 'Alquiler/Hipoteca',
    icon: '🏠',
    budget: 0,
    details: []
  },
  {
    mainCategoryId: 'gastos-fijos',
    name: 'Servicios',
    icon: '💡',
    budget: 0,
    details: ['Luz', 'Agua', 'Gas', 'Internet', 'Teléfono']
  },
  {
    mainCategoryId: 'gastos-fijos',
    name: 'Seguros',
    icon: '🛡️',
    budget: 0,
    details: ['Seguro de Vida', 'Seguro Médico', 'Seguro de Auto', 'Seguro de Hogar']
  },
  {
    mainCategoryId: 'gastos-fijos',
    name: 'Deudas',
    icon: '💳',
    budget: 0,
    details: ['Tarjeta de Crédito', 'Préstamos', 'Cuotas']
  },

  // Gastos Variables
  {
    mainCategoryId: 'gastos-variables',
    name: 'Alimentación',
    icon: '🍔',
    budget: 0,
    details: ['Supermercado', 'Restaurantes', 'Delivery', 'Cafetería']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Transporte',
    icon: '🚗',
    budget: 0,
    details: ['Gasolina', 'Uber/Taxi', 'Transporte Público', 'Mantenimiento', 'Estacionamiento']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Salud',
    icon: '⚕️',
    budget: 0,
    details: ['Médico', 'Medicamentos', 'Gym', 'Terapia']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Entretenimiento',
    icon: '🎬',
    budget: 0,
    details: ['Streaming', 'Cine', 'Hobbies', 'Salidas', 'Viajes']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Educación',
    icon: '📚',
    budget: 0,
    details: ['Cursos', 'Libros', 'Material']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Ropa',
    icon: '👕',
    budget: 0,
    details: ['Ropa', 'Calzado', 'Accesorios']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Tecnología',
    icon: '💻',
    budget: 0,
    details: ['Dispositivos', 'Software', 'Suscripciones']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Mascotas',
    icon: '🐕',
    budget: 0,
    details: ['Veterinario', 'Alimento', 'Accesorios']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Cuidado Personal',
    icon: '💅',
    budget: 0,
    details: ['Peluquería', 'Cosméticos', 'Spa']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Regalos',
    icon: '🎁',
    budget: 0,
    details: ['Cumpleaños', 'Festividades', 'Ocasiones Especiales']
  },
  {
    mainCategoryId: 'gastos-variables',
    name: 'Otros',
    icon: '📦',
    budget: 0,
    details: ['Varios', 'Imprevistos']
  },

  // Ahorros
  {
    mainCategoryId: 'ahorros',
    name: 'Ahorro de Emergencia',
    icon: '🆘',
    budget: 0,
    details: []
  },
  {
    mainCategoryId: 'ahorros',
    name: 'Ahorro para Metas',
    icon: '🎯',
    budget: 0,
    details: ['Vacaciones', 'Compra Grande', 'Proyecto']
  },
  {
    mainCategoryId: 'ahorros',
    name: 'Inversiones',
    icon: '📈',
    budget: 0,
    details: ['Acciones', 'Fondos', 'Criptomonedas', 'Bienes Raíces']
  },
  {
    mainCategoryId: 'ahorros',
    name: 'Retiro',
    icon: '👴',
    budget: 0,
    details: []
  }
]

/**
 * Modelo de Subcategoría
 */
export class Subcategory {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID()
    this.mainCategoryId = data.mainCategoryId || '' // ID de categoría principal
    this.name = data.name || ''
    this.icon = data.icon || '📁'
    this.budget = parseFloat(data.budget) || 0 // Presupuesto mensual
    this.details = data.details || [] // Lista de detalles para el registro
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || null
  }

  /**
   * Validar subcategoría
   */
  validate() {
    const errors = []

    if (!this.mainCategoryId) {
      errors.push('La categoría principal es requerida')
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('El nombre es requerido')
    }

    if (this.budget < 0) {
      errors.push('El presupuesto no puede ser negativo')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Agregar detalle
   */
  addDetail(name) {
    if (!name || name.trim() === '') {
      throw new Error('El nombre de detalle es requerido')
    }

    if (this.details.includes(name)) {
      throw new Error('El detalle ya existe')
    }

    this.details.push(name)
    this.updatedAt = new Date().toISOString()
    return this
  }

  /**
   * Eliminar detalle
   */
  removeDetail(name) {
    const index = this.details.indexOf(name)
    if (index > -1) {
      this.details.splice(index, 1)
      this.updatedAt = new Date().toISOString()
    }
    return this
  }

  /**
   * Obtener objeto para almacenar
   */
  toJSON() {
    return {
      id: this.id,
      mainCategoryId: this.mainCategoryId,
      name: this.name,
      icon: this.icon,
      budget: this.budget,
      details: [...this.details],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  /**
   * Obtener categoría principal
   */
  getMainCategory() {
    return MAIN_CATEGORIES.find(cat => cat.id === this.mainCategoryId)
  }
}

export default Subcategory
