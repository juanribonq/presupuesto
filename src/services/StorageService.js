/**
 * StorageService - Manejo de datos locales con IndexedDB
 */

import { openDB } from 'idb'

const DB_NAME = 'presupuesto-db'
const DB_VERSION = 3 // Incrementado para nueva estructura (v3 para forzar upgrade)

class StorageService {
  constructor() {
    this.db = null
    this.initialized = false
  }

  /**
   * Inicializar base de datos IndexedDB
   */
  async init() {
    console.log('💾 Inicializando StorageService...')

    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`📦 Actualizando BD de v${oldVersion} a v${newVersion}`)

          // Store para gastos
          if (!db.objectStoreNames.contains('expenses')) {
            const expensesStore = db.createObjectStore('expenses', {
              keyPath: 'id',
              autoIncrement: true
            })
            expensesStore.createIndex('date', 'date')
            expensesStore.createIndex('category', 'category')
            expensesStore.createIndex('month', 'month')
            expensesStore.createIndex('synced', 'synced')
            console.log('✅ Store "expenses" creado')
          }

          // Store para categorías
          if (!db.objectStoreNames.contains('categories')) {
            const categoriesStore = db.createObjectStore('categories', {
              keyPath: 'id'
            })
            categoriesStore.createIndex('name', 'name', { unique: true })
            console.log('✅ Store "categories" creado')
          }

          // Store para presupuestos mensuales
          if (!db.objectStoreNames.contains('budgets')) {
            const budgetsStore = db.createObjectStore('budgets', {
              keyPath: 'month'
            })
            console.log('✅ Store "budgets" creado')
          }

