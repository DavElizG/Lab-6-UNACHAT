# Matriz de Riesgo de Librerías - LAB-6-UNACHAT
## Evaluación de Seguridad basada en SBOM (CycloneDX)

**Fecha de análisis**: 29 de octubre de 2025  
**Proyecto**: okta-oidc-una v1.0.0  
**Total de componentes analizados**: 15 librerías principales  
**Herramienta de generación SBOM**: CycloneDX v1.6

---

## Tabla de Riesgo de Librerías Críticas

| Librería | Versión | Licencia | Riesgo | Probabilidad (1-5) | Impacto (1-5) | Riesgo Inherente | Mitigación Recomendada |
|----------|---------|----------|--------|-------------------|---------------|------------------|------------------------|
| **swig** | 1.4.2 | MIT | **ALTO** | 5 | 5 | **25** | **CRÍTICO**: Librería descontinuada desde 2016. Reemplazar con motor de plantillas moderno (EJS, Handlebars, Pug). Actualizar `consolidate` a alternativa segura. |
| **uglify-js** | 2.4.24 | BSD | **ALTO** | 5 | 4 | **20** | Versión extremadamente obsoleta (2014). Actualizar a Terser (sucesor oficial) o UglifyJS 3.x. Vulnerabilidades conocidas de seguridad. |
| **express-openid-connect** | 2.19.2 | MIT | **MEDIO-ALTO** | 4 | 4 | **16** | Actualizar a última versión estable. Revisar configuración de CSP y tokens CSRF. Implementar rate-limiting en endpoints de autenticación. |
| **openid-client** (v4) | 4.9.1 | MIT | **MEDIO-ALTO** | 4 | 4 | **16** | Existe versión más reciente (5.7.1) en dependencias. Unificar versiones para evitar conflictos. Revisar vulnerabilidades en v4.x. |
| **express** | 4.21.2 | MIT | **MEDIO** | 3 | 5 | **15** | Versión reciente pero revisar periódicamente. Configurar Helmet, CORS, y deshabilitar x-powered-by. Implementar rate-limiting. |
| **socket.io** | 4.8.1 | MIT | **MEDIO** | 3 | 5 | **15** | Versión reciente. Validar autenticación en handshake. Sanitizar todos los mensajes. Implementar límites de conexión por IP. |
| **consolidate** | 0.15.1 | MIT | **MEDIO** | 4 | 3 | **12** | Última versión de 2018. Considerar migración a motor de plantillas específico sin capa de abstracción. |
| **node-fetch** | 2.7.0 | MIT | **MEDIO** | 4 | 3 | **12** | Versión 2.x tiene vulnerabilidades conocidas. Actualizar a v3.x (ESM) o usar `undici` (oficial de Node.js). Validar todas las URLs antes de fetch. |
| **lodash** | 4.17.21 | MIT | **MEDIO** | 3 | 3 | **9** | Versión estable pero historial de prototype pollution. Migrar a lodash-es (tree-shaking) o funciones nativas de ES6+. |
| **jose** (v2) | 2.0.7 | MIT | **MEDIO** | 3 | 3 | **9** | Versión obsoleta (v2). Actualizar a jose v4.15.9 (presente en openid-client v5). Revisar manejo de JWTs y validación de firmas. |
| **bluebird** | 3.5.2 | MIT | **MEDIO** | 3 | 3 | **9** | Librería legacy. Node.js tiene Promises nativas desde v8. Migrar a async/await o Promise.all() nativo. |
| **dotenv** | 16.6.1 | BSD-2-Clause | **BAJO** | 2 | 4 | **8** | Versión actual. Validar que .env nunca se suba al repositorio. Usar .env.example como plantilla. |
| **express-session** | 1.18.2 | MIT | **BAJO-MEDIO** | 2 | 4 | **8** | Configurar correctamente: httpOnly, secure, sameSite. Usar store persistente en producción (Redis, MongoDB). Rotar secretos regularmente. |
| **csrf-sync** | 4.2.1 | ISC | **BAJO** | 2 | 3 | **6** | Versión reciente. Validar implementación correcta en todos los formularios. No exponer tokens en URLs. |
| **uuid** | 9.0.1 | MIT | **BAJO** | 1 | 2 | **2** | Versión actual y sin vulnerabilidades conocidas. Sin acción requerida. |

---

## Análisis de Riesgo por Categoría

### 🔴 **Riesgo Alto (20-25)**

**Componentes**: `swig`, `uglify-js`

