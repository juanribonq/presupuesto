/**
 * EventBus - Sistema simple de eventos pub/sub
 */

class EventBus {
  constructor() {
    this.listeners = {}
  }

  /**
   * Suscribirse a un evento
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  /**
   * Desuscribirse de un evento
   */
  off(event, callback) {
    if (!this.listeners[event]) return

    this.listeners[event] = this.listeners[event].filter(
      cb => cb !== callback
    )
  }

  /**
   * Emitir un evento
   */
  emit(event, data) {
    if (!this.listeners[event]) return

    this.listeners[event].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error en listener de evento "${event}":`, error)
      }
    })
  }

  /**
   * Suscribirse a un evento solo una vez
   */
  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data)
      this.off(event, onceWrapper)
    }
    this.on(event, onceWrapper)
  }

  /**
   * Limpiar todos los listeners de un evento
   */
  clear(event) {
    if (event) {
      delete this.listeners[event]
    } else {
      this.listeners = {}
    }
  }
}

// Exportar instancia única (singleton)
const eventBus = new EventBus()
export default eventBus
