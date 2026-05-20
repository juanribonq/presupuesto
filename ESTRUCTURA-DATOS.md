# Estructura de Datos - App Presupuesto

## 1. MODELOS DETALLADOS CON EJEMPLOS

### 1.1 Expense (Gasto)

```javascript
{
  id: "exp_1708456789123_abc123",           // UUID único
  date: "2026-02-20T14:30:00.000Z",        // ISO 8601
  categoryId: "cat_gastos_variables",       // Referencia a categoría
  subcategoryId: "sub_mercado",             // Referencia a subcategoría
  description: "Supermercado Éxito",        // Texto libre
  amount: 85000,                            // Número entero (pesos)
  monthYear: "2026-02",                     // Para agrupación/índice

  // Metadata
  createdAt: "2026-02-20T14:30:00.000Z",   // Timestamp creación
  updatedAt: "2026-02-20T14:30:00.000Z",   // Última modificación
  syncedAt: "2026-02-20T14:30:05.000Z",    // Última sync (null si no)
  synced: true,                             // Estado de sincronización

  // Opcional: para tracking
  deviceId: "iphone_12_abc123",             // Identificar dispositivo
  sheetRowNumber: 15                        // Fila en Google Sheet
}
```

**Ejemplos de gastos:**

```javascript
// Gasto de mercado
{
  id: "exp_001",
  date: "2026-02-20",
  categoryId: "cat_variables",
  subcategoryId: "sub_mercado",
  description: "Supermercado Éxito - Mercado semanal",
  amount: 85000,
  monthYear: "2026-02",
  createdAt: "2026-02-20T14:30:00Z",
  updatedAt: "2026-02-20T14:30:00Z",
  syncedAt: "2026-02-20T14:30:05Z",
  synced: true
}

// Gasto de transporte
{
  id: "exp_002",
  date: "2026-02-20",
  categoryId: "cat_variables",
  subcategoryId: "sub_transporte",
  description: "Uber - Casa a oficina",
  amount: 15000,
  monthYear: "2026-02",
  createdAt: "2026-02-20T09:15:00Z",
  updatedAt: "2026-02-20T09:15:00Z",
  syncedAt: null,
  synced: false  // Pendiente de sincronizar
}

// Gasto fijo
{
  id: "exp_003",
  date: "2026-02-01",
  categoryId: "cat_fijos",
  subcategoryId: "sub_arriendo",
  description: "Arriendo Febrero 2026",
  amount: 800000,
  monthYear: "2026-02",
  createdAt: "2026-02-01T08:00:00Z",
  updatedAt: "2026-02-01T08:00:00Z",
  syncedAt: "2026-02-01T08:00:10Z",
  synced: true
}
```

---

### 1.2 Category (Categoría Global)

```javascript
{
  id: "cat_gastos_fijos",                   // ID único
  name: "Gastos Fijos",                     // Nombre mostrado
  icon: "📌",                               // Emoji o nombre ícono
  color: "#E74C3C",                         // Color hex
  order: 1,                                 // Orden de visualización

  // Metadata
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
}
```

**Categorías predefinidas:**

```javascript
const DEFAULT_CATEGORIES = [
  {
    id: "cat_fijos",
    name: "Gastos Fijos",
    icon: "📌",
    color: "#E74C3C",
    order: 1
  },
  {
    id: "cat_variables",
    name: "Gastos Variables",
    icon: "💰",
    color: "#3498DB",
    order: 2
  },
  {
    id: "cat_ahorros",
    name: "Ahorros",
    icon: "🐷",
    color: "#2ECC71",
    order: 3
  }
]
```

---

### 1.3 Subcategory (Subcategoría)

```javascript
{
  id: "sub_mercado",                        // ID único
  categoryId: "cat_gastos_variables",       // Categoría padre
  name: "Mercado",                          // Nombre mostrado
  icon: "🛒",                               // Emoji
  budget: 500000,                           // Presupuesto asignado
  order: 1,                                 // Orden dentro de categoría

  // Metadata
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z"     // Actualizado al cambiar presupuesto
}
```

**Subcategorías predefinidas:**

