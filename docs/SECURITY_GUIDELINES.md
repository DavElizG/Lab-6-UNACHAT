# SECURITY GUIDELINES - LAB-6-UNACHAT

## Introducción

Este documento establece el estándar de desarrollo seguro y de calidad para el proyecto **LAB-6-UNACHAT**, una aplicación web desarrollada con Node.js y Express. 

El propósito de estas directrices es garantizar que el desarrollo del proyecto siga las mejores prácticas de seguridad informática, alineándose con la **primera fase del Secure Software Development Life Cycle (SSDLC)**: **Planificación y Diseño Seguro**.

Siguiendo este documento, el equipo de desarrollo se compromete a:
- Prevenir vulnerabilidades comunes desde las etapas tempranas del desarrollo
- Establecer estándares de código claros y consistentes
- Garantizar la trazabilidad y auditabilidad del código
- Facilitar la revisión por pares y la integración continua
- Proteger la información sensible y los datos de usuario

---

## 1. Principios Generales de Desarrollo Seguro (SSDLC)

### 1.1 Validación y Sanitización de Entradas

**Toda entrada de usuario debe ser validada y sanitizada antes de ser procesada.**

- **Nunca confiar en datos del cliente**: Todo lo que venga de `req.body`, `req.query`, `req.params` debe ser validado.
- **Usar bibliotecas de validación**: Se recomienda `express-validator` o `joi` para validación estructurada.
- **Validar tipo de dato, longitud y formato**: Ejemplo: validar emails, URLs, números, etc.

```javascript
// Ejemplo de validación con express-validator
const { body, validationResult } = require('express-validator');

app.post('/register', 
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 20 }).trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Procesar datos validados...
  }
);
```

### 1.2 Protección Contra Vulnerabilidades Comunes

#### 1.2.1 Cross-Site Scripting (XSS)

- **Escapar contenido HTML**: Todo contenido dinámico debe ser escapado antes de renderizarse.
- **Usar Content Security Policy (CSP)**: Limitar las fuentes de scripts permitidas.
- **Sanitizar inputs**: Remover tags HTML peligrosos de inputs de usuario.

```javascript
// Configurar CSP con helmet
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));
```

#### 1.2.2 Cross-Site Request Forgery (CSRF)

- **Usar tokens CSRF**: Implementar protección CSRF en formularios.
- **Validar origen de requests**: Verificar headers `Origin` y `Referer`.

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

#### 1.2.3 Server-Side Request Forgery (SSRF)

- **Validar URLs externas**: Si la aplicación hace requests a URLs proporcionadas por usuarios, validar que no sean IPs privadas.
- **Usar allowlist de dominios**: Permitir solo dominios conocidos y seguros.

#### 1.2.4 Inyección de Comandos

- **Nunca ejecutar comandos del sistema con input de usuario**: Evitar `child_process.exec()` con datos no sanitizados.
- **Usar alternativas seguras**: Si es necesario ejecutar comandos, usar arrays de argumentos en lugar de strings concatenados.

```javascript
// ❌ INSEGURO
const { exec } = require('child_process');
exec(`ping ${userInput}`); // Vulnerable a inyección

// ✅ SEGURO
const { execFile } = require('child_process');
execFile('ping', [validatedInput], (error, stdout) => {
  // Procesar resultado...
});
```

### 1.3 Manejo de Errores y Logs

- **No exponer stack traces en producción**: Los errores detallados solo deben mostrarse en desarrollo.
- **Registrar eventos de seguridad**: Loguear intentos de autenticación fallidos, accesos no autorizados, etc.
- **Usar niveles de log apropiados**: `error`, `warn`, `info`, `debug`.
- **No loguear información sensible**: Nunca registrar contraseñas, tokens, o datos personales.

```javascript
// Middleware de manejo de errores
app.use((err, req, res, next) => {
  // Log del error (sin exponer detalles al cliente)
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
  
  // Respuesta genérica en producción
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
```

