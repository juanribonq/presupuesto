# App Presupuesto Personal - Documento de Requerimientos

## 1. DESCRIPCIÓN GENERAL

Progressive Web App (PWA) para gestión de presupuesto personal con sincronización bidireccional con Google Sheets. La aplicación debe ser instalable en iPhone y funcionar como una app nativa, con gestión de periodos mensuales e historial completo.

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 Gestión de Categorías y Presupuestos

**RF-01: Estructura de Categorías**
- El sistema debe manejar 3 niveles de organización:
  - Categorías Globales (ej: Gastos Fijos, Gastos Variables, Ahorros)
  - Subcategorías (ej: Mercado, Salud, Transporte, etc.)
  - Presupuesto asignado a cada subcategoría

**RF-02: CRUD de Categorías**
- Crear nuevas categorías globales y subcategorías
- Editar nombres y presupuestos mediante edición inline (tocar para editar)
- Reorganizar orden mediante drag & drop
- Eliminar categorías (con validación si tienen gastos asociados)
- Asignar y modificar presupuesto en pesos por subcategoría

**RF-03: Presets de Categorías**
- Templates predefinidos de categorías comunes para inicio rápido:
  - Gastos Fijos: Arriendo, Servicios, Seguros, Suscripciones
  - Gastos Variables: Mercado, Transporte, Salud, Entretenimiento, Restaurantes
  - Ahorros: Ahorro general, Inversiones, Fondo de emergencia

**RF-04: Visualización de Presupuestos**
- Dashboard principal mostrando:
  - Resumen del mes actual (total presupuestado, gastado, disponible)
  - Porcentaje de uso global del presupuesto
  - Top 3 categorías con mayor gasto
  - Comparativa rápida: "Este mes vs mes pasado"

- Para cada subcategoría:
  - Monto presupuestado
  - Porcentaje respecto al ingreso mensual total
  - Gasto actual acumulado
  - Saldo pendiente (presupuesto - gasto actual)
  - Barra de progreso visual del porcentaje usado
  - Indicador de color (verde < 70%, amarillo 70-90%, rojo > 90%)

- Resumen por categoría global:
  - Total presupuestado
  - Total gastado
  - Porcentaje de uso

**RF-05: Alertas Inteligentes**
- Notificación visual cuando una subcategoría supere el 80% del presupuesto
- Alerta cuando el gasto total supere el 90% del ingreso mensual
- Banner informativo si hay presupuesto sin asignar

### 2.2 Registro de Gastos

**RF-06: Formulario de Registro Rápido**
- Botón flotante (+) siempre visible en la parte inferior derecha
- Campos obligatorios:
  - Categoría (selector con categorías globales)
  - Subcategoría (selector dependiente de categoría seleccionada)
  - Descripción (texto libre con autocompletado de gastos anteriores)
  - Valor en pesos (numérico, teclado numérico)
  - Fecha (por defecto fecha actual, modificable con selector de calendario)
- Recordar últimas 3 categorías usadas para acceso rápido
- Opción "Duplicar último gasto"

**RF-07: Gastos Recurrentes (Templates)**
- Crear plantillas de gastos frecuentes:
  - Nombre del template (ej: "Netflix")
  - Categoría y subcategoría predefinidas
  - Monto predefinido
  - Opción de marcar como recurrente mensual
- Acceso rápido a templates desde formulario de registro

**RF-08: Listado de Gastos**
- Vista de gastos del mes actual agrupados por fecha
- Mostrar: fecha, descripción, categoría, monto
- Gesto swipe izquierda para eliminar
- Gesto swipe derecha para editar
- Tocar el gasto para ver/editar detalles completos

**RF-09: Filtros y Búsqueda**
- Filtrar por:
  - Fecha (hoy, esta semana, este mes, rango personalizado)
  - Categoría/Subcategoría
  - Búsqueda por descripción (búsqueda global)
- Ordenar por: fecha (desc/asc), monto (mayor/menor)

### 2.3 Gestión de Periodos Mensuales

**RF-10: Cierre de Mes**
- Opción manual de "Cerrar Mes" en configuración
- Al cerrar mes:
  1. Archivar todos los gastos del mes actual en histórico
  2. Guardar snapshot del presupuesto usado
  3. Copiar estructura de categorías y presupuestos al nuevo mes
  4. Resetear gastos actuales a cero
  5. Permitir modificar ingreso mensual del nuevo periodo
  6. Permitir ajustar presupuestos antes de iniciar nuevo mes