```javascript
const DEFAULT_SUBCATEGORIES = {
  // Gastos Fijos
  cat_fijos: [
    {
      id: "sub_arriendo",
      categoryId: "cat_fijos",
      name: "Arriendo",
      icon: "🏠",
      budget: 800000,
      order: 1
    },
    {
      id: "sub_servicios",
      categoryId: "cat_fijos",
      name: "Servicios Públicos",
      icon: "💡",
      budget: 200000,
      order: 2
    },
    {
      id: "sub_seguros",
      categoryId: "cat_fijos",
      name: "Seguros",
      icon: "🛡️",
      budget: 150000,
      order: 3
    },
    {
      id: "sub_suscripciones",
      categoryId: "cat_fijos",
      name: "Suscripciones",
      icon: "📱",
      budget: 100000,
      order: 4
    }
  ],

  // Gastos Variables
  cat_variables: [
    {
      id: "sub_mercado",
      categoryId: "cat_variables",
      name: "Mercado",
      icon: "🛒",
      budget: 500000,
      order: 1
    },
    {
      id: "sub_transporte",
      categoryId: "cat_variables",
      name: "Transporte",
      icon: "🚕",
      budget: 300000,
      order: 2
    },
    {
      id: "sub_salud",
      categoryId: "cat_variables",
      name: "Salud",
      icon: "⚕️",
      budget: 200000,
      order: 3
    },
    {
      id: "sub_entretenimiento",
      categoryId: "cat_variables",
      name: "Entretenimiento",
      icon: "🎬",
      budget: 150000,
      order: 4
    },
    {
      id: "sub_restaurantes",
      categoryId: "cat_variables",
      name: "Restaurantes",
      icon: "🍔",
      budget: 250000,
      order: 5
    },
    {
      id: "sub_educacion",
      categoryId: "cat_variables",
      name: "Educación",
      icon: "📚",
      budget: 100000,
      order: 6
    },
    {
      id: "sub_ropa",
      categoryId: "cat_variables",
      name: "Ropa",
      icon: "👕",
      budget: 150000,
      order: 7
    },
    {
      id: "sub_otros",
      categoryId: "cat_variables",
      name: "Otros",
      icon: "📦",
      budget: 100000,
      order: 8
    }
  ],

  // Ahorros
  cat_ahorros: [
    {
      id: "sub_ahorro_general",
      categoryId: "cat_ahorros",
      name: "Ahorro General",
      icon: "💵",
      budget: 400000,
      order: 1
    },
    {
      id: "sub_inversiones",
      categoryId: "cat_ahorros",
      name: "Inversiones",
      icon: "📈",
      budget: 200000,
      order: 2
    },
    {
      id: "sub_emergencias",
      categoryId: "cat_ahorros",
      name: "Fondo Emergencias",
      icon: "🆘",
      budget: 150000,
      order: 3
    }
  ]
}
```

---

### 1.4 Budget (Presupuesto Mensual)

```javascript
{
  id: "budget_2026_02",                     // ID único (formato: budget_YYYY_MM)
  monthYear: "2026-02",                     // Mes y año
  income: 3000000,                          // Ingreso del mes

  // Presupuestos por subcategoría
  subcategoryBudgets: {
    "sub_arriendo": 800000,
    "sub_servicios": 200000,
    "sub_seguros": 150000,
    "sub_suscripciones": 100000,
    "sub_mercado": 500000,
    "sub_transporte": 300000,
    "sub_salud": 200000,
    "sub_entretenimiento": 150000,
    "sub_restaurantes": 250000,
    "sub_educacion": 100000,
    "sub_ropa": 150000,
    "sub_otros": 100000,
    "sub_ahorro_general": 400000,
    "sub_inversiones": 200000,
    "sub_emergencias": 150000
  },

  // Estado
  closed: false,                            // Si el mes está cerrado
  closedAt: null,                           // Timestamp de cierre

  // Metadata
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-15T10:00:00.000Z"
}
```

**Cálculos derivados (no se almacenan, se calculan):**

```javascript
{
  totalBudget: 3750000,          // Suma de todos los presupuestos
  totalSpent: 2500000,           // Suma de todos los gastos del mes
  remaining: 1250000,            // income - totalSpent
  percentageUsed: 83.33,         // (totalSpent / income) * 100
  overBudget: false,             // totalSpent > income
  daysInMonth: 28,               // Días del mes
  daysRemaining: 8,              // Días restantes
  dailyAverage: 89285.71,        // totalSpent / días transcurridos
  projectedTotal: 2500000        // dailyAverage * daysInMonth
}
```