### 1.4 Gestión Segura de Dependencias

- **Ejecutar `npm audit` regularmente**: Identificar y corregir vulnerabilidades conocidas.
- **Mantener dependencias actualizadas**: Usar `npm update` o herramientas como `npm-check-updates`.
- **Generar y revisar SBOM (Software Bill of Materials)**: Mantener inventario de todas las dependencias.
- **Usar Snyk para análisis de vulnerabilidades**: Integrar `snyk test` en el flujo de trabajo.

```bash
# Auditoría de seguridad
npm audit

# Corrección automática de vulnerabilidades
npm audit fix

# Análisis con Snyk
snyk test

# Generar SBOM
npm sbom --format=cyclonedx
```

---

## 2. Convenciones de Desarrollo y Estilo de Código

### 2.1 Nombres de Archivos, Funciones y Variables

**Archivos:**
- Archivos de rutas: `kebab-case` (ejemplo: `user-routes.js`, `auth-controller.js`)
- Vistas HTML: `kebab-case` (ejemplo: `index.html`, `dashboard.html`)
- CSS: `kebab-case` (ejemplo: `style.css`, `dashboard-style.css`)

**Funciones y Variables:**
- Funciones: `camelCase` (ejemplo: `getUserById`, `validateInput`)
- Variables: `camelCase` (ejemplo: `userName`, `isAuthenticated`)
- Constantes: `UPPER_SNAKE_CASE` (ejemplo: `MAX_LOGIN_ATTEMPTS`, `API_KEY`)

**Clases:**
- `PascalCase` (ejemplo: `UserController`, `DatabaseConnection`)

```javascript
// ✅ Buenas prácticas de nomenclatura
const MAX_RETRY_ATTEMPTS = 3;
const userService = require('./services/user-service');

class AuthenticationController {
  async loginUser(req, res) {
    const { username, password } = req.body;
    // ...
  }
}
```

### 2.2 Estructura de Carpetas

La estructura del proyecto **LAB-6-UNACHAT** debe seguir el siguiente estándar:

```
Lab-6-UNACHAT/
├── server.js              # Punto de entrada principal
├── package.json           # Dependencias y scripts
├── .env.example           # Plantilla de variables de entorno
├── .gitignore             # Archivos excluidos del repositorio
├── docs/                  # Documentación del proyecto
│   ├── SECURITY_GUIDELINES.md
│   └── evidences/         # Capturas y evidencias del SSDLC
├── static/                # Archivos estáticos públicos
│   └── css/
│       └── style.css
├── views/                 # Vistas HTML
│   ├── index.html
│   └── dashboard.html
├── routes/                # Rutas de Express (opcional, futuro)
├── controllers/           # Lógica de negocio (opcional, futuro)
└── middlewares/           # Middlewares personalizados (opcional, futuro)
```

### 2.3 Estándar de Commits y Ramas

**Convención de Commits (Conventional Commits):**

```
<tipo>(<ámbito>): <descripción>

[cuerpo opcional]
[pie opcional]
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `chore`: Tareas de mantenimiento (actualizar dependencias, etc.)
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `security`: Correcciones de seguridad

**Ejemplos:**
```bash
git commit -m "feat(auth): implementar sistema de login con JWT"
git commit -m "fix(xss): sanitizar inputs en formulario de registro"
git commit -m "chore(deps): actualizar express a v4.18.2"
git commit -m "security(csrf): añadir protección CSRF en formularios"
```

**Estrategia de Ramas:**

- `main`: Rama principal, siempre debe estar estable
- `develop`: Rama de desarrollo activo
- `feat/<nombre-feature>`: Nuevas funcionalidades
- `fix/<nombre-bug>`: Correcciones de bugs
- `security/<descripcion>`: Correcciones de seguridad

```bash
# Crear rama de feature
git checkout -b feat/websocket-chat