**RF-11: Configuración de Nuevo Mes**
- Pantalla de transición al cerrar mes:
  - Resumen del mes que cierra (total gastado, % usado, categorías destacadas)
  - Campo para ingreso del nuevo mes (prellenado con mes anterior)
  - Opción de ajustar presupuestos por categoría
  - Botón "Iniciar nuevo mes"

**RF-12: Historial de Meses**
- Sección "Histórico" con lista de meses anteriores
- Para cada mes archivado mostrar:
  - Nombre del mes (ej: "Enero 2026")
  - Total presupuestado vs total gastado
  - Porcentaje de uso
  - Indicador visual (semáforo)
- Tocar un mes para ver detalle completo (solo lectura)

**RF-13: Vista Detalle de Mes Histórico**
- Resumen del mes con todas las métricas
- Listado completo de gastos del mes
- Desglose por categorías
- Opción de exportar reporte del mes
- No editable (solo consulta)

### 2.4 Visualizaciones y Reportes

**RF-14: Gráficas del Mes Actual**
- Gráfica de torta: distribución de gastos por categoría global
- Gráfica de barras: presupuesto vs gastado por subcategoría
- Gráfica de línea: evolución de gastos día a día en el mes
- Indicador de velocidad de gasto (proyección fin de mes)

**RF-15: Comparativas**
- "Este mes vs mes pasado":
  - Diferencia en gasto total
  - Categorías donde se gastó más/menos
  - Porcentaje de cambio por categoría
- Vista de últimos 6 meses con gráfica de tendencia

**RF-16: Exportar Reportes**
- Exportar mes específico en PDF
- Incluir: resumen, gráficas, detalle de gastos
- Compartir vía: email, WhatsApp, etc.

### 2.5 Sincronización con Google Sheets

**RF-17: Estructura de Google Sheets**
- **Hoja 1 - Configuración:**
  - Columnas: Categoría Global | Subcategoría | Presupuesto | Orden
  - Una fila por subcategoría
  - Incluir ingreso mensual en primera fila

- **Hoja 2 - Gastos Mes Actual:**
  - Columnas: Fecha | Categoría | Subcategoría | Descripción | Valor
  - Ordenado por fecha descendente
  - Incluir mes/año de referencia

- **Hoja 3 - Histórico:**
  - Columnas: Mes-Año | Fecha | Categoría | Subcategoría | Descripción | Valor | Presupuesto_Mes | Total_Gastado_Mes
  - Todos los gastos de meses cerrados
  - Incluir fila resumen por mes

**RF-18: Integración Bidireccional**
- Sincronizar datos con Google Sheets mediante Google Sheets API v4
- Sincronización automática:
  - Al registrar un gasto (escritura)
  - Al abrir la app (lectura)
  - Al cambiar presupuestos (escritura)
  - Al cerrar mes (escritura masiva a histórico)

**RF-19: Estado de Sincronización**
- Indicador visual en header:
  - Sincronizado (check verde)
  - Sincronizando (spinner)
  - Pendiente (ícono naranja con número de cambios)
  - Error (ícono rojo con mensaje)
- Botón manual de sincronización
- Timestamp de última sincronización

**RF-20: Manejo de Conflictos**
- Estrategia: última escritura gana
- Si hay conflicto, mostrar notificación
- Opción de forzar sincronización desde Google Sheets (sobrescribir local)
- Cola de sincronización para modo offline

### 2.6 Configuración General

**RF-21: Configuración de Usuario**
- Ingreso mensual (modificable cada mes)
- Nombre de usuario (opcional)
- Moneda (default: COP - Pesos colombianos)
- Formato de fecha (DD/MM/YYYY)

**RF-22: Configuración de App**
- Tema: Claro / Oscuro / Auto (según sistema)
- Notificaciones: Activar/desactivar alertas de presupuesto
- Sincronización automática: Sí/No
- Idioma: Español (futuro: otros idiomas)

**RF-23: Gestión de Cuenta Google**
- Conectar/desconectar cuenta de Google
- Seleccionar archivo de Google Sheets específico
- Ver permisos otorgados
- Botón de "Cerrar sesión"

**RF-24: Respaldo y Restauración**
- Exportar todos los datos a JSON (backup local)
- Importar datos desde JSON
- Advertencia antes de sobrescribir datos

### 2.7 Funcionalidades Adicionales

**RF-25: Gastos Recurrentes Automáticos**
- Opción de marcar gastos como "recurrentes mensuales"
- Al iniciar nuevo mes, preguntar si desea agregar gastos recurrentes
- Lista de gastos recurrentes editable

