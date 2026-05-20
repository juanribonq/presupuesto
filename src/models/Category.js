/**
 * Modelo de Categoría (Category)
 */

export class Category {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID()
    this.name = data.name || ''
    this.icon = data.icon || '📁'
    this.color = data.color || '#6366f1'
    this.subcategories = data.subcategories || []
    this.budget = parseFloat(data.budget) || 0
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || null
  }

  /**
   * Validar categoría
   */
  validate() {
    const errors = []

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
   * Agregar subcategoría
   */
  addSubcategory(name) {
    if (!name || name.trim() === '') {
      throw new Error('El nombre de subcategoría es requerido')
    }

    if (this.subcategories.includes(name)) {
      throw new Error('La subcategoría ya existe')
    }

    this.subcategories.push(name)
    this.updatedAt = new Date().toISOString()
    return this
  }

  /**
   * Eliminar subcategoría
   */
  removeSubcategory(name) {
    const index = this.subcategories.indexOf(name)
    if (index > -1) {
      this.subcategories.splice(index, 1)
      this.updatedAt = new Date().toISOString()
    }
    return this
  }

  /**
   * Tiene subcategorías
   */
  hasSubcategories() {
    return this.subcategories.length > 0
  }

  /**
   * Obtener objeto para almacenar
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      color: this.color,
      subcategories: [...this.subcategories],
      budget: this.budget,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  /**
   * Obtener presupuesto formateado
   */
  getFormattedBudget(currency = 'USD', locale = 'es-ES') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.budget)
  }

  /**
   * Clonar categoría
   */
  clone() {
    return new Category({
      ...this.toJSON(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    })
  }

  /**
   * Actualizar campos
   */
  update(updates) {
    Object.assign(this, updates)
    this.updatedAt = new Date().toISOString()
    return this
  }
}

/**
 * Categorías predeterminadas
 */
export const DEFAULT_CATEGORIES = [
  {
    name: 'Alimentación',
    icon: '🍔',
    color: '#ef4444',
    subcategories: ['Supermercado', 'Restaurantes', 'Delivery'],
    budget: 0
  },
  {
    name: 'Transporte',
    icon: '🚗',
    color: '#f59e0b',
    subcategories: ['Gasolina', 'Uber/Taxi', 'Transporte Público', 'Mantenimiento'],
    budget: 0
  },
  {
    name: 'Hogar',
    icon: '🏠',
    color: '#10b981',
    subcategories: ['Alquiler', 'Servicios', 'Reparaciones', 'Decoración'],
    budget: 0
  },
  {
    name: 'Salud',
    icon: '⚕️',
    color: '#3b82f6',
    subcategories: ['Médico', 'Medicamentos', 'Gym', 'Seguros'],
    budget: 0
  },
  {
    name: 'Entretenimiento',
    icon: '🎬',
    color: '#8b5cf6',
    subcategories: ['Streaming', 'Cine', 'Hobbies', 'Salidas'],
    budget: 0
  },
  {
    name: 'Educación',
    icon: '📚',
    color: '#06b6d4',
    subcategories: ['Cursos', 'Libros', 'Material'],
    budget: 0
  },
  {
    name: 'Ropa',
    icon: '👕',
    color: '#ec4899',
    subcategories: ['Ropa', 'Calzado', 'Accesorios'],
    budget: 0
  },
  {
    name: 'Tecnología',
    icon: '💻',
    color: '#6366f1',
    subcategories: ['Dispositivos', 'Software', 'Suscripciones'],
    budget: 0
  },
  {
    name: 'Otros',
    icon: '📦',
    color: '#64748b',
    subcategories: ['Varios', 'Imprevistos'],
    budget: 0
  }
]

export default Category