# Crear rama de fix
git checkout -b fix/input-validation

# Crear rama de seguridad
git checkout -b security/add-helmet-middleware
```

---

## 3. Buenas Prácticas Específicas para Node.js y Express

### 3.1 Uso de Helmet

**Helmet** ayuda a proteger la aplicación configurando varios headers HTTP de seguridad.

```javascript
const helmet = require('helmet');
app.use(helmet());
```

**Headers configurados por Helmet:**
- `Content-Security-Policy`: Previene XSS
- `X-DNS-Prefetch-Control`: Controla DNS prefetching
- `X-Frame-Options`: Previene clickjacking
- `X-Content-Type-Options`: Previene MIME sniffing
- `Strict-Transport-Security`: Fuerza HTTPS

### 3.2 Configuración de CORS

```javascript
const cors = require('cors');

// Configuración restrictiva de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3.3 Rate Limiting

Prevenir ataques de fuerza bruta y DoS limitando el número de requests.

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});

app.use('/api/', limiter);
```

### 3.4 Compresión de Respuestas

```javascript
const compression = require('compression');
app.use(compression());
```

### 3.5 Deshabilitar X-Powered-By

```javascript
// Ocultar que la aplicación usa Express
app.disable('x-powered-by');
```

### 3.6 Configuración Segura de Cookies

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // Previene acceso desde JavaScript
    secure: true,      // Solo HTTPS (en producción)
    sameSite: 'strict', // Protección CSRF
    maxAge: 3600000    // 1 hora
  }
}));
```

### 3.7 Validación de Inputs en Rutas

```javascript
// Validar SIEMPRE req.body, req.query, req.params
app.post('/chat/send', (req, res) => {
  const { message } = req.body;
  
  // Validación básica
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensaje inválido' });
  }
  
  // Validación de longitud
  if (message.length > 500) {
    return res.status(400).json({ error: 'Mensaje demasiado largo' });
  }
  
  // Sanitización (remover HTML)
  const sanitizedMessage = message.replace(/<[^>]*>/g, '');
  
  // Procesar mensaje...
});
```

---

## 4. Gestión de Configuración y Secretos

### 4.1 Uso de Archivos .env

**TODAS las configuraciones sensibles deben estar en archivo `.env`:**

```env
# .env
NODE_ENV=development
PORT=3000
SESSION_SECRET=mi_secreto_super_seguro_cambiar_en_produccion
DATABASE_URL=mongodb://localhost:27017/unachat
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

**Cargar variables de entorno:**

```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;
```

### 4.2 Prohibido Subir .env al Repositorio

**El archivo `.env` NUNCA debe subirse a Git.**

```bash
# .gitignore
.env
.env.local
.env.*.local
node_modules/
npm-debug.log
*.log
```

**Crear `.env.example` como plantilla:**

```env
# .env.example
NODE_ENV=development
PORT=3000
SESSION_SECRET=cambiar_este_valor
DATABASE_URL=mongodb://localhost:27017/unachat
ALLOWED_ORIGINS=http://localhost:3000
```

### 4.3 Separación de Entornos

Mantener configuraciones separadas para:
- **Development**: `.env.development`
- **Testing**: `.env.test`
- **Production**: `.env.production`

```javascript
// Cargar según entorno
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
require('dotenv').config({ path: envFile });
```

---

## 5. Revisión de Código y Control de Calidad

### 5.1 Uso Obligatorio de ESLint

**Antes de hacer commit, ejecutar ESLint para verificar calidad de código.**

**Instalación:**

```bash
npm install --save-dev eslint
npx eslint --init
```

**Configuración recomendada (`.eslintrc.json`):**

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  }
}
```

**Ejecutar ESLint:**

```bash
# Verificar archivos
npx eslint server.js

# Corregir automáticamente
npx eslint server.js --fix
```

**Añadir script en `package.json`:**

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 5.2 Integración con Snyk Local