**RF-26: Metas de Ahorro**
- Definir metas de ahorro (nombre, monto objetivo, plazo)
- Tracking de progreso hacia la meta
- Vinculación opcional con categoría "Ahorros"

**RF-27: Modo Tutorial**
- Tour guiado al primer uso
- Explicación de cada sección
- Opción de "Configuración rápida" con wizard paso a paso

## 3. REQUERIMIENTOS NO FUNCIONALES

### 3.1 Usabilidad

**RNF-01: Interfaz Móvil Optimizada**
- Diseño mobile-first responsive
- Interfaz intuitiva siguiendo patrones iOS
- Fuentes legibles (mínimo 16px body, 14px secundario)
- Contraste suficiente (WCAG AA)
- Áreas de toque mínimo 44x44px

**RNF-02: Interacciones Naturales**
- Gestos swipe para acciones rápidas
- Pull-to-refresh para sincronizar
- Haptic feedback en acciones importantes (registrar gasto, alcanzar límite)
- Transiciones suaves entre pantallas (300ms)
- Botón flotante siempre accesible con el pulgar

**RNF-03: PWA Completa**
- Instalable en pantalla de inicio de iPhone
- Funcionar en modo standalone (sin barra navegador Safari)
- Ícono personalizado en múltiples resoluciones
- Splash screen con branding
- Funcionar en orientación portrait (bloquear landscape)

**RNF-04: Accesibilidad**
- Etiquetas ARIA para lectores de pantalla
- Navegación por teclado funcional
- Contraste de colores suficiente
- Tamaño de texto ajustable

### 3.2 Rendimiento

**RNF-05: Velocidad**
- Carga inicial: < 2 segundos en 4G
- Registro de gasto: < 500ms (respuesta UI)
- Sincronización en background sin bloquear UI
- Transiciones 60fps
- Lazy loading de histórico

**RNF-06: Optimización**
- Service Worker para cache de assets
- Imágenes optimizadas y comprimidas
- Minificación de JS/CSS
- Code splitting por rutas
- Bundle size < 500KB inicial

**RNF-07: Modo Offline**
- Funcionar completamente sin conexión
- Almacenar cambios en cola local
- Sincronizar automáticamente al recuperar conexión
- Indicador claro de modo offline

### 3.3 Compatibilidad

**RNF-08: Navegadores**
- Safari iOS 14+
- Chrome iOS (últimas 2 versiones)
- Progressive enhancement (funcionalidad básica en navegadores antiguos)

**RNF-09: Dispositivos**
- iPhone SE (pantalla pequeña: 375px ancho)
- iPhone 12/13/14 (standard)
- iPhone Pro Max (pantallas grandes)
- iPad (modo responsive)

### 3.4 Seguridad

**RNF-10: Autenticación**
- OAuth 2.0 con Google para acceso a Sheets
- Tokens almacenados en localStorage encriptado
- Refresh tokens manejados automáticamente
- Session timeout después de 30 días de inactividad

**RNF-11: Privacidad**
- No enviar datos a servidores propios (solo Google Sheets)
- No tracking de analytics sin consentimiento
- Datos sensibles no logueados en consola
- HTTPS obligatorio

### 3.5 Datos

**RNF-12: Persistencia Local**
- IndexedDB como base de datos local
- Schema versionado para migraciones
- Tamaño máximo: 50MB de datos
- Limpieza automática de caché antigua

**RNF-13: Integridad de Datos**
- Validación de datos en cliente y al sincronizar
- Checksums para detectar corrupción
- Logs de sincronización para debugging
- Rollback automático si sincronización falla

## 4. CASOS DE USO PRINCIPALES

### CU-01: Registrar Gasto Rápido (Flujo Principal)
1. Usuario abre la app (dashboard visible)
2. Presiona botón flotante (+)
3. Ve últimas 3 categorías usadas en la parte superior
4. Selecciona categoría rápida O busca otra
5. Selecciona subcategoría
6. Descripción se auto-completa con gastos similares previos
7. Ingresa monto (teclado numérico)
8. Fecha prellenada con hoy
9. Presiona "Guardar"
10. Haptic feedback + animación de confirmación
11. Sistema sincroniza en background
12. Dashboard se actualiza mostrando nuevo gasto y presupuesto actualizado
**Tiempo objetivo: < 15 segundos**

