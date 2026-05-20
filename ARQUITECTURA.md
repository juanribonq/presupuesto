# Arquitectura Técnica - App Presupuesto Personal

## 1. STACK TECNOLÓGICO

### Frontend
- **Framework:** Vanilla JavaScript (ES6+) con módulos
  - Alternativa: React/Preact (si se requiere mayor complejidad)
  - Razón: Mantener bundle pequeño, performance óptima

- **CSS:** CSS3 con Custom Properties (variables CSS)
  - CSS Grid y Flexbox para layouts
  - Media queries para responsive
  - Sin framework CSS para minimizar peso

- **Build Tool:** Vite
  - Hot reload para desarrollo
  - Optimización y minificación para producción
  - Tree shaking automático
  - PWA plugin para manifest y service worker

### Backend / Persistencia
- **Backend:** Serverless (Google Sheets API como backend)
- **Base de datos local:** IndexedDB
  - Librería: idb (wrapper promisificado de IndexedDB)
  - Para almacenamiento offline y cache

### APIs y Servicios
- **Google Sheets API v4**
  - Autenticación: OAuth 2.0
  - Scope: `https://www.googleapis.com/auth/spreadsheets`
  - Librería: google-api-javascript-client (gapi)

### PWA
- **Service Worker:** Workbox
  - Estrategia de cache
  - Background sync para sincronización offline
  - Precache de assets estáticos

- **Manifest:** manifest.json
  - Configuración de instalación
  - Íconos en múltiples resoluciones
  - Theme colors

## 2. ARQUITECTURA DE SOFTWARE

### Patrón Arquitectónico
**MVC Modificado (Model-View-Controller)**

```
┌─────────────────────────────────────────────┐
│                   VIEW LAYER                │
│  (HTML + CSS + UI Components)              │
│  - Dashboard.js                            │
│  - ExpenseForm.js                          │
│  - CategoryView.js                         │
│  - HistoryView.js                          │
└──────────────┬──────────────────────────────┘
               │
               ↕ Events / Updates
               │
┌──────────────┴──────────────────────────────┐
│              CONTROLLER LAYER               │
│  - AppController.js (Main)                 │
│  - ExpenseController.js                    │
│  - BudgetController.js                     │
│  - SyncController.js                       │
└──────────────┬──────────────────────────────┘
               │
               ↕ Data Operations
               │
┌──────────────┴──────────────────────────────┐
│               MODEL LAYER                   │
│  - ExpenseModel.js                         │
│  - CategoryModel.js                        │
│  - BudgetModel.js                          │
│  - SettingsModel.js                        │
└──────────────┬──────────────────────────────┘
               │
               ↕ CRUD Operations
               │
┌──────────────┴──────────────────────────────┐
│             STORAGE LAYER                   │
│  ┌──────────────┐  ┌──────────────────────┐│
│  │  IndexedDB   │  │  Google Sheets API  ││
│  │  (Local)     │←→│  (Remote)           ││
│  └──────────────┘  └──────────────────────┘│
│  - StorageService.js                       │
│  - GoogleSheetsService.js                  │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│           UTILITY LAYER                    │
│  - SyncQueue.js (offline sync)            │
│  - EventBus.js (pub/sub)                  │
│  - Utils.js (helpers)                     │
│  - DateUtils.js                           │
└────────────────────────────────────────────┘
```

### Estructura de Carpetas