---

### 1.5 Month (Mes Histórico)

```javascript
{
  id: "month_2026_01",                      // ID único
  monthYear: "2026-01",                     // Mes y año
  displayName: "Enero 2026",                // Nombre para mostrar

  // Resumen del mes
  income: 3000000,                          // Ingreso del mes
  totalBudget: 3750000,                     // Total presupuestado
  totalSpent: 2650000,                      // Total gastado
  percentageUsed: 88.33,                    // % del ingreso usado
  remaining: 350000,                        // Saldo final
  overBudget: false,                        // Si excedió presupuesto

  // Fechas
  closedAt: "2026-02-01T00:00:00.000Z",    // Cuándo se cerró
  startDate: "2026-01-01",                  // Primer día del mes
  endDate: "2026-01-31",                    // Último día del mes

  // Snapshot de categorías al momento del cierre
  categorySnapshots: [
    {
      categoryId: "cat_fijos",
      categoryName: "Gastos Fijos",
      subcategoryId: "sub_arriendo",
      subcategoryName: "Arriendo",
      budget: 800000,
      spent: 800000,
      percentage: 100,
      difference: 0
    },
    {
      categoryId: "cat_fijos",
      categoryName: "Gastos Fijos",
      subcategoryId: "sub_servicios",
      subcategoryName: "Servicios Públicos",
      budget: 200000,
      spent: 175000,
      percentage: 87.5,
      difference: 25000
    },
    {
      categoryId: "cat_variables",
      categoryName: "Gastos Variables",
      subcategoryId: "sub_mercado",
      subcategoryName: "Mercado",
      budget: 500000,
      spent: 475000,
      percentage: 95,
      difference: 25000
    }
    // ... más subcategorías
  ],

  // Estadísticas
  stats: {
    totalExpenses: 87,                      // Número de gastos registrados
    averageExpenseAmount: 30459.77,         // Promedio por gasto
    largestExpense: 800000,                 // Gasto más grande
    smallestExpense: 3500,                  // Gasto más pequeño
    topCategory: "cat_fijos",               // Categoría con más gasto
    topSubcategory: "sub_arriendo",         // Subcategoría con más gasto
    daysWithExpenses: 28                    // Días con al menos 1 gasto
  },

  // Referencias a gastos (IDs, no objetos completos)
  expenseIds: [
    "exp_001", "exp_002", "exp_003", /* ... */
  ],

  // Metadata
  createdAt: "2026-02-01T00:00:00.000Z"
}
```

---

### 1.6 Settings (Configuración)

```javascript
{
  // Identificación
  userId: "user_google_12345@gmail.com",    // Email de Google
  userName: "Juan Pablo",                    // Nombre opcional

  // Configuración regional
  currency: "COP",                           // Código moneda ISO 4217
  currencySymbol: "$",                       // Símbolo a mostrar
  locale: "es-CO",                           // Locale para formato números/fechas
  dateFormat: "DD/MM/YYYY",                  // Formato de fecha

  // Apariencia
  theme: "auto",                             // "light" | "dark" | "auto"
  primaryColor: "#4A90E2",                   // Color principal app

  // Notificaciones y alertas
  notifications: true,                       // Activar notificaciones
  budgetWarningThreshold: 80,                // Alertar al 80% de presupuesto
  budgetDangerThreshold: 90,                 // Peligro al 90%
  dailyReminder: false,                      // Recordar registrar gastos
  dailyReminderTime: "20:00",               // Hora del recordatorio

  // Sincronización
  autoSync: true,                            // Sincronización automática
  syncInterval: 5,                           // Intervalo en minutos
  syncOnExpense: true,                       // Sincronizar al registrar gasto

  // Google Sheets
  sheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", // ID del Sheet
  sheetName: "Presupuesto Personal",         // Nombre del documento
  sheetConnectedAt: "2026-01-15T10:00:00Z", // Cuándo se conectó

  // Funcionalidades
  enableRecurringExpenses: true,             // Gastos recurrentes
  enableSavingsGoals: true,                  // Metas de ahorro
  enableExport: true,                        // Exportar reportes

  // Tutorial
  completedTutorial: true,                   // Si completó tutorial
  tutorialStep: 5,                           // Último paso visto

  // Metadata
  lastSyncAt: "2026-02-20T14:35:00.000Z",   // Última sincronización
  appVersion: "1.0.0",                       // Versión de la app
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-02-20T14:30:00.000Z"
}
```

