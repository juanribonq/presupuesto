/**
 * App Presupuesto Personal
 * Punto de entrada principal
 */

// Importar configuración
import { GOOGLE_CONFIG } from './config/google-api.js'

// Importar servicios
import authService from './services/AuthService.js'
import storageService from './services/StorageService.js'
import googleSheetsService from './services/GoogleSheetsService.js'
import eventBus from './utils/EventBus.js'

// Importar modelos
import Expense from './models/Expense.js'
import { Category, DEFAULT_CATEGORIES } from './models/Category.js'
import { Subcategory, MAIN_CATEGORIES, DEFAULT_SUBCATEGORIES } from './models/CategoryNew.js'
import Income from './models/Income.js'
import { Budget, BudgetStats } from './models/Budget.js'

// Importar utilidades
import { formatCurrency, formatDate, formatMonth, getCurrentMonth } from './utils/helpers.js'

// Estado global de la app
const appState = {
  initialized: false,
  authenticated: false,
  servicesReady: false,
  currentView: 'dashboard',
  user: null,
  currentMonthStats: null,
  categories: [], // Mantenido para compatibilidad
  subcategories: [], // Nueva estructura
  incomes: [], // Ingresos del mes
  spreadsheetConnected: false
}

/**
 * Inicializar aplicación
 */
async function initApp() {
  console.log('🚀 Iniciando App Presupuesto...')

  try {
    // Verificar configuración
    if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.apiKey) {
      showError('Configuración incompleta. Por favor configura las variables de entorno.')
      console.error('⚠️ Variables de entorno faltantes. Revisa el archivo .env.local')
      return
    }

    // Mostrar loading
    showLoading(true)

    // Inicializar servicios de autenticación
    const isAuthenticated = await authService.init()

    appState.initialized = true
    console.log('✅ App inicializada correctamente')

    // Verificar autenticación
    if (isAuthenticated) {
      appState.authenticated = true
      appState.user = authService.getUser()
      await initServices()
      await showDashboard()
    } else {
      showLoginScreen()
    }

  } catch (error) {
    console.error('❌ Error inicializando app:', error)
    showError('Error al inicializar la aplicación. Por favor recarga la página.')
  } finally {
    showLoading(false)
  }
}

/**
 * Inicializar servicios de datos
 */
async function initServices() {
  console.log('⚙️ Inicializando servicios de datos...')

  try {
    // Inicializar IndexedDB
    await storageService.init()

    // Cargar subcategorías (nueva estructura)
    let subcategories = await storageService.getAllSubcategories()
    console.log(`📦 Subcategorías cargadas desde IndexedDB: ${subcategories.length}`)

    if (subcategories.length === 0) {
      console.log('📦 Creando subcategorías por defecto...')
      for (const subcatData of DEFAULT_SUBCATEGORIES) {
        const subcat = new Subcategory(subcatData)
        await storageService.addSubcategory(subcat.toJSON())
      }
      subcategories = await storageService.getAllSubcategories()
      console.log(`✅ Subcategorías creadas: ${subcategories.length}`)
    }

    // Mostrar presupuestos de cada subcategoría al cargar
    console.log('💰 Presupuestos actuales:')
    subcategories.forEach(sub => {
      console.log(`  - ${sub.icon} ${sub.name}: ${sub.budget || 0}`)
    })

    appState.subcategories = subcategories

    // Mantener categorías viejas para compatibilidad (si existen)
    let categories = await storageService.getAllCategories()
    appState.categories = categories

    // Cargar ingresos del mes actual
    const incomes = await storageService.getCurrentMonthIncomes()
    appState.incomes = incomes

    // Intentar conectar a Google Sheets
    try {
      const hasSpreadsheet = await googleSheetsService.init()
      appState.spreadsheetConnected = hasSpreadsheet
      console.log(hasSpreadsheet ? '✅ Conectado a Google Sheets' : 'ℹ️ Sin spreadsheet conectado')
    } catch (error) {
      console.warn('⚠️ Error conectando a Google Sheets:', error)
    }

    appState.servicesReady = true
    console.log('✅ Servicios de datos listos')

  } catch (error) {
    console.error('❌ Error inicializando servicios:', error)
    throw error
  }
}

/**
 * Cargar datos del mes actual
 */
async function loadCurrentMonthData() {
  try {
    const currentMonth = getCurrentMonth()
    const expenses = await storageService.getCurrentMonthExpenses()
    const budget = await storageService.getCurrentBudget()

    // Si no hay presupuesto, crear uno vacío
    if (!budget) {
      const newBudget = new Budget({ month: currentMonth, total: 0 })
      await storageService.saveBudget(currentMonth, newBudget.toJSON())
    }

    // Calcular estadísticas
    const stats = await storageService.getMonthStats(currentMonth)

    // Agregar total de ingresos a las stats
    const totalIncome = await storageService.getCurrentMonthTotalIncome()
    stats.totalIncome = totalIncome

    // Calcular presupuesto total real (suma de presupuestos de subcategorías)
    const subcategories = await storageService.getAllSubcategories()
    const totalBudget = subcategories.reduce((sum, sub) => sum + (sub.budget || 0), 0)
    stats.totalBudget = totalBudget
    stats.budgetTotal = totalBudget // Mantener compatibilidad

    appState.currentMonthStats = stats

    console.log(`📊 Datos cargados: ${expenses.length} gastos, ingresos: ${totalIncome}, presupuesto: ${totalBudget}`)
    return stats

  } catch (error) {
    console.error('❌ Error cargando datos:', error)
    return null
  }
}

/**
 * Mostrar/ocultar loading screen
 */
function showLoading(show) {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    loadingScreen.style.display = show ? 'flex' : 'none'
  }
}

/**
 * Mostrar pantalla de login
 */
function showLoginScreen() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')
  const fab = document.getElementById('fab')

  // Ocultar elementos
  header.style.display = 'none'
  content.style.display = 'block'
  bottomNav.style.display = 'none'
  if (fab) fab.style.display = 'none'

  // Pantalla de login
  content.innerHTML = `
    <div class="container" style="padding-top: 4rem;">
      <div class="card" style="text-align: center; padding: 3rem 2rem; max-width: 400px; margin: 0 auto;">
        <div style="font-size: 64px; margin-bottom: 1rem;">💰</div>
        <h1 style="font-size: 28px; font-weight: 600; margin-bottom: 0.5rem;">
          App Presupuesto
        </h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Gestiona tu presupuesto personal
        </p>

        <div class="divider" style="margin: 2rem 0;"></div>

        <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 14px;">
          Para comenzar, inicia sesión con tu cuenta de Google.<br>
          Tus datos se sincronizarán con Google Sheets.
        </p>

        <button id="login-btn" class="btn btn-primary btn-block" style="gap: 0.5rem;">
          <span style="font-size: 20px;">🔐</span>
          Iniciar sesión con Google
        </button>

        <p style="margin-top: 2rem; font-size: 12px; color: var(--text-tertiary);">
          Al iniciar sesión, aceptas que la app acceda a tus Google Sheets
        </p>
      </div>
    </div>
  `

  showLoading(false)

  // Agregar event listener al botón
  const loginBtn = document.getElementById('login-btn')
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin)
  }
}

/**
 * Mostrar dashboard
 */
