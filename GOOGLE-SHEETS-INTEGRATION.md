# Integración con Google Sheets - Guía Completa

## ⚠️ SEGURIDAD - IMPORTANTE

### Información Sensible - NO COMMITEAR

**NUNCA** incluir en el repositorio:
- ❌ Client ID de Google
- ❌ Client Secret
- ❌ API Keys
- ❌ Access Tokens
- ❌ Refresh Tokens
- ❌ IDs de Google Sheets personales

### Configuración Segura

**Variables de entorno (NO commitear):**
```javascript
// .env (añadir a .gitignore)
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=tu-api-key
```

**Archivo .gitignore obligatorio:**
```
# .gitignore
.env
.env.local
.env.production
*.key
*.secret
config/secrets.js
```

**Configuración pública (SÍ commitear):**
```javascript
// config/google-api.js (público, sin secretos)
export const GOOGLE_CONFIG = {
  // Estos valores los obtiene de variables de entorno
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,

  // Estos valores son públicos (OK)
  scope: 'https://www.googleapis.com/auth/spreadsheets',
  discoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4'
  ],

  // URLs autorizadas (configurar en Google Cloud Console)
  redirectUri: window.location.origin + '/callback'
}
```

### GitHub Pages + Secretos

Para GitHub Pages necesitas configurar los secretos:

1. **GitHub Secrets** (Settings > Secrets and variables > Actions):
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_API_KEY`

2. **GitHub Actions para deploy:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_GOOGLE_API_KEY: ${{ secrets.VITE_GOOGLE_API_KEY }}
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 1. ESTRUCTURA DE GOOGLE SHEETS

### Documento: "Presupuesto Personal"

El documento de Google Sheets contendrá 3 hojas (sheets):

```
📊 Presupuesto Personal (Documento)
├── 📄 Hoja 1: "Configuración"
├── 📄 Hoja 2: "Gastos Mes Actual"
└── 📄 Hoja 3: "Histórico"
```

---

## 2. HOJA 1: CONFIGURACIÓN

### 2.1 Estructura

| Columna A       | Columna B      | Columna C      | Columna D |
|-----------------|----------------|----------------|-----------|
| Categoría       | Subcategoría   | Presupuesto    | Orden     |

### 2.2 Contenido Ejemplo

```
Row 1  (Header):
A1: Categoría
B1: Subcategoría
C1: Presupuesto
D1: Orden

Row 2-3 (Metadata):
A2: META_DATA    B2: INGRESO         C2: 3000000    D2: [vacío]
A3: META_DATA    B3: MES_ANIO        C3: 2026-02    D3: [vacío]

Row 5+ (Categorías y Subcategorías):
A5: Gastos Fijos    B5: Arriendo              C5: 800000     D5: 1
A6: Gastos Fijos    B6: Servicios Públicos    C6: 200000     D6: 2
A7: Gastos Fijos    B7: Seguros               C7: 150000     D7: 3
A8: Gastos Fijos    B8: Suscripciones         C8: 100000     D8: 4

A9: Gastos Variables    B9: Mercado           C9: 500000     D9: 5
A10: Gastos Variables   B10: Transporte       C10: 300000    D10: 6
A11: Gastos Variables   B11: Salud            C11: 200000    D11: 7
A12: Gastos Variables   B12: Entretenimiento  C12: 150000    D12: 8
A13: Gastos Variables   B13: Restaurantes     C13: 250000    D13: 9
A14: Gastos Variables   B14: Educación        C14: 100000    D14: 10
A15: Gastos Variables   B15: Ropa             C15: 150000    D15: 11
A16: Gastos Variables   B16: Otros            C16: 100000    D16: 12

A17: Ahorros        B17: Ahorro General       C17: 400000    D17: 13
A18: Ahorros        B18: Inversiones          C18: 200000    D18: 14
A19: Ahorros        B19: Fondo Emergencias    C19: 150000    D19: 15
```

### 2.3 Formato Recomendado

**Header (Fila 1):**
- Fondo: Azul (#4A90E2)
- Texto: Blanco, negrita
- Bordes: Todos los bordes

**Metadata (Filas 2-3):**
- Fondo: Gris claro (#F8F9FA)
- Texto: Negrita

**Categorías:**
- Usar colores de fondo según categoría:
  - Gastos Fijos: #FFE6E6 (rojo claro)
  - Gastos Variables: #E6F2FF (azul claro)
  - Ahorros: #E6FFE6 (verde claro)

---

## 3. HOJA 2: GASTOS MES ACTUAL

### 3.1 Estructura

| Columna A | Columna B  | Columna C      | Columna D      | Columna E |
|-----------|------------|----------------|----------------|-----------|
| Fecha     | Categoría  | Subcategoría   | Descripción    | Valor     |

### 3.2 Contenido Ejemplo

```
Row 1 (Header):
A1: Fecha
B1: Categoría
C1: Subcategoría
D1: Descripción
E1: Valor

