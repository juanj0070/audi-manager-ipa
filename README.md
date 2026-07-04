# 🎯 IPA Audit Manager - Plugin Jira para Auditoría de Requisitos No Funcionales

Este es tu proyecto de **Trabajo Fin de Máster**: un plugin de Jira que implementa el **Índice de Prioridad de Auditoría (IPA)** con integración de **ISO/IEC 25010**.

## 📋 Estructura del Proyecto

```
audit-manager-ipa/
├── src/
│   ├── resolvers/
│   │   └── index.ts              ← ⭐ Backend: Algoritmo IPA mejorado
│   └── frontend/
│       ├── index.tsx              ← App principal React
│       └── components/
│           ├── DashboardIPA.tsx   ← Vista principal: ranking IPA
│           ├── CatalogManager.tsx ← Gestión de catálogos
│           └── AuditHistory.tsx   ← Histórico de cálculos
├── manifest.yml                  ← Configuración Jira
├── package.json
├── tsconfig.json
└── README.md (este archivo)
```

## 🚀 Instalación y Despliegue

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Construir el proyecto
```bash
npm run build
```

### Paso 3: Desplegar en Jira (desarrollo)
```bash
npm run deploy
```

### Paso 4: Instalar en tu sitio Jira Cloud
```bash
npm run install
# Te pedirá tu sitio Jira (ej: tu-nombre.atlassian.net)
```

### Paso 5: Modo "hot reload" (cambios en tiempo real)
```bash
npm run tunnel
# Esto permite ver los cambios sin redeploy
```

## 🧮 Algoritmo IPA - Tu Aportación Principal

El archivo **`src/resolvers/index.ts`** contiene la fórmula mejorada:

```
IPA = (w1·I·W_ISO + w2·log(H+1)·100 + w3·P·10 + w4·D·5 + w5·A·10) / MAX × 100
```

### Donde:
- **I** = Importancia del requisito (1-100)
- **W_ISO** = Peso de la característica ISO (0.6-1.0) ← **APORTACIÓN: esto es nuevo**
- **H** = Número de requisitos hijos
- **P** = Profundidad en el árbol
- **D** = Dependencias
- **A** = Antigüedad (Sprints sin auditar)

### Pesos ISO 25010 (Característica de Calidad):
- **Seguridad** = 1.0 (máxima criticidad: consecuencias legales)
- **Fiabilidad** = 0.8 (alta criticidad: continuidad servicio)
- **Mantenibilidad** = 0.7 (criticidad media-alta: deuda técnica)
- **Rendimiento** = 0.6 (criticidad media: medible con herramientas)

### Pesos de la Fórmula:
- **w1** = 0.40 (Importancia × ISO es el factor dominante)
- **w2** = 0.25 (Hijos: nodos críticos con efecto en cascada)
- **w3** = 0.15 (Profundidad: especificidad técnica)
- **w4** = 0.10 (Dependencias: riesgo de propagación)
- **w5** = 0.10 (Antigüedad: evita olvidos)

## 📊 Cómo usar el plugin

### 1. Crear un Catálogo (pestaña "Gestión de Catálogos")
- Dale un nombre (ej: "Seguridad ENS")
- Carga requisitos en formato CSV:
  ```
  SEC-001;Cifrado TLS 1.3;Seguridad;90
  SEC-002;Autenticación OAuth 2.0;Seguridad;70
  PERF-001;Tiempo respuesta <200ms;Rendimiento;90
  ```

### 2. Calcular IPA (pestaña "Dashboard IPA")
- Haz clic en "Calcular IPA"
- Se mostrará el ranking de requisitos ordenado por prioridad
- Los requisitos críticos (IPA > 70) aparecerán en rojo

### 3. Ver Histórico (pestaña "Histórico de Auditorías")
- Compara la evolución del riesgo entre sprints
- Identifica tendencias de requisitos recurrentemente críticos

## 📌 Archivos Clave Explicados

### `src/resolvers/index.ts` ⭐
Contiene:
- Función `calculateIpaScore()`: calcula IPA de UN requisito
- Función `calculateAndRankRequirements()`: normaliza y ordena todos
- Resolvers: puntos de entrada del backend (`calculateIpa`, `getCatalogs`, etc.)
- **Tipos TypeScript** para `Requirement`, `Catalog`, `IpaResult`

### `src/frontend/index.tsx`
- Componente App raíz con 3 pestañas
- Maneja el estado global de navegación

### `src/frontend/components/DashboardIPA.tsx`
- Muestra el ranking en tabla ordenado por IPA
- Colores semáforo: rojo (>70), naranja (40-70), verde (<40)
- Panel lateral con desglose de variables para cada requisito

## 🔍 Validación y Pruebas

### Prueba unitaria manual del algoritmo:
1. Abre el navegador en `https://tu-nombre.atlassian.net`
2. Ve a tu proyecto Jira
3. En el menú lateral, busca "IPA Audit Manager"
4. Carga un catálogo CSV
5. Haz clic en "Calcular IPA"

**Resultado esperado**: Los requisitos de Seguridad deben tener IPA > Rendimiento si tienen el mismo perfil técnico.

### Ejemplo de validación (del TFM):
```
SEC-001:  IPA=100 (Seguridad, Importancia=90)
PERF-001: IPA=71  (Rendimiento, Importancia=90)
Diferencia: 29 puntos → ✅ El peso ISO actúa correctamente
```

## 🐛 Troubleshooting

**Error: "Cannot find module '@forge/api'"**
```bash
npm install
forge tunnel
```

**Error: "Catalog not found"**
- Asegúrate de haber cargado un catálogo primero en "Gestión de Catálogos"

**Los cambios no aparecen en Jira**
- Ejecuta `forge tunnel` para modo desarrollo
- O redeploya: `forge deploy && forge install`

## 📚 Referencias del TFM

Tu documento describe:
- **Capítulo 4.3**: Fórmula del IPA (que implementamos en `calculateIpaScore()`)
- **Capítulo 4.2**: Modelo de datos (que tenemos en las interfaces TypeScript)
- **Capítulo 4.4**: Diseño UI (que usamos con Atlassian UI Kit 10)
- **Capítulo 6**: Validación (ejecuta las pruebas con datos de referencia)

## ✍️ Para tu Defensa del TFM

Cuando presentes, muestra:
1. **El algoritmo mejorado** en `src/resolvers/index.ts` línea ~85 (función `calculateIpaScore`)
2. **La tabla de pesos ISO** (~línea 40)
3. **El dashboard en acción**: carga un catálogo y calcula IPA
4. **La validación** con los 10 requisitos del escenario de prueba

---

**¿Preguntas?** Revisa el código inline (comentarios en cada función explicando qué hace).

Creado: Mayo 2026
Universidad de Murcia - Máster en Ingeniería del Software