```
app-presupuesto/
├── index.html                 # Punto de entrada
├── manifest.json             # PWA manifest
├── service-worker.js         # Service worker para PWA
├── package.json              # Dependencias
├── vite.config.js           # Configuración Vite
├── .env.example             # Variables de entorno ejemplo
│
├── public/                   # Assets estáticos
│   ├── icons/               # Íconos PWA (múltiples tamaños)
│   │   ├── icon-72.png
│   │   ├── icon-96.png
│   │   ├── icon-128.png
│   │   ├── icon-144.png
│   │   ├── icon-152.png
│   │   ├── icon-192.png
│   │   ├── icon-384.png
│   │   └── icon-512.png
│   └── splash/              # Splash screens iOS
│       └── ...
│
├── src/
│   ├── main.js              # Inicialización de app
│   │
│   ├── styles/              # CSS
│   │   ├── main.css         # Estilos globales
│   │   ├── variables.css    # CSS custom properties
│   │   ├── components.css   # Componentes reutilizables
│   │   └── themes.css       # Tema claro/oscuro
│   │
│   ├── views/               # Componentes de vista
│   │   ├── Dashboard.js
│   │   ├── ExpenseForm.js
│   │   ├── ExpenseList.js
│   │   ├── CategoryView.js
│   │   ├── CategoryEditor.js
│   │   ├── HistoryView.js
│   │   ├── MonthDetail.js
│   │   ├── ChartsView.js
│   │   ├── SettingsView.js
│   │   └── CloseMonthView.js
│   │
│   ├── controllers/         # Lógica de negocio
│   │   ├── AppController.js
│   │   ├── ExpenseController.js
│   │   ├── BudgetController.js
│   │   ├── CategoryController.js
│   │   ├── SyncController.js
│   │   └── HistoryController.js
│   │
│   ├── models/              # Modelos de datos
│   │   ├── Expense.js
│   │   ├── Category.js
│   │   ├── Budget.js
│   │   ├── Month.js
│   │   └── Settings.js
│   │
│   ├── services/            # Servicios
│   │   ├── StorageService.js       # IndexedDB wrapper
│   │   ├── GoogleSheetsService.js  # API Google Sheets
│   │   ├── SyncService.js          # Lógica de sincronización
│   │   ├── AuthService.js          # OAuth Google
│   │   └── ExportService.js        # Exportar PDF/JSON
│   │
│   ├── utils/               # Utilidades
│   │   ├── EventBus.js      # Sistema de eventos
│   │   ├── SyncQueue.js     # Cola de sincronización offline
│   │   ├── DateUtils.js     # Helpers de fechas
│   │   ├── NumberUtils.js   # Formateo de números
│   │   ├── Validator.js     # Validaciones
│   │   └── Logger.js        # Logging
│   │
│   └── config/              # Configuración
│       ├── constants.js     # Constantes globales
│       ├── db-schema.js     # Schema IndexedDB
│       └── sheets-schema.js # Schema Google Sheets
│
├── tests/                   # Tests (futuro)
│   └── ...
│
└── docs/                    # Documentación
    ├── REQUERIMIENTOS.md
    ├── ARQUITECTURA.md
    └── API.md
```

## 3. MODELOS DE DATOS

### 3.1 Modelo: Expense (Gasto)

```javascript
class Expense {
  id: string              // UUID generado localmente
  date: Date             // Fecha del gasto
  categoryId: string     // ID de categoría global
  subcategoryId: string  // ID de subcategoría
  description: string    // Descripción del gasto
  amount: number         // Monto en pesos
  monthYear: string      // "2026-02" (para agrupación)
  createdAt: Date        // Timestamp creación
  updatedAt: Date        // Timestamp última modificación
  syncedAt: Date | null  // Timestamp última sincronización
  synced: boolean        // Si está sincronizado con Sheets
}
```

### 3.2 Modelo: Category (Categoría Global)

```javascript
class Category {
  id: string           // UUID
  name: string         // "Gastos Fijos", "Gastos Variables", "Ahorros"
  icon: string         // Emoji o nombre de ícono
  color: string        // Color hex
  order: number        // Orden de visualización
  subcategories: Subcategory[]
}
```

### 3.3 Modelo: Subcategory (Subcategoría)

```javascript
class Subcategory {
  id: string           // UUID
  categoryId: string   // ID de categoría padre
  name: string         // "Mercado", "Salud", etc.
  icon: string         // Emoji o ícono
  budget: number       // Presupuesto asignado
  order: number        // Orden dentro de categoría
}
```

### 3.4 Modelo: Budget (Presupuesto Mensual)

```javascript
class Budget {
  id: string              // UUID
  monthYear: string       // "2026-02"
  income: number          // Ingreso del mes
  subcategoryBudgets: {   // Presupuestos por subcategoría
    [subcategoryId: string]: number
  }
  createdAt: Date
  closed: boolean         // Si el mes está cerrado
  closedAt: Date | null   // Fecha de cierre
}
```

