/**
 * Modelo de Gasto (Expense)
 */

export class Expense {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID()
    this.date = data.date || new Date().toISOString()
    this.category = data.category || '' // Categoría principal (viene de la subcategoría)
    this.subcategory = data.subcategory || '' // Subcategoría
    this.description = data.description || ''
    this.amount = parseFloat(data.amount) || 0
    this.notes = data.notes || ''
    this.month = data.month || this.extractMonth(this.date)
    this.synced = data.synced || false
    this.syncedAt = data.syncedAt || null
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  /**
   * Extraer mes en formato YYYY-MM desde una fecha
   */
  extractMonth(dateString) {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * Validar que el gasto sea válido
   */
  validate() {
    const errors = []

    if (!this.amount || this.amount <= 0) {
      errors.push('El monto debe ser mayor a 0')
    }

    if (!this.category) {
      errors.push('La categoría es requerida')
    }

    if (!this.date) {
      errors.push('La fecha es requerida')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Obtener representación para Google Sheets
   */
  toSheetRow() {
    return [
      this.id,
      this.date,
      this.category,
      this.subcategory,
      this.description,
      this.amount,
      this.notes
    ]
  }

  /**
   * Crear desde fila de Google Sheets
   */
  static fromSheetRow(row) {
    return new Expense({
      id: row[0],
      date: row[1],
      category: row[2],
      subcategory: row[3],
      description: row[4],
      amount: parseFloat(row[5]) || 0,
      notes: row[6]
    })
  }

  /**
   * Obtener objeto simple para almacenar
   */
  toJSON() {
    return {
      id: this.id,
      date: this.date,
      category: this.category,
      subcategory: this.subcategory,
      description: this.description,
      amount: this.amount,
      notes: this.notes,
      month: this.month,
      synced: this.synced,
      syncedAt: this.syncedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  /**
   * Obtener fecha formateada
   */
  getFormattedDate(locale = 'es-ES') {
    const date = new Date(this.date)
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Obtener monto formateado
   */
  getFormattedAmount(currency = 'USD', locale = 'es-ES') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.amount)
  }

  /**
   * Clonar gasto
   */
  clone() {
    return new Expense({
      ...this.toJSON(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
      syncedAt: null
    })
  }

  /**
   * Actualizar campos
   */
  update(updates) {
    Object.assign(this, updates)
    this.updatedAt = new Date().toISOString()
    this.synced = false // Marcar como no sincronizado
    return this
  }
}

export default Expense
