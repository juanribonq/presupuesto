# Diseño Visual - App Presupuesto Personal

## 1. PALETA DE COLORES

### 1.1 Colores Principales

```css
/* Primary - Azul confianza */
--color-primary: #4A90E2;
--color-primary-light: #6BA5E7;
--color-primary-dark: #3A7BC8;
--color-primary-subtle: #E8F2FB;

/* Success - Verde saludable */
--color-success: #2ECC71;
--color-success-light: #52D98B;
--color-success-dark: #27AE60;
--color-success-subtle: #E8F8F0;

/* Warning - Naranja advertencia */
--color-warning: #F5A623;
--color-warning-light: #F7B84B;
--color-warning-dark: #E89510;
--color-warning-subtle: #FEF5E7;

/* Danger - Rojo peligro */
--color-danger: #D0021B;
--color-danger-light: #E63946;
--color-danger-dark: #B00118;
--color-danger-subtle: #FDEAEC;

/* Info - Azul claro */
--color-info: #3498DB;
--color-info-light: #5DADE2;
--color-info-dark: #2874A6;
--color-info-subtle: #EBF5FB;
```

### 1.2 Colores Neutrales (Tema Claro)

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F8F9FA;
--bg-tertiary: #E9ECEF;
--bg-overlay: rgba(0, 0, 0, 0.5);

/* Borders */
--border-light: #E9ECEF;
--border-medium: #DEE2E6;
--border-dark: #CED4DA;

/* Text */
--text-primary: #212529;
--text-secondary: #6C757D;
--text-tertiary: #ADB5BD;
--text-inverse: #FFFFFF;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### 1.3 Colores Neutrales (Tema Oscuro)

```css
/* Backgrounds */
--bg-primary-dark: #1A1A1A;
--bg-secondary-dark: #2A2A2A;
--bg-tertiary-dark: #3A3A3A;
--bg-overlay-dark: rgba(0, 0, 0, 0.7);

/* Borders */
--border-light-dark: #3A3A3A;
--border-medium-dark: #4A4A4A;
--border-dark-dark: #5A5A5A;

/* Text */
--text-primary-dark: #FFFFFF;
--text-secondary-dark: #B0B0B0;
--text-tertiary-dark: #808080;
--text-inverse-dark: #1A1A1A;

/* Shadows */
--shadow-sm-dark: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md-dark: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg-dark: 0 10px 15px rgba(0, 0, 0, 0.4);
--shadow-xl-dark: 0 20px 25px rgba(0, 0, 0, 0.5);
```

### 1.4 Colores de Categorías

```css
/* Categorías Globales */
--cat-fijos: #E74C3C;        /* Rojo coral */
--cat-variables: #3498DB;    /* Azul */
--cat-ahorros: #2ECC71;      /* Verde */

/* Subcategorías - Tonos variados para diferenciación */
--sub-arriendo: #E74C3C;
--sub-servicios: #E67E22;
--sub-seguros: #9B59B6;
--sub-suscripciones: #34495E;
--sub-mercado: #16A085;
--sub-transporte: #F39C12;
--sub-salud: #E91E63;
--sub-entretenimiento: #9C27B0;
--sub-restaurantes: #FF5722;
--sub-educacion: #3F51B5;
--sub-ropa: #E91E63;
--sub-otros: #607D8B;
```

## 2. TIPOGRAFÍA

### 2.1 Familia de Fuentes

```css
/* iOS Native Font Stack */
--font-primary: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

/* Monospace para números */
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Courier New", monospace;
```

### 2.2 Tamaños de Fuente

```css
/* Display - Títulos grandes */
--text-display-lg: 32px;     /* 2rem */
--text-display-md: 28px;     /* 1.75rem */
--text-display-sm: 24px;     /* 1.5rem */

/* Headings - Encabezados */
--text-h1: 28px;             /* 1.75rem */
--text-h2: 22px;             /* 1.375rem */
--text-h3: 18px;             /* 1.125rem */
--text-h4: 16px;             /* 1rem */

/* Body - Texto normal */
--text-lg: 18px;             /* 1.125rem */
--text-base: 16px;           /* 1rem - Base */
--text-sm: 14px;             /* 0.875rem */
--text-xs: 12px;             /* 0.75rem */

/* Tiny - Metadatos */
--text-tiny: 11px;           /* 0.6875rem */
```

### 2.3 Pesos de Fuente

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 2.4 Line Heights