### 3.5 Modelo: Month (Mes Histórico)

```javascript
class Month {
  id: string              // UUID
  monthYear: string       // "2026-02"
  income: number          // Ingreso del mes
  totalBudget: number     // Total presupuestado
  totalSpent: number      // Total gastado
  percentageUsed: number  // % de presupuesto usado
  closedAt: Date          // Fecha de cierre

  // Snapshot de categorías al cierre
  categorySnapshots: {
    categoryId: string
    subcategoryId: string
    name: string
    budget: number
    spent: number
  }[]

  // Referencia a gastos (cargados bajo demanda)
  expenseIds: string[]
}
```

### 3.6 Modelo: Settings (Configuración)

```javascript
class Settings {
  userId: string              // ID de usuario (email Google)
  userName: string            // Nombre opcional
  currency: string            // "COP"
  locale: string              // "es-CO"
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean      // Activar notificaciones
  autoSync: boolean           // Sincronización automática

  // Google Sheets
  sheetId: string | null      // ID del Google Sheet
  sheetName: string | null    // Nombre del documento

  // Tutorial
  completedTutorial: boolean

  // Última sincronización
  lastSyncAt: Date | null
}
```

### 3.7 Modelo: ExpenseTemplate (Template de Gasto)

```javascript
class ExpenseTemplate {
  id: string
  name: string              // "Netflix", "Gimnasio"
  categoryId: string
  subcategoryId: string
  amount: number
  description: string
  recurring: boolean        // Si es gasto recurrente mensual
  order: number             // Orden de visualización
}
```

## 4. SCHEMA DE BASE DE DATOS

### 4.1 IndexedDB Schema

```javascript
// Database: BudgetAppDB
// Version: 1

const DB_SCHEMA = {
  name: 'BudgetAppDB',
  version: 1,
  stores: {

    // Gastos
    expenses: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        date: { keyPath: 'date', unique: false },
        monthYear: { keyPath: 'monthYear', unique: false },
        categoryId: { keyPath: 'categoryId', unique: false },
        subcategoryId: { keyPath: 'subcategoryId', unique: false },
        synced: { keyPath: 'synced', unique: false }
      }
    },

    // Categorías
    categories: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        order: { keyPath: 'order', unique: false }
      }
    },

    // Subcategorías
    subcategories: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        categoryId: { keyPath: 'categoryId', unique: false },
        order: { keyPath: 'order', unique: false }
      }
    },

    // Presupuestos mensuales
    budgets: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        monthYear: { keyPath: 'monthYear', unique: true }
      }
    },

    // Meses históricos
    months: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        monthYear: { keyPath: 'monthYear', unique: true },
        closedAt: { keyPath: 'closedAt', unique: false }
      }
    },

    // Templates de gastos
    templates: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        order: { keyPath: 'order', unique: false }
      }
    },

    // Configuración (un solo registro)
    settings: {
      keyPath: 'userId',
      autoIncrement: false
    },

    // Cola de sincronización
    syncQueue: {
      keyPath: 'id',
      autoIncrement: false,
      indexes: {
        timestamp: { keyPath: 'timestamp', unique: false },
        type: { keyPath: 'type', unique: false }
      }
    }
  }
}
```

### 4.2 Google Sheets Schema

#### Sheet 1: Configuración
```
┌──────────────┬──────────────┬─────────────┬───────┐
│ Categoría    │ Subcategoría │ Presupuesto │ Orden │
├──────────────┼──────────────┼─────────────┼───────┤
│ META_DATA    │ INGRESO      │ 3000000     │ -     │ ← Ingreso mensual
│ META_DATA    │ MES_ANIO     │ 2026-02     │ -     │ ← Mes actual
├──────────────┼──────────────┼─────────────┼───────┤
│ Gastos Fijos │ Arriendo     │ 800000      │ 1     │
│ Gastos Fijos │ Servicios    │ 200000      │ 2     │
│ Gastos Var.  │ Mercado      │ 500000      │ 3     │
│ Gastos Var.  │ Transporte   │ 300000      │ 4     │
│ Ahorros      │ Ahorro Gen.  │ 400000      │ 5     │
└──────────────┴──────────────┴─────────────┴───────┘
```

