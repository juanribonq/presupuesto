/**
 * AuthService - Manejo de autenticación con Google OAuth 2.0
 */

import { GOOGLE_CONFIG } from '../config/google-api.js'

class AuthService {
  constructor() {
    this.gapiLoaded = false
    this.gisLoaded = false
    this.tokenClient = null
    this.accessToken = null
    this.user = null
    this.listeners = {}
  }

  /**
   * Inicializar servicio de autenticación
   */
  async init() {
    console.log('🔐 Inicializando AuthService...')

    try {
      // Verificar configuración
      if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.apiKey) {
        throw new Error('Configuración de Google API incompleta')
      }

      // Cargar Google API Client
      await this.loadGapi()
      console.log('✅ Google API Client cargado')

      // Inicializar gapi.client
      await gapi.client.init({
        apiKey: GOOGLE_CONFIG.apiKey,
        discoveryDocs: GOOGLE_CONFIG.discoveryDocs
      })
      this.gapiLoaded = true
      console.log('✅ gapi.client inicializado')

      // Cargar Google Identity Services
      await this.loadGis()
      console.log('✅ Google Identity Services cargado')

      // Configurar token client
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scope,
        callback: async (response) => {
          if (response.error) {
            console.error('❌ Error en OAuth:', response.error)
            this.emit('auth:error', response.error)
            return
          }

          if (response.access_token) {
            this.accessToken = response.access_token
            this.saveToken(response)

            // Configurar token en gapi
            gapi.client.setToken({ access_token: response.access_token })

            // Obtener info del usuario
            await this.loadUserInfo()
            console.log('✅ Token de acceso obtenido')
          }
        }
      })
      this.gisLoaded = true

      // Verificar si hay token guardado
      const savedToken = this.loadToken()
      if (savedToken && !this.isTokenExpired(savedToken)) {
        this.accessToken = savedToken.access_token
        gapi.client.setToken(savedToken)
        await this.loadUserInfo()
        console.log('✅ Sesión restaurada desde token guardado')
        return true
      }

      console.log('ℹ️ No hay sesión activa')
      return false

    } catch (error) {
      console.error('❌ Error inicializando AuthService:', error)
      throw error
    }
  }

  /**
   * Iniciar sesión con Google
   */
  login() {
    console.log('🔐 Iniciando login...')

    if (!this.gisLoaded) {
      throw new Error('Google Identity Services no está cargado')
    }

    // Solicitar token de acceso
    this.tokenClient.requestAccessToken({ prompt: 'consent' })
  }

  /**
   * Cerrar sesión
   */
  logout() {
    console.log('🚪 Cerrando sesión...')

    if (this.accessToken) {
      // Revocar token
      google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log('✅ Token revocado')
      })

      // Limpiar estado
      this.accessToken = null
      this.user = null
      this.removeToken()

      // Limpiar gapi
      gapi.client.setToken(null)

      this.emit('auth:logout')
    }
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return this.accessToken !== null && this.user !== null
  }

  /**
   * Obtener usuario actual
   */
  getUser() {
    return this.user
  }

  /**
   * Obtener información del usuario
   */
  async loadUserInfo() {
    try {
      // Intentar primero con People API para obtener nombre completo
      try {
        const peopleResponse = await fetch(
          'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`
            }
          }
        )

        if (peopleResponse.ok) {
          const data = await peopleResponse.json()
          console.log('📋 Datos del usuario recibidos (People API):', data)

          const email = data.emailAddresses?.[0]?.value || 'usuario@email.com'
          const name = data.names?.[0]?.displayName || email.split('@')[0]
          const picture = data.photos?.[0]?.url || null

          this.user = {
            email,
            name,
            picture,
            verified_email: true
          }

          console.log('✅ Usuario autenticado:', this.user.name, `(${this.user.email})`)
          this.emit('auth:success', this.user)
          return
        }
      } catch (peopleError) {
        console.warn('⚠️ People API no disponible, usando método alternativo')
      }

      // Método alternativo: usar tokeninfo (más limitado pero funciona siempre)
      const tokenResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${this.accessToken}`
      )

      if (!tokenResponse.ok) {
        throw new Error('Error validando token')
      }

      const tokenInfo = await tokenResponse.json()
      console.log('📋 Token info recibido:', tokenInfo)

      this.user = {
        email: tokenInfo.email || 'usuario@email.com',
        name: tokenInfo.email ? tokenInfo.email.split('@')[0] : 'Usuario',
        picture: null,
        verified_email: tokenInfo.email_verified || false
      }

      console.log('✅ Usuario autenticado:', this.user.name, `(${this.user.email})`)
      this.emit('auth:success', this.user)

    } catch (error) {
      console.error('❌ Error obteniendo info del usuario:', error)
      this.emit('auth:error', error)
    }
  }

  /**
   * Cargar Google API Client
   */
  loadGapi() {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (typeof gapi !== 'undefined') {
        gapi.load('client', resolve)
        return
      }

      // Cargar script
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        gapi.load('client', resolve)
      }
      script.onerror = () => {
        reject(new Error('Error cargando Google API Client'))
      }
      document.body.appendChild(script)
    })
  }

  /**
   * Cargar Google Identity Services
   */
  loadGis() {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (typeof google !== 'undefined' && google.accounts) {
        resolve()
        return
      }

      // Cargar script
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = () => {
        reject(new Error('Error cargando Google Identity Services'))
      }
      document.body.appendChild(script)
    })
  }

  /**
   * Guardar token en localStorage
   */
  saveToken(token) {
    const tokenData = {
      access_token: token.access_token,
      expires_at: Date.now() + (token.expires_in * 1000),
      scope: token.scope
    }
    localStorage.setItem('google_token', JSON.stringify(tokenData))
  }

  /**
   * Cargar token desde localStorage
   */
  loadToken() {
    try {
      const data = localStorage.getItem('google_token')
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error cargando token:', error)
      return null
    }
  }

  /**
   * Eliminar token de localStorage
   */
  removeToken() {
    localStorage.removeItem('google_token')
  }

  /**
   * Verificar si el token expiró
   */
  isTokenExpired(token) {
    if (!token || !token.expires_at) {
      return true
    }
    // Considerar expirado si quedan menos de 5 minutos
    return Date.now() >= (token.expires_at - 5 * 60 * 1000)
  }

  /**
   * Sistema de eventos simple
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
  }

  emit(event, data) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(callback => callback(data))
  }
}

// Exportar instancia única (singleton)
const authService = new AuthService()
export default authService