Row 2+ (Gastos):
A2: 2026-02-20    B2: Gastos Variables    C2: Mercado         D2: Supermercado      E2: 85000
A3: 2026-02-20    B3: Gastos Variables    C3: Transporte      D3: Uber              E3: 15000
A4: 2026-02-19    B4: Gastos Variables    C4: Mercado         D4: Fruver            E4: 25000
```

### 3.3 Formato Recomendado

**Header (Fila 1):**
- Fondo: Azul (#4A90E2)
- Texto: Blanco, negrita
- Congelar fila (Freeze row 1)

**Fechas:** Formato DD/MM/YYYY o YYYY-MM-DD
**Valores:** Formato número con separador de miles

---

## 4. HOJA 3: HISTÓRICO

### 4.1 Estructura

| Col A    | Col B | Col C      | Col D          | Col E         | Col F   | Col G           | Col H              |
|----------|-------|------------|----------------|---------------|---------|-----------------|-------------------|
| Mes-Año  | Fecha | Categoría  | Subcategoría   | Descripción   | Valor   | Presup. Mes     | Total Gastado Mes |

### 4.2 Contenido Ejemplo

```
Row 1 (Header):
A1: Mes-Año
B1: Fecha
C1: Categoría
D1: Subcategoría
E1: Descripción
F1: Valor
G1: Presupuesto Mes
H1: Total Gastado Mes

Row 2 (Resumen):
A2: 2026-02
B2: 2026-02-28
C2: META_SUMMARY
D2: RESUMEN
E2: Febrero 2026
F2: [vacío]
G2: 3750000
H2: 2850000