### CU-02: Registrar Gasto Recurrente
1. Usuario presiona botón (+)
2. Presiona "Templates" en parte superior
3. Ve lista de gastos recurrentes guardados
4. Selecciona "Netflix - $50,000"
5. Template prellenada todos los campos
6. Ajusta fecha si es necesario
7. Presiona "Guardar"
8. Sistema registra y sincroniza
**Tiempo objetivo: < 5 segundos**

### CU-03: Revisar Estado de Presupuesto
1. Usuario abre la app
2. Ve dashboard con:
   - Resumen: "$2,500,000 de $3,000,000 (83%)"
   - Barra de progreso global
   - "Quedan 12 días de mes"
   - Top 3 categorías
3. Scroll down para ver todas las categorías
4. Mercado muestra rojo (95% usado)
5. Toca "Mercado" para ver detalle
6. Ve lista de gastos de mercado del mes
7. Ve comparativa: "Este mes $450k, mes pasado $380k (+18%)"

### CU-04: Cerrar Mes e Iniciar Nuevo
1. Usuario va a Configuración
2. Presiona "Cerrar mes actual"
3. Ve pantalla de resumen:
   - "Febrero 2026: Gastaste $2,850,000 de $3,000,000 (95%)"
   - Gráfica de distribución
   - Categorías destacadas
4. Presiona "Continuar"
5. Ve formulario nuevo mes:
   - "Ingreso Marzo 2026: $3,000,000" (prellenado)
   - Lista de presupuestos (copiados de febrero, editables)
6. Ajusta ingreso a $3,200,000
7. Aumenta presupuesto de "Mercado" de $450k a $500k
8. Presiona "Iniciar Marzo"
9. Sistema:
   - Mueve gastos de febrero a histórico
   - Sincroniza con Sheet 3
   - Actualiza Sheet 1 con nuevos presupuestos
   - Limpia Sheet 2
   - Resetea contadores
10. Dashboard muestra mes limpio listo para usar

### CU-05: Consultar Historial
1. Usuario va a sección "Histórico"
2. Ve lista de meses:
   - Febrero 2026: 95% usado (verde)
   - Enero 2026: 88% usado (verde)
   - Diciembre 2025: 103% usado (rojo)
3. Toca "Enero 2026"
4. Ve resumen completo del mes (solo lectura)
5. Ve todos los gastos registrados
6. Ve gráficas de distribución
7. Presiona "Comparar con Febrero"
8. Ve tabla comparativa de ambos meses
9. Presiona "Exportar PDF"
10. Comparte reporte por WhatsApp

### CU-06: Sincronizar Cambios desde Excel
1. Usuario modifica gastos directamente en Google Sheets desde PC
2. Agrega 3 gastos nuevos manualmente en Sheet 2
3. Modifica presupuesto de "Transporte" en Sheet 1
4. Abre la app en iPhone
5. Pull-to-refresh en dashboard
6. Sistema detecta cambios en Sheets
7. Muestra notificación: "3 gastos nuevos y 1 presupuesto actualizado"
8. Sincroniza cambios
9. Dashboard refleja nuevos datos
10. Categoría "Transporte" muestra nuevo presupuesto
11. Gastos nuevos aparecen en listado

### CU-07: Editar Gasto Rápido
1. Usuario ve lista de gastos del día
2. Swipe derecha en "Almuerzo - $25,000"
3. Se abre modal de edición rápida
4. Cambia monto a $28,000
5. Presiona "Actualizar"
6. Gasto actualizado
7. Presupuesto recalculado
8. Sincronización automática

### CU-08: Eliminar Gasto
1. Usuario ve lista de gastos
2. Swipe izquierda en "Taxi - $15,000"
3. Aparece botón rojo "Eliminar"
4. Toca "Eliminar"
5. Confirmación: "¿Eliminar este gasto?"
6. Confirma
7. Animación de desaparición
8. Presupuesto se actualiza
9. Sincronización automática

## 5. FLUJO DE NAVEGACIÓN

```
[Splash Screen]
    ↓
[Login Google] (primera vez)
    ↓
[Seleccionar/Crear Google Sheet] (primera vez)
    ↓
[Tutorial] (primera vez, opcional saltar)
    ↓
[Dashboard] ← INICIO
    ├─ [+ Nuevo Gasto]
    │   ├─ [Templates]
    │   └─ [Guardar] → Vuelve a Dashboard
    ├─ [Categoría Específica]
    │   ├─ Detalles presupuesto
    │   ├─ Lista gastos categoría
    │   └─ [Editar Presupuesto]
    ├─ [Gráficas] (tab inferior)
    │   ├─ Torta
    │   ├─ Barras
    │   └─ Línea temporal
    ├─ [Histórico] (tab inferior)
    │   └─ [Mes Específico]
    │       ├─ Detalle mes
    │       └─ [Exportar PDF]
    └─ [Configuración] (tab inferior)
        ├─ Perfil
        ├─ Categorías (CRUD)
        ├─ Templates gastos
        ├─ Metas de ahorro
        ├─ Cerrar mes
        ├─ Sincronización
        └─ Cuenta Google
```