#### Sheet 2: Gastos Mes Actual
```
┌────────────┬──────────────┬──────────────┬─────────────┬─────────┐
│ Fecha      │ Categoría    │ Subcategoría │ Descripción │ Valor   │
├────────────┼──────────────┼──────────────┼─────────────┼─────────┤
│ 2026-02-20 │ Gastos Var.  │ Mercado      │ Supermercado│ 85000   │
│ 2026-02-20 │ Gastos Var.  │ Transporte   │ Uber        │ 15000   │
│ 2026-02-19 │ Gastos Var.  │ Mercado      │ Fruver      │ 25000   │
│ 2026-02-15 │ Gastos Fijos │ Servicios    │ Energía     │ 120000  │
│ 2026-02-01 │ Gastos Fijos │ Arriendo     │ Arriendo feb│ 800000  │
└────────────┴──────────────┴──────────────┴─────────────┴─────────┘
```

#### Sheet 3: Histórico
```
┌─────────┬────────────┬──────────────┬──────────────┬─────────────┬─────────┬──────────────┬──────────────┐
│ Mes-Año │ Fecha      │ Categoría    │ Subcategoría │ Descripción │ Valor   │ Presup. Mes  │ Total Gastado│
├─────────┼────────────┼──────────────┼──────────────┼─────────────┼─────────┼──────────────┼──────────────┤
│ 2026-01 │ 2026-01-31 │ META_SUMMARY │ RESUMEN      │ Enero 2026  │ 0       │ 3000000      │ 2650000      │← Fila resumen
│ 2026-01 │ 2026-01-30 │ Gastos Var.  │ Mercado      │ Supermercado│ 95000   │ -            │ -            │
│ 2026-01 │ 2026-01-28 │ Gastos Var.  │ Restaurantes │ Almuerzo    │ 35000   │ -            │ -            │
│ ...     │ ...        │ ...          │ ...          │ ...         │ ...     │ -            │ -            │
│ 2025-12 │ 2025-12-31 │ META_SUMMARY │ RESUMEN      │ Dic. 2025   │ 0       │ 3000000      │ 3100000      │
│ 2025-12 │ 2025-12-30 │ Gastos Var.  │ Regalos      │ Navidad     │ 250000  │ -            │ -            │
└─────────┴────────────┴──────────────┴──────────────┴─────────────┴─────────┴──────────────┴──────────────┘
```

## 5. FLUJO DE SINCRONIZACIÓN

### 5.1 Arquitectura de Sincronización

```
┌─────────────────────────────────────────────────┐
│              USER ACTIONS                       │
│  (Crear/Editar/Eliminar gastos o categorías)  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│           1. WRITE TO INDEXEDDB                 │
│  - Actualización inmediata en local             │
│  - UI se actualiza instantáneamente             │
│  - Marcar registro como "no sincronizado"       │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│        2. ADD TO SYNC QUEUE                     │
│  - Agregar operación a cola de sincronización   │
│  - Si hay conexión → proceso inmediato          │
│  - Si NO hay conexión → guardar para después    │
└──────────────────┬──────────────────────────────┘
                   ↓
              ¿Hay conexión?
                   │
         ┌─────────┴─────────┐
         │ NO                │ SÍ
         ↓                   ↓
┌────────────────┐   ┌───────────────────────┐
│ MODO OFFLINE   │   │  3. SYNC TO SHEETS   │
│ - Esperar      │   │  - Batch operations  │
│ - Mantener en  │   │  - Update Sheet      │
│   cola         │   │  - Handle errors     │
│ - Retry cuando │   └──────────┬────────────┘
│   haya red     │              ↓
└────────────────┘   ┌───────────────────────┐
                     │  4. MARK AS SYNCED    │
                     │  - Update timestamp   │
                     │  - Remove from queue  │
                     │  - Update UI indicator│
                     └───────────────────────┘
```

### 5.2 Sincronización desde Google Sheets (Pull)

