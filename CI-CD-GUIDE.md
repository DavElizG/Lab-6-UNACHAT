# CI/CD Pipeline Configuration Guide

Este proyecto implementa un pipeline completo de CI/CD con las siguientes herramientas:

## 🔧 Herramientas Implementadas

### 1. **Linting (ESLint)**
- **Propósito**: Detectar errores sintácticos y de estilo de código
- **Configuración**: `.eslintrc.json`
- **Comando local**: `npm run lint`
- **Auto-fix**: `npm run lint:fix`

### 2. **Unit Tests (Mocha + Chai con BDD)**
- **Propósito**: Pruebas unitarias con estilo BDD (Behavior-Driven Development)
- **Framework**: Mocha + Chai
- **Ubicación**: `test/` directory
- **Comando local**: `npm test`
- **Coverage**: `npm run test:coverage`

### 3. **SAST - Snyk**
- **Propósito**: Análisis de seguridad estático para detectar vulnerabilidades
- **Escanea**: Dependencias y código fuente
- **Comando local**: `npm run security:snyk` (requiere autenticación)

### 4. **SonarCloud**
- **Propósito**: Análisis de calidad de código, code smells, y seguridad
- **Métricas**: Cobertura, duplicación, complejidad, vulnerabilidades

## 📋 Configuración de Secrets en GitHub

Para que el pipeline funcione correctamente, debes configurar los siguientes secrets en tu repositorio de GitHub:

### Paso 1: Obtener Snyk Token

1. Regístrate en [Snyk](https://snyk.io/)
2. Ve a Account Settings → General
3. Copia tu API Token
4. En GitHub: Settings → Secrets and variables → Actions → New repository secret
5. Nombre: `SNYK_TOKEN`
6. Valor: Tu Snyk API Token

### Paso 2: Configurar SonarCloud

1. Regístrate en [SonarCloud](https://sonarcloud.io/)
2. Importa tu repositorio de GitHub
3. Copia tu Organization Key y Project Key
4. Ve a My Account → Security → Generate Token
5. En GitHub: Settings → Secrets and variables → Actions → New repository secret
6. Nombre: `SONAR_TOKEN`
7. Valor: Tu SonarCloud Token

### Paso 3: Actualizar sonar-project.properties

Edita el archivo `sonar-project.properties` con tus valores:

```properties
sonar.projectKey=TU_USUARIO_Lab-6-UNACHAT
sonar.organization=tu-organizacion
```

## 🚀 Uso Local

### Instalar dependencias

```bash
npm install
```

### Ejecutar linting

```bash
npm run lint
```

### Ejecutar tests

```bash
npm test
```

### Ejecutar coverage

```bash
npm run test:coverage
```

### Ejecutar todo el pipeline localmente

```bash
npm run ci
```

## 📊 Pipeline de GitHub Actions

El pipeline se ejecuta automáticamente en:
- Push a las ramas `main` o `develop`
- Pull requests a `main` o `develop`
- Manualmente desde GitHub Actions

### Flujo del Pipeline

1. **Linting** 🔍
   - Verifica errores sintácticos y de estilo
   - Debe pasar para continuar

2. **Unit Tests** 🧪
   - Ejecuta todas las pruebas unitarias
   - Genera reporte de cobertura
   - Debe pasar para continuar

3. **SAST (Snyk)** 🔒
   - Escanea vulnerabilidades en dependencias
   - Escanea código fuente
   - Genera reporte de seguridad

4. **SonarCloud** 📊
   - Análisis de calidad de código
   - Detección de code smells
   - Métricas de cobertura

5. **Success** ✅
   - Si todos los jobs pasan, el pipeline es exitoso

## 📁 Estructura de Archivos

```
.
├── .github/
│   └── workflows/
│       └── ci-pipeline.yml       # Configuración del pipeline
├── test/
│   ├── config.test.js            # Tests de configuración
│   └── security.test.js          # Tests de seguridad
├── .eslintrc.json                # Configuración de ESLint
├── .eslintignore                 # Archivos ignorados por ESLint
├── sonar-project.properties      # Configuración de SonarCloud
└── package.json                  # Scripts y dependencias
```

## 🔐 Variables de Entorno para Tests

Los tests utilizan las siguientes variables de entorno:

```
NODE_ENV=test
PORT=3001
SECRET=test_secret_key
BASE_URL=http://localhost:3001
ISSUER_BASE_URL=https://una-infosec.us.auth0.com/
CLIENT_ID=test_client_id
CLIENT_SECRET=test_client_secret
REDIRECT_URI=http://localhost:3001/dashboard
```

## 📈 Reportes Generados

El pipeline genera los siguientes artefactos:

1. **Coverage Report** (nyc)
   - Retención: 30 días
   - Ubicación: `coverage/`

2. **Snyk Security Report**
   - Retención: 30 días
   - Formato: JSON

3. **SonarCloud Dashboard**
   - Disponible en sonarcloud.io
   - Historial completo de análisis

## ✅ Checklist de Implementación

- [x] Configurar ESLint
- [x] Crear tests unitarios con BDD
- [x] Configurar Snyk
- [x] Configurar SonarCloud
- [x] Crear workflow de GitHub Actions
- [ ] Configurar secrets en GitHub
- [ ] Actualizar sonar-project.properties
- [ ] Primer push para activar pipeline

## 🐛 Troubleshooting

### Error: SNYK_TOKEN not found
- Verifica que hayas configurado el secret `SNYK_TOKEN` en GitHub

### Error: SONAR_TOKEN not found
- Verifica que hayas configurado el secret `SONAR_TOKEN` en GitHub

### Tests fallan localmente
- Asegúrate de tener todas las dependencias instaladas: `npm install`
- Verifica las variables de entorno

### Linting falla
- Ejecuta `npm run lint:fix` para auto-corregir problemas menores
- Revisa manualmente los errores que no se pueden auto-corregir

## 📚 Recursos Adicionales

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai BDD API](https://www.chaijs.com/api/bdd/)
- [Snyk Documentation](https://docs.snyk.io/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