```css
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

## 3. ESPACIADO Y SIZING

### 3.1 Sistema de Espaciado (Base 8px)

```css
--space-0: 0;
--space-1: 4px;      /* 0.25rem */
--space-2: 8px;      /* 0.5rem */
--space-3: 12px;     /* 0.75rem */
--space-4: 16px;     /* 1rem */
--space-5: 20px;     /* 1.25rem */
--space-6: 24px;     /* 1.5rem */
--space-8: 32px;     /* 2rem */
--space-10: 40px;    /* 2.5rem */
--space-12: 48px;    /* 3rem */
--space-16: 64px;    /* 4rem */
--space-20: 80px;    /* 5rem */
```

### 3.2 Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;  /* Círculos perfectos */
```

### 3.3 Tamaños de Elementos Interactivos

```css
/* Mínimo para touch en móviles (iOS HIG) */
--touch-target-min: 44px;

/* Botones */
--button-height-sm: 32px;
--button-height-md: 44px;
--button-height-lg: 56px;

/* Inputs */
--input-height: 44px;

/* Iconos */
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

## 4. COMPONENTES DE UI

### 4.1 Botones

#### Botón Principal (Primary)

```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  height: var(--button-height-md);

  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.btn-primary:active {
  background: var(--color-primary-dark);
  transform: scale(0.98);
}
```

Visual:
```
┌──────────────────────┐
│      GUARDAR         │  ← Azul #4A90E2, texto blanco
└──────────────────────┘
```

#### Botón Secundario

```css
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
  /* resto igual a primary */
}
```

Visual:
```
┌──────────────────────┐
│      CANCELAR        │  ← Gris claro, texto oscuro
└──────────────────────┘
```

#### Botón de Peligro

```css
.btn-danger {
  background: var(--color-danger);
  color: white;
  /* resto igual a primary */
}
```

#### Botón Flotante (FAB)

```css
.btn-fab {
  position: fixed;
  bottom: 80px;  /* Sobre el bottom nav */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-lg);

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 24px;
  transition: all 0.3s ease;
}

.btn-fab:active {
  transform: scale(0.95);
}
```

Visual:
```
                              ┌─────┐
                              │  +  │  ← Botón flotante
                              └─────┘
```

### 4.2 Cards (Tarjetas)

#### Card de Categoría

```css
.category-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);

  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.category-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}
```

Visual:
```
┌────────────────────────────────────┐
│ 🛒 Mercado              [████] 95% │
│ $475,000 / $500,000                │
│ Quedan: $25,000                    │
└────────────────────────────────────┘
```

Breakdown detallado:
```
┌────────────────────────────────────┐
│ [Icono] [Nombre]        [Progreso] │  ← Fila 1: Header
│ [Gastado] / [Presupuesto]          │  ← Fila 2: Montos
│ [Estado/Saldo]                     │  ← Fila 3: Info extra
└────────────────────────────────────┘
```

### 4.3 Barras de Progreso

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease, background 0.3s ease;
}

/* Estados de color según porcentaje */
.progress-bar-fill.ok {
  background: var(--color-success);
}

.progress-bar-fill.warning {
  background: var(--color-warning);
}

.progress-bar-fill.danger {
  background: var(--color-danger);
}
```

Visual:
```
Estado OK (< 70%)
[████████████░░░░░░░░] 60%  ← Verde

Estado Warning (70-90%)
[████████████████░░░░] 80%  ← Naranja

Estado Danger (> 90%)
[███████████████████░] 95%  ← Rojo
```

### 4.4 Inputs

```css
.input {
  width: 100%;
  height: var(--input-height);
  padding: 0 var(--space-4);

  background: var(--bg-secondary);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);

  font-size: var(--text-base);
  color: var(--text-primary);

  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

Visual:
```
┌────────────────────────────────────┐
│ Supermercado...                    │  ← Input normal
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Supermercado Éxito|                │  ← Input con focus (borde azul)
└────────────────────────────────────┘
```

### 4.5 Select / Dropdown

```css
.select {
  /* Similar a input */
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Icono chevron */
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}
```

Visual:
```
┌────────────────────────────────────┐
│ Gastos Variables              ▼   │
└────────────────────────────────────┘
```

### 4.6 Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  height: 60px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);

  display: flex;
  justify-content: space-around;
  align-items: center;

  box-shadow: var(--shadow-md);
  z-index: 100;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  color: var(--text-secondary);
  font-size: var(--text-xs);
  padding: var(--space-2);

  transition: color 0.2s ease;
}

.bottom-nav-item.active {
  color: var(--color-primary);
}

.bottom-nav-item .icon {
  font-size: var(--icon-md);
}
```