async function showDashboard() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')
  const fab = document.getElementById('fab')

  // Mostrar elementos
  header.style.display = 'flex'
  content.style.display = 'block'
  bottomNav.style.display = 'flex'
  if (fab) fab.style.display = 'flex'

  // Cargar datos
  showLoading(true)
  const stats = await loadCurrentMonthData()
  showLoading(false)

  const user = authService.getUser()

  // Verificar si hay spreadsheet conectado
  const sheetStatus = appState.spreadsheetConnected
    ? `<div class="badge badge-success">📊 Conectado a Google Sheets</div>`
    : `<button id="connect-sheet-btn" class="btn btn-secondary btn-sm">
         Conectar Google Sheets
       </button>`

  // Dashboard
  content.innerHTML = `
    <div class="container" style="padding-top: 1rem; padding-bottom: 5rem;">

      <!-- Header de usuario -->
      <div class="card" style="margin-bottom: 1rem; padding: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 32px;">👤</div>
            <div>
              <div style="font-weight: 600; font-size: 14px;">
                ${user?.name || 'Usuario'}
              </div>
              <div style="font-size: 12px; color: var(--text-secondary);">
                ${user?.email || ''}
              </div>
            </div>
          </div>
          <div>
            ${sheetStatus}
          </div>
        </div>
      </div>

      <!-- Ingresos del mes -->
      <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div style="font-size: 16px; font-weight: 600;">💵 Ingresos del Mes</div>
          <button id="manage-income-btn" class="btn btn-primary btn-sm">+ Agregar</button>
        </div>
        ${appState.incomes.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
            ${appState.incomes.map(income => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 8px;">
                <div>
                  <div style="font-weight: 500; font-size: 14px;">${income.concept}</div>
                  ${income.description ? `<div style="font-size: 12px; color: var(--text-secondary);">${income.description}</div>` : ''}
                </div>
                <div style="font-weight: 700; font-size: 16px; color: var(--color-success);">
                  ${formatCurrency(income.amount)}
                </div>
              </div>
            `).join('')}
          </div>
          <div style="text-align: center; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="font-size: 12px; color: var(--text-secondary);">TOTAL INGRESOS</div>
            <div style="font-size: 28px; font-weight: 700; color: var(--color-success);">
              ${formatCurrency(appState.incomes.reduce((sum, inc) => sum + inc.amount, 0))}
            </div>
          </div>
        ` : `
          <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
            <div style="font-size: 32px; margin-bottom: 0.5rem;">💰</div>
            <div style="font-size: 14px;">Sin ingresos registrados</div>
            <div style="font-size: 12px; margin-top: 0.5rem;">Agrega tus fuentes de ingreso del mes</div>
          </div>
        `}
      </div>

      <!-- Resumen del mes -->
      <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
        <div style="text-align: center;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
            TOTAL GASTADO EN ${stats?.month?.toUpperCase() || getCurrentMonth()}
          </div>
          <div style="font-size: 36px; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
            ${formatCurrency(stats?.totalSpent || 0)}
          </div>
          ${stats?.totalBudget > 0 ? `
            <div style="font-size: 14px; color: var(--text-secondary);">
              de ${formatCurrency(stats.totalBudget)} presupuestados
            </div>
            <div style="margin-top: 1rem;">
              <div style="background: var(--bg-secondary); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: ${getBudgetColor((stats.totalSpent / stats.totalBudget) * 100)}; height: 100%; width: ${Math.min((stats.totalSpent / stats.totalBudget) * 100, 100)}%; transition: width 0.3s;"></div>
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 0.5rem;">
                ${((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}% del presupuesto
              </div>
            </div>
          ` : `
            <div style="font-size: 14px; color: var(--text-tertiary); margin-top: 1rem;">
              Sin presupuesto configurado
            </div>
          `}
        </div>
        ${stats?.expenseCount > 0 ? `
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <button id="close-month-btn" class="btn btn-secondary btn-block" style="font-size: 14px;">
              📦 Cerrar Mes Actual
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Estadísticas rápidas -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
        <div class="card" style="padding: 1rem; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 0.5rem;">📝</div>
          <div style="font-size: 24px; font-weight: 700;">${stats?.expenseCount || 0}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Gastos</div>
        </div>
        <div class="card" style="padding: 1rem; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 0.5rem;">📊</div>
          <div style="font-size: 24px; font-weight: 700;">${Object.keys(stats?.byCategory || {}).length}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">Categorías</div>
        </div>
      </div>

      <!-- Gastos por categoría -->
      ${Object.keys(stats?.byCategory || {}).length > 0 ? `
        <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 1rem;">
            Gastos por Categoría
          </h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, amount]) => {
                // Buscar icono desde categoría principal (MAIN_CATEGORIES)
                const mainCat = MAIN_CATEGORIES.find(c => c.name === category)
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 20px;">${mainCat?.icon || '📁'}</span>
                      <span style="font-size: 14px;">${category}</span>
                    </div>
                    <div style="font-weight: 600; font-size: 14px;">
                      ${formatCurrency(amount)}
                    </div>
                  </div>
                `
              }).join('')}
          </div>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">Sin gastos registrados</div>
          <div class="empty-state-description">
            Comienza agregando tu primer gasto
          </div>
        </div>
      `}

      <!-- Últimos gastos -->
      ${stats?.expenses?.length > 0 ? `
        <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 1rem;">
            Últimos Gastos
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${stats.expenses
              .slice(-5)
              .reverse()
              .map(expense => {
                const subcat = appState.subcategories.find(s => s.name === expense.subcategory)
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 20px;">${subcat?.icon || '📁'}</span>
                      <div>
                        <div style="font-size: 14px; font-weight: 500;">
                          ${expense.description || expense.category}
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                          ${formatDate(expense.date)}
                        </div>
                      </div>
                    </div>
                    <div style="font-weight: 600; font-size: 14px;">
                      ${formatCurrency(expense.amount)}
                    </div>
                  </div>
                `
              }).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `

  // Event listeners
  const connectSheetBtn = document.getElementById('connect-sheet-btn')
  if (connectSheetBtn) {
    connectSheetBtn.addEventListener('click', handleConnectSheet)
  }

  const manageIncomeBtn = document.getElementById('manage-income-btn')
  if (manageIncomeBtn) {
    manageIncomeBtn.addEventListener('click', showIncomeManagement)
  }

  const closeMonthBtn = document.getElementById('close-month-btn')
  if (closeMonthBtn) {
    closeMonthBtn.addEventListener('click', showCloseMonthModal)
  }

  // Actualizar navegación
  updateNavigation('dashboard')
}

/**
 * Obtener color según porcentaje de presupuesto
 */
function getBudgetColor(percentage) {
  if (percentage >= 100) return 'var(--color-danger)'
  if (percentage >= 90) return 'var(--color-warning)'
  if (percentage >= 75) return 'var(--color-info)'
  return 'var(--color-success)'
}

/**
 * Actualizar navegación activa
 */
function updateNavigation(view) {
  const navItems = document.querySelectorAll('.bottom-nav-item')
  navItems.forEach(item => {
    if (item.dataset.view === view) {
      item.classList.add('active')
    } else {
      item.classList.remove('active')
    }
  })
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
  const content = document.getElementById('app-content')
  content.style.display = 'block'
  content.innerHTML = `
    <div class="container" style="padding-top: 2rem;">
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Error</div>
        <div class="empty-state-description">${message}</div>
        <button class="btn btn-primary" onclick="location.reload()">
          Recargar
        </button>
      </div>
    </div>
  `
}

/**
 * Mostrar toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container')

  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.innerHTML = `<span>${message}</span>`

  container.appendChild(toast)

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    toast.style.animation = 'slideInDown 0.3s ease reverse'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Manejar login
 */
function handleLogin() {
  console.log('🔐 Intentando login...')
  showLoading(true)

  try {
    authService.login()
  } catch (error) {
    console.error('❌ Error en login:', error)
    showToast('Error al iniciar sesión', 'error')
    showLoading(false)
  }
}

/**
 * Manejar logout
 */
function handleLogout() {
  console.log('🚪 Cerrando sesión...')

  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    authService.logout()
    appState.authenticated = false
    appState.user = null
    appState.servicesReady = false
    showLoginScreen()
    showToast('Sesión cerrada correctamente', 'success')
  }
}

/**
 * Conectar a Google Sheets
 */
async function handleConnectSheet() {
  console.log('📊 Conectando a Google Sheets...')

  // Advertencia importante sobre sincronización unidireccional
  const understood = confirm(
    '⚠️ IMPORTANTE: Sincronización Unidireccional\n\n' +
    'Esta app sincroniza datos SOLO desde la app hacia Google Sheets.\n\n' +
    '✅ Google Sheets actúa como BACKUP y visualización\n' +
    '❌ NO edites datos manualmente en Google Sheets\n' +
    '⚠️ Cualquier cambio manual será SOBRESCRITO\n\n' +
    'Haz todos los cambios desde la app.\n\n' +
    '¿Entendido y de acuerdo?'
  )

  if (!understood) {
    showToast('Conexión cancelada', 'info')
    return
  }

  const create = confirm(
    '¿Quieres crear un nuevo Google Sheet?\n\n' +
    'SI = Crear nuevo\n' +
    'NO = Conectar a uno existente'
  )

  try {
    showLoading(true)

    if (create) {
      // Crear nuevo spreadsheet
      await googleSheetsService.createSpreadsheet('Presupuesto Personal')
      showToast('Google Sheet creado correctamente', 'success')
    } else {
      // Conectar a existente
      const spreadsheetId = prompt(
        'Ingresa el ID del Google Sheet:\n\n' +
        '⚠️ Recuerda: Cualquier dato en ese Sheet será sobrescrito'
      )
      if (spreadsheetId) {
        await googleSheetsService.connectSpreadsheet(spreadsheetId)
        showToast('Conectado a Google Sheet', 'success')
      } else {
        showLoading(false)
        return
      }
    }

    appState.spreadsheetConnected = true
    await showDashboard()

  } catch (error) {
    console.error('❌ Error conectando Sheet:', error)
    showToast('Error conectando a Google Sheets', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Setup Auth Event Listeners
 */
function setupAuthListeners() {
  // Login exitoso
  authService.on('auth:success', async (user) => {
    console.log('✅ Autenticación exitosa:', user.email)
    appState.authenticated = true
    appState.user = user
    await initServices()
    await showDashboard()
    showToast(`Bienvenido, ${user.name || user.email}!`, 'success')
  })

  // Error de autenticación
  authService.on('auth:error', (error) => {
    console.error('❌ Error de autenticación:', error)
    showToast('Error al autenticar. Intenta de nuevo.', 'error')
    showLoginScreen()
  })

  // Logout
  authService.on('auth:logout', () => {
    console.log('ℹ️ Usuario deslogueado')
  })
}

/**
 * Mostrar vista de gastos del mes
 */
async function showExpensesView() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')
  const fab = document.getElementById('fab')

  // Mostrar elementos
  header.style.display = 'flex'
  content.style.display = 'block'
  bottomNav.style.display = 'flex'
  if (fab) fab.style.display = 'flex'

  // Actualizar vista actual
  appState.currentView = 'expenses'

  // Cargar gastos
  showLoading(true)
  const expenses = await storageService.getCurrentMonthExpenses()
  showLoading(false)

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const currentMonth = getCurrentMonth()

  content.innerHTML = `
    <div class="container" style="padding-top: 1rem; padding-bottom: 5rem;">

      <!-- Header -->
      <div class="card" style="margin-bottom: 1rem; padding: 1.5rem; text-align: center;">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
          GASTOS DE ${formatMonth(currentMonth).toUpperCase()}
        </div>
        <div style="font-size: 32px; font-weight: 700; color: var(--color-primary);">
          ${formatCurrency(total)}
        </div>
        <div style="font-size: 14px; color: var(--text-secondary); margin-top: 0.5rem;">
          ${expenses.length} ${expenses.length === 1 ? 'gasto' : 'gastos'} registrados
        </div>
      </div>

      <!-- Lista de gastos -->
      ${expenses.length > 0 ? `
        <div class="card" style="padding: 0; overflow: hidden;">
          ${expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((expense, index) => {
              const subcat = appState.subcategories.find(s => s.name === expense.subcategory)
              const isLast = index === expenses.length - 1
              return `
                <div
                  class="expense-item"
                  data-expense-id="${expense.id}"
                  style="
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: ${isLast ? 'none' : '1px solid var(--border-light)'};
                    cursor: pointer;
                    transition: background var(--transition-base);
                  "
                >
                  <div style="font-size: 32px; flex-shrink: 0;">
                    ${subcat?.icon || '📁'}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 2px;">
                      ${expense.description || expense.category}
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary);">
                      ${expense.category}${expense.subcategory ? ` · ${expense.subcategory}` : ''}
                    </div>
                    <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px;">
                      ${formatDate(expense.date)}
                    </div>
                  </div>
                  <div style="text-align: right; flex-shrink: 0;">
                    <div style="font-weight: 700; font-size: 16px; color: var(--text-primary);">
                      ${formatCurrency(expense.amount)}
                    </div>
                    <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 2px;">
                      ${expense.synced ? '✓ Sync' : '○ Local'}
                    </div>
                  </div>
                </div>
              `
            }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">Sin gastos</div>
          <div class="empty-state-description">
            Toca el botón + para agregar tu primer gasto
          </div>
        </div>
      `}

    </div>
  `

  // Event listeners para cada gasto
  const expenseItems = document.querySelectorAll('.expense-item')
  expenseItems.forEach(item => {
    item.addEventListener('click', async () => {
      const expenseId = item.dataset.expenseId // UUID string, no parseInt
      await handleExpenseClick(expenseId)
    })
  })

  // Actualizar navegación
  updateNavigation('expenses')
}

/**
 * Manejar click en un gasto (mostrar opciones)
 */
async function handleExpenseClick(expenseId) {
  const expense = await storageService.getExpense(expenseId)
  if (!expense) return

  const modal = document.getElementById('modal')

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h2>Opciones</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <div class="modal-body" style="padding: 0;">
        <!-- Detalle del gasto -->
        <div style="padding: 1.5rem; background: var(--bg-secondary);">
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 48px; margin-bottom: 0.5rem;">
              ${appState.subcategories.find(s => s.name === expense.subcategory)?.icon || '📁'}
            </div>
            <div style="font-size: 28px; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
              ${formatCurrency(expense.amount)}
            </div>
            <div style="font-size: 14px; color: var(--text-secondary);">
              ${expense.description || expense.category}
            </div>
          </div>

          <div class="divider" style="margin: 1rem 0;"></div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 14px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Categoría:</span>
              <span style="font-weight: 500;">${expense.category}</span>
            </div>
            ${expense.subcategory ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Subcategoría:</span>
                <span style="font-weight: 500;">${expense.subcategory}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Fecha:</span>
              <span style="font-weight: 500;">${formatDate(expense.date)}</span>
            </div>
            ${expense.notes ? `
              <div style="margin-top: 0.5rem;">
                <div style="color: var(--text-secondary); margin-bottom: 0.25rem;">Notas:</div>
                <div style="font-weight: 500; font-size: 13px;">${expense.notes}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Opciones -->
        <div style="padding: 1rem;">
          <button id="edit-expense-btn" class="btn btn-primary btn-block" style="margin-bottom: 0.75rem;">
            ✏️ Editar Gasto
          </button>
          <button id="delete-expense-btn" class="btn btn-danger btn-block">
            🗑️ Eliminar Gasto
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button id="close-btn" class="btn btn-secondary btn-block">
          Cerrar
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  // Event listeners
  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('close-btn').addEventListener('click', hideModal)
  document.getElementById('edit-expense-btn').addEventListener('click', () => {
    hideModal()
    showExpenseForm(expense)
  })
  document.getElementById('delete-expense-btn').addEventListener('click', () => {
    handleDeleteExpense(expenseId)
  })
}

/**
 * Eliminar un gasto
 */
async function handleDeleteExpense(expenseId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
    return
  }

  try {
    showLoading(true)

    // 1. Eliminar de IndexedDB local
    await storageService.deleteExpense(expenseId)

    // 2. Si está conectado a Sheets, sincronizar la eliminación
    if (appState.spreadsheetConnected) {
      try {
        // Obtener todos los gastos actuales (ya sin el eliminado)
        const expenses = await storageService.getCurrentMonthExpenses()

        // Escribir a Sheets (sobrescribe la hoja, eliminando el gasto)
        await googleSheetsService.writeCurrentMonthExpenses(expenses)

        console.log('✅ Gasto eliminado también de Google Sheets')
        showToast('Gasto eliminado y sincronizado', 'success')
      } catch (error) {
        console.error('⚠️ Error sincronizando eliminación a Sheets:', error)
        showToast('Gasto eliminado localmente (sin sincronizar)', 'warning')
      }
    } else {
      showToast('Gasto eliminado correctamente', 'success')
    }

    hideModal()

    // Actualizar vista
    if (appState.currentView === 'expenses') {
      await showExpensesView()
    } else {
      await showDashboard()
    }
  } catch (error) {
    console.error('❌ Error eliminando gasto:', error)
    showToast('Error al eliminar el gasto', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Mostrar vista de categorías (nueva estructura de 3 niveles)
 */
async function showCategoriesView() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')
  const fab = document.getElementById('fab')

  // Mostrar elementos
  header.style.display = 'flex'
  content.style.display = 'block'
  bottomNav.style.display = 'flex'
  if (fab) fab.style.display = 'none' // No FAB en categorías

  // Actualizar vista actual
  appState.currentView = 'categories'

  // Cargar datos
  showLoading(true)
  const subcategories = await storageService.getAllSubcategories()
  const expenses = await storageService.getCurrentMonthExpenses()
  const totalIncome = await storageService.getCurrentMonthTotalIncome()
  showLoading(false)

  // Calcular gastos por subcategoría
  const spendingBySubcategory = {}
  expenses.forEach(exp => {
    const key = exp.subcategory || exp.category // Compatibilidad
    spendingBySubcategory[key] = (spendingBySubcategory[key] || 0) + exp.amount
  })

  const totalBudget = subcategories.reduce((sum, sub) => sum + (sub.budget || 0), 0)
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Agrupar subcategorías por categoría principal
  const subcategoriesByMain = {}
  MAIN_CATEGORIES.forEach(mainCat => {
    subcategoriesByMain[mainCat.id] = subcategories.filter(sub => sub.mainCategoryId === mainCat.id)
  })

  content.innerHTML = `
    <div class="container" style="padding-top: 1rem; padding-bottom: 5rem;">

      <!-- Header Resumen -->
      <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; text-align: center;">
          <div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 0.25rem;">INGRESOS</div>
            <div style="font-size: 20px; font-weight: 700; color: var(--color-success);">
              ${formatCurrency(totalIncome)}
            </div>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 0.25rem;">PRESUPUESTO</div>
            <div style="font-size: 20px; font-weight: 700; color: var(--color-primary);">
              ${formatCurrency(totalBudget)}
            </div>
          </div>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); text-align: center;">
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 0.25rem;">GASTADO</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--text-primary);">
            ${formatCurrency(totalSpent)}
          </div>
          ${totalBudget > 0 ? `
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 0.25rem;">
              ${((totalSpent/totalBudget)*100).toFixed(1)}% del presupuesto
            </div>
          ` : ''}
        </div>
        <button id="config-budget-btn" class="btn ${totalBudget === 0 ? 'btn-primary' : 'btn-secondary'} btn-block" style="margin-top: 1rem;">
          ${totalBudget === 0 ? '⚙️ Configurar Presupuesto' : '✏️ Editar Presupuesto'}
        </button>
      </div>

      <!-- Categorías Principales con Subcategorías -->
      ${MAIN_CATEGORIES.map(mainCat => {
        const subs = subcategoriesByMain[mainCat.id] || []
        const mainCatTotal = subs.reduce((sum, sub) => sum + (sub.budget || 0), 0)
        const mainCatSpent = subs.reduce((sum, sub) => {
          const subName = sub.name
          return sum + (spendingBySubcategory[subName] || 0)
        }, 0)
        const mainCatPercent = mainCatTotal > 0 ? (mainCatSpent / mainCatTotal) * 100 : 0

        return `
          <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
            <!-- Header de Categoría Principal -->
            <div style="background: ${mainCat.color}15; padding: 1rem; border-bottom: 2px solid ${mainCat.color};">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="font-size: 32px;">${mainCat.icon}</div>
                  <div>
                    <div style="font-weight: 700; font-size: 18px;">${mainCat.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                      ${subs.length} ${subs.length === 1 ? 'subcategoría' : 'subcategorías'}
                    </div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; font-size: 20px;">${formatCurrency(mainCatSpent)}</div>
                  <div style="font-size: 11px; color: var(--text-secondary);">
                    ${mainCatTotal > 0 ? `de ${formatCurrency(mainCatTotal)}` : 'Sin presupuesto'}
                  </div>
                </div>
              </div>
              ${mainCatTotal > 0 ? `
                <div style="margin-top: 0.75rem;">
                  <div style="background: var(--bg-primary); height: 6px; border-radius: 3px; overflow: hidden;">
                    <div style="background: ${mainCat.color}; height: 100%; width: ${Math.min(mainCatPercent, 100)}%; transition: width 0.3s;"></div>
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 0.25rem; text-align: center;">
                    ${mainCatPercent.toFixed(1)}% usado
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Subcategorías -->
            <div style="padding: 0.5rem;">
              ${subs.length > 0 ? subs.map(sub => {
                const subSpent = spendingBySubcategory[sub.name] || 0
                const subBudget = sub.budget || 0
                const subPercent = subBudget > 0 ? (subSpent / subBudget) * 100 : 0
                const statusColor = subPercent >= 100 ? 'var(--color-danger)' :
                                   subPercent >= 90 ? 'var(--color-warning)' :
                                   subPercent >= 75 ? 'var(--color-info)' :
                                   'var(--color-success)'

                return `
                  <div class="subcategory-item" data-subcategory-id="${sub.id}"
                       style="padding: 0.75rem; cursor: pointer; border-radius: 8px; margin-bottom: 0.5rem; transition: background 0.2s;"
                       onmouseover="this.style.background='var(--bg-secondary)'"
                       onmouseout="this.style.background='transparent'">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="font-size: 24px;">${sub.icon}</div>
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">
                          ${sub.name}
                        </div>
                        ${sub.details?.length > 0 ? `
                          <div style="font-size: 11px; color: var(--text-tertiary);">
                            ${sub.details.slice(0, 3).join(', ')}${sub.details.length > 3 ? '...' : ''}
                          </div>
                        ` : ''}
                        ${subBudget > 0 ? `
                          <div style="margin-top: 4px;">
                            <div style="background: var(--bg-secondary); height: 4px; border-radius: 2px; overflow: hidden;">
                              <div style="background: ${statusColor}; height: 100%; width: ${Math.min(subPercent, 100)}%; transition: width 0.3s;"></div>
                            </div>
                            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 2px;">
                              ${formatCurrency(subSpent)} / ${formatCurrency(subBudget)}
                            </div>
                          </div>
                        ` : `
                          <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 2px;">
                            Sin presupuesto
                          </div>
                        `}
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 16px; color: ${statusColor};">
                          ${formatCurrency(subSpent)}
                        </div>
                      </div>
                    </div>
                  </div>
                `
              }).join('') : `
                <div style="text-align: center; padding: 1.5rem; color: var(--text-tertiary);">
                  <div style="font-size: 12px;">Sin subcategorías</div>
                </div>
              `}
            </div>

            <!-- Footer: Botón agregar subcategoría -->
            <div style="padding: 0.75rem; border-top: 1px solid var(--border-light);">
              <button class="btn btn-secondary btn-sm btn-block add-subcategory-btn" data-main-category-id="${mainCat.id}">
                + Agregar Subcategoría
              </button>
            </div>
          </div>
        `
      }).join('')}

    </div>
  `

  // Event listeners
  const configBudgetBtn = document.getElementById('config-budget-btn')
  if (configBudgetBtn) {
    configBudgetBtn.addEventListener('click', showBudgetConfig)
  }

  // Click en subcategorías
  const subcategoryItems = document.querySelectorAll('.subcategory-item')
  subcategoryItems.forEach(item => {
    item.addEventListener('click', async () => {
      const subcategoryId = item.dataset.subcategoryId
      await handleSubcategoryClick(subcategoryId)
    })
  })

  // Botones de agregar subcategoría
  const addSubcategoryBtns = document.querySelectorAll('.add-subcategory-btn')
  addSubcategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mainCategoryId = btn.dataset.mainCategoryId
      showSubcategoryForm(null, mainCategoryId)
    })
  })

  // Actualizar navegación
  updateNavigation('categories')
}

/**
 * Manejar click en una subcategoría
 */
async function handleSubcategoryClick(subcategoryId) {
  const subcategory = await storageService.getSubcategory(subcategoryId)
  if (!subcategory) return

  const expenses = await storageService.getCurrentMonthExpenses()
  const subcategoryExpenses = expenses.filter(exp =>
    exp.subcategory === subcategory.name || exp.category === subcategory.name
  )
  const spent = subcategoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const mainCat = MAIN_CATEGORIES.find(c => c.id === subcategory.mainCategoryId)

  const modal = document.getElementById('modal')

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 450px;">
      <div class="modal-header">
        <h2>${subcategory.icon} ${subcategory.name}</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <div class="modal-body">
        <!-- Categoría principal -->
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${mainCat.color}15; border-radius: 20px; margin-bottom: 1rem;">
          <span style="font-size: 20px;">${mainCat.icon}</span>
          <span style="font-size: 13px; font-weight: 600;">${mainCat.name}</span>
        </div>

        <!-- Stats -->
        <div style="text-align: center; padding: 1.5rem; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 1.5rem;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
            GASTADO ESTE MES
          </div>
          <div style="font-size: 32px; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
            ${formatCurrency(spent)}
          </div>
          ${subcategory.budget > 0 ? `
            <div style="font-size: 14px; color: var(--text-secondary);">
              de ${formatCurrency(subcategory.budget)} presupuestados
            </div>
            <div style="margin-top: 0.75rem;">
              <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: var(--color-primary); height: 100%; width: ${Math.min((spent/subcategory.budget)*100, 100)}%; transition: width 0.3s;"></div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Info -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
              PRESUPUESTO MENSUAL
            </div>
            <div style="font-size: 18px; font-weight: 600;">
              ${subcategory.budget > 0 ? formatCurrency(subcategory.budget) : 'No configurado'}
            </div>
          </div>

          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
              DETALLES (${subcategory.details?.length || 0})
            </div>
            ${subcategory.details?.length > 0 ? `
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${subcategory.details.map(detail => `
                  <span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 13px;">
                    ${detail}
                  </span>
                `).join('')}
              </div>
            ` : `
              <div style="color: var(--text-tertiary); font-size: 14px;">
                Sin detalles definidos
              </div>
            `}
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 0.5rem;">
              Los detalles se usan al registrar gastos para mayor precisión
            </div>
          </div>

          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
              GASTOS ESTE MES
            </div>
            <div style="font-size: 18px; font-weight: 600;">
              ${subcategoryExpenses.length} ${subcategoryExpenses.length === 1 ? 'gasto' : 'gastos'}
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
          <button id="edit-subcategory-btn" class="btn btn-primary" style="flex: 1;">
            ✏️ Editar
          </button>
          <button id="delete-subcategory-btn" class="btn btn-danger" style="flex: 1;">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('edit-subcategory-btn').addEventListener('click', () => {
    hideModal()
    showSubcategoryForm(subcategory)
  })
  document.getElementById('delete-subcategory-btn').addEventListener('click', () => {
    handleDeleteSubcategory(subcategoryId)
  })
}

/**
 * Mostrar formulario de subcategoría
 */
function showSubcategoryForm(subcategory = null, mainCategoryId = null) {
  const isEdit = subcategory !== null
  const selectedMainCategoryId = isEdit ? subcategory.mainCategoryId : mainCategoryId

  const modal = document.getElementById('modal')

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isEdit ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <form id="subcategory-form" class="modal-body">
        <!-- Categoría Principal -->
        <div class="form-group">
          <label for="main-category">Categoría Principal *</label>
          <select
            id="main-category"
            class="form-select"
            required
            ${isEdit ? 'disabled' : ''}
          >
            ${MAIN_CATEGORIES.map(mainCat => `
              <option value="${mainCat.id}" ${selectedMainCategoryId === mainCat.id ? 'selected' : ''}>
                ${mainCat.icon} ${mainCat.name}
              </option>
            `).join('')}
          </select>
          ${isEdit ? '<small class="form-hint">No se puede cambiar la categoría principal</small>' : ''}
        </div>

        <!-- Nombre -->
        <div class="form-group">
          <label for="subcat-name">Nombre *</label>
          <input
            type="text"
            id="subcat-name"
            class="form-input"
            placeholder="Ej: Transporte, Alimentación"
            required
            value="${isEdit ? subcategory.name : ''}"
            autofocus
          >
        </div>

        <!-- Icono -->
        <div class="form-group">
          <label for="subcat-icon">Icono (emoji) *</label>
          <input
            type="text"
            id="subcat-icon"
            class="form-input"
            placeholder="🚗"
            required
            value="${isEdit ? subcategory.icon : '📁'}"
            maxlength="2"
          >
          <small class="form-hint">Usa un emoji como icono</small>
        </div>

        <!-- Presupuesto mensual -->
        <div class="form-group">
          <label for="subcat-budget">Presupuesto Mensual</label>
          <input
            type="number"
            id="subcat-budget"
            class="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            value="${isEdit && subcategory.budget ? subcategory.budget : ''}"
          >
        </div>

        <!-- Detalles -->
        <div class="form-group">
          <label for="subcat-details">Detalles (separados por coma)</label>
          <textarea
            id="subcat-details"
            class="form-textarea"
            placeholder="Gasolina, Uber, Transporte Público"
            rows="3"
          >${isEdit && subcategory.details ? subcategory.details.join(', ') : ''}</textarea>
          <small class="form-hint">Los detalles ayudan a especificar gastos. Son opcionales.</small>
        </div>
      </form>

      <div class="modal-footer">
        <button id="cancel-btn" class="btn btn-secondary">
          Cancelar
        </button>
        <button id="save-subcategory-btn" class="btn btn-primary">
          ${isEdit ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('cancel-btn').addEventListener('click', hideModal)
  document.getElementById('save-subcategory-btn').addEventListener('click', () => handleSaveSubcategory(isEdit ? subcategory.id : null, selectedMainCategoryId))
}

/**
 * Guardar subcategoría
 */
async function handleSaveSubcategory(subcategoryId = null, defaultMainCategoryId = null) {
  const form = document.getElementById('subcategory-form')

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const detailsText = document.getElementById('subcat-details').value.trim()
  const details = detailsText ? detailsText.split(',').map(s => s.trim()).filter(s => s) : []

  const subcategoryData = {
    mainCategoryId: subcategoryId ? undefined : (document.getElementById('main-category').value || defaultMainCategoryId),
    name: document.getElementById('subcat-name').value.trim(),
    icon: document.getElementById('subcat-icon').value.trim() || '📁',
    budget: parseFloat(document.getElementById('subcat-budget').value) || 0,
    details
  }

  // Si es edición, mantener mainCategoryId original
  if (subcategoryId) {
    const existing = await storageService.getSubcategory(subcategoryId)
    subcategoryData.mainCategoryId = existing.mainCategoryId
  }

  try {
    showLoading(true)

    if (subcategoryId) {
      await storageService.updateSubcategory(subcategoryId, subcategoryData)
      showToast('Subcategoría actualizada', 'success')
    } else {
      const subcat = new Subcategory(subcategoryData)
      await storageService.addSubcategory(subcat.toJSON())
      showToast('Subcategoría creada', 'success')
    }

    // Recargar subcategorías en appState
    appState.subcategories = await storageService.getAllSubcategories()

    hideModal()
    await showCategoriesView()

  } catch (error) {
    console.error('❌ Error guardando subcategoría:', error)
    showToast('Error al guardar la subcategoría', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Eliminar subcategoría
 */
async function handleDeleteSubcategory(subcategoryId) {
  const subcategory = await storageService.getSubcategory(subcategoryId)
  const expenses = await storageService.getCurrentMonthExpenses()
  const hasExpenses = expenses.some(exp => exp.subcategory === subcategory.name || exp.category === subcategory.name)

  if (hasExpenses) {
    if (!confirm(`La subcategoría "${subcategory.name}" tiene gastos asociados. Si la eliminas, esos gastos quedarán sin subcategoría. ¿Continuar?`)) {
      return
    }
  } else {
    if (!confirm(`¿Eliminar la subcategoría "${subcategory.name}"?`)) {
      return
    }
  }

  try {
    showLoading(true)
    await storageService.deleteSubcategory(subcategoryId)

    // Recargar subcategorías
    appState.subcategories = await storageService.getAllSubcategories()

    hideModal()
    showToast('Subcategoría eliminada', 'success')
    await showCategoriesView()

  } catch (error) {
    console.error('❌ Error eliminando subcategoría:', error)
    showToast('Error al eliminar la subcategoría', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Manejar click en una categoría (LEGACY - para compatibilidad)
 */
async function handleCategoryClick(categoryId) {
  const category = await storageService.getCategory(categoryId)
  if (!category) return

  const expenses = await storageService.getCurrentMonthExpenses()
  const categoryExpenses = expenses.filter(exp => exp.category === category.name)
  const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  const modal = document.getElementById('modal')

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 450px;">
      <div class="modal-header">
        <h2>${category.icon} ${category.name}</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <div class="modal-body">
        <!-- Stats -->
        <div style="text-align: center; padding: 1.5rem; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 1.5rem;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
            GASTADO ESTE MES
          </div>
          <div style="font-size: 32px; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
            ${formatCurrency(spent)}
          </div>
          ${category.budget > 0 ? `
            <div style="font-size: 14px; color: var(--text-secondary);">
              de ${formatCurrency(category.budget)} presupuestados
            </div>
            <div style="margin-top: 0.75rem;">
              <div style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: var(--color-primary); height: 100%; width: ${Math.min((spent/category.budget)*100, 100)}%; transition: width 0.3s;"></div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Info -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
              PRESUPUESTO MENSUAL
            </div>
            <div style="font-size: 18px; font-weight: 600;">
              ${category.budget > 0 ? formatCurrency(category.budget) : 'No configurado'}
            </div>
          </div>

          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
              SUBCATEGORÍAS (${category.subcategories?.length || 0})
            </div>
            ${category.subcategories?.length > 0 ? `
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${category.subcategories.map(sub => `
                  <span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 13px;">
                    ${sub}
                  </span>
                `).join('')}
              </div>
            ` : `
              <div style="color: var(--text-tertiary); font-size: 14px;">
                Sin subcategorías
              </div>
            `}
          </div>

          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">
              GASTOS ESTE MES
            </div>
            <div style="font-size: 18px; font-weight: 600;">
              ${categoryExpenses.length} ${categoryExpenses.length === 1 ? 'gasto' : 'gastos'}
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
          <button id="edit-category-btn" class="btn btn-primary" style="flex: 1;">
            ✏️ Editar
          </button>
          <button id="delete-category-btn" class="btn btn-danger" style="flex: 1;">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('edit-category-btn').addEventListener('click', () => {
    hideModal()
    showCategoryForm(category)
  })
  document.getElementById('delete-category-btn').addEventListener('click', () => {
    handleDeleteCategory(categoryId)
  })
}

/**
 * Mostrar formulario de categoría
 */
function showCategoryForm(category = null) {
  const isEdit = category !== null
  const modal = document.getElementById('modal')

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <form id="category-form" class="modal-body">
        <!-- Nombre -->
        <div class="form-group">
          <label for="cat-name">Nombre *</label>
          <input
            type="text"
            id="cat-name"
            class="form-input"
            placeholder="Ej: Transporte"
            required
            value="${isEdit ? category.name : ''}"
            autofocus
          >
        </div>

        <!-- Icono -->
        <div class="form-group">
          <label for="cat-icon">Icono (emoji) *</label>
          <input
            type="text"
            id="cat-icon"
            class="form-input"
            placeholder="🚗"
            required
            value="${isEdit ? category.icon : '📁'}"
            maxlength="2"
          >
          <small class="form-hint">Usa un emoji como icono</small>
        </div>

        <!-- Color -->
        <div class="form-group">
          <label for="cat-color">Color</label>
          <input
            type="color"
            id="cat-color"
            class="form-input"
            value="${isEdit ? category.color : '#6366f1'}"
            style="height: 50px; padding: 0.25rem;"
          >
        </div>

        <!-- Presupuesto mensual -->
        <div class="form-group">
          <label for="cat-budget">Presupuesto Mensual</label>
          <input
            type="number"
            id="cat-budget"
            class="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            value="${isEdit && category.budget ? category.budget : ''}"
          >
        </div>

        <!-- Subcategorías -->
        <div class="form-group">
          <label for="cat-subcategories">Subcategorías (separadas por coma)</label>
          <textarea
            id="cat-subcategories"
            class="form-textarea"
            placeholder="Gasolina, Uber, Transporte Público"
            rows="3"
          >${isEdit && category.subcategories ? category.subcategories.join(', ') : ''}</textarea>
          <small class="form-hint">Opcional. Escribe cada subcategoría separada por comas</small>
        </div>
      </form>

      <div class="modal-footer">
        <button id="cancel-btn" class="btn btn-secondary">
          Cancelar
        </button>
        <button id="save-category-btn" class="btn btn-primary">
          ${isEdit ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('cancel-btn').addEventListener('click', hideModal)
  document.getElementById('save-category-btn').addEventListener('click', () => handleSaveCategory(isEdit ? category.id : null))
}

/**
 * Guardar o actualizar categoría
 */
async function handleSaveCategory(categoryId = null) {
  const form = document.getElementById('category-form')

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const subcategoriesText = document.getElementById('cat-subcategories').value.trim()
  const subcategories = subcategoriesText ? subcategoriesText.split(',').map(s => s.trim()).filter(s => s) : []

  const categoryData = {
    name: document.getElementById('cat-name').value.trim(),
    icon: document.getElementById('cat-icon').value.trim() || '📁',
    color: document.getElementById('cat-color').value,
    budget: parseFloat(document.getElementById('cat-budget').value) || 0,
    subcategories
  }

  try {
    showLoading(true)

    if (categoryId) {
      await storageService.updateCategory(categoryId, categoryData)
      showToast('Categoría actualizada', 'success')
    } else {
      const cat = new Category(categoryData)
      await storageService.addCategory(cat.toJSON())
      showToast('Categoría creada', 'success')
    }

    // Recargar categorías en appState
    appState.categories = await storageService.getAllCategories()

    hideModal()
    await showCategoriesView()

  } catch (error) {
    console.error('❌ Error guardando categoría:', error)
    showToast('Error al guardar la categoría', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Eliminar categoría
 */
async function handleDeleteCategory(categoryId) {
  const category = await storageService.getCategory(categoryId)
  const expenses = await storageService.getCurrentMonthExpenses()
  const hasExpenses = expenses.some(exp => exp.category === category.name)

  if (hasExpenses) {
    if (!confirm(`La categoría "${category.name}" tiene gastos asociados. Si la eliminas, esos gastos quedarán sin categoría. ¿Continuar?`)) {
      return
    }
  } else {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      return
    }
  }

  try {
    showLoading(true)
    await storageService.deleteCategory(categoryId)

    // Recargar categorías
    appState.categories = await storageService.getAllCategories()

    hideModal()
    showToast('Categoría eliminada', 'success')
    await showCategoriesView()

  } catch (error) {
    console.error('❌ Error eliminando categoría:', error)
    showToast('Error al eliminar la categoría', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Mostrar configuración de presupuesto (actualizado para subcategorías)
 */
async function showBudgetConfig() {
  console.log('📊 showBudgetConfig() - Abriendo modal de presupuesto...')

  const budget = await storageService.getCurrentBudget()
  console.log('   → Budget cargado desde IndexedDB:', budget)

  const subcategories = await storageService.getAllSubcategories()
  console.log(`   → ${subcategories.length} subcategorías cargadas desde IndexedDB`)
  console.log('   → Presupuestos leídos de IndexedDB:')
  subcategories.forEach(sub => {
    if (sub.budget > 0) {
      console.log(`      ${sub.icon} ${sub.name}: ${sub.budget}`)
    }
  })

  console.log('   → Presupuestos en appState.subcategories:')
  appState.subcategories.forEach(sub => {
    if (sub.budget > 0) {
      console.log(`      ${sub.icon} ${sub.name}: ${sub.budget}`)
    }
  })

  const totalIncome = await storageService.getCurrentMonthTotalIncome()
  const currentMonth = getCurrentMonth()

  const modal = document.getElementById('modal')

  // Agrupar subcategorías por categoría principal
  const subcategoriesByMain = {}
  MAIN_CATEGORIES.forEach(mainCat => {
    subcategoriesByMain[mainCat.id] = subcategories.filter(sub => sub.mainCategoryId === mainCat.id)
  })

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h2>Presupuesto Mensual</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <form id="budget-form" class="modal-body">
        <!-- Mes -->
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.25rem;">
            CONFIGURANDO PRESUPUESTO PARA
          </div>
          <div style="font-size: 18px; font-weight: 600;">
            ${formatMonth(currentMonth)}
          </div>
        </div>

        <!-- Resumen de Ingresos -->
        <div style="background: var(--bg-success)15; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid var(--color-success);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 12px; color: var(--text-secondary);">INGRESOS DEL MES</div>
              <div style="font-size: 20px; font-weight: 700; color: var(--color-success);">
                ${formatCurrency(totalIncome)}
              </div>
            </div>
            <button type="button" id="manage-income-from-budget" class="btn btn-secondary btn-sm">
              Gestionar
            </button>
          </div>
          ${totalIncome === 0 ? `
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 0.5rem;">
              Agrega tus ingresos antes de configurar el presupuesto
            </div>
          ` : ''}
        </div>

        <div class="divider"></div>

        <!-- Info de presupuesto total calculado -->
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
            PRESUPUESTO TOTAL (calculado automáticamente)
          </div>
          <div id="total-budget-display" style="font-size: 28px; font-weight: 700; color: var(--color-primary);">
            0.00
          </div>
          <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 0.25rem;">
            Suma de todas las subcategorías
          </div>
          ${totalIncome > 0 ? `
            <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
              <div style="font-size: 11px; color: var(--text-secondary);">
                Porcentaje del ingreso: <span id="budget-income-percent" style="font-weight: 600;">0%</span>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="divider"></div>

        <!-- Distribución por Subcategorías -->
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 0.5rem;">
            Distribución por Subcategorías
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 1rem;">
            Asigna un presupuesto a cada subcategoría
          </div>

          ${MAIN_CATEGORIES.map(mainCat => {
            const subs = subcategoriesByMain[mainCat.id] || []
            return `
              <div style="margin-bottom: 1.5rem;">
                <!-- Header Categoría Principal -->
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${mainCat.color};">
                  <span style="font-size: 24px;">${mainCat.icon}</span>
                  <span style="font-weight: 600; font-size: 15px;">${mainCat.name}</span>
                  <span style="font-size: 11px; color: var(--text-secondary); margin-left: auto;" id="main-cat-total-${mainCat.id}">
                    0.00
                  </span>
                </div>

                <!-- Subcategorías -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${subs.map(sub => `
                    <div class="form-group" style="margin-bottom: 0;">
                      <label for="subcat-budget-${sub.id}" style="display: flex; align-items: center; gap: 0.5rem; font-size: 13px;">
                        <span style="font-size: 18px;">${sub.icon}</span>
                        ${sub.name}
                      </label>
                      <input
                        type="number"
                        id="subcat-budget-${sub.id}"
                        class="form-input"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value="${sub.budget || ''}"
                        data-subcategory-id="${sub.id}"
                        data-main-category-id="${mainCat.id}"
                      >
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          }).join('')}
        </div>
      </form>

      <div class="modal-footer">
        <button id="cancel-btn" class="btn btn-secondary">
          Cancelar
        </button>
        <button id="save-budget-btn" class="btn btn-primary">
          Guardar Presupuesto
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  // Calcular y actualizar presupuesto total automáticamente
  const subcategoryInputs = subcategories.map(sub => document.getElementById(`subcat-budget-${sub.id}`))
  const totalDisplay = document.getElementById('total-budget-display')
  const budgetIncomePercent = document.getElementById('budget-income-percent')

  function updateTotalBudget() {
    const total = subcategoryInputs.reduce((sum, input) => {
      return sum + (parseFloat(input?.value) || 0)
    }, 0)
    totalDisplay.textContent = formatCurrency(total)

    // Actualizar porcentaje respecto al ingreso
    if (totalIncome > 0 && budgetIncomePercent) {
      const percent = (total / totalIncome) * 100
      budgetIncomePercent.textContent = `${percent.toFixed(1)}%`
      budgetIncomePercent.style.color = percent > 100 ? 'var(--color-danger)' :
                                          percent > 90 ? 'var(--color-warning)' :
                                          'var(--color-success)'
    }

    // Actualizar totales por categoría principal
    MAIN_CATEGORIES.forEach(mainCat => {
      const mainCatTotal = subcategoriesByMain[mainCat.id]?.reduce((sum, sub) => {
        const input = document.getElementById(`subcat-budget-${sub.id}`)
        return sum + (parseFloat(input?.value) || 0)
      }, 0) || 0
      const mainCatTotalEl = document.getElementById(`main-cat-total-${mainCat.id}`)
      if (mainCatTotalEl) {
        mainCatTotalEl.textContent = formatCurrency(mainCatTotal)
      }
    })
  }

  // Agregar listeners a todos los inputs de subcategorías
  subcategoryInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateTotalBudget)
    }
  })

  // Cálculo inicial
  updateTotalBudget()

  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('cancel-btn').addEventListener('click', hideModal)
  document.getElementById('save-budget-btn').addEventListener('click', handleSaveBudget)

  // Botón para gestionar ingresos
  const manageIncomeBtn = document.getElementById('manage-income-from-budget')
  if (manageIncomeBtn) {
    manageIncomeBtn.addEventListener('click', () => {
      hideModal()
      showIncomeManagement()
    })
  }
}

/**
 * Guardar presupuesto
 */
async function handleSaveBudget() {
  console.log('🚀 handleSaveBudget() iniciado')

  const form = document.getElementById('budget-form')

  if (!form.checkValidity()) {
    console.warn('⚠️ Formulario no válido')
    form.reportValidity()
    return
  }

  const currentMonth = getCurrentMonth()
  console.log(`📅 Mes actual: ${currentMonth}`)
  console.log(`🔗 Spreadsheet conectado: ${appState.spreadsheetConnected}`)

  try {
    showLoading(true)

    // Obtener todas las subcategorías
    const subcategories = await storageService.getAllSubcategories()
    console.log(`📊 Guardando presupuesto para ${subcategories.length} subcategorías`)

    // Leer presupuestos desde los inputs y actualizar cada subcategoría
    const subcategoryBudgets = {}
    const updatedSubcategories = []

    for (const sub of subcategories) {
      const input = document.getElementById(`subcat-budget-${sub.id}`)
      if (input) {
        const inputValue = input.value
        const budgetAmount = parseFloat(inputValue) || 0
        subcategoryBudgets[sub.id] = budgetAmount

        console.log(`📝 Input encontrado para "${sub.name}" (ID: ${sub.id})`)
        console.log(`   → Valor del input: "${inputValue}"`)
        console.log(`   → Valor parseado: ${budgetAmount}`)
        console.log(`   → Valor actual en DB: ${sub.budget}`)
        console.log(`   → ¿Cambió?: ${sub.budget !== budgetAmount}`)

        // Solo actualizar si el valor cambió
        if (sub.budget !== budgetAmount) {
          console.log(`   → Actualizando presupuesto de "${sub.name}": ${sub.budget} → ${budgetAmount}`)

          try {
            const updated = await storageService.updateSubcategory(sub.id, { budget: budgetAmount })
            console.log(`   → ✅ Actualización retornó:`, updated)

            // Verificar que se guardó leyendo de nuevo
            const verified = await storageService.getSubcategory(sub.id)
            console.log(`   → 🔍 Verificación: presupuesto guardado = ${verified.budget}`)

            if (verified.budget === budgetAmount) {
              console.log(`   → ✅ CONFIRMADO: Subcategoría "${sub.name}" guardada correctamente`)
              updatedSubcategories.push(sub.name)
            } else {
              console.error(`   → ❌ ERROR: El presupuesto NO se guardó correctamente!`)
              console.error(`   → Esperado: ${budgetAmount}, Actual: ${verified.budget}`)
            }
          } catch (error) {
            console.error(`   → ❌ Error actualizando subcategoría "${sub.name}":`, error)
            throw error
          }
        } else {
          console.log(`   → ℹ️ Sin cambios para "${sub.name}"`)
        }
      } else {
        console.warn(`⚠️ No se encontró input para subcategoría "${sub.name}" (ID: ${sub.id})`)
      }
    }

    console.log(`\n✅ Resumen: ${updatedSubcategories.length} subcategorías actualizadas:`, updatedSubcategories)

    // Calcular total (suma de todos los presupuestos de subcategorías)
    const totalBudget = Object.values(subcategoryBudgets).reduce((sum, amount) => sum + amount, 0)

    // Guardar presupuesto del mes con estructura de subcategorías
    const budgetData = {
      month: currentMonth,
      total: totalBudget,
      subcategories: subcategoryBudgets
    }

    await storageService.saveBudget(currentMonth, budgetData)
    console.log(`✅ Presupuesto del mes ${currentMonth} guardado en IndexedDB: Total = ${totalBudget}`)

    // Recargar subcategorías en appState
    const reloadedSubcategories = await storageService.getAllSubcategories()
    console.log(`\n🔄 Subcategorías recargadas desde IndexedDB: ${reloadedSubcategories.length}`)

    // Verificar que los cambios están en las subcategorías recargadas
    console.log('🔍 Verificando presupuestos después de recargar:')
    reloadedSubcategories.forEach(sub => {
      const wasUpdated = updatedSubcategories.includes(sub.name)
      if (wasUpdated || sub.budget > 0) {
        console.log(`   ${wasUpdated ? '✅' : 'ℹ️'} ${sub.icon} ${sub.name}: ${sub.budget}`)
      }
    })

    appState.subcategories = reloadedSubcategories
    console.log('✅ appState.subcategories actualizado')

    // Sincronizar presupuesto con Google Sheets (si está conectado)
    console.log(`\n📊 ¿Sincronizar con Sheets? appState.spreadsheetConnected = ${appState.spreadsheetConnected}`)

    if (appState.spreadsheetConnected) {
      try {
        console.log('🔄 Iniciando sincronización a Google Sheets...')

        const budget = await storageService.getCurrentBudget()
        console.log(`   → Budget del mes cargado:`, budget)

        const expenses = await storageService.getCurrentMonthExpenses()
        console.log(`   → Gastos del mes cargados: ${expenses.length}`)

        const totalIncome = await storageService.getCurrentMonthTotalIncome()
        console.log(`   → Total ingresos: ${totalIncome}`)

        console.log(`   → Subcategorías a sincronizar: ${appState.subcategories.length}`)
        console.log('   → Llamando a syncBudgetToSheets...')

        await googleSheetsService.syncBudgetToSheets(budget, appState.subcategories, expenses, totalIncome)
        console.log('   → ✅ syncBudgetToSheets completado')

        // Actualizar dropdown de validación en Sheets
        console.log('   → Actualizando dropdowns de validación...')
        await googleSheetsService.setupCategoryValidation(appState.subcategories)
        console.log('   → ✅ Dropdowns actualizados')

        console.log('✅ Sincronización a Sheets completada exitosamente')
        showToast('Presupuesto guardado y sincronizado con Sheets', 'success')
      } catch (error) {
        console.error('❌ Error sincronizando presupuesto a Sheets:', error)
        console.error('   Stack trace:', error.stack)
        showToast('Presupuesto guardado localmente (error al sincronizar con Sheets)', 'warning')
      }
    } else {
      console.log('ℹ️ Spreadsheet no conectado, saltando sincronización')
      showToast('Presupuesto guardado localmente', 'success')
    }

    hideModal()

    // Volver a la vista que corresponda
    if (appState.currentView === 'categories') {
      await showCategoriesView()
    } else {
      await showDashboard()
    }

  } catch (error) {
    console.error('❌ Error guardando presupuesto:', error)
    showToast('Error al guardar el presupuesto', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
  // Bottom navigation
  const navItems = document.querySelectorAll('.bottom-nav-item')
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view
      console.log(`Navegando a: ${view}`)

      if (view === 'dashboard') {
        showDashboard()
      } else if (view === 'expenses') {
        showExpensesView()
      } else if (view === 'categories') {
        showCategoriesView()
      } else if (view === 'history') {
        showHistoryView()
      } else if (view === 'settings') {
        showSettingsView()
      } else {
        showToast(`Vista ${view} - Por implementar`, 'info')
      }
    })
  })

  // Botón de sincronización
  const syncBtn = document.getElementById('sync-btn')
  if (syncBtn) {
    syncBtn.addEventListener('click', handleSync)
  }

  // Botón de usuario
  const userBtn = document.getElementById('user-btn')
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      if (confirm('¿Cerrar sesión?')) {
        handleLogout()
      }
    })
  }

  // FAB
  const fab = document.getElementById('fab')
  if (fab) {
    fab.addEventListener('click', () => {
      showExpenseForm()
    })
  }
}

/**
 * Mostrar formulario de nuevo gasto
 */
function showExpenseForm(expense = null) {
  const isEdit = expense !== null
  const modal = document.getElementById('modal')

  // Obtener fecha actual en formato YYYY-MM-DD para el input
  const today = new Date().toISOString().split('T')[0]

  // Encontrar subcategoría si estamos editando
  let selectedSubcategoryId = null

  if (isEdit && expense.subcategory) {
    // Buscar subcategoría por nombre
    const subcategory = appState.subcategories.find(s => s.name === expense.subcategory)
    if (subcategory) {
      selectedSubcategoryId = subcategory.id
    }
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <form id="expense-form" class="modal-body">
        <!-- Monto -->
        <div class="form-group">
          <label for="amount">Monto *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            class="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            value="${isEdit ? expense.amount : ''}"
            autofocus
          >
        </div>

        <!-- Subcategoría (incluye categoría principal automáticamente) -->
        <div class="form-group">
          <label for="subcategory">Categoría *</label>
          <select
            id="subcategory"
            name="subcategory"
            class="form-select"
            required
          >
            <option value="">Selecciona una categoría</option>
            ${MAIN_CATEGORIES.map(mainCat => {
              const subs = appState.subcategories.filter(sub => sub.mainCategoryId === mainCat.id)
              return `
                <optgroup label="${mainCat.icon} ${mainCat.name}">
                  ${subs.map(sub => `
                    <option value="${sub.id}" ${selectedSubcategoryId === sub.id ? 'selected' : ''}>
                      ${sub.icon} ${sub.name}
                    </option>
                  `).join('')}
                </optgroup>
              `
            }).join('')}
          </select>
          <small class="form-hint">La categoría principal se asigna automáticamente</small>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label for="description">Descripción *</label>
          <input
            type="text"
            id="description"
            name="description"
            class="form-input"
            placeholder="Ej: Compra de supermercado, Gasolina, etc."
            value="${isEdit ? expense.description || '' : ''}"
            required
          >
        </div>

        <!-- Fecha -->
        <div class="form-group">
          <label for="date">Fecha *</label>
          <input
            type="date"
            id="date"
            name="date"
            class="form-input"
            required
            value="${isEdit ? expense.date.split('T')[0] : today}"
          >
        </div>

        <!-- Notas -->
        <div class="form-group">
          <label for="notes">Notas</label>
          <textarea
            id="notes"
            name="notes"
            class="form-textarea"
            placeholder="Notas adicionales (opcional)"
            rows="3"
          >${isEdit ? expense.notes || '' : ''}</textarea>
        </div>
      </form>

      <div class="modal-footer">
        <button id="cancel-btn" class="btn btn-secondary">
          Cancelar
        </button>
        <button id="save-btn" class="btn btn-primary">
          ${isEdit ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  `

  // Mostrar modal
  modal.style.display = 'flex'

  // Event listeners
  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('cancel-btn').addEventListener('click', hideModal)
  document.getElementById('save-btn').addEventListener('click', () => handleSaveExpense(isEdit ? expense.id : null))
}

/**
 * Ocultar modal
 */
function hideModal() {
  const modal = document.getElementById('modal')
  modal.style.display = 'none'
  modal.innerHTML = ''
}

/**
 * Guardar o actualizar gasto
 */
async function handleSaveExpense(expenseId = null) {
  const form = document.getElementById('expense-form')

  // Validar formulario
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  // Obtener subcategoría seleccionada
  const subcategoryId = document.getElementById('subcategory').value
  if (!subcategoryId) {
    showToast('Debes seleccionar una categoría', 'warning')
    return
  }

  const subcategory = appState.subcategories.find(sub => sub.id === subcategoryId)
  if (!subcategory) {
    showToast('Categoría no encontrada', 'error')
    return
  }

  // Obtener categoría principal automáticamente
  const mainCategory = MAIN_CATEGORIES.find(cat => cat.id === subcategory.mainCategoryId)

  // Preparar datos del gasto
  const formData = {
    amount: parseFloat(document.getElementById('amount').value),
    category: mainCategory.name, // Categoría principal (automática)
    subcategory: subcategory.name, // Subcategoría seleccionada
    description: document.getElementById('description').value || '',
    date: new Date(document.getElementById('date').value).toISOString(),
    notes: document.getElementById('notes').value || ''
  }

  try {
    showLoading(true)

    if (expenseId) {
      // Actualizar gasto existente
      await storageService.updateExpense(expenseId, formData)
      showToast('Gasto actualizado correctamente', 'success')
    } else {
      // Crear nuevo gasto
      const expense = new Expense(formData)
      await storageService.addExpense(expense.toJSON())
      showToast('Gasto agregado correctamente', 'success')
    }

    // Cerrar modal
    hideModal()

    // Actualizar vista actual
    if (appState.currentView === 'dashboard') {
      await showDashboard()
    } else if (appState.currentView === 'expenses') {
      await showExpensesView()
    }

  } catch (error) {
    console.error('❌ Error guardando gasto:', error)
    showToast('Error al guardar el gasto', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Sincronización manual con Google Sheets
 */
/**
 * Sincronización UNIDIRECCIONAL: App → Google Sheets
 *
 * ⚠️ IMPORTANTE: Solo sube datos locales a Sheets (NO descarga desde Sheets)
 * - La app es la única fuente de verdad
 * - Cualquier cambio manual en Sheets será sobrescrito
 */
async function handleSync() {
  if (!appState.spreadsheetConnected) {
    showToast('Primero conecta a Google Sheets', 'warning')
    return
  }

  console.log('⬆️ Iniciando sincronización unidireccional (App → Sheets)...')

  try {
    showLoading(true)

    // Obtener gastos locales del mes actual
    const localExpenses = await storageService.getCurrentMonthExpenses()

    // Obtener ingresos locales del mes actual
    const localIncomes = await storageService.getCurrentMonthIncomes()

    // Sincronización UNIDIRECCIONAL: Solo subir a Sheets (gastos + ingresos)
    await googleSheetsService.pushToSheets(localExpenses, localIncomes)

    // Marcar todos los gastos locales como sincronizados
    const expenseIds = localExpenses.map(e => e.id)
    await storageService.markExpensesSynced(expenseIds)

    // Registrar sincronización exitosa
    await storageService.logSync('success', {
      expensesCount: localExpenses.length,
      direction: 'push-only'
    })

    // Sincronizar presupuesto (solo escritura a Sheets)
    try {
      const subcategories = await storageService.getAllSubcategories()
      const totalIncome = await storageService.getCurrentMonthTotalIncome()
      const budget = await storageService.getCurrentBudget()
      const allExpenses = await storageService.getCurrentMonthExpenses()

      // Solo escribir presupuesto a Sheets (NO leer desde Sheets)
      await googleSheetsService.syncBudgetToSheets(budget, subcategories, allExpenses, totalIncome)

      // Configurar dropdown de validación en Sheets
      await googleSheetsService.setupCategoryValidation(subcategories)

      console.log('✅ Presupuesto también sincronizado')
    } catch (error) {
      console.warn('⚠️ Error sincronizando presupuesto:', error)
    }

    showToast(`✅ ${localExpenses.length} gastos y ${localIncomes.length} ingresos subidos a Sheets`, 'success')
    console.log('✅ Sincronización unidireccional completada')

    // Actualizar vista actual
    if (appState.currentView === 'dashboard') {
      await showDashboard()
    } else if (appState.currentView === 'expenses') {
      await showExpensesView()
    }

  } catch (error) {
    console.error('❌ Error en sincronización:', error)
    showToast('Error al sincronizar. Intenta de nuevo.', 'error')

    // Registrar error
    await storageService.logSync('error', {
      error: error.message,
      direction: 'push-only'
    })
  } finally {
    showLoading(false)
  }
}

/**
 * Mostrar gestión de ingresos
 */
async function showIncomeManagement() {
  const modal = document.getElementById('modal')
  const incomes = await storageService.getCurrentMonthIncomes()
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0)

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2>💵 Gestión de Ingresos</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <div class="modal-body">
        <!-- Total de ingresos -->
        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
            TOTAL INGRESOS DEL MES
          </div>
          <div style="font-size: 36px; font-weight: 700; color: var(--color-success);">
            ${formatCurrency(totalIncome)}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 0.5rem;">
            ${incomes.length} ${incomes.length === 1 ? 'ingreso' : 'ingresos'} registrados
          </div>
        </div>

        <!-- Lista de ingresos -->
        ${incomes.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
            ${incomes.map(income => `
              <div class="card" style="padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                  <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 0.25rem;">
                      ${income.concept}
                    </div>
                    ${income.description ? `
                      <div style="font-size: 13px; color: var(--text-secondary);">
                        ${income.description}
                      </div>
                    ` : ''}
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; font-size: 18px; color: var(--color-success);">
                      ${formatCurrency(income.amount)}
                    </div>
                  </div>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                  <button class="btn btn-secondary btn-sm edit-income-btn" data-income-id="${income.id}" style="flex: 1;">
                    ✏️ Editar
                  </button>
                  <button class="btn btn-danger btn-sm delete-income-btn" data-income-id="${income.id}" style="flex: 1;">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
            <div style="font-size: 48px; margin-bottom: 0.5rem;">💰</div>
            <div style="font-size: 14px; margin-bottom: 0.5rem;">Sin ingresos registrados</div>
            <div style="font-size: 12px;">Agrega tu primer ingreso del mes</div>
          </div>
        `}
      </div>

      <div class="modal-footer">
        <button id="add-income-btn" class="btn btn-primary btn-block">
          + Agregar Ingreso
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  // Event listeners
  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('add-income-btn').addEventListener('click', () => showIncomeForm())

  // Edit income buttons
  document.querySelectorAll('.edit-income-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const incomeId = btn.dataset.incomeId
      const income = await storageService.getIncome(incomeId)
      showIncomeForm(income)
    })
  })

  // Delete income buttons
  document.querySelectorAll('.delete-income-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const incomeId = btn.dataset.incomeId
      await handleDeleteIncome(incomeId)
    })
  })
}

/**
 * Mostrar formulario de ingreso
 */
function showIncomeForm(income = null) {
  const isEdit = income !== null
  const modal = document.getElementById('modal')

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${isEdit ? 'Editar Ingreso' : 'Nuevo Ingreso'}</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <form id="income-form" class="modal-body">
        <!-- Concepto -->
        <div class="form-group">
          <label for="income-concept">Concepto *</label>
          <input
            type="text"
            id="income-concept"
            class="form-input"
            placeholder="Ej: Salario, Freelance, Bono"
            required
            value="${isEdit ? income.concept : ''}"
            autofocus
          >
          <small class="form-hint">Tipo de ingreso (Salario, Freelance, Inversión, etc.)</small>
        </div>

        <!-- Monto -->
        <div class="form-group">
          <label for="income-amount">Monto *</label>
          <input
            type="number"
            id="income-amount"
            class="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            value="${isEdit ? income.amount : ''}"
          >
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label for="income-description">Descripción (opcional)</label>
          <textarea
            id="income-description"
            class="form-textarea"
            placeholder="Detalles adicionales..."
            rows="3"
          >${isEdit ? income.description || '' : ''}</textarea>
        </div>
      </form>

      <div class="modal-footer">
        <button id="cancel-btn" class="btn btn-secondary">
          Cancelar
        </button>
        <button id="save-income-btn" class="btn btn-primary">
          ${isEdit ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  // Event listeners
  document.getElementById('modal-close').addEventListener('click', () => showIncomeManagement())
  document.getElementById('cancel-btn').addEventListener('click', () => showIncomeManagement())
  document.getElementById('save-income-btn').addEventListener('click', () => handleSaveIncome(isEdit ? income.id : null))
}

/**
 * Guardar ingreso
 */
async function handleSaveIncome(incomeId = null) {
  const form = document.getElementById('income-form')

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const incomeData = {
    concept: document.getElementById('income-concept').value.trim(),
    amount: parseFloat(document.getElementById('income-amount').value),
    description: document.getElementById('income-description').value.trim()
  }

  try {
    showLoading(true)

    if (incomeId) {
      await storageService.updateIncome(incomeId, incomeData)
      showToast('Ingreso actualizado', 'success')
    } else {
      const newIncome = new Income(incomeData)
      await storageService.addIncome(newIncome.toJSON())
      showToast('Ingreso agregado', 'success')
    }

    // Recargar ingresos en appState
    appState.incomes = await storageService.getCurrentMonthIncomes()

    // Volver a gestión de ingresos
    await showIncomeManagement()

    // Si estamos en dashboard, recargarlo
    if (appState.currentView === 'dashboard') {
      setTimeout(() => {
        hideModal()
        showDashboard()
      }, 500)
    }

  } catch (error) {
    console.error('❌ Error guardando ingreso:', error)
    showToast('Error al guardar el ingreso', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Eliminar ingreso
 */
async function handleDeleteIncome(incomeId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
    return
  }

  try {
    showLoading(true)
    await storageService.deleteIncome(incomeId)
    showToast('Ingreso eliminado', 'success')

    // Recargar ingresos
    appState.incomes = await storageService.getCurrentMonthIncomes()

    // Recargar vista
    await showIncomeManagement()

  } catch (error) {
    console.error('❌ Error eliminando ingreso:', error)
    showToast('Error al eliminar el ingreso', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Mostrar vista de histórico
 */
async function showHistoryView() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')
  const fab = document.getElementById('fab')

  // Mostrar elementos
  header.style.display = 'flex'
  content.style.display = 'block'
  bottomNav.style.display = 'flex'
  if (fab) fab.style.display = 'none' // No FAB en histórico

  // Actualizar vista actual
  appState.currentView = 'history'

  try {
    showLoading(true)

    // Leer histórico desde Google Sheets
    let historyData = []
    if (appState.spreadsheetConnected) {
      try {
        historyData = await googleSheetsService.readHistory()
      } catch (error) {
        console.warn('⚠️ Error leyendo histórico desde Sheets:', error)
      }
    }

    showLoading(false)

    // Agrupar por mes
    const groupedByMonth = {}
    historyData.forEach(expense => {
      if (!groupedByMonth[expense.month]) {
        groupedByMonth[expense.month] = []
      }
      groupedByMonth[expense.month].push(expense)
    })

    // Ordenar meses (más recientes primero)
    const months = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a))

    content.innerHTML = `
      <div class="container" style="padding-top: 1rem; padding-bottom: 5rem;">

        <!-- Header -->
        <div class="card" style="margin-bottom: 1rem; padding: 1.5rem; text-align: center;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 0.5rem;">
            📅 Histórico de Gastos
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Meses cerrados y archivados
          </p>
        </div>

        ${!appState.spreadsheetConnected ? `
          <div style="background: var(--bg-warning)15; padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--color-warning); margin-bottom: 1rem;">
            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--color-warning);">
              ⚠️ Google Sheets no conectado
            </div>
            <div style="font-size: 14px; color: var(--text-secondary);">
              El histórico se almacena en Google Sheets. Conecta tu cuenta para ver meses anteriores.
            </div>
            <button id="connect-sheet-history" class="btn btn-primary" style="margin-top: 1rem;">
              Conectar Google Sheets
            </button>
          </div>
        ` : months.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <div class="empty-state-title">Sin histórico</div>
            <div class="empty-state-description">
              Los meses cerrados aparecerán aquí.<br>
              Cierra el mes actual desde el Dashboard para comenzar.
            </div>
          </div>
        ` : `
          <!-- Lista de meses -->
          ${months.map(month => {
            const expenses = groupedByMonth[month]
            const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
            const expenseCount = expenses.length

            // Agrupar por categoría
            const byCategory = expenses.reduce((acc, exp) => {
              const cat = exp.category || 'Sin categoría'
              acc[cat] = (acc[cat] || 0) + exp.amount
              return acc
            }, {})

            return `
              <div class="card" style="margin-bottom: 1rem; overflow: hidden;">
                <!-- Header del mes -->
                <div class="month-header" data-month="${month}" style="
                  padding: 1rem 1.5rem;
                  background: var(--bg-secondary);
                  cursor: pointer;
                  transition: background var(--transition-base);
                "
                onmouseover="this.style.background='var(--bg-tertiary)'"
                onmouseout="this.style.background='var(--bg-secondary)'"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 18px; font-weight: 700; margin-bottom: 0.25rem;">
                        ${formatMonth(month)}
                      </div>
                      <div style="font-size: 13px; color: var(--text-secondary);">
                        ${expenseCount} ${expenseCount === 1 ? 'gasto' : 'gastos'}
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 20px; font-weight: 700; color: var(--color-primary);">
                        ${formatCurrency(totalSpent)}
                      </div>
                      <div style="font-size: 12px; color: var(--text-secondary);">
                        ▼ Ver detalle
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Detalle del mes (oculto por defecto) -->
                <div id="month-detail-${month}" style="display: none; padding: 1rem;">
                  <!-- Gastos por categoría -->
                  <div style="margin-bottom: 1rem;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-secondary);">
                      Por Categoría
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                      ${Object.entries(byCategory)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount]) => {
                          const mainCat = MAIN_CATEGORIES.find(c => c.name === category)
                          const percent = (amount / totalSpent) * 100
                          return `
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                              <span style="font-size: 20px;">${mainCat?.icon || '📁'}</span>
                              <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                  <span style="font-size: 13px;">${category}</span>
                                  <span style="font-size: 13px; font-weight: 600;">${formatCurrency(amount)}</span>
                                </div>
                                <div style="background: var(--bg-secondary); height: 4px; border-radius: 2px; overflow: hidden;">
                                  <div style="background: ${mainCat?.color || 'var(--color-primary)'}; height: 100%; width: ${percent}%;"></div>
                                </div>
                              </div>
                            </div>
                          `
                        }).join('')}
                    </div>
                  </div>

                  <div class="divider" style="margin: 1rem 0;"></div>

                  <!-- Lista de gastos -->
                  <div style="margin-bottom: 1rem;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-secondary);">
                      Gastos (${expenseCount})
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                      ${expenses
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((expense, index) => {
                          const subcat = appState.subcategories.find(s => s.name === expense.subcategory)
                          return `
                            <div style="
                              display: flex;
                              align-items: center;
                              gap: 0.75rem;
                              padding: 0.75rem;
                              border-bottom: ${index === expenses.length - 1 ? 'none' : '1px solid var(--border-light)'};
                            ">
                              <div style="font-size: 24px;">${subcat?.icon || '📁'}</div>
                              <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; font-size: 14px; margin-bottom: 2px;">
                                  ${expense.description || expense.category}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">
                                  ${expense.category}${expense.subcategory ? ` · ${expense.subcategory}` : ''} · ${formatDate(expense.date)}
                                </div>
                              </div>
                              <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">
                                ${formatCurrency(expense.amount)}
                              </div>
                            </div>
                          `
                        }).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `
          }).join('')}
        `}

      </div>
    `

    // Event listeners para expandir/contraer meses
    document.querySelectorAll('.month-header').forEach(header => {
      header.addEventListener('click', () => {
        const month = header.dataset.month
        const detail = document.getElementById(`month-detail-${month}`)
        if (detail) {
          const isVisible = detail.style.display !== 'none'
          detail.style.display = isVisible ? 'none' : 'block'

          // Cambiar flecha
          const arrow = header.querySelector('[style*="▼"]')
          if (arrow) {
            arrow.textContent = isVisible ? '▼ Ver detalle' : '▲ Ocultar'
          }
        }
      })
    })

    // Botón conectar sheets
    const connectBtn = document.getElementById('connect-sheet-history')
    if (connectBtn) {
      connectBtn.addEventListener('click', handleConnectSheet)
    }

  } catch (error) {
    console.error('❌ Error mostrando histórico:', error)
    showToast('Error al cargar histórico', 'error')
  } finally {
    showLoading(false)
  }

  // Actualizar navegación
  updateNavigation('history')
}

/**
 * Mostrar vista de settings/configuración
 */
async function showSettingsView() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')
  const fab = document.getElementById('fab')

  // Mostrar elementos
  header.style.display = 'flex'
  content.style.display = 'block'
  bottomNav.style.display = 'flex'
  if (fab) fab.style.display = 'none' // No FAB en settings

  // Actualizar vista actual
  appState.currentView = 'settings'

  const user = authService.getUser()
  const spreadsheetUrl = appState.spreadsheetConnected ? googleSheetsService.getSpreadsheetUrl() : null
  const lastSync = await storageService.getLastSuccessfulSync()

  content.innerHTML = `
    <div class="container" style="padding-top: 1rem; padding-bottom: 5rem;">

      <!-- Header -->
      <div class="card" style="margin-bottom: 1rem; padding: 1.5rem; text-align: center;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 0.5rem;">
          ⚙️ Configuración
        </h2>
        <p style="font-size: 14px; color: var(--text-secondary);">
          Ajustes y preferencias de la aplicación
        </p>
      </div>

      <!-- Sección: Cuenta -->
      <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
        <div style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 14px; font-weight: 600;">👤 Cuenta</div>
        </div>
        <div style="padding: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 48px;">👤</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 16px; margin-bottom: 0.25rem;">
                ${user?.name || 'Usuario'}
              </div>
              <div style="font-size: 13px; color: var(--text-secondary);">
                ${user?.email || 'Sin email'}
              </div>
            </div>
          </div>
          <button id="logout-btn" class="btn btn-danger btn-block">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Sección: Google Sheets -->
      <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
        <div style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 14px; font-weight: 600;">📊 Google Sheets</div>
        </div>
        <div style="padding: 1rem;">
          ${appState.spreadsheetConnected ? `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="color: var(--color-success); font-size: 20px;">✓</span>
                <span style="font-weight: 600; font-size: 14px;">Conectado</span>
              </div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
                Sincronización activa con Google Sheets
              </div>
              ${lastSync ? `
                <div style="font-size: 11px; color: var(--text-tertiary);">
                  Última sincronización: ${formatDate(lastSync.timestamp)}
                </div>
              ` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <a href="${spreadsheetUrl}" target="_blank" class="btn btn-secondary btn-block" style="text-decoration: none;">
                📄 Abrir en Google Sheets
              </a>
              <button id="disconnect-sheet-btn" class="btn btn-danger btn-block">
                🔌 Desconectar Spreadsheet
              </button>
            </div>
          ` : `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="color: var(--color-warning); font-size: 20px;">⚠</span>
                <span style="font-weight: 600; font-size: 14px;">Sin conectar</span>
              </div>
              <div style="font-size: 12px; color: var(--text-secondary);">
                Conecta tu cuenta para sincronizar tus datos
              </div>
            </div>
            <button id="connect-sheet-settings" class="btn btn-primary btn-block">
              🔗 Conectar Google Sheets
            </button>
          `}
        </div>
      </div>

      <!-- Sección: Sincronización -->
      <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
        <div style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 14px; font-weight: 600;">🔄 Sincronización</div>
        </div>
        <div style="padding: 1rem;">
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 0.5rem;">
              Modo de Sincronización
            </div>
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 0.25rem;">
                ⬆️ Unidireccional (App → Sheets)
              </div>
              <div style="font-size: 12px; color: var(--text-secondary);">
                La app es la única fuente de verdad. Los cambios solo se suben a Sheets.
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="force-sync-btn" class="btn btn-secondary btn-block" ${!appState.spreadsheetConnected ? 'disabled' : ''}>
              🔄 Sincronizar Ahora
            </button>
            <button id="restore-from-sheets-btn" class="btn btn-primary btn-block" ${!appState.spreadsheetConnected ? 'disabled' : ''}>
              📥 Restaurar desde Sheets
            </button>
          </div>
          <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 0.75rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
            <strong>💡 Uso Multi-Dispositivo:</strong><br>
            • <strong>Sincronizar Ahora:</strong> Sube cambios locales a Sheets<br>
            • <strong>Restaurar desde Sheets:</strong> Descarga datos de Sheets a este dispositivo<br>
            <br>
            Para usar en iPhone y PC:<br>
            1. Haz cambios en iPhone → Sincronizar<br>
            2. Abre en PC → Restaurar desde Sheets<br>
            3. Haz cambios en PC → Sincronizar<br>
            4. Regresas a iPhone → Restaurar desde Sheets
          </div>
        </div>
      </div>

      <!-- Sección: Datos -->
      <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
        <div style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 14px; font-weight: 600;">💾 Gestión de Datos</div>
        </div>
        <div style="padding: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="export-data-btn" class="btn btn-secondary btn-block">
              📥 Exportar Backup (JSON)
            </button>
            <button id="import-data-btn" class="btn btn-secondary btn-block">
              📤 Importar Backup
            </button>
            <button id="clear-old-data-btn" class="btn btn-secondary btn-block">
              🗑️ Limpiar Datos Antiguos
            </button>
          </div>
        </div>
      </div>

      <!-- Sección: Cierre de Mes -->
      <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
        <div style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 14px; font-weight: 600;">📦 Cierre de Mes</div>
        </div>
        <div style="padding: 1rem;">
          <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 1rem;">
            Cierra el mes actual para archivar gastos y comenzar el próximo mes.
          </div>
          <button id="close-month-settings-btn" class="btn btn-secondary btn-block">
            📦 Cerrar Mes Actual
          </button>
        </div>
      </div>

      <!-- Sección: Información -->
      <div class="card" style="margin-bottom: 1rem; padding: 0; overflow: hidden;">
        <div style="padding: 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
          <div style="font-size: 14px; font-weight: 600;">ℹ️ Información</div>
        </div>
        <div style="padding: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Versión:</span>
              <span style="font-weight: 600;">1.0.0</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Build:</span>
              <span style="font-weight: 600;">2026-05-20</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Autor:</span>
              <span style="font-weight: 600;">Juan Ribón</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input oculto para importar -->
      <input type="file" id="import-file-input" accept=".json" style="display: none;">

    </div>
  `

  // Event listeners
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout)
  }

  const disconnectSheetBtn = document.getElementById('disconnect-sheet-btn')
  if (disconnectSheetBtn) {
    disconnectSheetBtn.addEventListener('click', handleDisconnectSheet)
  }

  const connectSheetSettings = document.getElementById('connect-sheet-settings')
  if (connectSheetSettings) {
    connectSheetSettings.addEventListener('click', handleConnectSheet)
  }

  const forceSyncBtn = document.getElementById('force-sync-btn')
  if (forceSyncBtn) {
    forceSyncBtn.addEventListener('click', handleSync)
  }

  const restoreFromSheetsBtn = document.getElementById('restore-from-sheets-btn')
  if (restoreFromSheetsBtn) {
    restoreFromSheetsBtn.addEventListener('click', handleRestoreFromSheets)
  }

  const exportDataBtn = document.getElementById('export-data-btn')
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', handleExportData)
  }

  const importDataBtn = document.getElementById('import-data-btn')
  if (importDataBtn) {
    importDataBtn.addEventListener('click', () => {
      document.getElementById('import-file-input').click()
    })
  }

  const importFileInput = document.getElementById('import-file-input')
  if (importFileInput) {
    importFileInput.addEventListener('change', handleImportData)
  }

  const clearOldDataBtn = document.getElementById('clear-old-data-btn')
  if (clearOldDataBtn) {
    clearOldDataBtn.addEventListener('click', handleClearOldData)
  }

  const closeMonthSettingsBtn = document.getElementById('close-month-settings-btn')
  if (closeMonthSettingsBtn) {
    closeMonthSettingsBtn.addEventListener('click', showCloseMonthModal)
  }

  // Actualizar navegación
  updateNavigation('settings')
}

/**
 * 🔄 RESTAURAR DATOS DESDE GOOGLE SHEETS
 *
 * Muestra modal de confirmación y ejecuta la restauración completa de datos.
 * ⚠️ ADVERTENCIA: Sobrescribe todos los datos locales con los de Sheets.
 */
async function handleRestoreFromSheets() {
  console.log('📥 Iniciando restauración desde Google Sheets...')

  if (!appState.spreadsheetConnected) {
    showToast('Primero conecta a Google Sheets', 'warning')
    return
  }

  // Mostrar modal de confirmación con advertencia
  const modal = document.getElementById('modal')
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h2>📥 Restaurar desde Google Sheets</h2>
        <button id="modal-close" class="btn-icon">✕</button>
      </div>

      <div class="modal-body">
        <!-- Advertencia importante -->
        <div style="background: var(--color-danger)15; padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--color-danger); margin-bottom: 1.5rem;">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 0.75rem; color: var(--color-danger);">
            ⚠️ ADVERTENCIA IMPORTANTE
          </div>
          <div style="font-size: 14px; color: var(--text-primary); line-height: 1.6;">
            Esta acción <strong>SOBRESCRIBIRÁ TODOS</strong> los datos locales en este dispositivo con los datos de Google Sheets.
          </div>
        </div>

        <!-- Qué se va a restaurar -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 0.75rem;">
            📦 Datos que se restaurarán:
          </div>
          <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 13px;">
              <div>✓ Gastos del mes actual</div>
              <div>✓ Presupuestos de todas las subcategorías</div>
              <div>✓ Ingresos del mes</div>
              <div>✓ Configuración general</div>
            </div>
          </div>
        </div>

        <!-- Cuándo usar esta función -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 0.75rem;">
            💡 Cuándo usar esta función:
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
            • Al abrir la app en un <strong>nuevo dispositivo</strong><br>
            • Cuando quieras <strong>sincronizar datos</strong> desde otro dispositivo<br>
            • Para <strong>recuperar datos</strong> después de limpiar el navegador<br>
            • Si hiciste cambios en otro dispositivo y los quieres aquí
          </div>
        </div>

        <!-- Recomendación -->
        <div style="background: var(--color-info)15; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--color-info);">
          <div style="font-size: 13px; color: var(--text-primary);">
            <strong>💾 Recomendación:</strong> Si tienes datos locales importantes que no has sincronizado, presiona <strong>"Sincronizar Ahora"</strong> antes de restaurar.
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button id="cancel-restore-btn" class="btn btn-secondary">
          Cancelar
        </button>
        <button id="confirm-restore-btn" class="btn btn-danger">
          Restaurar Datos
        </button>
      </div>
    </div>
  `

  modal.style.display = 'flex'

  document.getElementById('modal-close').addEventListener('click', hideModal)
  document.getElementById('cancel-restore-btn').addEventListener('click', hideModal)
  document.getElementById('confirm-restore-btn').addEventListener('click', async () => {
    try {
      showLoading(true)
      hideModal()

      console.log('   → Descargando datos desde Google Sheets...')
      const restoredData = await googleSheetsService.restoreAllFromSheets()

      console.log('   → Guardando datos en IndexedDB...')
      const summary = await storageService.restoreFromSheets(restoredData)

      // Actualizar estado global
      appState.subcategories = await storageService.getAllSubcategories()
      appState.incomes = await storageService.getCurrentMonthIncomes()

      console.log('✅ Restauración completada exitosamente')
      showToast(`Datos restaurados: ${summary.expensesRestored} gastos, ${summary.subcategoriesRestored} subcategorías`, 'success')

      // Recargar vista actual (Dashboard o Settings)
      if (appState.currentView === 'settings') {
        await showSettingsView()
      } else {
        await showDashboardView()
      }

    } catch (error) {
      console.error('❌ Error restaurando datos:', error)
      showToast(`Error al restaurar datos: ${error.message}`, 'error')
    } finally {
      showLoading(false)
    }
  })
}

/**
 * Desconectar Google Sheets
 */
function handleDisconnectSheet() {
  if (confirm('¿Estás seguro de desconectar Google Sheets?\n\nLos datos locales se mantendrán, pero no podrás sincronizar hasta que conectes de nuevo.')) {
    googleSheetsService.disconnect()
    appState.spreadsheetConnected = false
    showToast('Google Sheets desconectado', 'success')
    showSettingsView() // Recargar vista
  }
}

/**
 * Exportar datos (backup)
 */
async function handleExportData() {
  try {
    showLoading(true)
    const data = await storageService.exportData()

    // Crear archivo JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Descargar
    const a = document.createElement('a')
    a.href = url
    a.download = `presupuesto-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast('Backup exportado correctamente', 'success')
  } catch (error) {
    console.error('❌ Error exportando datos:', error)
    showToast('Error al exportar datos', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Importar datos (restaurar backup)
 */
async function handleImportData(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!confirm('¿Estás seguro de importar este backup?\n\nEsto sobrescribirá los datos actuales.')) {
    event.target.value = '' // Reset input
    return
  }

  try {
    showLoading(true)

    const text = await file.text()
    const data = JSON.parse(text)

    await storageService.importData(data)

    showToast('Backup importado correctamente', 'success')

    // Recargar app
    setTimeout(() => {
      location.reload()
    }, 1500)

  } catch (error) {
    console.error('❌ Error importando datos:', error)
    showToast('Error al importar datos. Verifica que el archivo sea válido.', 'error')
  } finally {
    showLoading(false)
    event.target.value = '' // Reset input
  }
}

/**
 * Limpiar datos antiguos
 */
async function handleClearOldData() {
  if (!confirm('¿Limpiar datos de más de 12 meses?\n\nSolo se eliminarán gastos ya sincronizados.')) {
    return
  }

  try {
    showLoading(true)
    const deleted = await storageService.cleanOldData(12)
    showToast(`${deleted} gastos antiguos eliminados`, 'success')
  } catch (error) {
    console.error('❌ Error limpiando datos:', error)
    showToast('Error al limpiar datos antiguos', 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Mostrar modal de confirmación de cierre de mes
 */
async function showCloseMonthModal() {
  const currentMonth = getCurrentMonth()

  try {
    showLoading(true)
    const summary = await storageService.getMonthCloseSummary(currentMonth)
    showLoading(false)

    if (!summary.canClose) {
      if (summary.expenseCount === 0) {
        showToast('No hay gastos para cerrar este mes', 'warning')
        return
      }
      if (summary.unsyncedCount > 0) {
        showToast(`Tienes ${summary.unsyncedCount} gastos sin sincronizar. Sincroniza primero.`, 'warning')
        return
      }
    }

    const modal = document.getElementById('modal')

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h2>📦 Cerrar Mes Actual</h2>
          <button id="modal-close" class="btn-icon">✕</button>
        </div>

        <div class="modal-body">
          <!-- Advertencia -->
          <div style="background: var(--bg-warning)15; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--color-warning); margin-bottom: 1.5rem;">
            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--color-warning);">
              ⚠️ Esta acción es permanente
            </div>
            <div style="font-size: 13px; color: var(--text-secondary);">
              Los gastos del mes actual se moverán al histórico en Google Sheets y se limpiarán localmente.
            </div>
          </div>

          <!-- Resumen del mes -->
          <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 0.5rem;">
                MES A CERRAR
              </div>
              <div style="font-size: 24px; font-weight: 700;">
                ${formatMonth(currentMonth)}
              </div>
            </div>

            <div class="divider" style="margin: 1rem 0;"></div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Total de gastos:</span>
                <span style="font-weight: 600;">${summary.expenseCount}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Total gastado:</span>
                <span style="font-weight: 700; color: var(--color-primary);">${formatCurrency(summary.totalSpent)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Presupuesto:</span>
                <span style="font-weight: 600;">${formatCurrency(summary.budgetTotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Ingresos:</span>
                <span style="font-weight: 600; color: var(--color-success);">${formatCurrency(summary.totalIncome)}</span>
              </div>
            </div>

            ${summary.budgetTotal > 0 ? `
              <div class="divider" style="margin: 1rem 0;"></div>
              <div style="text-align: center;">
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 0.5rem;">
                  PORCENTAJE USADO DEL PRESUPUESTO
                </div>
                <div style="font-size: 32px; font-weight: 700; color: ${getBudgetColor((summary.totalSpent / summary.budgetTotal) * 100)};">
                  ${((summary.totalSpent / summary.budgetTotal) * 100).toFixed(1)}%
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Información adicional -->
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 1rem;">
            <strong>¿Qué sucederá?</strong>
            <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
              <li>Los ${summary.expenseCount} gastos se moverán a la hoja "Histórico" en Google Sheets</li>
              <li>La hoja "Mes Actual" se limpiará</li>
              <li>Los gastos locales se marcarán como archivados</li>
              <li>Podrás ver el histórico en la vista de Histórico</li>
            </ul>
          </div>

          ${!appState.spreadsheetConnected ? `
            <div style="background: var(--bg-danger)15; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--color-danger); margin-top: 1rem;">
              <div style="font-weight: 600; color: var(--color-danger); margin-bottom: 0.5rem;">
                ❌ Google Sheets no conectado
              </div>
              <div style="font-size: 13px; color: var(--text-secondary);">
                Debes conectar Google Sheets antes de cerrar el mes para guardar el histórico.
              </div>
            </div>
          ` : ''}
        </div>

        <div class="modal-footer">
          <button id="cancel-close-month" class="btn btn-secondary">
            Cancelar
          </button>
          <button id="confirm-close-month" class="btn btn-danger" ${!appState.spreadsheetConnected ? 'disabled' : ''}>
            Cerrar Mes
          </button>
        </div>
      </div>
    `

    modal.style.display = 'flex'

    // Event listeners
    document.getElementById('modal-close').addEventListener('click', hideModal)
    document.getElementById('cancel-close-month').addEventListener('click', hideModal)
    document.getElementById('confirm-close-month').addEventListener('click', () => handleCloseMonth(currentMonth, summary))

  } catch (error) {
    console.error('❌ Error mostrando modal de cierre:', error)
    showToast('Error al cargar datos del mes', 'error')
    showLoading(false)
  }
}

/**
 * Ejecutar cierre de mes
 */
async function handleCloseMonth(month, summary) {
  console.log(`📦 Ejecutando cierre de mes: ${month}`)

  try {
    showLoading(true)
    hideModal()

    // 1. Cerrar mes en Google Sheets (mover a histórico)
    if (appState.spreadsheetConnected) {
      console.log('📊 Cerrando mes en Google Sheets...')
      await googleSheetsService.closeCurrentMonth()
      showToast('Mes cerrado en Google Sheets', 'success')
    }

    // 2. Cerrar mes localmente (archivar gastos)
    console.log('💾 Cerrando mes localmente...')
    const result = await storageService.closeMonth(month)

    // 3. Limpiar gastos del mes actual (opcional, si quieres borrarlos)
    // await storageService.clearCurrentMonthExpenses(month)

    console.log(`✅ Mes ${month} cerrado exitosamente`)
    showToast(`Mes ${formatMonth(month)} cerrado correctamente`, 'success')

    // Emitir evento
    eventBus.emit('month:closed', { month, ...result })

    // Recargar dashboard
    await showDashboard()

  } catch (error) {
    console.error('❌ Error cerrando mes:', error)
    showToast(`Error al cerrar el mes: ${error.message}`, 'error')
  } finally {
    showLoading(false)
  }
}

/**
 * Detectar preferencia de tema
 */
function setupTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light')

  // Escuchar cambios
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.matches ? 'dark' : 'light')
  })
}

/**
 * Registrar Service Worker
 */
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      console.log('✅ Service Worker será registrado por Vite PWA')
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error)
    }
  }
}

/**
 * Iniciar aplicación cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📱 DOM cargado, iniciando aplicación...')

  setupTheme()
  setupAuthListeners()
  setupEventListeners()
  await registerServiceWorker()
  await initApp()
})

// Exportar para uso global si es necesario
window.appState = appState
window.showToast = showToast
window.googleSheetsService = googleSheetsService
window.storageService = storageService
window.handleSync = handleSync
window.showCloseMonthModal = showCloseMonthModal