          // Store para configuración
          if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config', { keyPath: 'key' })
            console.log('✅ Store "config" creado')
          }

          // Store para histórico de sincronización
          if (!db.objectStoreNames.contains('sync_log')) {
            const syncStore = db.createObjectStore('sync_log', {
              keyPath: 'timestamp'
            })
            syncStore.createIndex('status', 'status')
            console.log('✅ Store "sync_log" creado')
          }

          // Nuevos stores para versión 2
          // Store para subcategorías (nueva estructura)
          if (!db.objectStoreNames.contains('subcategories')) {
            const subcategoriesStore = db.createObjectStore('subcategories', {
              keyPath: 'id'
            })
            subcategoriesStore.createIndex('name', 'name')
            subcategoriesStore.createIndex('mainCategoryId', 'mainCategoryId')
            console.log('✅ Store "subcategories" creado')
          }

          // Store para ingresos (múltiples por mes)
          if (!db.objectStoreNames.contains('incomes')) {
            const incomesStore = db.createObjectStore('incomes', {
              keyPath: 'id'
            })
            incomesStore.createIndex('month', 'month')
            incomesStore.createIndex('concept', 'concept')
            console.log('✅ Store "incomes" creado')
          }
        }
      })

      this.initialized = true
      console.log('✅ StorageService inicializado')
      return true

    } catch (error) {
      console.error('❌ Error inicializando StorageService:', error)
      throw error
    }
  }

  /**
   * Verificar que la DB esté inicializada
   */
  ensureInitialized() {
    if (!this.initialized || !this.db) {
      throw new Error('StorageService no está inicializado. Llama a init() primero.')
    }
  }

  // ============================================
  // GASTOS (EXPENSES)
  // ============================================

  /**
   * Agregar un gasto
   */
  async addExpense(expense) {
    this.ensureInitialized()

    const expenseData = {
      ...expense,
      date: expense.date || new Date().toISOString(),
      month: expense.month || this.getCurrentMonth(),
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const id = await this.db.add('expenses', expenseData)
    console.log(`✅ Gasto agregado con ID ${id}`)
    return { ...expenseData, id }
  }

  /**
   * Obtener un gasto por ID
   */
  async getExpense(id) {
    this.ensureInitialized()
    return await this.db.get('expenses', id)
  }

  /**
   * Obtener todos los gastos
   */
  async getAllExpenses() {
    this.ensureInitialized()
    return await this.db.getAll('expenses')
  }

  /**
   * Obtener gastos de un mes específico
   */
  async getExpensesByMonth(month) {
    this.ensureInitialized()
    const index = this.db.transaction('expenses').store.index('month')
    return await index.getAll(month)
  }

  /**
   * Obtener gastos del mes actual
   */
  async getCurrentMonthExpenses() {
    return await this.getExpensesByMonth(this.getCurrentMonth())
  }

  /**
   * Obtener gastos por categoría
   */
  async getExpensesByCategory(category) {
    this.ensureInitialized()
    const index = this.db.transaction('expenses').store.index('category')
    return await index.getAll(category)
  }

  /**
   * Obtener gastos no sincronizados
   */
  async getUnsyncedExpenses() {
    this.ensureInitialized()
    const index = this.db.transaction('expenses').store.index('synced')
    return await index.getAll(false)
  }

  /**
   * Actualizar un gasto
   */
  async updateExpense(id, updates) {
    this.ensureInitialized()

    const expense = await this.getExpense(id)
    if (!expense) {
      throw new Error(`Gasto con ID ${id} no encontrado`)
    }

    const updatedExpense = {
      ...expense,
      ...updates,
      updatedAt: new Date().toISOString(),
      synced: false // Marcar como no sincronizado al actualizar
    }

    await this.db.put('expenses', updatedExpense)
    console.log(`✅ Gasto ${id} actualizado`)
    return updatedExpense
  }

  /**
   * Eliminar un gasto
   */
  async deleteExpense(id) {
    this.ensureInitialized()
    await this.db.delete('expenses', id)
    console.log(`✅ Gasto ${id} eliminado`)
  }

  /**
   * Marcar gastos como sincronizados
   */
  async markExpensesSynced(ids) {
    this.ensureInitialized()
    const tx = this.db.transaction('expenses', 'readwrite')

    for (const id of ids) {
      const expense = await tx.store.get(id)
      if (expense) {
        expense.synced = true
        expense.syncedAt = new Date().toISOString()
        await tx.store.put(expense)
      }
    }

    await tx.done
    console.log(`✅ ${ids.length} gastos marcados como sincronizados`)
  }

  // ============================================
  // CATEGORÍAS
  // ============================================

  /**
   * Agregar una categoría
   */
  async addCategory(category) {
    this.ensureInitialized()

    const categoryData = {
      id: category.id || crypto.randomUUID(),
      name: category.name,
      icon: category.icon || '📁',
      color: category.color || '#6366f1',
      subcategories: category.subcategories || [],
      budget: category.budget || 0,
      createdAt: new Date().toISOString()
    }

    await this.db.add('categories', categoryData)
    console.log(`✅ Categoría "${categoryData.name}" agregada`)
    return categoryData
  }

  /**
   * Obtener una categoría por ID
   */
  async getCategory(id) {
    this.ensureInitialized()
    return await this.db.get('categories', id)
  }

  /**
   * Obtener todas las categorías
   */
  async getAllCategories() {
    this.ensureInitialized()
    return await this.db.getAll('categories')
  }

  /**
   * Actualizar una categoría
   */
  async updateCategory(id, updates) {
    this.ensureInitialized()

    const category = await this.getCategory(id)
    if (!category) {
      throw new Error(`Categoría con ID ${id} no encontrada`)
    }

    const updatedCategory = {
      ...category,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.db.put('categories', updatedCategory)
    console.log(`✅ Categoría ${id} actualizada`)
    return updatedCategory
  }

  /**
   * Eliminar una categoría
   */
  async deleteCategory(id) {
    this.ensureInitialized()
    await this.db.delete('categories', id)
    console.log(`✅ Categoría ${id} eliminada`)
  }

  // ============================================
  // PRESUPUESTOS
  // ============================================

  /**
   * Guardar presupuesto de un mes
   */
  async saveBudget(month, budgetData) {
    this.ensureInitialized()

    const budget = {
      month,
      total: budgetData.total,
      categories: budgetData.categories || {},
      createdAt: budgetData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.db.put('budgets', budget)
    console.log(`✅ Presupuesto guardado para ${month}`)
    return budget
  }

  /**
   * Obtener presupuesto de un mes
   */
  async getBudget(month) {
    this.ensureInitialized()
    return await this.db.get('budgets', month)
  }

  /**
   * Obtener presupuesto del mes actual
   */
  async getCurrentBudget() {
    return await this.getBudget(this.getCurrentMonth())
  }

  /**
   * Obtener todos los presupuestos (histórico)
   */
  async getAllBudgets() {
    this.ensureInitialized()
    return await this.db.getAll('budgets')
  }

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  /**
   * Guardar configuración
   */
  async setConfig(key, value) {
    this.ensureInitialized()
    await this.db.put('config', { key, value, updatedAt: new Date().toISOString() })
    console.log(`✅ Configuración "${key}" guardada`)
  }

  /**
   * Obtener configuración
   */
  async getConfig(key) {
    this.ensureInitialized()
    const config = await this.db.get('config', key)
    return config ? config.value : null
  }

  /**
   * Obtener toda la configuración
   */
  async getAllConfig() {
    this.ensureInitialized()
    const configs = await this.db.getAll('config')
    return configs.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {})
  }

  // ============================================
  // SINCRONIZACIÓN
  // ============================================

  /**
   * Registrar sincronización
   */
  async logSync(status, details = {}) {
    this.ensureInitialized()

    const log = {
      timestamp: new Date().toISOString(),
      status, // 'success' | 'error' | 'partial'
      ...details
    }

    await this.db.add('sync_log', log)
    console.log(`📝 Sincronización registrada: ${status}`)
    return log
  }

  /**
   * Obtener últimos logs de sincronización
   */
  async getRecentSyncLogs(limit = 10) {
    this.ensureInitialized()
    const logs = await this.db.getAll('sync_log')
    return logs.slice(-limit).reverse() // Últimos N, más recientes primero
  }

  /**
   * Obtener última sincronización exitosa
   */
  async getLastSuccessfulSync() {
    this.ensureInitialized()
    const logs = await this.db.getAll('sync_log')
    const successLogs = logs.filter(log => log.status === 'success')
    return successLogs.length > 0 ? successLogs[successLogs.length - 1] : null
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Obtener mes actual en formato YYYY-MM
   */
  getCurrentMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  /**
   * Calcular estadísticas del mes
   */
  async getMonthStats(month) {
    const expenses = await this.getExpensesByMonth(month)
    const budget = await this.getBudget(month)

    // Total gastado
    const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

    // Gastos por categoría
    const byCategory = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Sin categoría'
      acc[cat] = (acc[cat] || 0) + (exp.amount || 0)
      return acc
    }, {})

    // Porcentaje de presupuesto usado
    const budgetTotal = budget?.total || 0
    const budgetUsedPercent = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0

    return {
      month,
      totalSpent,
      budgetTotal,
      budgetUsedPercent: Math.round(budgetUsedPercent * 100) / 100,
      budgetRemaining: budgetTotal - totalSpent,
      expenseCount: expenses.length,
      byCategory,
      expenses
    }
  }

  /**
   * Limpiar datos antiguos (más de X meses)
   */
  async cleanOldData(monthsToKeep = 12) {
    this.ensureInitialized()

    const now = new Date()
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToKeep, 1)
    const cutoffMonth = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}`

    const allExpenses = await this.getAllExpenses()
    const tx = this.db.transaction('expenses', 'readwrite')
    let deleted = 0

    for (const expense of allExpenses) {
      if (expense.month < cutoffMonth && expense.synced) {
        await tx.store.delete(expense.id)
        deleted++
      }
    }

    await tx.done
    console.log(`🗑️ ${deleted} gastos antiguos eliminados`)
    return deleted
  }

  /**
   * Exportar todos los datos (para backup)
   */
  async exportData() {
    this.ensureInitialized()

    return {
      expenses: await this.getAllExpenses(),
      categories: await this.getAllCategories(),
      budgets: await this.getAllBudgets(),
      config: await this.getAllConfig(),
      exportedAt: new Date().toISOString()
    }
  }

  /**
   * Importar datos (restaurar backup)
   */
  async importData(data) {
    this.ensureInitialized()

    const tx = this.db.transaction(['expenses', 'categories', 'budgets', 'config'], 'readwrite')

    // Importar gastos
    if (data.expenses) {
      for (const expense of data.expenses) {
        await tx.objectStore('expenses').put(expense)
      }
    }

    // Importar categorías
    if (data.categories) {
      for (const category of data.categories) {
        await tx.objectStore('categories').put(category)
      }
    }

    // Importar presupuestos
    if (data.budgets) {
      for (const budget of data.budgets) {
        await tx.objectStore('budgets').put(budget)
      }
    }

    // Importar configuración
    if (data.config) {
      for (const [key, value] of Object.entries(data.config)) {
        await tx.objectStore('config').put({ key, value })
      }
    }

    await tx.done
    console.log('✅ Datos importados correctamente')
  }

  /**
   * Limpiar toda la base de datos
   */
  async clearAll() {
    this.ensureInitialized()

    const tx = this.db.transaction(['expenses', 'categories', 'budgets', 'config', 'sync_log', 'subcategories', 'incomes'], 'readwrite')

    await tx.objectStore('expenses').clear()
    await tx.objectStore('categories').clear()
    await tx.objectStore('budgets').clear()
    await tx.objectStore('config').clear()
    await tx.objectStore('sync_log').clear()
    await tx.objectStore('subcategories').clear()
    await tx.objectStore('incomes').clear()

    await tx.done
    console.log('🗑️ Base de datos limpiada')
  }

  // ============================================
  // SUBCATEGORÍAS (Nueva estructura)
  // ============================================

  /**
   * Agregar una subcategoría
   */
  async addSubcategory(subcategory) {
    this.ensureInitialized()

    const subcategoryData = {
      id: subcategory.id || crypto.randomUUID(),
      mainCategoryId: subcategory.mainCategoryId,
      name: subcategory.name,
      icon: subcategory.icon || '📁',
      budget: subcategory.budget || 0,
      details: subcategory.details || [],
      createdAt: new Date().toISOString()
    }

    await this.db.add('subcategories', subcategoryData)
    console.log(`✅ Subcategoría "${subcategoryData.name}" agregada`)
    return subcategoryData
  }

  /**
   * Obtener una subcategoría por ID
   */
  async getSubcategory(id) {
    this.ensureInitialized()
    return await this.db.get('subcategories', id)
  }

  /**
   * Obtener todas las subcategorías
   */
  async getAllSubcategories() {
    this.ensureInitialized()
    return await this.db.getAll('subcategories')
  }

  /**
   * Obtener subcategorías por categoría principal
   */
  async getSubcategoriesByMainCategory(mainCategoryId) {
    this.ensureInitialized()
    const index = this.db.transaction('subcategories').store.index('mainCategoryId')
    return await index.getAll(mainCategoryId)
  }

  /**
   * Actualizar una subcategoría
   */
  async updateSubcategory(id, updates) {
    this.ensureInitialized()

    const subcategory = await this.getSubcategory(id)
    if (!subcategory) {
      throw new Error(`Subcategoría con ID ${id} no encontrada`)
    }

    const updatedSubcategory = {
      ...subcategory,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.db.put('subcategories', updatedSubcategory)
    console.log(`✅ Subcategoría ${id} actualizada`)
    return updatedSubcategory
  }

  /**
   * Eliminar una subcategoría
   */
  async deleteSubcategory(id) {
    this.ensureInitialized()
    await this.db.delete('subcategories', id)
    console.log(`✅ Subcategoría ${id} eliminada`)
  }

  // ============================================
  // INGRESOS (Múltiples por mes)
  // ============================================

  /**
   * Agregar un ingreso
   */
  async addIncome(income) {
    this.ensureInitialized()

    const incomeData = {
      id: income.id || crypto.randomUUID(),
      month: income.month || this.getCurrentMonth(),
      concept: income.concept,
      amount: parseFloat(income.amount) || 0,
      description: income.description || '',
      createdAt: new Date().toISOString()
    }

    await this.db.add('incomes', incomeData)
    console.log(`✅ Ingreso "${incomeData.concept}" agregado`)
    return incomeData
  }

  /**
   * Obtener un ingreso por ID
   */
  async getIncome(id) {
    this.ensureInitialized()
    return await this.db.get('incomes', id)
  }

  /**
   * Obtener todos los ingresos
   */
  async getAllIncomes() {
    this.ensureInitialized()
    return await this.db.getAll('incomes')
  }

  /**
   * Obtener ingresos de un mes específico
   */
  async getIncomesByMonth(month) {
    this.ensureInitialized()
    const index = this.db.transaction('incomes').store.index('month')
    return await index.getAll(month)
  }

  /**
   * Obtener ingresos del mes actual
   */
  async getCurrentMonthIncomes() {
    return await this.getIncomesByMonth(this.getCurrentMonth())
  }

  /**
   * Calcular total de ingresos de un mes
   */
  async getMonthTotalIncome(month) {
    const incomes = await this.getIncomesByMonth(month)
    return incomes.reduce((sum, income) => sum + income.amount, 0)
  }

  /**
   * Calcular total de ingresos del mes actual
   */
  async getCurrentMonthTotalIncome() {
    return await this.getMonthTotalIncome(this.getCurrentMonth())
  }

  /**
   * Actualizar un ingreso
   */
  async updateIncome(id, updates) {
    this.ensureInitialized()

    const income = await this.getIncome(id)
    if (!income) {
      throw new Error(`Ingreso con ID ${id} no encontrado`)
    }

    const updatedIncome = {
      ...income,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.db.put('incomes', updatedIncome)
    console.log(`✅ Ingreso ${id} actualizado`)
    return updatedIncome
  }

  /**
   * Eliminar un ingreso
   */
  async deleteIncome(id) {
    this.ensureInitialized()
    await this.db.delete('incomes', id)
    console.log(`✅ Ingreso ${id} eliminado`)
  }

  // ============================================
  // CIERRE DE MES
  // ============================================

  /**
   * Cerrar mes actual (mover gastos a histórico local)
   * Esto prepara los datos locales para el cierre de mes
   * El histórico real está en Google Sheets
   */
  async closeMonth(month) {
    this.ensureInitialized()

    console.log(`📦 Cerrando mes ${month} en local...`)

    try {
      // 1. Obtener todos los gastos del mes
      const expenses = await this.getExpensesByMonth(month)

      if (expenses.length === 0) {
        console.log('ℹ️ No hay gastos para cerrar')
        return {
          success: true,
          expenseCount: 0,
          message: 'No hay gastos para cerrar'
        }
      }

      // 2. Verificar que todos estén sincronizados
      const unsyncedExpenses = expenses.filter(exp => !exp.synced)
      if (unsyncedExpenses.length > 0) {
        throw new Error(`Hay ${unsyncedExpenses.length} gastos sin sincronizar. Sincroniza primero.`)
      }

      // 3. Marcar gastos como archivados (opcional, para no eliminarlos)
      const tx = this.db.transaction('expenses', 'readwrite')
      for (const expense of expenses) {
        expense.archived = true
        expense.archivedAt = new Date().toISOString()
        await tx.store.put(expense)
      }
      await tx.done

      // 4. Obtener presupuesto del mes para histórico
      const budget = await this.getBudget(month)

      console.log(`✅ Mes ${month} cerrado: ${expenses.length} gastos archivados`)

      return {
        success: true,
        month,
        expenseCount: expenses.length,
        budget: budget?.total || 0,
        message: `Mes ${month} cerrado correctamente`
      }

    } catch (error) {
      console.error('❌ Error cerrando mes:', error)
      throw error
    }
  }

  /**
   * Limpiar gastos archivados del mes actual
   * (Después de cerrar mes en Sheets)
   */
  async clearCurrentMonthExpenses(month) {
    this.ensureInitialized()

    try {
      const expenses = await this.getExpensesByMonth(month)
      const tx = this.db.transaction('expenses', 'readwrite')

      let deleted = 0
      for (const expense of expenses) {
        if (expense.synced) { // Solo eliminar si está sincronizado
          await tx.store.delete(expense.id)
          deleted++
        }
      }

      await tx.done
      console.log(`🗑️ ${deleted} gastos eliminados del mes ${month}`)
      return deleted

    } catch (error) {
      console.error('❌ Error limpiando gastos:', error)
      throw error
    }
  }

  /**
   * Obtener resumen de un mes para cierre
   */
  async getMonthCloseSummary(month) {
    this.ensureInitialized()

    const expenses = await this.getExpensesByMonth(month)
    const budget = await this.getBudget(month)
    const incomes = await this.getIncomesByMonth(month)

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    const unsyncedCount = expenses.filter(exp => !exp.synced).length

    return {
      month,
      expenseCount: expenses.length,
      totalSpent,
      budgetTotal: budget?.total || 0,
      totalIncome,
      unsyncedCount,
      canClose: unsyncedCount === 0 && expenses.length > 0
    }
  }

  /**
   * 🔄 RESTAURAR DATOS DESDE GOOGLE SHEETS
   *
   * Reemplaza todos los datos locales con los datos provenientes de Google Sheets.
   * ⚠️ ADVERTENCIA: Esto SOBRESCRIBIRÁ todos los datos locales actuales.
   *
   * @param {Object} restoredData - Datos obtenidos desde googleSheetsService.restoreAllFromSheets()
   * @returns {Object} Resumen de datos restaurados
   */
  async restoreFromSheets(restoredData) {
    this.ensureInitialized()

    console.log('📥 Restaurando datos en IndexedDB desde Google Sheets...')

    try {
      // 1. Limpiar todas las tablas
      console.log('   → Limpiando datos actuales...')
      const tx1 = this.db.transaction(
        ['expenses', 'subcategories', 'budgets', 'incomes'],
        'readwrite'
      )

      await tx1.objectStore('expenses').clear()
      await tx1.objectStore('subcategories').clear()
      await tx1.objectStore('budgets').clear()
      await tx1.objectStore('incomes').clear()
      await tx1.done

      // 2. Restaurar gastos
      console.log(`   → Restaurando ${restoredData.expenses.length} gastos...`)
      for (const expense of restoredData.expenses) {
        await this.db.add('expenses', expense)
      }

      // 3. Restaurar subcategorías
      console.log(`   → Restaurando ${restoredData.subcategories.length} subcategorías...`)
      for (const subcategory of restoredData.subcategories) {
        await this.db.add('subcategories', subcategory)
      }

      // 4. Restaurar presupuestos
      console.log(`   → Restaurando presupuestos...`)
      for (const [month, budget] of Object.entries(restoredData.budgets)) {
        await this.db.put('budgets', budget)
      }

      // 5. Restaurar ingresos
      console.log(`   → Restaurando ${restoredData.incomes.length} ingresos...`)
      for (const income of restoredData.incomes) {
        await this.db.add('incomes', income)
      }

      // 6. Registrar restauración en log de sincronización
      await this.logSync('restore', {
        expensesCount: restoredData.expenses.length,
        subcategoriesCount: restoredData.subcategories.length,
        incomesCount: restoredData.incomes.length,
        direction: 'sheets-to-app'
      })

      const summary = {
        success: true,
        expensesRestored: restoredData.expenses.length,
        subcategoriesRestored: restoredData.subcategories.length,
        incomesRestored: restoredData.incomes.length,
        budgetsRestored: Object.keys(restoredData.budgets).length
      }

      console.log('✅ Datos restaurados exitosamente:')
      console.log(`   - ${summary.expensesRestored} gastos`)
      console.log(`   - ${summary.subcategoriesRestored} subcategorías`)
      console.log(`   - ${summary.incomesRestored} ingresos`)
      console.log(`   - ${summary.budgetsRestored} presupuestos`)

      return summary

    } catch (error) {
      console.error('❌ Error restaurando datos desde Sheets:', error)
      throw error
    }
  }
}

// Exportar instancia única (singleton)
const storageService = new StorageService()
export default storageService