```
┌─────────────────────────────────────────────────┐
│         TRIGGER: App abre / Pull-to-refresh    │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│    1. FETCH FROM SHEETS (3 hojas en paralelo)  │
│    - Sheet 1: Configuración y presupuestos     │
│    - Sheet 2: Gastos del mes actual            │
│    - Sheet 3: Histórico (opcional)             │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│         2. COMPARE WITH LOCAL DATA              │
│    - Comparar timestamps (updatedAt)            │
│    - Detectar: nuevos, modificados, eliminados  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│         3. RESOLVE CONFLICTS                    │
│    Estrategia: Última escritura gana            │
│    - Si timestamp Sheet > local → usar Sheet    │
│    - Si timestamp local > Sheet → usar local    │
│    - Loguear conflictos para debugging          │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│         4. UPDATE INDEXEDDB                     │
│    - Aplicar cambios a base local               │
│    - Marcar como sincronizado                   │
└──────────────────┬──────────────────────────────┘
                   ↓
┌──────────────────┴──────────────────────────────┐
│         5. UPDATE UI                            │
│    - Renderizar nuevos datos                    │
│    - Mostrar notificación si hubo cambios       │
│    - Actualizar indicador de sync               │
└─────────────────────────────────────────────────┘
```

### 5.3 Casos Especiales de Sincronización

#### Caso 1: Cierre de Mes
```
1. Usuario presiona "Cerrar Mes" → Confirma
2. Sistema hace snapshot de datos del mes:
   - Todos los gastos
   - Todas las categorías y presupuestos
   - Métricas calculadas
3. Batch write a Sheet 3 (Histórico):
   - Una fila resumen del mes
   - Todas las filas de gastos con mes-año
4. Clear Sheet 2 (Gastos mes actual)
5. Copiar configuración Sheet 1 para nuevo mes
6. Actualizar IndexedDB:
   - Mover gastos a tabla 'months'
   - Crear nuevo Budget para nuevo mes
   - Resetear contadores
7. Sincronizar todo → esperar confirmación
8. Mostrar pantalla "Nuevo mes iniciado"
```

#### Caso 2: Conflicto de Edición Simultánea
```
Escenario: Usuario edita gasto en app mientras alguien
           edita mismo gasto en Google Sheet

1. App detecta conflicto (checksums no coinciden)
2. Comparar timestamps:
   - App: updatedAt = 2026-02-20 10:30:00
   - Sheet: updatedAt = 2026-02-20 10:31:00
3. Sheet es más reciente → Sheet gana
4. Sobrescribir versión local con versión de Sheet
5. Mostrar notificación: "Se actualizó gasto X desde Sheets"
6. Log del conflicto para análisis
```

## 6. COMPONENTES PRINCIPALES

### 6.1 AppController (Controlador Principal)

```javascript
class AppController {
  constructor() {
    this.storageService = new StorageService()
    this.syncService = new SyncService()
    this.authService = new AuthService()
    this.eventBus = new EventBus()

    this.currentView = null
    this.currentMonth = null
    this.user = null
  }

  async init() {
    // 1. Inicializar IndexedDB
    // 2. Verificar autenticación
    // 3. Cargar configuración
    // 4. Sincronizar con Sheets
    // 5. Renderizar vista inicial
  }

  navigate(view, params) {
    // Navegación entre vistas
  }

  // Event handlers
  onExpenseCreated() {}
  onBudgetUpdated() {}
  onSyncCompleted() {}
}
```

### 6.2 SyncService (Servicio de Sincronización)

```javascript
class SyncService {
  constructor(storageService, sheetsService) {
    this.storage = storageService
    this.sheets = sheetsService
    this.queue = new SyncQueue()
    this.syncing = false
  }

  // Push: Local → Sheets
  async pushChanges() {
    // 1. Obtener cambios pendientes de cola
    // 2. Agrupar en batch
    // 3. Enviar a Google Sheets
    // 4. Actualizar estado de sync
  }

  // Pull: Sheets → Local
  async pullChanges() {
    // 1. Fetch data de Sheets
    // 2. Comparar con local
    // 3. Resolver conflictos
    // 4. Actualizar IndexedDB
  }

  // Bidireccional
  async sync() {
    if (this.syncing) return

    this.syncing = true
    try {
      await this.pushChanges()
      await this.pullChanges()
      this.emit('sync:complete')
    } catch (error) {
      this.emit('sync:error', error)
    } finally {
      this.syncing = false
    }
  }

  // Auto-sync cada X minutos
  startAutoSync(intervalMinutes = 5) {}
  stopAutoSync() {}
}
```