Row 3+ (Gastos del mes):
A3: 2026-02    B3: 2026-02-28    C3: Gastos Var.    D3: Mercado    E3: Supermercado    F3: 95000
```

---

## 5. INTEGRACIÓN CON GOOGLE SHEETS API

### 5.1 Configuración Inicial (SIN SECRETOS)

#### Paso 1: Crear Proyecto en Google Cloud Console

1. Ir a https://console.cloud.google.com/
2. Crear nuevo proyecto: "App Presupuesto PWA"
3. Habilitar Google Sheets API:
   - APIs & Services > Enable APIs and Services
   - Buscar "Google Sheets API"
   - Click "Enable"

#### Paso 2: Configurar OAuth 2.0

1. APIs & Services > Credentials
2. Create Credentials > OAuth client ID
3. Application type: **Web application**
4. Authorized JavaScript origins:
   ```
   http://localhost:5173
   https://tu-usuario.github.io
   ```
5. Authorized redirect URIs:
   ```
   http://localhost:5173
   https://tu-usuario.github.io
   ```
6. **IMPORTANTE:** Copiar Client ID (guardarlo en lugar seguro)

#### Paso 3: Configurar API Key

1. APIs & Services > Credentials
2. Create Credentials > API Key
3. Restringir la API Key:
   - Application restrictions: HTTP referrers
   - Website restrictions:
     ```
     https://tu-usuario.github.io/*
     localhost:5173/*
     ```
   - API restrictions: Google Sheets API
4. **IMPORTANTE:** Copiar API Key (guardarlo en lugar seguro)

⚠️ **NUNCA** commitear estos valores al repositorio

#### Paso 4: Configurar Pantalla de Consentimiento

1. OAuth consent screen
2. User Type: **External**
3. App information:
   - App name: "App Presupuesto Personal"
   - User support email: tu-email@gmail.com
   - Developer contact: tu-email@gmail.com
4. Scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
5. Test users: agregar emails que usarán la app

### 5.2 Configuración en el Proyecto

#### Archivo .env (NO COMMITEAR)

```bash
# .env.local - Para desarrollo
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Archivo .env.example (SÍ commitear)

```bash
# .env.example - Template para otros desarrolladores
VITE_GOOGLE_CLIENT_ID=tu-client-id-aqui
VITE_GOOGLE_API_KEY=tu-api-key-aqui
```

#### Configuración de la App (config/google-api.js)

```javascript
// config/google-api.js
// Este archivo SÍ se commitea (sin valores sensibles)

export const GOOGLE_CONFIG = {
  // Obtener de variables de entorno
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,

  // Configuración pública
  scope: 'https://www.googleapis.com/auth/spreadsheets',
  discoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4'
  ]
}

// Validar que las variables estén configuradas
if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.apiKey) {
  console.error('⚠️ Configuración de Google API incompleta')
  console.error('Verifica que VITE_GOOGLE_CLIENT_ID y VITE_GOOGLE_API_KEY estén configurados')
}
```

### 5.3 Autenticación Segura

```javascript
// services/AuthService.js

class AuthService {
  constructor() {
    this.gapiLoaded = false
    this.gisLoaded = false
    this.tokenClient = null
    this.accessToken = null
  }

  async init() {
    // Verificar que la configuración esté completa
    if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.apiKey) {
      throw new Error('Configuración de Google API incompleta. Revisa el archivo .env')
    }

    // Cargar Google API client
    await this.loadGapi()
    await this.loadGis()

    // Inicializar gapi
    await gapi.client.init({
      apiKey: GOOGLE_CONFIG.apiKey,
      discoveryDocs: GOOGLE_CONFIG.discoveryDocs
    })

    this.gapiLoaded = true

    // Configurar token client
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.clientId,
      scope: GOOGLE_CONFIG.scope,
      callback: (response) => {
        if (response.access_token) {
          this.accessToken = response.access_token
          this.saveToken(response)
          this.emit('auth:success')
        }
      }
    })

    this.gisLoaded = true

    // Verificar token guardado
    const savedToken = this.loadToken()
    if (savedToken && !this.isTokenExpired(savedToken)) {
      this.accessToken = savedToken.access_token
      gapi.client.setToken(savedToken)
      return true
    }

    return false
  }

  async login() {
    if (!this.gisLoaded) {
      throw new Error('Google Identity Services no cargado')
    }

    // Solicitar token
    this.tokenClient.requestAccessToken()
  }

  logout() {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken)
      this.accessToken = null
      this.removeToken()
      this.emit('auth:logout')
    }
  }

  isAuthenticated() {
    return this.accessToken !== null
  }

  // Almacenamiento seguro de tokens
  saveToken(token) {
    const tokenData = {
      access_token: token.access_token,
      expires_at: Date.now() + (token.expires_in * 1000)
    }

    // Almacenar en localStorage (solo en cliente, no en repo)
    localStorage.setItem('google_token', JSON.stringify(tokenData))
  }

  loadToken() {
    const data = localStorage.getItem('google_token')
    return data ? JSON.parse(data) : null
  }

  removeToken() {
    localStorage.removeItem('google_token')
  }

  isTokenExpired(token) {
    return Date.now() >= token.expires_at
  }

  // Cargar scripts
  loadGapi() {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        gapi.load('client', resolve)
      }
      document.body.appendChild(script)
    })
  }

  loadGis() {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = resolve
      document.body.appendChild(script)
    })
  }
}

export default AuthService
```

### 5.4 Operaciones CRUD

```javascript
// services/GoogleSheetsService.js

class GoogleSheetsService {
  constructor(authService) {
    this.auth = authService
    this.sheetId = null
  }

  setSheetId(sheetId) {
    // El usuario selecciona/proporciona su propio Sheet ID
    // No hardcodear Sheet IDs en el código
    this.sheetId = sheetId
    localStorage.setItem('user_sheet_id', sheetId)
  }

  getSheetId() {
    return this.sheetId || localStorage.getItem('user_sheet_id')
  }

  async readConfiguration() {
    const sheetId = this.getSheetId()
    if (!sheetId) {
      throw new Error('No hay Google Sheet configurado')
    }

    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Configuración!A2:D100'
    })

    const rows = response.result.values || []

    const metadata = {}
    const categories = []

    rows.forEach(row => {
      if (row[0] === 'META_DATA') {
        metadata[row[1]] = row[2]
      } else if (row[0] && row[1] && row[2]) {
        categories.push({
          category: row[0],
          subcategory: row[1],
          budget: parseInt(row[2]),
          order: parseInt(row[3] || 0)
        })
      }
    })

    return {
      income: parseInt(metadata.INGRESO || 0),
      monthYear: metadata.MES_ANIO || '',
      categories
    }
  }

  async readCurrentMonthExpenses() {
    const sheetId = this.getSheetId()

    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Gastos Mes Actual!A2:E1000'
    })

    const rows = response.result.values || []

    return rows.map((row, index) => ({
      id: `sheet_row_${index + 2}`,
      date: row[0],
      category: row[1],
      subcategory: row[2],
      description: row[3],
      amount: parseInt(row[4] || 0),
      sheetRow: index + 2
    }))
  }

  async addExpense(expense) {
    const sheetId = this.getSheetId()

    const values = [[
      expense.date,
      expense.category,
      expense.subcategory,
      expense.description,
      expense.amount
    ]]

    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Gastos Mes Actual!A:E',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    })

    return response.result
  }

  async updateExpense(expense) {
    const sheetId = this.getSheetId()
    const row = expense.sheetRow

    const values = [[
      expense.date,
      expense.category,
      expense.subcategory,
      expense.description,
      expense.amount
    ]]

    const response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Gastos Mes Actual!A${row}:E${row}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    })

    return response.result
  }

  async deleteExpense(sheetRow) {
    const sheetId = this.getSheetId()

    const response = await gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `Gastos Mes Actual!A${sheetRow}:E${sheetRow}`
    })

    return response.result
  }
}

export default GoogleSheetsService
```

---

## 6. DESPLIEGUE EN GITHUB PAGES

### 6.1 Configurar Repositorio

```bash
# Inicializar git (si aún no está)
git init

# Crear .gitignore
cat > .gitignore << EOF
# Environment variables (NO COMMITEAR)
.env
.env.local
.env.production
.env.*.local

# Secrets (NO COMMITEAR)
*.key
*.secret
config/secrets.js

# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
EOF

# Crear .env.example (template público)
cat > .env.example << EOF
# Configuración de Google API
# Obtén estos valores de Google Cloud Console

VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy-tu-api-key-aqui
EOF
```

### 6.2 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          # Usar secretos de GitHub
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_GOOGLE_API_KEY: ${{ secrets.VITE_GOOGLE_API_KEY }}
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### 6.3 Configurar Secretos en GitHub

1. Ir a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Agregar:
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: `tu-client-id.apps.googleusercontent.com`
5. Agregar:
   - Name: `VITE_GOOGLE_API_KEY`
   - Value: `AIzaSy...`

### 6.4 Configurar GitHub Pages

1. Repository > Settings > Pages
2. Source: **GitHub Actions**
3. Guardar

### 6.5 README con Instrucciones

```markdown
# App Presupuesto Personal

PWA para gestión de presupuesto personal con sincronización a Google Sheets.

## 🚀 Demo

[Ver app en vivo](https://tu-usuario.github.io/app-presupuesto)

## ⚙️ Configuración para Desarrollo

### 1. Clonar repositorio

\`\`\`bash
git clone https://github.com/tu-usuario/app-presupuesto.git
cd app-presupuesto
npm install
\`\`\`

### 2. Configurar Google API

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar Google Sheets API
3. Crear credenciales OAuth 2.0
4. Crear API Key

### 3. Variables de entorno

\`\`\`bash
cp .env.example .env.local
\`\`\`

Editar `.env.local` con tus credenciales:
\`\`\`
VITE_GOOGLE_CLIENT_ID=tu-client-id
VITE_GOOGLE_API_KEY=tu-api-key
\`\`\`

⚠️ **NUNCA** commitear el archivo `.env.local`

### 4. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

## 📦 Build para producción

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🔒 Seguridad

- Las credenciales se configuran mediante variables de entorno
- Los secretos se almacenan en GitHub Secrets para deploy
- No hay información sensible en el código fuente

## 📄 Licencia

MIT
\`\`\`

---

## 7. CHECKLIST DE SEGURIDAD

Antes de hacer push al repositorio:

- [ ] Archivo `.gitignore` creado y actualizado
- [ ] Archivo `.env` en `.gitignore`
- [ ] Archivo `.env.example` creado (sin valores reales)
- [ ] No hay Client IDs hardcodeados en el código
- [ ] No hay API Keys hardcodeados en el código
- [ ] No hay Sheet IDs personales hardcodeados
- [ ] GitHub Secrets configurados
- [ ] OAuth redirect URIs configuradas en Google Console
- [ ] README con instrucciones claras

---

## 8. PRÓXIMOS PASOS

1. ✅ Seguridad configurada
2. ⏭️ Setup del proyecto con estructura segura
3. ⏭️ Implementar servicios con variables de entorno
4. ⏭️ Probar localmente
5. ⏭️ Configurar GitHub Secrets
6. ⏭️ Deploy a GitHub Pages
