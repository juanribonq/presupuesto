# 💰 App Presupuesto Personal

Progressive Web App (PWA) para gestión de presupuesto personal con sincronización bidireccional a Google Sheets.

## 🚀 Demo

[Ver app en vivo](https://tu-usuario.github.io/app-presupuesto) (Próximamente)

## ✨ Características

- 📱 **PWA Instalable** - Funciona como app nativa en iPhone
- 📊 **Dashboard Intuitivo** - Visualiza tu presupuesto de forma clara
- 💾 **Sincronización** - Bidireccional con Google Sheets
- 📴 **Modo Offline** - Funciona sin conexión, sincroniza después
- 📅 **Gestión Mensual** - Cierre de mes e histórico completo
- 📈 **Gráficas** - Visualización de gastos por categoría
- ⚡ **Rápido** - Registro de gastos en menos de 15 segundos
- 🎨 **Tema Claro/Oscuro** - Automático según preferencias del sistema

## 📋 Estado del Proyecto

### ✅ Completado

- [x] Planificación y requerimientos
- [x] Diseño de arquitectura
- [x] Sistema de diseño (CSS)
- [x] Setup del proyecto
- [x] Configuración de seguridad
- [x] Estructura de archivos

### 🚧 En Desarrollo

- [ ] Servicios (Storage, Auth, Sync)
- [ ] Modelos de datos
- [ ] Vistas y componentes
- [ ] Integración Google Sheets API
- [ ] Funcionalidad completa

## 🛠️ Tecnologías

- **Frontend:** Vanilla JavaScript (ES6+)
- **Build:** Vite
- **PWA:** Vite PWA Plugin + Workbox
- **Base de datos local:** IndexedDB (idb)
- **Backend:** Google Sheets API v4
- **Autenticación:** OAuth 2.0
- **Hosting:** GitHub Pages

## 📦 Instalación y Desarrollo

### Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Google
- Proyecto en Google Cloud Console

### 1. Clonar el Repositorio

\`\`\`bash
git clone https://github.com/tu-usuario/app-presupuesto.git
cd app-presupuesto
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar Google API

#### 3.1 Crear Proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: "App Presupuesto PWA"
3. Habilitar **Google Sheets API**
4. Ir a **APIs & Services > Credentials**

#### 3.2 Crear OAuth 2.0 Client ID

1. Click en "Create Credentials" > "OAuth client ID"
2. Application type: **Web application**
3. Authorized JavaScript origins:
   \`\`\`
   http://localhost:5173
   https://tu-usuario.github.io
   \`\`\`
4. Authorized redirect URIs:
   \`\`\`
   http://localhost:5173
   https://tu-usuario.github.io
   \`\`\`
5. **Copiar Client ID**

#### 3.3 Crear API Key

1. Click en "Create Credentials" > "API Key"
2. Restringir la API Key:
   - **Application restrictions:** HTTP referrers
   - **Website restrictions:**
     \`\`\`
     https://tu-usuario.github.io/*
     localhost:5173/*
     \`\`\`
   - **API restrictions:** Google Sheets API
3. **Copiar API Key**

#### 3.4 Configurar OAuth Consent Screen

1. Ir a "OAuth consent screen"
2. User Type: **External**
3. Completar información de la app
4. Scopes: `https://www.googleapis.com/auth/spreadsheets`
5. Agregar usuarios de prueba (tu email)

### 4. Variables de Entorno

\`\`\`bash
# Copiar template
cp .env.example .env.local

# Editar .env.local con tus credenciales
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy-tu-api-key-aqui
\`\`\`

⚠️ **IMPORTANTE:** Nunca commitear el archivo `.env.local`

### 5. Ejecutar en Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abrir http://localhost:5173

### 6. Build para Producción

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🚀 Despliegue en GitHub Pages

### 1. Configurar Secretos de GitHub

1. Ir a tu repositorio en GitHub
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Agregar:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** tu-client-id.apps.googleusercontent.com
5. Agregar:
   - **Name:** `VITE_GOOGLE_API_KEY`
   - **Value:** AIzaSy...

### 2. Activar GitHub Pages

1. Repository > Settings > Pages
2. Source: **GitHub Actions**
3. Guardar

### 3. Deploy

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

GitHub Actions se encargará del deploy automático.

## 📖 Uso

### Primera vez

1. Abrir la app
2. Click en "Conectar con Google"
3. Autorizar permisos
4. Crear o seleccionar Google Sheet
5. Configurar categorías y presupuestos
6. ¡Empezar a registrar gastos!

### Registrar Gasto

1. Click en botón flotante (+)
2. Seleccionar categoría
3. Ingresar descripción y monto
4. Guardar (se sincroniza automáticamente)

### Cerrar Mes

1. Ir a Configuración
2. Click en "Cerrar Mes"
3. Revisar resumen
4. Ajustar presupuestos del nuevo mes
5. Iniciar nuevo mes

## 🔒 Seguridad

- ✅ Variables de entorno para credenciales
- ✅ `.gitignore` configurado
- ✅ GitHub Secrets para deploy
- ✅ OAuth 2.0 con Google
- ✅ Sin información sensible en el código
- ✅ Tokens almacenados localmente (localStorage)

## 📱 Estructura de Google Sheets

La app utiliza un documento de Google Sheets con 3 hojas:

### Hoja 1: Configuración
- Categorías y subcategorías
- Presupuestos por subcategoría
- Ingreso mensual

### Hoja 2: Gastos Mes Actual
- Registro de gastos del mes en curso
- Fecha, categoría, descripción, valor

### Hoja 3: Histórico
- Gastos de meses cerrados
- Resúmenes por mes
- Histórico completo

## 📚 Documentación

- [Requerimientos](./REQUERIMIENTOS.md)
- [Arquitectura](./ARQUITECTURA.md)
- [Estructura de Datos](./ESTRUCTURA-DATOS.md)
- [Diseño Visual](./DISENO-VISUAL.md)
- [Google Sheets Integration](./GOOGLE-SHEETS-INTEGRATION.md)

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Roadmap

- [ ] Implementar servicios básicos
- [ ] Crear vistas principales
- [ ] Integración completa con Google Sheets
- [ ] Tests unitarios e integración
- [ ] Gráficas interactivas
- [ ] Exportar reportes PDF
- [ ] Metas de ahorro
- [ ] Gastos recurrentes automáticos
- [ ] Compartir presupuesto
- [ ] Notificaciones push
- [ ] Soporte multi-idioma

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

## 👤 Autor

Tu Nombre - [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [Vite](https://vitejs.dev/)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [idb](https://github.com/jakearchibald/idb)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