Visual:
```
┌──────┬──────┬──────┬──────┬──────┐
│  🏠  │  💰  │  📊  │  📅  │  ⚙️  │
│ Inicio│Gastos│Gráfic│Histor│Config│
└──────┴──────┴──────┴──────┴──────┘
```

### 4.7 Header

```css
.header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;

  height: 56px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);

  box-shadow: var(--shadow-sm);
  z-index: 90;
}

.header-title {
  font-size: var(--text-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.header-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.header-icon-btn:active {
  background: var(--bg-secondary);
}
```

Visual:
```
┌────────────────────────────────────┐
│ ≡  Presupuesto         🔄  👤     │
└────────────────────────────────────┘
```

### 4.8 Modal / Bottom Sheet

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: 999;

  display: flex;
  align-items: flex-end;

  animation: fadeIn 0.2s ease;
}

.bottom-sheet {
  width: 100%;
  max-height: 80vh;
  background: var(--bg-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;

  animation: slideUp 0.3s ease;
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--border-dark);
  border-radius: var(--radius-full);
  margin: var(--space-3) auto;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

Visual:
```
┌────────────────────────────────────┐
│          ━━━━                      │  ← Handle
│                                    │
│  Nuevo Gasto                       │
│                                    │
│  [Formulario...]                   │
│                                    │
└────────────────────────────────────┘
```

### 4.9 Lista de Gastos

```css
.expense-list {
  padding: var(--space-4);
}

.expense-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);

  position: relative;
  transition: transform 0.2s ease;
}

.expense-item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--icon-md);
}

.expense-item-content {
  flex: 1;
}

.expense-item-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.expense-item-meta {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.expense-item-amount {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  color: var(--text-primary);
}
```

Visual:
```
┌────────────────────────────────────┐
│ ┌──┐  Supermercado Éxito           │
│ │🛒│  Mercado · Hoy 14:30      $85k│
│ └──┘                               │
└────────────────────────────────────┘
```

### 4.10 Badges y Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.badge-success {
  background: var(--color-success-subtle);
  color: var(--color-success-dark);
}

.badge-warning {
  background: var(--color-warning-subtle);
  color: var(--color-warning-dark);
}

.badge-danger {
  background: var(--color-danger-subtle);
  color: var(--color-danger-dark);
}
```

Visual:
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ En meta  │  │ Atención │  │ Excedido │
└──────────┘  └──────────┘  └──────────┘
   Verde         Naranja        Rojo
```

### 4.11 Empty States

```css
.empty-state {
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}
```

Visual:
```
        📭

   No hay gastos aún

Presiona el botón + para
   registrar tu primer gasto

   [  EMPEZAR  ]
```

## 5. PANTALLAS COMPLETAS

### 5.1 Dashboard (Pantalla Principal)

```
┌────────────────────────────────────┐
│ ≡  Presupuesto         🔄  👤     │ ← Header (56px)
├────────────────────────────────────┤
│                                    │
│  FEBRERO 2026                      │ ← Título mes
│  Quedan 8 días                     │ ← Info días
│                                    │
│  ┌──────────────────────────────┐ │
│  │ $2,500,000 / $3,000,000      │ │ ← Card resumen
│  │ [████████████████░░░░] 83%   │ │
│  │                              │ │
│  │ vs Mes pasado: +5% 📈        │ │
│  └──────────────────────────────┘ │
│                                    │
│  📊 GASTOS FIJOS           $1.25M │ ← Categoría
│  ┌──────────────────────────────┐ │
│  │ 🏠 Arriendo    [████] 100%   │ │ ← Subcategoría
│  │ $800k / $800k                │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 💡 Servicios   [███░]  75%   │ │
│  │ $150k / $200k                │ │
│  └──────────────────────────────┘ │
│                                    │
│  💰 GASTOS VARIABLES      $1.75M │
│  ┌──────────────────────────────┐ │
│  │ 🛒 Mercado     [█████] 95% 🔴│ │ ← Alerta
│  │ $475k / $500k                │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 🚕 Transporte  [██░░]  50%   │ │
│  │ $150k / $300k                │ │
│  └──────────────────────────────┘ │
│  ...                               │
│                                    │
│                            ┌─────┐│
│                            │  +  ││ ← FAB
│                            └─────┘│
├────────────────────────────────────┤
│ [🏠] [💰] [📊] [📅] [⚙️]          │ ← Bottom nav (60px)
└────────────────────────────────────┘
```

