/**
 * GoogleSheetsService - Sincronización UNIDIRECCIONAL con Google Sheets
 *
 * ⚠️ IMPORTANTE: Sincronización SOLO App → Sheets (unidireccional)
 *
 * - La app es la ÚNICA fuente de verdad
 * - Google Sheets actúa como BACKUP y herramienta de visualización
 * - SOLO se escriben datos a Sheets (NO se leen cambios desde Sheets)
 * - Cualquier edición manual en Google Sheets será SOBRESCRITA
 *
 * Si necesitas hacer cambios, hazlos SIEMPRE desde la app.
 */

import { GOOGLE_CONFIG, SHEET_NAMES } from '../config/google-api.js'
import authService from './AuthService.js'
import eventBus from '../utils/EventBus.js'

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = null
    this.initialized = false
  }

  /**
   * Inicializar servicio
   */
  async init() {
    console.log('📊 Inicializando GoogleSheetsService...')

    if (!authService.isAuthenticated()) {
      throw new Error('Usuario no autenticado')
    }

    // Intentar cargar spreadsheetId guardado
    const savedId = localStorage.getItem('spreadsheet_id')
    if (savedId) {
      try {
        await this.verifySpreadsheet(savedId)
        this.spreadsheetId = savedId
        console.log(`✅ Spreadsheet cargado: ${savedId}`)
      } catch (error) {
        console.warn('⚠️ Spreadsheet guardado no válido:', error)
        localStorage.removeItem('spreadsheet_id')
      }
    }

    this.initialized = true
    return this.spreadsheetId !== null
  }

  /**
   * Verificar que un spreadsheet existe y es accesible
   */
  async verifySpreadsheet(spreadsheetId) {
    try {
      const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId
      })
      return response.result
    } catch (error) {
      console.error('❌ Error verificando spreadsheet:', error)
      throw error
    }
  }

  /**
   * Crear nuevo spreadsheet
   */
  async createSpreadsheet(title = 'Presupuesto Personal') {
    console.log(`📄 Creando nuevo spreadsheet: "${title}"`)

    try {
      const response = await gapi.client.sheets.spreadsheets.create({
        properties: {
          title: `${title} - ${new Date().toISOString().split('T')[0]}`
        },
        sheets: [
          {
            properties: {
              title: SHEET_NAMES.CONFIG,
              gridProperties: { frozenRowCount: 1 }
            }
          },
          {
            properties: {
              title: 'Presupuesto',
              gridProperties: { frozenRowCount: 1 }
            }
          },
          {
            properties: {
              title: 'Ingresos',
              gridProperties: { frozenRowCount: 1 }
            }
          },
          {
            properties: {
              title: SHEET_NAMES.CURRENT,
              gridProperties: { frozenRowCount: 1 }
            }
          },
          {
            properties: {
              title: SHEET_NAMES.HISTORY,
              gridProperties: { frozenRowCount: 1 }
            }
          }
        ]
      })

      const spreadsheet = response.result
      this.spreadsheetId = spreadsheet.spreadsheetId

      // Guardar ID en localStorage
      localStorage.setItem('spreadsheet_id', this.spreadsheetId)

      // Inicializar estructura de cada hoja
      await this.initializeSheetStructure()

      console.log(`✅ Spreadsheet creado: ${this.spreadsheetId}`)
      eventBus.emit('sheets:created', { spreadsheetId: this.spreadsheetId })

      return spreadsheet

    } catch (error) {
      console.error('❌ Error creando spreadsheet:', error)
      throw error
    }
  }

  /**
   * Conectar a spreadsheet existente
   */
  async connectSpreadsheet(spreadsheetId) {
    console.log(`🔗 Conectando a spreadsheet: ${spreadsheetId}`)

    try {
      await this.verifySpreadsheet(spreadsheetId)
      this.spreadsheetId = spreadsheetId
      localStorage.setItem('spreadsheet_id', spreadsheetId)

      console.log('✅ Conectado a spreadsheet')
      eventBus.emit('sheets:connected', { spreadsheetId })

      return true
    } catch (error) {
      console.error('❌ Error conectando a spreadsheet:', error)
      throw error
    }
  }

  /**
   * Inicializar estructura de las hojas
   */
  async initializeSheetStructure() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('🏗️ Inicializando estructura de hojas...')

    const requests = []

    // Hoja de Configuración
    requests.push({
      range: `${SHEET_NAMES.CONFIG}!A1:B10`,
      values: [
        ['Clave', 'Valor'],
        ['Usuario', authService.getUser()?.email || ''],
        ['Fecha Creación', new Date().toISOString()],
        ['Mes Actual', this.getCurrentMonth()],
        ['Ingreso Mensual', '0'],
        ['Presupuesto Total', '0'],
        ['', ''],
        ['', ''],
        ['', ''],
        ['Última Sincronización', new Date().toISOString()]
      ]
    })

    // Hoja de Gastos Mes Actual (6 columnas, sin Categoría)
    requests.push({
      range: `${SHEET_NAMES.CURRENT}!A1:F1`,
      values: [
        ['ID', 'Fecha', 'Subcategoría', 'Descripción', 'Monto', 'Notas']
      ]
    })

    // Hoja de Histórico (7 columnas, sin Categoría)
    requests.push({
      range: `${SHEET_NAMES.HISTORY}!A1:G1`,
      values: [
        ['Mes', 'ID', 'Fecha', 'Subcategoría', 'Descripción', 'Monto', 'Notas']
      ]
    })

    // Hoja de Presupuesto (nueva)
    requests.push({
      range: `Presupuesto!A1:H1`,
      values: [
        ['Categoría', 'Subcategoría', 'Presupuesto', 'Gastado', 'Disponible', '% Usado', '% del Ingreso', 'Estado']
      ]
    })

    // Hoja de Ingresos (nueva)
    requests.push({
      range: `Ingresos!A1:E1`,
      values: [
        ['ID', 'Mes', 'Concepto', 'Monto', 'Descripción']
      ]
    })

    try {
      await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: requests
        }
      })

      console.log('✅ Estructura de hojas inicializada')
    } catch (error) {
      console.error('❌ Error inicializando estructura:', error)
      throw error
    }
  }

  /**
   * ⚠️ USO INTERNO: Leer configuración desde Google Sheets
   *
   * NOTA: Este método solo debe usarse en casos específicos (ej: primera configuración).
   * En sincronización normal NO se leen datos desde Sheets.
   */
  async readConfig() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.CONFIG}!A2:B20`
      })

      const rows = response.result.values || []
      const config = {}

      rows.forEach(([key, value]) => {
        if (key) {
          config[key] = value
        }
      })

      console.log('✅ Configuración leída desde Sheets')
      return config

    } catch (error) {
      console.error('❌ Error leyendo configuración:', error)
      throw error
    }
  }

  /**
   * Escribir configuración a Google Sheets
   */
  async writeConfig(config) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      const rows = Object.entries(config).map(([key, value]) => [key, value])

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.CONFIG}!A2:B${rows.length + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: rows
        }
      })

      console.log('✅ Configuración escrita a Sheets')
    } catch (error) {
      console.error('❌ Error escribiendo configuración:', error)
      throw error
    }
  }

  /**
   * ⚠️ USO INTERNO: Leer gastos del mes actual desde Google Sheets
   *
   * NOTA: Este método solo debe usarse en casos específicos (ej: primera configuración).
   * En sincronización normal NO se leen datos desde Sheets.
   */
  async readCurrentMonthExpenses() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.CURRENT}!A2:F1000`
      })

      const rows = response.result.values || []

      // Importar para obtener categorías principales
      const { MAIN_CATEGORIES } = await import('../models/CategoryNew.js')

      // Obtener subcategorías actuales de la base de datos
      const storageService = (await import('./StorageService.js')).default
      const allSubcategories = await storageService.getAllSubcategories()

      const expenses = rows.map(row => {
        const subcatName = row[2]

        // Inferir categoría principal desde la subcategoría
        let category = ''
        const subcat = allSubcategories.find(s => s.name === subcatName)
        if (subcat) {
          const mainCat = MAIN_CATEGORIES.find(c => c.id === subcat.mainCategoryId)
          category = mainCat ? mainCat.name : ''
        }

        return {
          id: row[0],
          date: row[1],
          category: category, // Inferido desde subcategoría
          subcategory: subcatName,
          description: row[3],
          amount: parseFloat(row[4]) || 0,
          notes: row[5]
        }
      })

      console.log(`✅ ${expenses.length} gastos leídos desde Sheets`)
      return expenses

    } catch (error) {
      console.error('❌ Error leyendo gastos:', error)
      throw error
    }
  }

  /**
   * Escribir gastos al mes actual en Google Sheets
   */
  async writeCurrentMonthExpenses(expenses) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      // Preparar datos: 6 columnas (ID, Fecha, Subcategoría, Descripción, Monto, Notas)
      const rows = expenses.map(exp => [
        exp.id,
        exp.date,
        exp.subcategory || '',
        exp.description || '',
        exp.amount,
        exp.notes || ''
      ])

      // Limpiar hoja (mantener header)
      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.CURRENT}!A2:F1000`
      })

      // Escribir nuevos datos
      if (rows.length > 0) {
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${SHEET_NAMES.CURRENT}!A2:F${rows.length + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: rows
          }
        })
      }

      console.log(`✅ ${expenses.length} gastos escritos a Sheets`)
    } catch (error) {
      console.error('❌ Error escribiendo gastos:', error)
      throw error
    }
  }

  /**
   * Agregar un gasto al mes actual
   */
  async addExpense(expense) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      const row = [
        expense.id,
        expense.date,
        expense.subcategory || '',
        expense.description || '',
        expense.amount,
        expense.notes || ''
      ]

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.CURRENT}!A2:F2`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      })

      console.log('✅ Gasto agregado a Sheets')
      return true

    } catch (error) {
      console.error('❌ Error agregando gasto:', error)
      throw error
    }
  }

  /**
   * Cerrar mes actual (mover a histórico)
   */
  async closeCurrentMonth() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('📦 Cerrando mes actual...')

    try {
      // 1. Leer gastos del mes actual
      const currentExpenses = await this.readCurrentMonthExpenses()

      if (currentExpenses.length === 0) {
        console.log('ℹ️ No hay gastos para cerrar')
        return
      }

      // 2. Preparar datos para histórico (agregar columna de mes)
      const currentMonth = this.getCurrentMonth()
      const historyRows = currentExpenses.map(exp => [
        currentMonth,
        exp.id,
        exp.date,
        exp.category,
        exp.subcategory || '',
        exp.description || '',
        exp.amount,
        exp.notes || ''
      ])

      // 3. Agregar al histórico
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.HISTORY}!A2:H2`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: historyRows
        }
      })

      // 4. Limpiar hoja del mes actual (mantener header)
      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.CURRENT}!A2:G1000`
      })

      // 5. Actualizar configuración
      const config = await this.readConfig()
      config['Mes Actual'] = this.getNextMonth()
      config['Última Sincronización'] = new Date().toISOString()
      await this.writeConfig(config)

      console.log(`✅ Mes ${currentMonth} cerrado y movido a histórico`)
      eventBus.emit('sheets:month-closed', { month: currentMonth, expenseCount: currentExpenses.length })

      return true

    } catch (error) {
      console.error('❌ Error cerrando mes:', error)
      throw error
    }
  }

  /**
   * Leer histórico completo
   */
  async readHistory() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAMES.HISTORY}!A2:H10000`
      })

      const rows = response.result.values || []
      const expenses = rows.map(row => ({
        month: row[0],
        id: row[1],
        date: row[2],
        category: row[3],
        subcategory: row[4],
        description: row[5],
        amount: parseFloat(row[6]) || 0,
        notes: row[7]
      }))

      console.log(`✅ ${expenses.length} gastos históricos leídos`)
      return expenses

    } catch (error) {
      console.error('❌ Error leyendo histórico:', error)
      throw error
    }
  }

  /**
   * Leer histórico de un mes específico
   */
  async readHistoryByMonth(month) {
    const allHistory = await this.readHistory()
    return allHistory.filter(exp => exp.month === month)
  }

  /**
   * Sincronizar: subir cambios locales a Sheets
   */
  async syncToSheets(expenses) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log(`⬆️ Sincronizando ${expenses.length} gastos a Sheets...`)

    try {
      await this.writeCurrentMonthExpenses(expenses)

      // Actualizar última sincronización
      const config = await this.readConfig()
      config['Última Sincronización'] = new Date().toISOString()
      await this.writeConfig(config)

      console.log('✅ Sincronización a Sheets completada')
      eventBus.emit('sheets:sync-complete', { direction: 'upload', count: expenses.length })

      return true

    } catch (error) {
      console.error('❌ Error sincronizando a Sheets:', error)
      eventBus.emit('sheets:sync-error', { direction: 'upload', error })
      throw error
    }
  }

  /**
   * ⚠️ DEPRECADO: Sincronización desde Sheets (ya no se usa)
   *
   * La app ahora usa sincronización UNIDIRECCIONAL (App → Sheets)
   * NO se descargan cambios desde Google Sheets
   *
   * ⚠️ IMPORTANTE: Cualquier cambio manual en Google Sheets será sobrescrito
   */
  async syncFromSheets() {
    console.warn('⚠️ syncFromSheets está deprecado. La app usa sincronización unidireccional.')
    console.warn('⚠️ NO se descargan cambios desde Google Sheets.')
    throw new Error('Sincronización desde Sheets deshabilitada. La app es la única fuente de verdad.')
  }

  /**
   * ⚠️ DEPRECADO: Sincronización bidireccional (ya no se usa)
   * Usar pushToSheets() en su lugar para sincronización unidireccional
   */
  async smartSync(localExpenses) {
    console.warn('⚠️ smartSync está deprecado. Usa pushToSheets() para sincronización unidireccional.')
    return this.pushToSheets(localExpenses)
  }

  /**
   * Sincronización UNIDIRECCIONAL: App → Sheets
   * Solo sube datos locales a Google Sheets (NO lee desde Sheets)
   *
   * ⚠️ IMPORTANTE: Cualquier cambio manual en Google Sheets será sobrescrito
   */
  async pushToSheets(localExpenses, localIncomes = []) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('⬆️ Iniciando sincronización unidireccional (App → Sheets)...')
    console.log(`📤 Subiendo ${localExpenses.length} gastos y ${localIncomes.length} ingresos a Google Sheets`)

    try {
      // Subir gastos
      await this.writeCurrentMonthExpenses(localExpenses)

      // Subir ingresos
      if (localIncomes.length > 0) {
        await this.writeIncomesToSheets(localIncomes)
      }

      console.log(`✅ Sincronización completada: ${localExpenses.length} gastos y ${localIncomes.length} ingresos subidos`)
      eventBus.emit('sheets:sync-complete', {
        direction: 'push-only',
        count: localExpenses.length,
        incomesCount: localIncomes.length
      })

      return localExpenses

    } catch (error) {
      console.error('❌ Error en sincronización unidireccional:', error)
      eventBus.emit('sheets:sync-error', { direction: 'push-only', error })
      throw error
    }
  }

  /**
   * Obtener URL del spreadsheet
   */
  getSpreadsheetUrl() {
    if (!this.spreadsheetId) return null
    return `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`
  }

  /**
   * Desconectar spreadsheet
   */
  disconnect() {
    this.spreadsheetId = null
    localStorage.removeItem('spreadsheet_id')
    console.log('🔌 Spreadsheet desconectado')
    eventBus.emit('sheets:disconnected')
  }

  /**
   * Verificar si una hoja existe en el spreadsheet
   */
  async sheetExists(sheetName) {
    try {
      const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      })
      const sheets = response.result.sheets || []
      return sheets.some(sheet => sheet.properties.title === sheetName)
    } catch (error) {
      console.error('❌ Error verificando hoja:', error)
      return false
    }
  }

  /**
   * Crear hoja en el spreadsheet
   */
  async createSheet(sheetName) {
    try {
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: { frozenRowCount: 1 }
                }
              }
            }
          ]
        }
      })
      console.log(`✅ Hoja "${sheetName}" creada`)
      return true
    } catch (error) {
      console.error(`❌ Error creando hoja "${sheetName}":`, error)
      throw error
    }
  }

  /**
   * Configurar validación de datos (dropdown) en columna de Categoría
   */
  async setupCategoryValidation(subcategories) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    try {
      // Obtener sheetId de la hoja del mes actual
      const response = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      })

      const sheet = response.result.sheets.find(s => s.properties.title === SHEET_NAMES.CURRENT)
      if (!sheet) {
        console.warn('No se encontró la hoja del mes actual')
        return
      }

      const sheetId = sheet.properties.sheetId

      // Crear lista de valores únicos de subcategorías (solo nombre, sin icono)
      const categoryValues = subcategories.map(sub => sub.name)

      // Configurar validación de datos SOLO en columna C (Subcategoría, index 2)
      // Y limpiar cualquier validación de las otras columnas
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            // Limpiar validaciones de TODAS las columnas primero
            {
              setDataValidation: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: 0, // A
                  endColumnIndex: 6    // F
                },
                rule: null // Elimina todas las validaciones
              }
            },
            // Ahora agregar validación SOLO en columna C
            {
              setDataValidation: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1, // Desde fila 2 (0-indexed)
                  endRowIndex: 1000, // Hasta fila 1000
                  startColumnIndex: 2, // Columna C (Subcategoría)
                  endColumnIndex: 3
                },
                rule: {
                  condition: {
                    type: 'ONE_OF_LIST',
                    values: categoryValues.map(val => ({ userEnteredValue: val }))
                  },
                  showCustomUi: true,
                  strict: false
                }
              }
            }
          ]
        }
      })

      console.log('✅ Validación de datos configurada en columna Subcategoría')
    } catch (error) {
      console.error('❌ Error configurando validación:', error)
      // No lanzar error, es opcional
    }
  }

  /**
   * Leer presupuestos de subcategorías desde Google Sheets
   */
  async readBudgetFromSheets() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('📥 Leyendo presupuestos desde Sheets...')

    try {
      const exists = await this.sheetExists('Presupuesto')
      if (!exists) {
        console.log('ℹ️ Hoja "Presupuesto" no existe')
        return { subcategoryBudgets: {}, totalIncome: 0 }
      }

      // Leer datos de la hoja (saltando headers)
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Presupuesto!A2:I1000'
      })

      const rows = response.result.values || []
      const subcategoryBudgets = {}
      let totalIncome = 0

      // Importar para obtener subcategorías
      const { MAIN_CATEGORIES } = await import('../models/CategoryNew.js')

      rows.forEach(row => {
        const [mainCatName, subcatName, budgetValue, , , , , , ] = row

        // Detectar si es la fila de ingreso
        if (mainCatName && mainCatName.includes('INGRESO MENSUAL')) {
          totalIncome = parseFloat(budgetValue) || 0
          return
        }

        // Solo procesar subcategorías (tienen nombre en columna B y presupuesto)
        if (subcatName && subcatName.trim() !== '' && budgetValue) {
          // Limpiar nombre: remover emojis, espacios extras, y símbolos al inicio
          let cleanSubcatName = subcatName.trim()

          // Remover emojis y símbolos especiales al inicio (incluyendo espacios dobles)
          cleanSubcatName = cleanSubcatName.replace(/^[\s\uD800-\uDFFF\u2702-\u27B0\uF000-\uFFFF\u00A9\u00AE\u203C-\u3299]+/g, '')
          cleanSubcatName = cleanSubcatName.replace(/^\s+/, '') // Trim espacios adicionales

          const budget = parseFloat(budgetValue)

          if (!isNaN(budget) && budget > 0 && cleanSubcatName) {
            console.log(`   📊 Presupuesto leído: "${cleanSubcatName}" = ${budget}`)
            subcategoryBudgets[cleanSubcatName] = budget
          }
        }
      })

      console.log(`✅ Presupuestos leídos desde Sheets: ${Object.keys(subcategoryBudgets).length} subcategorías`)
      return { subcategoryBudgets, totalIncome }

    } catch (error) {
      console.error('❌ Error leyendo presupuestos:', error)
      throw error
    }
  }

  /**
   * ⚠️ DEPRECADO: Sincronización bidireccional de presupuestos (ya no se usa)
   *
   * La app ahora usa sincronización UNIDIRECCIONAL (App → Sheets)
   * NO se leen presupuestos desde Google Sheets
   *
   * ⚠️ IMPORTANTE: Cualquier cambio manual en Google Sheets será sobrescrito
   */
  async smartSyncBudget(localSubcategories, totalIncome = 0) {
    console.warn('⚠️ smartSyncBudget está deprecado. La app usa sincronización unidireccional.')
    console.warn('⚠️ Solo se suben presupuestos locales a Sheets, no se descargan.')

    // Solo retornar los datos locales sin cambios (no leer desde Sheets)
    return {
      subcategories: localSubcategories,
      totalIncome: totalIncome,
      hasChanges: false
    }
  }

  /**
   * Sincronizar presupuesto a Google Sheets (actualizado para nueva estructura)
   */
  async syncBudgetToSheets(budget, subcategories, expenses, totalIncome = 0) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('📊 Sincronizando presupuesto a Sheets...')

    try {
      // Verificar si la hoja "Presupuesto" existe, si no crearla
      const exists = await this.sheetExists('Presupuesto')
      if (!exists) {
        console.log('📄 Creando hoja "Presupuesto"...')
        await this.createSheet('Presupuesto')

        // Inicializar headers
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Presupuesto!A1:H1',
          valueInputOption: 'RAW',
          resource: {
            values: [
              ['Categoría Principal', 'Subcategoría', 'Presupuesto', 'Gastado', 'Disponible', '% Usado', '% del Ingreso', 'Estado']
            ]
          }
        })
      }

      // Importar MAIN_CATEGORIES para agrupar
      const { MAIN_CATEGORIES } = await import('../models/CategoryNew.js')

      // Calcular gastos por subcategoría
      const spendingBySubcategory = {}
      expenses.forEach(exp => {
        const subcat = exp.subcategory || 'Sin subcategoría'
        spendingBySubcategory[subcat] = (spendingBySubcategory[subcat] || 0) + exp.amount
      })

      // Preparar filas de presupuesto
      const rows = []
      let currentRow = 2 // Fila inicial (después de headers)

      // Calcular cuántas filas ocuparán las categorías para las fórmulas de totales
      let totalDataRows = 0
      MAIN_CATEGORIES.forEach(mainCat => {
        const subs = subcategories.filter(sub => sub.mainCategoryId === mainCat.id)
        totalDataRows += 1 // Categoría principal
        totalDataRows += subs.length // Subcategorías
        totalDataRows += 1 // Separador
      })

      const firstDataRow = currentRow + 3 // Después de TOTAL GENERAL, INGRESO, separador
      const lastDataRow = firstDataRow + totalDataRows - 1

      // Fila de resumen general (con FÓRMULAS)
      rows.push([
        '💰 TOTAL GENERAL',
        '',
        `=SUM(C${firstDataRow}:C${lastDataRow})`, // Total presupuesto = suma de presupuestos
        `=SUM(D${firstDataRow}:D${lastDataRow})`, // Total gastado = suma de gastados
        `=C${currentRow}-D${currentRow}`, // Disponible = Presupuesto - Gastado
        `=IF(C${currentRow}>0; D${currentRow}/C${currentRow}; 0)`, // % Usado
        totalIncome > 0 ? `=IF(C${currentRow}>0; C${currentRow}/${totalIncome}; 0)` : 'N/A', // % del Ingreso
        `=IF(F${currentRow}>=1; "🔴 Excedido"; IF(F${currentRow}>=0,9; "🟡 Crítico"; "🟢 OK"))` // Estado
      ])
      currentRow++

      // Fila de ingreso (con FÓRMULAS)
      rows.push([
        '💵 INGRESO MENSUAL',
        '',
        totalIncome,
        `=D${currentRow-1}`, // Gastado = referencia al total gastado
        `=C${currentRow}-D${currentRow}`, // Disponible = Ingreso - Gastado
        `=IF(C${currentRow}>0; D${currentRow}/C${currentRow}; 0)`, // % Usado
        '100%',
        `=IF((C${currentRow}-D${currentRow})/C${currentRow}>0,2; "🟢 Ahorrando"; IF((C${currentRow}-D${currentRow})/C${currentRow}>0; "🟡 Equilibrado"; "🔴 Déficit"))`
      ])
      currentRow++

      rows.push(['', '', '', '', '', '', '', '']) // Separador (8 columnas)
      currentRow++

      // Agrupar subcategorías por categoría principal
      const subcategoriesByMain = {}
      MAIN_CATEGORIES.forEach(mainCat => {
        subcategoriesByMain[mainCat.id] = subcategories.filter(sub => sub.mainCategoryId === mainCat.id)
      })

      // Por cada categoría principal
      MAIN_CATEGORIES.forEach(mainCat => {
        const subs = subcategoriesByMain[mainCat.id] || []
        const mainCatStartRow = currentRow
        const subsStartRow = currentRow + 1
        const subsEndRow = subsStartRow + subs.length - 1

        // Fila de categoría principal (con FÓRMULAS)
        rows.push([
          `${mainCat.icon} ${mainCat.name}`,
          '',
          subs.length > 0 ? `=SUM(C${subsStartRow}:C${subsEndRow})` : 0, // Presupuesto = suma de subcategorías
          subs.length > 0 ? `=SUM(D${subsStartRow}:D${subsEndRow})` : 0, // Gastado = suma de subcategorías
          `=C${currentRow}-D${currentRow}`, // Disponible
          `=IF(C${currentRow}>0; D${currentRow}/C${currentRow}; 0)`, // % Usado
          totalIncome > 0 ? `=IF($C$3>0; C${currentRow}/$C$3; 0)` : 'N/A', // % del Ingreso (ref a fila ingreso)
          `=IF(F${currentRow}>=1; "🔴 Excedido"; IF(F${currentRow}>=0,9; "🟡 Crítico"; IF(F${currentRow}>=0,75; "🟠 Alto"; "🟢 OK")))` // Estado
        ])
        currentRow++

        // Subcategorías (con FÓRMULAS)
        subs.forEach(sub => {
          const subcatBudget = sub.budget || 0
          const subcatSpent = spendingBySubcategory[sub.name] || 0

          rows.push([
            '',
            `  ${sub.icon} ${sub.name}`,
            subcatBudget, // Presupuesto (valor editable)
            subcatSpent, // Gastado (valor calculado desde la app)
            `=C${currentRow}-D${currentRow}`, // Disponible
            `=IF(C${currentRow}>0; D${currentRow}/C${currentRow}; 0)`, // % Usado
            totalIncome > 0 ? `=IF($C$3>0; C${currentRow}/$C$3; 0)` : 'N/A', // % del Ingreso
            `=IF(F${currentRow}>=1; "🔴 Excedido"; IF(F${currentRow}>=0,9; "🟡 Crítico"; IF(F${currentRow}>=0,75; "🟠 Alto"; "🟢 OK")))` // Estado
          ])
          currentRow++
        })

        rows.push(['', '', '', '', '', '', '', '']) // Separador (8 columnas)
        currentRow++
      })

      // Limpiar hoja de presupuesto
      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: 'Presupuesto!A2:H1000'
      })

      // Escribir nuevos datos
      if (rows.length > 0) {
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Presupuesto!A2:H${rows.length + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: rows
          }
        })
      }

      // Aplicar formato de porcentaje a las columnas F (% Usado) y G (% del Ingreso)
      try {
        // Obtener sheetId de la hoja Presupuesto
        const response = await gapi.client.sheets.spreadsheets.get({
          spreadsheetId: this.spreadsheetId
        })
        const sheet = response.result.sheets.find(s => s.properties.title === 'Presupuesto')

        if (sheet) {
          const sheetId = sheet.properties.sheetId

          // Aplicar formato de porcentaje a columnas F y G
          await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
              requests: [
                // Formatear columna F (% Usado) como porcentaje
                {
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: 1, // Desde fila 2
                      endRowIndex: rows.length + 2, // Hasta última fila con datos
                      startColumnIndex: 5, // Columna F
                      endColumnIndex: 6
                    },
                    cell: {
                      userEnteredFormat: {
                        numberFormat: {
                          type: 'PERCENT',
                          pattern: '0.00%'
                        }
                      }
                    },
                    fields: 'userEnteredFormat.numberFormat'
                  }
                },
                // Formatear columna G (% del Ingreso) como porcentaje
                {
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: 1, // Desde fila 2
                      endRowIndex: rows.length + 2, // Hasta última fila con datos
                      startColumnIndex: 6, // Columna G
                      endColumnIndex: 7
                    },
                    cell: {
                      userEnteredFormat: {
                        numberFormat: {
                          type: 'PERCENT',
                          pattern: '0.00%'
                        }
                      }
                    },
                    fields: 'userEnteredFormat.numberFormat'
                  }
                }
              ]
            }
          })
          console.log('✅ Formato de porcentaje aplicado a columnas F y G')
        }
      } catch (error) {
        console.warn('⚠️ Error aplicando formato de porcentaje:', error)
        // No lanzar error, el formateo es opcional
      }

      // Calcular total de presupuesto (suma de todas las subcategorías)
      const totalBudget = subcategories.reduce((sum, sub) => sum + (sub.budget || 0), 0)

      // Actualizar configuración con ingreso y presupuesto
      const configUpdates = [
        ['Ingreso Mensual', totalIncome],
        ['Presupuesto Total', totalBudget]
      ]

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Configuración!A5:B6',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: configUpdates
        }
      })

      console.log('✅ Presupuesto sincronizado a Sheets')
      return true

    } catch (error) {
      console.error('❌ Error sincronizando presupuesto:', error)
      throw error
    }
  }

  /**
   * Leer ingresos desde Google Sheets
   */
  async readIncomesFromSheets() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('💵 Leyendo ingresos desde Google Sheets...')

    try {
      // Verificar si la hoja existe
      const exists = await this.sheetExists('Ingresos')
      if (!exists) {
        console.log('ℹ️ Hoja "Ingresos" no existe, creándola...')
        await this.createSheet('Ingresos')

        // Inicializar headers
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Ingresos!A1:E1',
          valueInputOption: 'RAW',
          resource: {
            values: [['ID', 'Mes', 'Concepto', 'Monto', 'Descripción']]
          }
        })

        return []
      }

      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Ingresos!A2:E1000'
      })

      const rows = response.result.values || []
      const incomes = rows.map(row => ({
        id: row[0],
        month: row[1],
        concept: row[2],
        amount: parseFloat(row[3]) || 0,
        description: row[4] || ''
      }))

      console.log(`✅ ${incomes.length} ingresos leídos desde Sheets`)
      return incomes

    } catch (error) {
      console.error('❌ Error leyendo ingresos:', error)
      throw error
    }
  }

  /**
   * Escribir ingresos a Google Sheets
   */
  async writeIncomesToSheets(incomes) {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log(`💵 Escribiendo ${incomes.length} ingresos a Sheets...`)

    try {
      // Verificar si la hoja existe
      const exists = await this.sheetExists('Ingresos')
      if (!exists) {
        console.log('ℹ️ Hoja "Ingresos" no existe, creándola...')
        await this.createSheet('Ingresos')

        // Inicializar headers
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'Ingresos!A1:E1',
          valueInputOption: 'RAW',
          resource: {
            values: [['ID', 'Mes', 'Concepto', 'Monto', 'Descripción']]
          }
        })
      }

      // Preparar datos
      const rows = incomes.map(income => [
        income.id,
        income.month,
        income.concept,
        income.amount,
        income.description || ''
      ])

      // Limpiar hoja (mantener header)
      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: 'Ingresos!A2:E1000'
      })

      // Escribir nuevos datos
      if (rows.length > 0) {
        await gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `Ingresos!A2:E${rows.length + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: rows
          }
        })
      }

      console.log(`✅ ${incomes.length} ingresos escritos a Sheets`)
      return true

    } catch (error) {
      console.error('❌ Error escribiendo ingresos:', error)
      throw error
    }
  }

  /**
   * 🔄 RESTAURAR TODOS LOS DATOS DESDE GOOGLE SHEETS
   *
   * Lee todos los datos desde Google Sheets y los retorna para ser guardados en IndexedDB.
   * Útil para sincronizar un nuevo dispositivo o recuperar datos.
   *
   * ⚠️ IMPORTANTE: Este método NO modifica IndexedDB directamente.
   * Retorna los datos para que StorageService los importe.
   */
  async restoreAllFromSheets() {
    if (!this.spreadsheetId) {
      throw new Error('No hay spreadsheet activo')
    }

    console.log('📥 Restaurando todos los datos desde Google Sheets...')

    try {
      const restoredData = {
        config: {},
        expenses: [],
        subcategories: [],
        budgets: {},
        incomes: []
      }

      // 1. Leer configuración
      console.log('   → Leyendo configuración...')
      const config = await this.readConfig()
      restoredData.config = config

      // 2. Leer gastos del mes actual
      console.log('   → Leyendo gastos del mes actual...')
      const currentExpenses = await this.readCurrentMonthExpenses()
      restoredData.expenses = currentExpenses.map(exp => ({
        id: exp.id,
        date: exp.date,
        category: exp.category,
        subcategory: exp.subcategory,
        description: exp.description,
        amount: exp.amount,
        notes: exp.notes,
        month: this.getCurrentMonth(),
        synced: true,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      // 3. Leer presupuestos desde hoja "Presupuesto"
      console.log('   → Leyendo presupuestos...')
      const budgetData = await this.readBudgetFromSheets()

      // Importar DEFAULT_SUBCATEGORIES para estructura
      const { DEFAULT_SUBCATEGORIES } = await import('../models/CategoryNew.js')

      // Reconstruir subcategorías con presupuestos desde el Sheet
      console.log('   → Reconstruyendo subcategorías con presupuestos...')
      restoredData.subcategories = DEFAULT_SUBCATEGORIES.map(defaultSub => {
        // Buscar presupuesto por nombre exacto
        let budget = budgetData.subcategoryBudgets[defaultSub.name] || 0

        // Si no se encuentra, intentar buscar sin tener en cuenta espacios extras
        if (budget === 0) {
          const normalizedName = defaultSub.name.trim().toLowerCase()
          const matchingKey = Object.keys(budgetData.subcategoryBudgets).find(key =>
            key.trim().toLowerCase() === normalizedName
          )
          if (matchingKey) {
            budget = budgetData.subcategoryBudgets[matchingKey]
            console.log(`   ✅ Presupuesto encontrado para "${defaultSub.name}": ${budget} (match: "${matchingKey}")`)
          }
        } else {
          console.log(`   ✅ Presupuesto restaurado: "${defaultSub.name}" = ${budget}`)
        }

        return {
          id: defaultSub.id || crypto.randomUUID(),
          mainCategoryId: defaultSub.mainCategoryId,
          name: defaultSub.name,
          icon: defaultSub.icon,
          budget: budget,
          details: defaultSub.details || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })

      // Guardar presupuesto del mes actual
      const currentMonth = this.getCurrentMonth()
      const subcategoryBudgets = {}
      restoredData.subcategories.forEach(sub => {
        subcategoryBudgets[sub.id] = sub.budget
      })

      restoredData.budgets[currentMonth] = {
        month: currentMonth,
        total: budgetData.totalIncome,
        subcategories: subcategoryBudgets,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 4. Leer ingresos desde hoja "Ingresos"
      console.log('   → Leyendo ingresos...')
      const allIncomes = await this.readIncomesFromSheets()

      // Filtrar solo los ingresos del mes actual
      restoredData.incomes = allIncomes
        .filter(income => income.month === currentMonth)
        .map(income => ({
          id: income.id,
          month: income.month,
          concept: income.concept,
          amount: income.amount,
          description: income.description,
          createdAt: new Date().toISOString()
        }))

      console.log(`✅ Datos restaurados desde Sheets:`)
      console.log(`   - ${restoredData.expenses.length} gastos`)
      console.log(`   - ${restoredData.subcategories.length} subcategorías`)
      console.log(`   - ${restoredData.incomes.length} ingresos`)
      console.log(`   - Presupuesto total: ${budgetData.totalIncome}`)

      return restoredData

    } catch (error) {
      console.error('❌ Error restaurando datos desde Sheets:', error)
      throw error
    }
  }

  /**
   * Utilidades
   */
  getCurrentMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  getNextMonth() {
    const now = new Date()
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  }
}

// Exportar instancia única (singleton)
const googleSheetsService = new GoogleSheetsService()
export default googleSheetsService