**Detectar vulnerabilidades antes de hacer push:**

```bash
# Instalar Snyk CLI
npm install -g snyk

# Autenticarse
snyk auth

# Escanear proyecto
snyk test

# Monitorear proyecto
snyk monitor
```

**Integrar en workflow:**

```bash
# Antes de commit
npm run lint
snyk test
npm audit
```

### 5.3 Validación Manual de Dependencias mediante SBOM

```bash
# Generar SBOM
npm sbom --sbom-format=cyclonedx > sbom.json

# Revisar manualmente las dependencias
cat sbom.json

# Verificar licencias
npx license-checker

```
---



### 5.4 Validación previa a commits (Build & Tests)

Antes de cada commit o push al repositorio, el desarrollador debe ejecutar:

```bash
npm run lint
npm run build
npm test   # cuando existan pruebas unitarias

```
---

## 6. Políticas de Commits, Ramas y Revisiones

### 6.1 Convenciones de Git

- **Commits atómicos**: Un commit debe representar un cambio lógico completo.
- **Mensajes descriptivos**: Seguir Conventional Commits (ver sección 2.3).
- **No hacer commit directo a `main`**: Usar Pull Requests.
- **Rebase antes de merge**: Mantener historial limpio.

```bash
# Workflow recomendado
git checkout -b feat/nueva-funcionalidad
# ... hacer cambios ...
git add .
git commit -m "feat(chat): añadir sistema de mensajes en tiempo real"
git push origin feat/nueva-funcionalidad
# Crear Pull Request en GitHub
```

### 6.2 Revisiones Entre Compañeros (Code Review)

**Todos los Pull Requests deben ser revisados por al menos un compañero antes de hacer merge.**

**Checklist de revisión:**

- [ ] El código sigue las convenciones de estilo del proyecto
- [ ] No hay vulnerabilidades evidentes (XSS, inyección, etc.)
- [ ] Los inputs están validados y sanitizados
- [ ] No hay secretos hardcodeados
- [ ] El código está documentado adecuadamente
- [ ] Los tests pasan (si aplica)
- [ ] ESLint no reporta errores
- [ ] `npm audit` no reporta vulnerabilidades críticas

**Proceso de Code Review:**

1. Crear Pull Request con descripción clara
2. Asignar al menos un revisor
3. El revisor comenta y sugiere cambios
4. El autor implementa cambios sugeridos
5. Una vez aprobado, hacer merge con `squash and merge` o `rebase and merge`

---

## 7. Uso Responsable de Agentes de IA

### 7.1 Solicitar Código con Buenas Prácticas de Seguridad

**Al usar ChatGPT, Claude, GitHub Copilot u otras IAs:**

- **Ser específico en los prompts**: "Genera código Node.js seguro que valide inputs y prevenga XSS"
- **Solicitar explicaciones**: "Explica por qué este código es vulnerable a inyección SQL"
- **Pedir alternativas seguras**: "¿Cómo puedo hacer esto de forma más segura?"

**Ejemplo de prompt responsable:**

```
"Genera una función en Node.js/Express que maneje el registro de usuarios. 
Debe incluir:
- Validación de email y password
- Sanitización de inputs
- Protección contra XSS
- Hash de contraseñas con bcrypt
- Manejo de errores apropiado"
```

### 7.2 No Incluir Secretos en Prompts

**NUNCA incluir en prompts:**
- Contraseñas reales
- API keys
- Tokens de autenticación
- Información personal (PII)
- Credenciales de bases de datos

**En su lugar, usar placeholders:**

```
// ✅ CORRECTO
"¿Cómo conecto a MongoDB usando una variable de entorno para la URL?"

// ❌ INCORRECTO
"¿Cómo conecto a MongoDB usando mongodb://admin:password123@localhost?"
```

### 7.3 Verificar y Auditar Output de IA