---

### 1.7 ExpenseTemplate (Template de Gasto)

```javascript
{
  id: "template_netflix",                    // ID único
  name: "Netflix",                           // Nombre del template
  categoryId: "cat_fijos",                   // Categoría
  subcategoryId: "sub_suscripciones",        // Subcategoría
  amount: 50000,                             // Monto predefinido
  description: "Suscripción Netflix",        // Descripción predefinida
  icon: "📺",                                // Ícono visual

  // Configuración
  recurring: true,                           // Si es recurrente mensual
  recurringDay: 15,                          // Día del mes (1-31)
  autoAdd: false,                            // Agregar automáticamente

  // Uso
  order: 1,                                  // Orden de visualización
  usageCount: 12,                            // Veces usado
  lastUsedAt: "2026-02-15T10:00:00.000Z",   // Última vez usado

  // Metadata
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-01-15T10:00:00.000Z"
}
```

**Templates predefinidos comunes:**

```javascript
const COMMON_TEMPLATES = [
  // Suscripciones
  {
    id: "tpl_netflix",
    name: "Netflix",
    categoryId: "cat_fijos",
    subcategoryId: "sub_suscripciones",
    amount: 50000,
    description: "Suscripción Netflix",
    icon: "📺",
    recurring: true,
    recurringDay: 15
  },
  {
    id: "tpl_spotify",
    name: "Spotify",
    categoryId: "cat_fijos",
    subcategoryId: "sub_suscripciones",
    amount: 20000,
    description: "Suscripción Spotify",
    icon: "🎵",
    recurring: true,
    recurringDay: 10
  },
  {
    id: "tpl_gimnasio",
    name: "Gimnasio",
    categoryId: "cat_fijos",
    subcategoryId: "sub_suscripciones",
    amount: 80000,
    description: "Mensualidad gimnasio",
    icon: "💪",
    recurring: true,
    recurringDay: 1
  },

  // Transporte
  {
    id: "tpl_uber_casa_oficina",
    name: "Uber Casa-Oficina",
    categoryId: "cat_variables",
    subcategoryId: "sub_transporte",
    amount: 15000,
    description: "Uber casa a oficina",
    icon: "🚕",
    recurring: false
  },
  {
    id: "tpl_gasolina",
    name: "Gasolina",
    categoryId: "cat_variables",
    subcategoryId: "sub_transporte",
    amount: 100000,
    description: "Tanqueada gasolina",
    icon: "⛽",
    recurring: false
  }
]
```

---

### 1.8 SyncQueueItem (Cola de Sincronización)

```javascript
{
  id: "sync_1708456789123_xyz",             // UUID único
  timestamp: "2026-02-20T14:30:00.000Z",    // Cuándo se agregó a cola

  // Operación
  type: "CREATE_EXPENSE",                    // Tipo de operación
  // Tipos: CREATE_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE,
  //        UPDATE_BUDGET, UPDATE_CATEGORY, CLOSE_MONTH

  operation: "create",                       // CRUD operation
  entity: "expense",                         // Entidad afectada
  entityId: "exp_002",                       // ID de la entidad

  // Datos
  data: {
    // Objeto completo o delta
    date: "2026-02-20",
    categoryId: "cat_variables",
    subcategoryId: "sub_transporte",
    description: "Uber - Casa a oficina",
    amount: 15000,
    monthYear: "2026-02"
  },

  // Estado
  status: "pending",                         // "pending" | "processing" | "success" | "error"
  retries: 0,                                // Número de reintentos
  maxRetries: 3,                             // Máximo de reintentos
  error: null,                               // Mensaje de error si falló

  // Metadata
  deviceId: "iphone_12_abc123",
  syncedAt: null                             // Cuándo se sincronizó
}
```

---

## 2. RELACIONES ENTRE ENTIDADES