### Tabs de Navegación Inferior (5 tabs):
1. **Inicio** (Dashboard)
2. **Gastos** (Lista completa)
3. **Gráficas** (Visualizaciones)
4. **Histórico** (Meses anteriores)
5. **Config** (Configuración)

## 6. DISEÑO DE INTERFAZ (Wireframes Conceptuales)

### Pantalla Principal - Dashboard
```
┌─────────────────────────────┐
│ ≡  Presupuesto    🔄 👤    │ ← Header
├─────────────────────────────┤
│ FEBRERO 2026                │
│ Quedan 12 días              │
│                             │
│ ┌─────────────────────────┐ │
│ │ $2,500,000 / $3,000,000│ │ ← Resumen global
│ │ [████████░░] 83%       │ │
│ └─────────────────────────┘ │
│                             │
│ vs Mes pasado: +5% 📈       │
│                             │
│ ▼ GASTOS FIJOS              │
│ ┌─────────────────────────┐ │
│ │ Arriendo    [████] 100% │ │ ← Subcategoría
│ │ $800k / $800k           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Servicios   [███░]  75% │ │
│ │ $150k / $200k  ⚠️      │ │
│ └─────────────────────────┘ │
│                             │
│ ▼ GASTOS VARIABLES          │
│ ┌─────────────────────────┐ │
│ │ Mercado     [█████] 95% │ │ ← Alerta roja
│ │ $475k / $500k  🔴      │ │
│ └─────────────────────────┘ │
│ ...                         │
│                             │
│                         ┌─┐ │
│                         │+│ │ ← Botón flotante
│                         └─┘ │
├─────────────────────────────┤
│ [🏠] [💰] [📊] [📅] [⚙️] │ ← Bottom tabs
└─────────────────────────────┘
```

### Pantalla Nuevo Gasto
```
┌─────────────────────────────┐
│ ← Nuevo Gasto          [X]  │
├─────────────────────────────┤
│ Últimas categorías:         │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │🛒 Mer││🍔 Rest││🚕 Tran │ │ ← Acceso rápido
│ └──────┘ └──────┘ └──────┘ │
│                             │
│ O buscar:                   │
│ ┌─────────────────────────┐ │
│ │ Categoría ▼            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Subcategoría ▼         │ │
│ └─────────────────────────┘ │
│                             │
│ Descripción                 │
│ ┌─────────────────────────┐ │
│ │ Almuerzo...            │ │ ← Autocompletado
│ └─────────────────────────┘ │
│ │ • Almuerzo restaurante  │ │
│ │ • Almuerzo oficina      │ │
│                             │
│ Valor                       │
│ ┌─────────────────────────┐ │
│ │ $ 25,000               │ │ ← Teclado numérico
│ └─────────────────────────┘ │
│                             │
│ Fecha: 20/02/2026  [📅]    │
│                             │
│ [📋 Guardar como template] │
│                             │
│      ┌──────────────┐       │
│      │   GUARDAR    │       │ ← Botón principal
│      └──────────────┘       │
└─────────────────────────────┘
```

### Pantalla Histórico
```
┌─────────────────────────────┐
│ ← Histórico                 │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ FEBRERO 2026        ▶  │ │
│ │ $2.8M / $3M        95% │ │
│ │ [████████░]         🟢 │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ENERO 2026          ▶  │ │
│ │ $2.6M / $3M        88% │ │
│ │ [████████░]         🟢 │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ DICIEMBRE 2025      ▶  │ │
│ │ $3.1M / $3M       103% │ │
│ │ [██████████]        🔴 │ │
│ └─────────────────────────┘ │
│                             │
│ [📊 Ver tendencias]         │
│ [📄 Exportar todo]          │
└─────────────────────────────┘
```

## 7. PALETA DE COLORES Y DISEÑO

### Colores Principales
- **Primary:** #4A90E2 (Azul confianza)
- **Success:** #7ED321 (Verde < 70% presupuesto)
- **Warning:** #F5A623 (Naranja 70-90%)
- **Danger:** #D0021B (Rojo > 90%)
- **Background:** #FFFFFF (claro) / #1A1A1A (oscuro)
- **Surface:** #F8F9FA (claro) / #2A2A2A (oscuro)
- **Text:** #333333 (claro) / #FFFFFF (oscuro)

