/**
 * Utilidades y helpers generales
 */

/**
 * Formatear moneda
 */
export function formatCurrency(amount, currency = 'USD', locale = 'es-ES') {
  // Formato simple sin símbolo de moneda
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatear fecha
 */
export function formatDate(dateString, locale = 'es-ES', options = {}) {
  const date = new Date(dateString)
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  return date.toLocaleDateString(locale, { ...defaultOptions, ...options })
}

/**
 * Formatear fecha completa con hora
 */
export function formatDateTime(dateString, locale = 'es-ES') {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formatear fecha relativa (hace X días)
 */
export function formatRelativeDate(dateString, locale = 'es-ES') {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
  return `Hace ${Math.floor(diffDays / 365)} años`
}

/**
 * Formatear mes (YYYY-MM) a texto
 */
export function formatMonth(monthString, locale = 'es-ES') {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long'
  })
}

/**
 * Formatear porcentaje
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`
}

/**
 * Obtener mes actual (YYYY-MM)
 */
export function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Obtener mes siguiente
 */
export function getNextMonth(monthString = null) {
  const current = monthString ? new Date(`${monthString}-01`) : new Date()
  const next = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Obtener mes anterior
 */
export function getPreviousMonth(monthString = null) {
  const current = monthString ? new Date(`${monthString}-01`) : new Date()
  const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Generar lista de meses (para histórico)
 */
export function generateMonthList(startMonth, endMonth) {
  const months = []
  let current = new Date(`${startMonth}-01`)
  const end = new Date(`${endMonth}-01`)

  while (current <= end) {
    months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`)
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
  }

  return months
}

/**
 * Validar formato de mes (YYYY-MM)
 */
export function isValidMonth(monthString) {
  return /^\d{4}-\d{2}$/.test(monthString)
}

/**
 * Generar ID único
 */
export function generateId() {
  return crypto.randomUUID()
}

/**
 * Truncar texto
 */
export function truncate(text, maxLength = 50) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitalizar primera letra
 */
export function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Debounce - Retrasar ejecución de función
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle - Limitar frecuencia de ejecución
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Agrupar array por clave
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

/**
 * Sumar valores de array
 */
export function sum(array, key = null) {
  if (key) {
    return array.reduce((total, item) => total + (item[key] || 0), 0)
  }
  return array.reduce((total, value) => total + value, 0)
}

/**
 * Ordenar array de objetos
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Copiar al portapapeles
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Error copiando al portapapeles:', error)
    return false
  }
}

/**
 * Descargar archivo
 */
export function downloadFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Leer archivo como texto
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

/**
 * Validar email
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Generar color aleatorio
 */
export function randomColor() {
  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Determinar si el color es oscuro
 */
export function isColorDark(hexColor) {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}

/**
 * Sleep/delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry - Reintentar función con backoff exponencial
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      await sleep(delay * attempt) // Backoff exponencial
      console.log(`Reintentando (${attempt}/${maxAttempts})...`)
    }
  }
}

/**
 * Validar conexión a Internet
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Escuchar cambios de conexión
 */
export function onConnectionChange(callback) {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))
}

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatMonth,
  formatPercentage,
  getCurrentMonth,
  getNextMonth,
  getPreviousMonth,
  generateMonthList,
  isValidMonth,
  generateId,
  truncate,
  capitalize,
  debounce,
  throttle,
  groupBy,
  sum,
  sortBy,
  copyToClipboard,
  downloadFile,
  readFileAsText,
  isValidEmail,
  randomColor,
  isColorDark,
  sleep,
  retry,
  isOnline,
  onConnectionChange
}