```
┌─────────────────┐
│    Settings     │
│                 │
│  - userId       │
│  - sheetId      │
│  - currency     │
└─────────────────┘
        │
        │ 1:N
        ↓
┌─────────────────┐
│    Category     │
│                 │
│  - id           │
│  - name         │
│  - icon         │
└────────┬────────┘
         │
         │ 1:N
         ↓
┌─────────────────┐
│  Subcategory    │◄─────────┐
│                 │          │
│  - id           │          │
│  - categoryId   │          │
│  - budget       │          │ N:1
└────────┬────────┘          │
         │                   │
         │ 1:N         ┌─────┴──────┐
         │             │  Expense   │
         │             │            │
         └────────────►│ - subId    │
                       │ - amount   │
                       │ - date     │
                       └─────┬──────┘
                             │
                             │ N:1
                             ↓
                       ┌─────────────┐
                       │   Budget    │
                       │             │
                       │ - monthYear │
                       │ - income    │
                       └─────┬───────┘
                             │
                             │ 1:1 (when closed)
                             ↓
                       ┌─────────────┐
                       │    Month    │
                       │ (Historical)│
                       │             │
                       │ - snapshot  │
                       │ - stats     │
                       └─────────────┘
```

---

## 3. EJEMPLOS DE QUERIES COMUNES

### 3.1 Obtener gastos del mes actual

```javascript
async function getCurrentMonthExpenses() {
  const currentMonthYear = getCurrentMonthYear() // "2026-02"

  const expenses = await db.expenses
    .where('monthYear')
    .equals(currentMonthYear)
    .sortBy('date')

  return expenses
}
```

### 3.2 Calcular total gastado por subcategoría

```javascript
async function getSubcategoryTotal(subcategoryId, monthYear) {
  const expenses = await db.expenses
    .where('[subcategoryId+monthYear]')
    .equals([subcategoryId, monthYear])
    .toArray()

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  return total
}
```

### 3.3 Obtener resumen completo del mes

```javascript
async function getMonthSummary(monthYear) {
  // 1. Obtener presupuesto
  const budget = await db.budgets
    .where('monthYear')
    .equals(monthYear)
    .first()

  // 2. Obtener todos los gastos
  const expenses = await db.expenses
    .where('monthYear')
    .equals(monthYear)
    .toArray()

  // 3. Obtener categorías y subcategorías
  const categories = await db.categories.toArray()
  const subcategories = await db.subcategories.toArray()

  // 4. Calcular totales por subcategoría
  const summary = subcategories.map(sub => {
    const subExpenses = expenses.filter(e => e.subcategoryId === sub.id)
    const spent = subExpenses.reduce((sum, e) => sum + e.amount, 0)
    const budgeted = budget.subcategoryBudgets[sub.id] || 0
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0
    const remaining = budgeted - spent

    return {
      subcategory: sub,
      budgeted,
      spent,
      remaining,
      percentage,
      status: percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : 'ok'
    }
  })

  // 5. Agrupar por categoría
  const byCategory = categories.map(cat => {
    const subs = summary.filter(s => s.subcategory.categoryId === cat.id)
    const totalBudgeted = subs.reduce((sum, s) => sum + s.budgeted, 0)
    const totalSpent = subs.reduce((sum, s) => sum + s.spent, 0)

    return {
      category: cat,
      subcategories: subs,
      totalBudgeted,
      totalSpent,
      percentage: (totalSpent / totalBudgeted) * 100
    }
  })

  return {
    monthYear,
    income: budget.income,
    totalBudgeted: Object.values(budget.subcategoryBudgets).reduce((a,b) => a+b, 0),
    totalSpent: expenses.reduce((sum, e) => sum + e.amount, 0),
    categories: byCategory,
    expenseCount: expenses.length
  }
}
```

### 3.4 Buscar gastos por descripción

```javascript
async function searchExpenses(query, monthYear = null) {
  let expenses = await db.expenses.toArray()

  // Filtrar por mes si se especifica
  if (monthYear) {
    expenses = expenses.filter(e => e.monthYear === monthYear)
  }

  // Buscar en descripción (case-insensitive)
  const lowerQuery = query.toLowerCase()
  const results = expenses.filter(e =>
    e.description.toLowerCase().includes(lowerQuery)
  )

  // Ordenar por relevancia (exactitud) y fecha
  results.sort((a, b) => {
    const aExact = a.description.toLowerCase() === lowerQuery
    const bExact = b.description.toLowerCase() === lowerQuery
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return new Date(b.date) - new Date(a.date)
  })

  return results
}
```