### Tipografía
- **Familia:** -apple-system, SF Pro (iOS native)
- **Tamaños:**
  - H1: 28px (bold) - Títulos principales
  - H2: 22px (semibold) - Secciones
  - H3: 18px (semibold) - Subsecciones
  - Body: 16px (regular) - Texto normal
  - Small: 14px (regular) - Secundario
  - Caption: 12px (regular) - Metadatos

### Espaciado
- Base: 8px
- Pequeño: 8px
- Medio: 16px
- Grande: 24px
- Extra: 32px

## 8. RESTRICCIONES Y SUPUESTOS

### Restricciones
- Moneda única: Pesos colombianos (COP)
- Un solo usuario por instancia de app
- Depende de Google Sheets como backend (no hay servidor propio)
- Requiere cuenta de Google
- Máximo 1000 gastos por mes (limitación práctica)
- Histórico máximo: 24 meses

### Supuestos
- Usuario tiene cuenta de Google activa
- Usuario tiene acceso intermitente a internet (sync periódica)
- Usuario mantiene estructura de hojas en Google Sheets
- Usuario usa principalmente iPhone (optimización iOS first)
- Gastos se registran en pesos enteros (sin centavos)

## 9. CRITERIOS DE ÉXITO

### Métricas de Usabilidad
1. Registrar un gasto toma < 15 segundos
2. 90% de usuarios completa configuración inicial sin ayuda
3. Tasa de error en registro < 5%

### Métricas Técnicas
1. La app es instalable en iPhone y funciona standalone
2. Carga inicial < 2 segundos
3. Sincronización bidireccional funciona en 95% de casos
4. App funciona offline y sincroniza al recuperar conexión
5. 0 pérdida de datos durante sincronización

### Métricas de Satisfacción
1. Usuario puede visualizar claramente estado de presupuesto
2. Alertas de presupuesto se disparan correctamente
3. Histórico preserva todos los datos de meses anteriores
4. Proceso de cierre de mes es claro e intuitivo

## 10. RIESGOS Y MITIGACIONES

### Riesgo 1: Límites de Google Sheets API
- **Problema:** 100 requests/100 segundos por usuario
- **Mitigación:**
  - Batch de operaciones
  - Cache local extensivo
  - Sincronización inteligente (solo cambios)

### Riesgo 2: Conflictos de Sincronización
- **Problema:** Usuario modifica Sheet mientras app sincroniza
- **Mitigación:**
  - Timestamps en cada registro
  - Última escritura gana
  - Log de conflictos
  - Opción de forzar resincronización completa

### Riesgo 3: Pérdida de Datos Offline
- **Problema:** Usuario limpia cache del navegador
- **Mitigación:**
  - Advertencia sobre limpieza de datos
  - Sincronización frecuente cuando hay conexión
  - Opción de backup manual a archivo JSON

### Riesgo 4: Límite de Almacenamiento IndexedDB
- **Problema:** Histórico muy grande excede límites
- **Mitigación:**
  - Limitar histórico a 24 meses en local
  - Google Sheets mantiene histórico completo
  - Opción de cargar meses antiguos bajo demanda

## 11. FASES DE DESARROLLO

### Fase 1: MVP (Mínimo Viable)
- Estructura básica PWA
- Dashboard con presupuestos
- Registro de gastos simple
- Sincronización básica con Google Sheets (lectura/escritura)
- Modo offline básico

### Fase 2: Mejoras de UX
- Edición inline
- Gestos swipe
- Templates de gastos
- Últimas categorías usadas
- Gráficas básicas

### Fase 3: Gestión Mensual
- Cierre de mes
- Histórico de meses
- Comparativas mes actual vs anterior
- Exportar reportes

### Fase 4: Features Avanzados
- Gastos recurrentes automáticos
- Metas de ahorro
- Gráficas avanzadas y tendencias
- Notificaciones push
- Compartir presupuesto

## 12. PRÓXIMOS PASOS

1. ✅ Definir requerimientos (completado)
2. ⏭️ Diseñar arquitectura técnica
3. ⏭️ Definir estructura de datos detallada
4. ⏭️ Crear diseño visual (mockups)
5. ⏭️ Configurar entorno de desarrollo
6. ⏭️ Desarrollo Fase 1 (MVP)
