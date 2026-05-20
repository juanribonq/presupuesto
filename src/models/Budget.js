/**
 * Modelo de Presupuesto (Budget)
 *
 * Nota: El ingreso ahora se maneja con múltiples registros en Income model
 * El presupuesto se calcula como suma de subcategorías
 */

export class Budget {
  constructor(data = {}) {
    this.month = data.month || this.getCurrentMonth()
    this.subcategories = data.subcategories || {} // { subcategoryId: amount } - presupuesto por subcategoría
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || null
    this.closed = data.closed || false
    this.closedAt = data.closedAt || null
  }

  /**
   * Obtener mes actual en formato YYYY-MM
   */
  getCurrentMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * Validar presupuesto
   */
  validate() {
    const errors = []

    if (!this.month || !/^\d{4}-\d{2}$/.test(this.month)) {
      errors.push('Mes inválido (formato: YYYY-MM)')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Establecer presupuesto para una subcategoría
   */
  setSubcategoryBudget(subcategoryId, amount) {
    if (amount < 0) {
      throw new Error('El monto no puede ser negativo')
    }

    this.subcategories[subcategoryId] = parseFloat(amount)
    this.updatedAt = new Date().toISOString()
    return this
  }

  /**
   * Obtener presupuesto de una subcategoría
   */
  getSubcategoryBudget(subcategoryId) {
    return this.subcategories[subcategoryId] || 0
  }

  /**
   * Eliminar presupuesto de una subcategoría
   */
  removeSubcategoryBudget(subcategoryId) {
    delete this.subcategories[subcategoryId]
    this.updatedAt = new Date().toISOString()
    return this
  }

  /**
   * Calcular suma total de presupuestos
   */
  getTotal() {
    return Object.values(this.subcategories).reduce((sum, amount) => sum + amount, 0)
  }

  /**
   * Obtener presupuesto por categoría principal
   */
  getTotalByMainCategory(mainCategoryId, subcategoriesList) {
    let total = 0
    subcategoriesList
      .filter(sub => sub.mainCategoryId === mainCategoryId)
      .forEach(sub => {
        total += this.subcategories[sub.id] || 0
      })
    return total
  }

  /**
   * Cerrar presupuesto del mes
   */
  close() {
    this.closed = true
    this.closedAt = new Date().toISOString()
    return this
  }

  /**
   * Reabrir presupuesto
   */
  reopen() {
    this.closed = false
    this.closedAt = null
    this.updatedAt = new Date().toISOString()
    return this
  }

  /**
   * Está cerrado
   */
  isClosed() {
    return this.closed === true
  }

  /**
   * Obtener objeto para almacenar
   */
  toJSON() {
    return {
      month: this.month,
      subcategories: { ...this.subcategories },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      closed: this.closed,
      closedAt: this.closedAt
    }
  }

  /**
   * Obtener total formateado
   */
  getFormattedTotal(currency = 'USD', locale = 'es-ES') {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.getTotal())
  }

  /**
   * Obtener mes formateado
   */
  getFormattedMonth(locale = 'es-ES') {
    const [year, month] = this.month.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long'
    })
  }

  /**
   * Clonar presupuesto para otro mes
   */
  cloneForMonth(targetMonth) {
    return new Budget({
      month: targetMonth,
      subcategories: { ...this.subcategories },
      closed: false,
      closedAt: null
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
 * Estadísticas de presupuesto con gastos (actualizado para nueva estructura)
 */
export class BudgetStats {
  constructor(budget, expenses = [], subcategories = []) {
    this.budget = budget
    this.expenses = expenses
    this.subcategories = subcategories
    this.stats = this.calculate()
  }

  /**
   * Calcular estadísticas
   */
  calculate() {
    // Total gastado
    const totalSpent = this.expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Gastos por subcategoría
    const subcategorySpending = {}
    this.expenses.forEach(exp => {
      const subcat = exp.subcategory || exp.category // Compatibilidad con estructura antigua
      subcategorySpending[subcat] = (subcategorySpending[subcat] || 0) + exp.amount
    })

    // Comparar con presupuesto
    const subcategoryStats = {}
    Object.entries(this.budget.subcategories).forEach(([subcatId, budgetAmount]) => {
      const subcategory = this.subcategories.find(s => s.id === subcatId)
      const spent = subcategorySpending[subcategory?.name] || 0
      const remaining = budgetAmount - spent
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0

      subcategoryStats[subcatId] = {
        budget: budgetAmount,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        status: this.getStatus(percentage),
        name: subcategory?.name || 'Desconocido',
        mainCategoryId: subcategory?.mainCategoryId
      }
    })

    // Estadísticas generales
    const totalBudget = this.budget.getTotal()
    const totalRemaining = totalBudget - totalSpent
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return {
      month: this.budget.month,
      total: {
        budget: totalBudget,
        spent: totalSpent,
        remaining: totalRemaining,
        percentage: Math.round(totalPercentage * 100) / 100,
        status: this.getStatus(totalPercentage)
      },
      subcategories: subcategoryStats,
      expenseCount: this.expenses.length,
      averageExpense: this.expenses.length > 0 ? totalSpent / this.expenses.length : 0
    }
  }

  /**
   * Determinar estado según porcentaje usado
   */
  getStatus(percentage) {
    if (percentage >= 100) return 'exceeded' // Excedido
    if (percentage >= 90) return 'critical'  // Crítico
    if (percentage >= 75) return 'warning'   // Advertencia
    if (percentage >= 50) return 'normal'    // Normal
    return 'good' // Bien
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return this.stats
  }

  /**
   * Obtener subcategorías con problemas
   */
  getProblematicSubcategories() {
    return Object.entries(this.stats.subcategories)
      .filter(([_, stats]) => stats.status === 'exceeded' || stats.status === 'critical')
      .map(([subcatId, stats]) => ({ subcategoryId: subcatId, ...stats }))
  }

  /**
   * Está dentro del presupuesto
   */
  isWithinBudget() {
    return this.stats.total.status !== 'exceeded'
  }

  /**
   * Necesita atención
   */
  needsAttention() {
    return this.stats.total.status === 'critical' || this.stats.total.status === 'exceeded'
  }
}

export default Budget