### 3.5 Obtener últimas categorías usadas

```javascript
async function getRecentlyUsedCategories(limit = 3) {
  const expenses = await db.expenses
    .orderBy('createdAt')
    .reverse()
    .limit(20) // Últimos 20 gastos
    .toArray()

  // Contar frecuencia de subcategorías
  const frequency = {}
  expenses.forEach(exp => {
    const key = `${exp.categoryId}_${exp.subcategoryId}`
    frequency[key] = (frequency[key] || 0) + 1
  })

  // Ordenar por frecuencia
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  // Obtener objetos completos
  const recent = []
  for (const [key, count] of sorted) {
    const [categoryId, subcategoryId] = key.split('_')
    const category = await db.categories.get(categoryId)
    const subcategory = await db.subcategories.get(subcategoryId)
    recent.push({ category, subcategory, count })
  }

  return recent
}
```

---

## 4. VALIDACIONES

### 4.1 Validación de Expense

```javascript
function validateExpense(expense) {
  const errors = []

  // Campos requeridos
  if (!expense.categoryId) {
    errors.push('Categoría es requerida')
  }
  if (!expense.subcategoryId) {
    errors.push('Subcategoría es requerida')
  }
  if (!expense.description || expense.description.trim() === '') {
    errors.push('Descripción es requerida')
  }
  if (!expense.amount || expense.amount <= 0) {
    errors.push('Monto debe ser mayor a 0')
  }
  if (!expense.date) {
    errors.push('Fecha es requerida')
  }

  // Validaciones de formato
  if (expense.amount && !Number.isInteger(expense.amount)) {
    errors.push('Monto debe ser un número entero')
  }
  if (expense.amount && expense.amount > 999999999) {
    errors.push('Monto excede el máximo permitido')
  }
  if (expense.description && expense.description.length > 200) {
    errors.push('Descripción muy larga (máximo 200 caracteres)')
  }

  // Validación de fecha
  const date = new Date(expense.date)
  if (isNaN(date.getTime())) {
    errors.push('Fecha inválida')
  }
  if (date > new Date()) {
    errors.push('Fecha no puede ser futura')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 4.2 Validación de Budget

```javascript
function validateBudget(budget) {
  const errors = []

  if (!budget.income || budget.income <= 0) {
    errors.push('Ingreso debe ser mayor a 0')
  }

  if (!budget.subcategoryBudgets || Object.keys(budget.subcategoryBudgets).length === 0) {
    errors.push('Debe definir al menos un presupuesto')
  }

  // Validar cada presupuesto
  for (const [subId, amount] of Object.entries(budget.subcategoryBudgets)) {
    if (amount < 0) {
      errors.push(`Presupuesto de ${subId} no puede ser negativo`)
    }
  }

  // Calcular total presupuestado
  const totalBudget = Object.values(budget.subcategoryBudgets)
    .reduce((sum, amount) => sum + amount, 0)

  // Advertencia si presupuesto excede ingreso
  if (totalBudget > budget.income) {
    errors.push(`Total presupuestado ($${totalBudget.toLocaleString()}) excede ingreso ($${budget.income.toLocaleString()})`)
  }

  return {
    valid: errors.length === 0,
    errors,
    totalBudget
  }
}
```

---

## 5. HELPERS Y UTILIDADES

### 5.1 Formato de Moneda

```javascript
function formatCurrency(amount, includeSymbol = true) {
  const formatted = amount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  return includeSymbol ? `$${formatted}` : formatted
}

// Ejemplos:
formatCurrency(85000)       // "$85.000"
formatCurrency(1500000)     // "$1.500.000"
formatCurrency(85000, false) // "85.000"
```

### 5.2 Formato de Fecha

```javascript
function formatDate(date, format = 'short') {
  const d = new Date(date)

  switch (format) {
    case 'short':
      // "20/02/2026"
      return d.toLocaleDateString('es-CO')

    case 'long':
      // "20 de febrero de 2026"
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

    case 'relative':
      // "Hace 2 días", "Hoy", "Ayer"
      return getRelativeDate(d)

    case 'month-year':
      // "Febrero 2026"
      return d.toLocaleDateString('es-CO', {
        month: 'long',
        year: 'numeric'
      })

    default:
      return d.toLocaleDateString('es-CO')
  }
}