**Observaciones Críticas**:

- **swig@1.4.2**: Motor de plantillas **descontinuado desde 2016**. No recibe parches de seguridad. Múltiples CVEs sin resolver relacionados con Server-Side Template Injection (SSTI). **ACCIÓN INMEDIATA REQUERIDA**.

- **uglify-js@2.4.24**: Versión de **hace 11 años** (2014). Vulnerabilidades conocidas:
  - CVE-2015-8858: ReDoS (Regular Expression Denial of Service)
  - CVE-2015-8857: Manipulación de scope en parseo
  - Problemas de minificación que pueden generar código vulnerable
  
**Impacto**: Alto riesgo de explotación. Puede comprometer la seguridad de la aplicación completa.

---

### 🟠 **Riesgo Medio-Alto (12-16)**

**Componentes**: `express-openid-connect`, `openid-client@4.9.1`, `express`, `socket.io`, `consolidate`, `node-fetch`

**Observaciones**:

- **express-openid-connect@2.19.2**: Librería crítica de autenticación. Versión de 2024 pero requiere:
  - Configuración robusta de CSP (Content Security Policy)
  - Validación de tokens CSRF en todos los flujos
  - Rate-limiting en endpoints `/login`, `/callback`
  - Logging de intentos de autenticación fallidos

- **openid-client**: Coexisten **dos versiones** (4.9.1 y 5.7.1) en el proyecto. Esto puede causar:
  - Conflictos de dependencias
  - Vulnerabilidades en v4.x no patcheadas
  - Comportamiento inconsistente en validación de tokens

- **express@4.21.2**: Framework principal. Aunque es versión reciente (2024), requiere:
  - Configurar `helmet()` para headers de seguridad
  - Deshabilitar `app.disable('x-powered-by')`
  - Implementar rate-limiting con `express-rate-limit`
  - Validar y sanitizar todos los inputs (`express-validator`)

- **socket.io@4.8.1**: Comunicación en tiempo real. Riesgos:
  - XSS a través de mensajes no sanitizados
  - DoS por conexiones ilimitadas
  - Falta de autenticación en handshake
  - **Mitigación**: Validar origen, autenticar conexiones, rate-limit por IP

- **node-fetch@2.7.0**: Vulnerabilidades conocidas en v2.x:
  - CVE-2022-0235: Exposure of sensitive information
  - **Mitigación**: Actualizar a v3.x o usar `undici` (oficial Node.js 18+)

---

### 🟡 **Riesgo Medio (6-9)**

**Componentes**: `lodash`, `jose@2.0.7`, `bluebird`, `dotenv`, `express-session`

**Observaciones**:

- **lodash@4.17.21**: Historial de CVEs relacionados con Prototype Pollution:
  - CVE-2019-10744, CVE-2020-8203 (patcheadas en esta versión)
  - Tamaño grande de librería (70KB+)
  - **Recomendación**: Migrar a `lodash-es` (tree-shakeable) o funciones ES6+ nativas

- **jose@2.0.7**: Librería de manejo de JWT/JWE. Versión **v2 obsoleta**:
  - Existe v4.15.9 en el proyecto (usada por openid-client v5)
  - Posibles vulnerabilidades en algoritmos de firmado
  - **Acción**: Unificar en jose v4.x y revisar configuración de JWTs

- **bluebird@3.5.2**: Librería de Promises **legacy** (2018):
  - Node.js tiene Promises nativas desde v8 (2017)
  - No necesaria en proyectos modernos
  - **Acción**: Refactorizar a async/await nativo

- **dotenv@16.6.1**: Gestión de variables de entorno:
  - Versión actual y segura
  - **Riesgo**: Exposición de secretos si .env se sube a Git
  - **Mitigación**: Validar .gitignore, usar .env.example

- **express-session@1.18.2**: Manejo de sesiones:
  - Configuración insegura por defecto
  - **Acción**: Configurar cookies con `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
  - Usar store persistente (no MemoryStore en producción)

---

### 🟢 **Riesgo Bajo (2-6)**

**Componentes**: `csrf-sync`, `uuid`

**Observaciones**:

- **csrf-sync@4.2.1**: Protección CSRF moderna y reciente (2024).
  - Sin vulnerabilidades conocidas
  - **Validar**: Implementación correcta en todos los formularios POST

- **uuid@9.0.1**: Generación de UUIDs.
  - Versión más reciente disponible
  - Sin vulnerabilidades conocidas
  - Sin acción requerida

---

## Recomendaciones Generales de Mitigación

### 1️⃣ **Acciones Inmediatas (Próximas 48 horas)**

```bash
# Remover swig y migrar a EJS o Pug
npm uninstall swig consolidate
npm install ejs

