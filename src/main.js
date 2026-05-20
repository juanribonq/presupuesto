/**
 * App Presupuesto Personal
 * Punto de entrada principal
 */

// Importar configuración
import { GOOGLE_CONFIG } from './config/google-api.js'

// TODO: Importar servicios cuando estén implementados
// import AuthService from './services/AuthService.js'
// import StorageService from './services/StorageService.js'
// import AppController from './controllers/AppController.js'

// Estado global de la app
const appState = {
  initialized: false,
  authenticated: false,
  currentView: null,
  user: null
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

    // TODO: Inicializar servicios
    // await storageService.init()
    // await authService.init()

    // Simular carga inicial
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Por ahora mostrar pantalla de bienvenida
    showWelcomeScreen()

    appState.initialized = true
    console.log('✅ App inicializada correctamente')

  } catch (error) {
    console.error('❌ Error inicializando app:', error)
    showError('Error al inicializar la aplicación. Por favor recarga la página.')
  } finally {
    showLoading(false)
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
 * Mostrar pantalla de bienvenida temporal
 */
function showWelcomeScreen() {
  const content = document.getElementById('app-content')
  const header = document.getElementById('app-header')
  const bottomNav = document.getElementById('bottom-nav')

  // Mostrar elementos
  header.style.display = 'flex'
  content.style.display = 'block'
  bottomNav.style.display = 'flex'

  // Contenido temporal de bienvenida
  content.innerHTML = `
    <div class="container" style="padding-top: 2rem;">
      <div class="card" style="text-align: center; padding: 2rem;">
        <div style="font-size: 64px; margin-bottom: 1rem;">💰</div>
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 1rem;">
          App Presupuesto Personal
        </h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Bienvenido a tu gestor de presupuesto personal con sincronización a Google Sheets
        </p>

        <div class="divider" style="margin: 2rem 0;"></div>

        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 1rem;">
          Estado del Proyecto
        </h2>

        <div style="text-align: left; background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <p style="margin-bottom: 0.5rem;"><strong>✅ Completado:</strong></p>
          <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
            <li>Planificación y diseño</li>
            <li>Arquitectura definida</li>
            <li>Setup del proyecto</li>
            <li>Sistema de diseño (CSS)</li>
            <li>Estructura de archivos</li>
          </ul>
        </div>

        <div style="text-align: left; background: var(--color-info-subtle); padding: 1rem; border-radius: 8px;">
          <p style="margin-bottom: 0.5rem;"><strong>🚧 Por Implementar:</strong></p>
          <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
            <li>Servicios (Storage, Auth, Sync)</li>
            <li>Modelos de datos</li>
            <li>Vistas y componentes</li>
            <li>Integración Google Sheets</li>
            <li>Funcionalidad completa</li>
          </ul>
        </div>

        <div class="divider" style="margin: 2rem 0;"></div>

        <p style="font-size: 14px; color: var(--text-tertiary);">
          La aplicación está en desarrollo activo.<br>
          Próximos pasos: Implementar servicios y vistas.
        </p>
      </div>
    </div>
  `
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
  toast.innerHTML = `
    <span>${message}</span>
  `

  container.appendChild(toast)

  // Auto-remover después de 3 segundos
  setTimeout(() => {
    toast.style.animation = 'slideInDown 0.3s ease reverse'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Event Listeners
 */
function setupEventListeners() {
  // Bottom navigation
  const navItems = document.querySelectorAll('.bottom-nav-item')
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remover active de todos
      navItems.forEach(i => i.classList.remove('active'))
      // Agregar active al clickeado
      item.classList.add('active')

      const view = item.dataset.view
      console.log(`Navegando a: ${view}`)
      // TODO: Implementar navegación real
      showToast(`Vista ${view} - Por implementar`, 'info')
    })
  })

  // Botón de sincronización
  const syncBtn = document.getElementById('sync-btn')
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      console.log('Sincronización solicitada')
      showToast('Sincronización - Por implementar', 'info')
    })
  }

  // Botón de usuario
  const userBtn = document.getElementById('user-btn')
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      console.log('Perfil de usuario')
      showToast('Perfil - Por implementar', 'info')
    })
  }

  // FAB
  const fab = document.getElementById('fab')
  if (fab) {
    fab.style.display = 'flex'
    fab.addEventListener('click', () => {
      console.log('Nuevo gasto')
      showToast('Nuevo gasto - Por implementar', 'info')
    })
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
      // Vite PWA plugin se encarga de esto automáticamente
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
  setupEventListeners()
  await registerServiceWorker()
  await initApp()
})

// Exportar para uso global si es necesario
window.appState = appState
window.showToast = showToast