### 6.3 GoogleSheetsService (API de Google Sheets)

```javascript
class GoogleSheetsService {
  constructor(authService) {
    this.auth = authService
    this.sheetId = null
  }

  // Inicializar con ID de Sheet
  init(sheetId) {}

  // READ Operations
  async getConfiguration() {
    // Leer Sheet 1
  }

  async getCurrentMonthExpenses() {
    // Leer Sheet 2
  }

  async getHistory(monthYear) {
    // Leer Sheet 3 filtrado
  }

  // WRITE Operations (Batch)
  async updateConfiguration(categories, subcategories, income) {
    // Batch update Sheet 1
  }

  async addExpenses(expenses) {
    // Batch append a Sheet 2
  }

  async updateExpense(expense) {
    // Update específico en Sheet 2
  }

  async deleteExpense(expenseId) {
    // Delete row en Sheet 2
  }

  async archiveMonth(monthData) {
    // Batch write a Sheet 3
    // Clear Sheet 2
  }

  // UTILITY
  async createSheet(name) {
    // Crear nuevo Google Sheet con estructura
  }
}
```

### 6.4 StorageService (IndexedDB Wrapper)

```javascript
class StorageService {
  constructor() {
    this.db = null
  }

  async init() {
    // Abrir/crear DB con schema
  }

  // Gastos
  async addExpense(expense) {}
  async getExpense(id) {}
  async updateExpense(expense) {}
  async deleteExpense(id) {}
  async getExpensesByMonth(monthYear) {}
  async getExpensesBySubcategory(subcategoryId, monthYear) {}

  // Categorías
  async addCategory(category) {}
  async getCategories() {}
  async updateCategory(category) {}

  // Subcategorías
  async addSubcategory(subcategory) {}
  async getSubcategories(categoryId) {}
  async updateSubcategory(subcategory) {}

  // Presupuestos
  async getBudget(monthYear) {}
  async updateBudget(budget) {}

  // Meses históricos
  async getMonths() {}
  async getMonth(monthYear) {}
  async addMonth(month) {}

  // Configuración
  async getSettings() {}
  async updateSettings(settings) {}

  // Cola de sincronización
  async addToSyncQueue(operation) {}
  async getSyncQueue() {}
  async clearSyncQueue() {}
}
```

## 7. SERVICE WORKER (PWA)

### Estrategia de Cache

```javascript
// service-worker.js

// 1. PRECACHE - Assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('static-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.js',
        '/src/styles/main.css',
        '/icons/icon-192.png',
        // ... más assets
      ])
    })
  )
})

// 2. NETWORK FIRST - API calls
// Para Google Sheets API
// Intenta red primero, fallback a cache

// 3. CACHE FIRST - Assets
// Para CSS, JS, imágenes
// Busca en cache primero

// 4. BACKGROUND SYNC
// Para sincronización offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses())
  }
})
```

## 8. SEGURIDAD

### OAuth 2.0 Flow

```
1. Usuario presiona "Conectar con Google"
2. Redirect a Google OAuth consent screen
3. Usuario autoriza permisos (Sheets)
4. Google redirect con authorization code
5. Intercambiar code por access token + refresh token
6. Almacenar tokens en localStorage (encriptado)
7. Usar access token en headers de API calls
8. Refresh automático cuando expira (1 hora)
```

### Almacenamiento Seguro

```javascript
// No guardar credenciales en texto plano
// Usar Web Crypto API para encriptar tokens sensibles

class SecureStorage {
  async encryptToken(token) {
    // Encrypt con AES-GCM
  }

  async decryptToken(encryptedToken) {
    // Decrypt
  }

  async saveToken(key, token) {
    const encrypted = await this.encryptToken(token)
    localStorage.setItem(key, encrypted)
  }

  async getToken(key) {
    const encrypted = localStorage.getItem(key)
    return await this.decryptToken(encrypted)
  }
}
```

