/**
 * Configuración de Google API
 *
 * IMPORTANTE: Este archivo NO contiene información sensible.
 * Los valores se obtienen de variables de entorno.
 *
 * Para desarrollo:
 * 1. Copiar .env.example a .env.local
 * 2. Completar con tus credenciales de Google Cloud Console
 * 3. Nunca commitear el archivo .env.local
 */

export const GOOGLE_CONFIG = {
  // Obtener de variables de entorno (Vite)
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,

  // Configuración pública (OK para commitear)
  scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
  discoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4'
  ],

  // URLs de Google API
  apiUrl: 'https://sheets.googleapis.com/v4',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token'
}

// Validar configuración al cargar
if (typeof window !== 'undefined') {
  const missingVars = []

  if (!GOOGLE_CONFIG.clientId) {
    missingVars.push('VITE_GOOGLE_CLIENT_ID')
  }
  if (!GOOGLE_CONFIG.apiKey) {
    missingVars.push('VITE_GOOGLE_API_KEY')
  }

  if (missingVars.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes:')
    missingVars.forEach(v => console.warn(`   - ${v}`))
    console.warn('📝 Pasos para configurar:')
    console.warn('   1. Copiar .env.example a .env.local')
    console.warn('   2. Obtener credenciales de https://console.cloud.google.com/')
    console.warn('   3. Completar las variables en .env.local')
    console.warn('   4. Reiniciar el servidor de desarrollo')
  } else {
    console.log('✅ Configuración de Google API cargada correctamente')
  }
}

// Constantes útiles
export const SHEET_NAMES = {
  CONFIG: 'Configuración',
  CURRENT: 'Gastos Mes Actual',
  HISTORY: 'Histórico'
}

export const API_LIMITS = {
  MAX_REQUESTS_PER_100_SECONDS: 100,
  MAX_BATCH_SIZE: 500,
  MAX_CELLS_PER_REQUEST: 10000000
}