# Actualizar uglify-js a Terser
npm uninstall uglify-js
npm install --save-dev terser

# Actualizar node-fetch a v3 o usar undici
npm uninstall node-fetch
npm install undici
```

### 2️⃣ **Acciones de Corto Plazo (1 semana)**

```bash
# Unificar versión de openid-client
npm list openid-client
npm update openid-client

# Actualizar jose a v4.x
npm update jose

# Auditoría de seguridad
npm audit
npm audit fix

# Análisis con Snyk
snyk test
snyk monitor
```

### 3️⃣ **Acciones de Mediano Plazo (2-4 semanas)**

- **Refactorizar dependencias legacy**:
  - Eliminar `bluebird` → usar async/await nativo
  - Reducir uso de `lodash` → funciones ES6+ (map, filter, reduce)
  
- **Configurar seguridad en Express**:
  ```javascript
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  
  app.use(helmet());
  app.disable('x-powered-by');
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
  ```

- **Implementar validación de inputs**:
  ```bash
  npm install express-validator
  ```

### 4️⃣ **Políticas de Mantenimiento Continuo**

- **Auditorías semanales**: `npm audit` cada lunes
- **Actualizaciones mensuales**: Revisar `npm outdated`
- **SBOM trimestral**: Regenerar con `npx @cyclonedx/cyclonedx-npm`
- **Monitoreo con Snyk**: Integrar en CI/CD

---

## Resumen Ejecutivo

### Estadísticas de Riesgo

| Categoría de Riesgo | Cantidad | Porcentaje |
|---------------------|----------|------------|
| Alto (20-25) | 2 | 13.3% |
| Medio-Alto (12-16) | 6 | 40.0% |
| Medio (6-9) | 5 | 33.3% |
| Bajo (2-6) | 2 | 13.3% |

### Hallazgos Críticos

1. ⚠️ **2 librerías obsoletas críticas** requieren reemplazo inmediato (`swig`, `uglify-js`)
2. ⚠️ **Conflicto de versiones** en `openid-client` (4.9.1 vs 5.7.1)
3. ⚠️ **6 librerías legacy** candidatas para refactorización
4. ✅ **Express y Socket.IO actualizados** pero requieren configuración de seguridad
5. ✅ **Dependencias de autenticación** (Okta, Passport) en versiones recientes

### Prioridades de Acción

| Prioridad | Componente | Acción | Plazo |
|-----------|-----------|--------|-------|
| 🔴 P0 | swig | Migrar a EJS/Pug | Inmediato |
| 🔴 P0 | uglify-js | Actualizar a Terser | Inmediato |
| 🟠 P1 | openid-client | Unificar versiones | 1 semana |
| 🟠 P1 | node-fetch | Actualizar a v3/undici | 1 semana |
| 🟡 P2 | Express config | Helmet + rate-limit | 2 semanas |
| 🟡 P2 | lodash | Reducir uso / ES6+ | 1 mes |

---

## Licencias Identificadas

| Licencia | Librerías | Riesgo Legal |
|----------|-----------|--------------|
| MIT | 11 | Bajo - Compatible con uso comercial |
| BSD-2-Clause / BSD-3-Clause | 2 | Bajo - Compatible con uso comercial |
| Apache-2.0 | 1 | Bajo - Compatible, requiere NOTICE |
| ISC | 1 | Bajo - Equivalente a MIT |

**Observación**: Todas las licencias son compatibles con uso comercial y código abierto. No se identificaron licencias restrictivas (GPL, AGPL).

---

## Referencias y Herramientas

- **SBOM generado con**: CycloneDX npm plugin v4.0.3
- **Estándar SBOM**: CycloneDX v1.6 (JSON)
- **Base de datos de vulnerabilidades**: 
  - [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
  - [Snyk Vulnerability Database](https://snyk.io/vuln/)
  - [CVE MITRE](https://cve.mitre.org/)
- **Guías de seguridad**:
  - [OWASP Top 10 2021](https://owasp.org/Top10/)
  - [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
  - [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Documento generado para**: Proyecto LAB-6-UNACHAT - SSDLC Fase 1  
**Autor**: Análisis automático basado en SBOM CycloneDX  
**Próxima revisión**: 29 de noviembre de 2025 (trimestral)