## 9. OPTIMIZACIONES DE RENDIMIENTO

### 9.1 Code Splitting

```javascript
// Lazy loading de vistas no críticas
const HistoryView = () => import('./views/HistoryView.js')
const SettingsView = () => import('./views/SettingsView.js')
const ChartsView = () => import('./views/ChartsView.js')

// Solo Dashboard y ExpenseForm cargados inicialmente
```

### 9.2 Virtual Scrolling

```javascript
// Para listados largos (> 100 gastos)
// Solo renderizar elementos visibles + buffer
class VirtualList {
  render() {
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = visibleStart + visibleCount

    // Renderizar solo visibleStart a visibleEnd
  }
}
```

### 9.3 Debouncing

```javascript
// Para búsquedas y filtros
const debouncedSearch = debounce((query) => {
  searchExpenses(query)
}, 300)
```

### 9.4 Memoización

```javascript
// Cachear cálculos costosos
class BudgetCalculator {
  constructor() {
    this.cache = new Map()
  }

  calculateTotals(expenses, subcategoryId) {
    const key = `${subcategoryId}-${expenses.length}`

    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    // Cálculo costoso
    const result = expenses
      .filter(e => e.subcategoryId === subcategoryId)
      .reduce((sum, e) => sum + e.amount, 0)

    this.cache.set(key, result)
    return result
  }
}
```

## 10. TESTING

### Estrategia de Testing

```
├── Unit Tests (70%)
│   ├── Models
│   ├── Controllers
│   ├── Services
│   └── Utils
│
├── Integration Tests (20%)
│   ├── Storage ↔ Sync
│   ├── Sync ↔ Google Sheets
│   └── Controllers ↔ Views
│
└── E2E Tests (10%)
    ├── Flujo completo registro gasto
    ├── Flujo cierre de mes
    └── Flujo sincronización
```

### Herramientas
- **Unit/Integration:** Vitest
- **E2E:** Playwright
- **Mocking:** MSW (Mock Service Worker) para Google API

## 11. DESPLIEGUE

### Opciones de Hosting

**Opción 1: GitHub Pages (Recomendado)**
- Gratis
- HTTPS automático
- Deploy automático con GitHub Actions
- Ideal para PWA estática

**Opción 2: Netlify**
- Gratis con plan básico
- Deploy automático
- HTTPS
- Edge functions si se necesitan

**Opción 3: Vercel**
- Similar a Netlify
- Optimizado para performance

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy PWA

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 12. MONITOREO Y DEBUGGING

### Logging

```javascript
class Logger {
  constructor(level = 'info') {
    this.level = level
    this.logs = []
  }

  info(message, data) {
    this.log('INFO', message, data)
  }

  warn(message, data) {
    this.log('WARN', message, data)
  }

  error(message, error) {
    this.log('ERROR', message, { error: error.message, stack: error.stack })
  }

  log(level, message, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }

    this.logs.push(entry)

    // En desarrollo: console
    if (import.meta.env.DEV) {
      console[level.toLowerCase()](message, data)
    }

    // En producción: enviar a servicio de logs (opcional)
  }

  // Exportar logs para debugging
  export() {
    return JSON.stringify(this.logs, null, 2)
  }
}
```

### Error Tracking

```javascript
// Capturar errores globales
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', event.reason)
})
```

## 13. PRÓXIMOS PASOS

1. ✅ Requerimientos definidos
2. ✅ Arquitectura diseñada
3. ⏭️ Definir estructura de datos detallada (schemas completos)
4. ⏭️ Crear mockups de interfaz
5. ⏭️ Setup inicial del proyecto
6. ⏭️ Implementar capa de persistencia (IndexedDB)
7. ⏭️ Implementar Google Sheets integration
8. ⏭️ Desarrollar vistas principales
9. ⏭️ Integrar sincronización
10. ⏭️ Testing y optimización