**Colores:**
- Fondo: Blanco (#FFFFFF)
- Card resumen: Blanco con sombra
- Barra progreso: Verde/Naranja/Rojo según %
- FAB: Azul primario (#4A90E2)

### 5.2 Nuevo Gasto (Modal Bottom Sheet)

```
┌────────────────────────────────────┐
│ [Overlay semi-transparente]        │
│                                    │
│  ┌────────────────────────────────┐│
│  │        ━━━━                    ││ ← Handle
│  │                                ││
│  │ ← Nuevo Gasto             [X]  ││
│  │                                ││
│  │ Últimas categorías:            ││
│  │ ┌────┐ ┌────┐ ┌────┐          ││
│  │ │ 🛒 │ │ 🍔 │ │ 🚕 │          ││ ← Quick access
│  │ │Mer │ │Rest│ │Tran│          ││
│  │ └────┘ └────┘ └────┘          ││
│  │                                ││
│  │ Categoría                      ││
│  │ ┌──────────────────────────┐  ││
│  │ │ Gastos Variables      ▼ │  ││ ← Select
│  │ └──────────────────────────┘  ││
│  │                                ││
│  │ Subcategoría                   ││
│  │ ┌──────────────────────────┐  ││
│  │ │ Mercado               ▼ │  ││
│  │ └──────────────────────────┘  ││
│  │                                ││
│  │ Descripción                    ││
│  │ ┌──────────────────────────┐  ││
│  │ │ Supermercado Éxito       │  ││ ← Input text
│  │ └──────────────────────────┘  ││
│  │                                ││
│  │ Valor                          ││
│  │ ┌──────────────────────────┐  ││
│  │ │ $ 85,000                 │  ││ ← Input number
│  │ └──────────────────────────┘  ││
│  │                                ││
│  │ Fecha: 20/02/2026       [📅] ││
│  │                                ││
│  │ [📋 Guardar como template]    ││
│  │                                ││
│  │    ┌──────────────────┐       ││
│  │    │     GUARDAR      │       ││ ← Primary btn
│  │    └──────────────────┘       ││
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

**Interacciones:**
- Swipe down para cerrar
- Tap en overlay para cerrar
- Animación slide-up al abrir

### 5.3 Detalle de Categoría

```
┌────────────────────────────────────┐
│ ← Mercado                  ⋯      │ ← Header con back
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │        🛒 Mercado            │ │
│  │                              │ │
│  │    $475,000 / $500,000       │ │ ← Montos grandes
│  │                              │ │
│  │  [███████████████████░] 95%  │ │ ← Barra grande
│  │                              │ │
│  │  Quedan: $25,000              │ │
│  │  De tu presupuesto mensual   │ │
│  └──────────────────────────────┘ │
│                                    │
│  📊 Comparativa                    │
│  ┌──────────────────────────────┐ │
│  │ Este mes:    $475k  [95%] ↑  │ │
│  │ Mes pasado:  $380k  [76%]    │ │
│  │ Diferencia:  +$95k (+25%)    │ │
│  └──────────────────────────────┘ │
│                                    │
│  💰 Gastos de Febrero             │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ ┌──┐ Supermercado Éxito      │ │
│  │ │🛒│ Hoy 14:30          $85k │ │ ← Swipeable
│  │ └──┘                         │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ ┌──┐ Frutas y verduras       │ │
│  │ │🛒│ Ayer 18:00         $45k │ │
│  │ └──┘                         │ │
│  └──────────────────────────────┘ │
│  ...                               │
│                            ┌─────┐│
│                            │  +  ││
│                            └─────┘│
├────────────────────────────────────┤
│ [🏠] [💰] [📊] [📅] [⚙️]          │
└────────────────────────────────────┘
```

**Gestos:**
- Swipe left en gasto: Eliminar (rojo)
- Swipe right en gasto: Editar (azul)
- Tap en gasto: Ver detalle

### 5.4 Gráficas

```
┌────────────────────────────────────┐
│ ← Gráficas                         │
├────────────────────────────────────┤
│                                    │
│  Febrero 2026              [ ⋯ ]  │
│                                    │
│  ┌──────────────────────────────┐ │
│  │     DISTRIBUCIÓN             │ │
│  │                              │ │
│  │         ╱───╲                │ │
│  │       ╱       ╲              │ │
│  │      │  Torta  │             │ │ ← Chart.js
│  │       ╲       ╱              │ │
│  │         ╲───╱                │ │
│  │                              │ │
│  │  🔴 Fijos      42%  $1.25M   │ │
│  │  🔵 Variables  50%  $1.50M   │ │
│  │  🟢 Ahorros     8%  $250k    │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │   PRESUPUESTO VS GASTADO     │ │
│  │                              │ │
│  │   ████                       │ │
│  │   ████  ███                  │ │
│  │   ████  ███  ███             │ │ ← Bar chart
│  │   ████  ████ ████ ███        │ │
│  │   ──────────────────         │ │
│  │   Fijos Var. Ahor. Otro      │ │
│  │                              │ │
│  │  ■ Presupuesto  ■ Gastado    │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │   EVOLUCIÓN DEL MES          │ │
│  │                     ╱         │ │
│  │                   ╱           │ │
│  │                 ╱             │ │ ← Line chart
│  │               ╱               │ │
│  │         ────╱                 │ │
│  │   ─────                       │ │
│  │   1  5  10  15  20  25  28   │ │
│  └──────────────────────────────┘ │
│                                    │
├────────────────────────────────────┤
│ [🏠] [💰] [📊] [📅] [⚙️]          │
└────────────────────────────────────┘
```

**Librería:** Chart.js o similar
**Colores:** Usar paleta de categorías definida

### 5.5 Histórico

```
┌────────────────────────────────────┐
│ ← Histórico                        │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │ FEBRERO 2026             ▶  │ │
│  │ $2.85M / $3M             95% │ │
│  │ [█████████████████████░] 🟢  │ │ ← Tapeable
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ ENERO 2026               ▶  │ │
│  │ $2.65M / $3M             88% │ │
│  │ [█████████████████░░░░░] 🟢  │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ DICIEMBRE 2025           ▶  │ │
│  │ $3.10M / $3M            103% │ │
│  │ [████████████████████████]🔴 │ │ ← Over budget
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ NOVIEMBRE 2025           ▶  │ │
│  │ $2.40M / $3M             80% │ │
│  │ [████████████████░░░░░░░]🟢  │ │
│  └──────────────────────────────┘ │
│                                    │
│  [📊 Ver tendencias de 6 meses]   │
│  [📄 Exportar histórico completo]  │
│                                    │
├────────────────────────────────────┤
│ [🏠] [💰] [📊] [📅] [⚙️]          │
└────────────────────────────────────┘
```

## 6. ANIMACIONES Y TRANSICIONES

### 6.1 Transiciones de Página

```css
/* Slide in from right */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Slide out to left */
@keyframes slideOutLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.page-transition {
  animation: slideInRight 0.3s ease;
}
```

### 6.2 Feedback Táctil

```css
/* Efecto ripple al tocar */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple-effect 0.6s ease-out;
}

@keyframes ripple-effect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

### 6.3 Loading States

```css
/* Skeleton loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  border: 3px solid var(--border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## 7. ICONOGRAFÍA

### 7.1 Iconos Principales

Usar emojis nativos o biblioteca como Lucide/Feather Icons

```
🏠  Inicio / Arriendo
💰  Gastos / Dinero
📊  Gráficas / Estadísticas
📅  Histórico / Calendario
⚙️   Configuración
➕  Agregar
🔄  Sincronización
👤  Usuario / Perfil
⋯   Más opciones (3 puntos)
✓   Check / Completado
✕   Cerrar / Eliminar
📌  Fijos
🛒  Mercado
🚕  Transporte
⚕️  Salud
🎬  Entretenimiento
🍔  Restaurantes
📚  Educación
👕  Ropa
💡  Servicios
🛡️  Seguros
📱  Suscripciones
🐷  Ahorros
📈  Inversiones
🆘  Emergencias
```

## 8. RESPONSIVE BREAKPOINTS

```css
/* iPhone SE (pequeño) */
@media (max-width: 374px) {
  :root {
    --text-base: 15px;
    --space-4: 14px;
  }
}

/* iPhone standard (375-428px) */
@media (min-width: 375px) and (max-width: 428px) {
  /* Estilos base - optimizado para este rango */
}

/* iPhone Pro Max / Plus (grande) */
@media (min-width: 429px) {
  :root {
    --text-base: 17px;
    --space-4: 18px;
  }
}

/* iPad / Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

## 9. ACCESIBILIDAD

### 9.1 Contraste

Todos los colores cumplen WCAG AA:
- Texto primario en fondo claro: ratio 4.5:1+
- Texto grande en fondo claro: ratio 3:1+

### 9.2 Touch Targets

Mínimo 44x44px para elementos interactivos (iOS HIG)

### 9.3 Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## 10. PRÓXIMOS PASOS

1. ✅ Diseño visual completo definido
2. ⏭️ Crear guía de Google Sheets con ejemplos
3. ⏭️ Setup del proyecto (package.json, estructura)
4. ⏭️ Implementar sistema de diseño (CSS variables)
5. ⏭️ Crear componentes base