**TODO código generado por IA debe ser:**

1. **Leído y comprendido** por el desarrollador
2. **Verificado** que sigue las directrices de seguridad
3. **Probado** antes de integrarse al proyecto
4. **Revisado por pares** antes de hacer merge

**No asumir que la IA siempre genera código seguro:**

- Verificar que los inputs son validados
- Confirmar que no hay hardcoded secrets
- Revisar que se usan bibliotecas actualizadas
- Validar que el código no introduce vulnerabilidades

---

## 8. Plan de Mejora Continua

### 8.1 Auditorías Trimestrales de Seguridad

**Cada 3 meses, realizar:**

1. **Revisión de dependencias**: `npm audit`, `snyk test`
2. **Análisis de código estático**: Ejecutar SAST tools
3. **Revisión de configuraciones**: Verificar `.env`, headers de seguridad
4. **Actualización de SBOM**: Regenerar Software Bill of Materials
5. **Revisión de logs**: Analizar eventos de seguridad registrados

### 8.2 Revisión de Dependencias

**Proceso mensual:**

```bash
# 1. Verificar vulnerabilidades
npm audit

# 2. Actualizar parches de seguridad
npm audit fix

# 3. Revisar actualizaciones disponibles
npm outdated

# 4. Escanear con Snyk
snyk test

# 5. Generar reporte
snyk test --json > security-report.json
```

### 8.3 Actualización de Herramientas

**Mantener actualizadas las siguientes herramientas:**

- **Node.js**: Usar versiones LTS (Long Term Support)
- **npm**: Actualizar a la última versión estable
- **ESLint**: Mantener configuración actualizada
- **Snyk**: Actualizar CLI regularmente
- **Dependencias críticas**: Express, Helmet, etc.

```bash
# Actualizar Node.js (usar nvm)
nvm install --lts
nvm use --lts

# Actualizar npm
npm install -g npm@latest

# Actualizar Snyk
npm install -g snyk@latest

# Actualizar dependencias del proyecto
npm update
```

**Calendario de actualizaciones:**

- **Semanal**: Revisar `npm audit`
- **Mensual**: Actualizar dependencias menores
- **Trimestral**: Auditoría completa de seguridad
- **Semestral**: Actualizar versiones mayores (con testing extensivo)

---

## 9. Responsabilidades del Equipo

Cada miembro del equipo de **LAB-6-UNACHAT** se compromete a:

1. **Leer y comprender** este documento completamente
2. **Seguir las directrices** establecidas en todo el código que escriba
3. **Revisar el código** de sus compañeros con criterio de seguridad
4. **Reportar vulnerabilidades** encontradas inmediatamente
5. **Mantener actualizado** su conocimiento en seguridad informática
6. **Participar activamente** en las auditorías de seguridad
7. **No comprometer la seguridad** por conveniencia o rapidez

---

## 10. Firmas del Equipo

Este documento ha sido revisado y aprobado por el equipo de desarrollo de **LAB-6-UNACHAT** como parte de la **Fase 1 del SSDLC (Planificación y Diseño Seguro)** en el curso de Seguridad Informática.

| Nombre | Rol | Firma | Fecha |
|--------|-----|-------|-------|
|        | Desarrollador/a |       | 29/10/2025 |
|        | Desarrollador/a |       | 29/10/2025 |
|        | Desarrollador/a |       | 29/10/2025 |
|        | Desarrollador/a |       | 29/10/2025 |

---

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Snyk Documentation](https://docs.snyk.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

---

**Versión**: 1.0  
**Fecha de creación**: 29 de octubre de 2025  
**Última actualización**: 29 de octubre de 2025  
**Estado**: Aprobado

---

*Este documento es un componente crítico del Secure Software Development Life Cycle (SSDLC) del proyecto LAB-6-UNACHAT y debe ser revisado y actualizado regularmente para reflejar las mejores prácticas actuales de seguridad.*
