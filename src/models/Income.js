/**
 * Modelo de Ingreso (Income)
 *
 * Permite registrar múltiples fuentes de ingreso que se suman
 */

export class Income {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID()
    this.month = data.month || this.getCurrentMonth()
    this.concept = data.concept || '' // Ej: "Salario", "Freelance", "Bono"
    this.amount = parseFloat(data.amount) || 0
    this.description = data.description || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || null
  }

  /**
   * Obtener mes actual en formato YYYY-MM
   */
  getCurrentMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * Validar ingreso
   */
  validate() {
    const errors = []

    if (!this.month || !/^\d{4}-\d{2}$/.test(this.month)) {
      errors.push('Mes inválido (formato: YYYY-MM)')
    }

    if (!this.concept || this.concept.trim() === '') {
      errors.push('El concepto es requerido')
    }

    if (this.amount <= 0) {
      errors.push('El monto debe ser mayor a 0')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Obtener objeto para almacenar
   */
  toJSON() {
    return {
      id: this.id,
      month: this.month,
      concept: this.concept,
      amount: this.amount,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
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
 * Resumen de ingresos del mes
 */
export class MonthlyIncomes {
  constructor(month, incomes = []) {
    this.month = month
    this.incomes = incomes
  }

  /**
   * Obtener total de ingresos
   */
  getTotal() {
    return this.incomes.reduce((sum, income) => sum + income.amount, 0)
  }

  /**
   * Agregar ingreso
   */
  addIncome(income) {
    this.incomes.push(income)
    return this
  }

  /**
   * Eliminar ingreso
   */
  removeIncome(incomeId) {
    const index = this.incomes.findIndex(inc => inc.id === incomeId)
    if (index > -1) {
      this.incomes.splice(index, 1)
    }
    return this
  }

  /**
   * Obtener ingreso por ID
   */
  getIncome(incomeId) {
    return this.incomes.find(inc => inc.id === incomeId)
  }

  /**
   * Actualizar ingreso
   */
  updateIncome(incomeId, updates) {
    const income = this.getIncome(incomeId)
    if (income) {
      income.update(updates)
    }
    return this
  }

  /**
   * Agrupar por concepto
   */
  groupByConcept() {
    const grouped = {}
    this.incomes.forEach(income => {
      if (!grouped[income.concept]) {
        grouped[income.concept] = []
      }
      grouped[income.concept].push(income)
    })
    return grouped
  }

  /**
   * Obtener total por concepto
   */
  getTotalByConcept() {
    const totals = {}
    this.incomes.forEach(income => {
      totals[income.concept] = (totals[income.concept] || 0) + income.amount
    })
    return totals
  }

  /**
   * Convertir a JSON
   */
  toJSON() {
    return {
      month: this.month,
      incomes: this.incomes.map(inc => inc.toJSON())
    }
  }
}

export default Income