function getRelativeDate(date) {
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return date.toLocaleDateString('es-CO')
}
```

### 5.3 Cálculo de Porcentajes

```javascript
function calculatePercentage(spent, budget) {
  if (!budget || budget === 0) return 0
  return (spent / budget) * 100
}

function getPercentageStatus(percentage) {
  if (percentage >= 100) return 'over'      // Excedido
  if (percentage >= 90) return 'danger'     // Peligro
  if (percentage >= 70) return 'warning'    // Advertencia
  return 'ok'                               // Normal
}

function getPercentageColor(percentage) {
  const status = getPercentageStatus(percentage)
  const colors = {
    ok: '#2ECC71',       // Verde
    warning: '#F5A623',  // Naranja
    danger: '#D0021B',   // Rojo
    over: '#8B0000'      // Rojo oscuro
  }
  return colors[status]
}
```

### 5.4 Generación de IDs

```javascript
function generateId(prefix = '') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

// Ejemplos:
generateId('exp')      // "exp_1708456789123_abc123"
generateId('cat')      // "cat_1708456789456_xyz789"
generateId()           // "1708456789789_def456"
```

### 5.5 Obtener mes/año actual

```javascript
function getCurrentMonthYear() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`  // "2026-02"
}

function getMonthYearDisplay(monthYear) {
  const [year, month] = monthYear.split('-')
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric'
  })  // "Febrero 2026"
}
```

---

## 6. DATOS DE PRUEBA (SEED DATA)

```javascript
const SEED_DATA = {
  // Usuario de prueba
  settings: {
    userId: "test@gmail.com",
    userName: "Usuario Demo",
    currency: "COP",
    currencySymbol: "$",
    locale: "es-CO",
    theme: "auto",
    notifications: true,
    autoSync: true,
    sheetId: null,
    completedTutorial: false,
    createdAt: new Date().toISOString()
  },

  // Categorías por defecto
  categories: DEFAULT_CATEGORIES,

  // Subcategorías por defecto
  subcategories: Object.values(DEFAULT_SUBCATEGORIES).flat(),

  // Presupuesto del mes actual
  budget: {
    id: `budget_${getCurrentMonthYear()}`,
    monthYear: getCurrentMonthYear(),
    income: 3000000,
    subcategoryBudgets: {
      "sub_arriendo": 800000,
      "sub_servicios": 200000,
      "sub_seguros": 150000,
      "sub_suscripciones": 100000,
      "sub_mercado": 500000,
      "sub_transporte": 300000,
      "sub_salud": 200000,
      "sub_entretenimiento": 150000,
      "sub_restaurantes": 250000,
      "sub_educacion": 100000,
      "sub_ropa": 150000,
      "sub_otros": 100000,
      "sub_ahorro_general": 400000,
      "sub_inversiones": 200000,
      "sub_emergencias": 150000
    },
    closed: false,
    closedAt: null,
    createdAt: new Date().toISOString()
  },

  // Gastos de ejemplo (últimos 7 días)
  expenses: [
    {
      id: generateId('exp'),
      date: new Date().toISOString(),
      categoryId: "cat_variables",
      subcategoryId: "sub_mercado",
      description: "Supermercado Éxito",
      amount: 85000,
      monthYear: getCurrentMonthYear(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      synced: false
    },
    {
      id: generateId('exp'),
      date: new Date().toISOString(),
      categoryId: "cat_variables",
      subcategoryId: "sub_transporte",
      description: "Uber casa a oficina",
      amount: 15000,
      monthYear: getCurrentMonthYear(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: null,
      synced: false
    },
    // ... más gastos de ejemplo
  ],

  // Templates comunes
  templates: COMMON_TEMPLATES
}
```

---

## 7. PRÓXIMOS PASOS

1. ✅ Estructura de datos definida con ejemplos
2. ⏭️ Crear diseño visual (mockups con colores y estilos)
3. ⏭️ Setup del proyecto (package.json, estructura de carpetas)
4. ⏭️ Implementar capa de persistencia (IndexedDB)
5. ⏭️ Crear componentes de UI básicos
