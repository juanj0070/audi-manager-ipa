# IPA Audit Manager

Aplicación para Jira Cloud desarrollada sobre Atlassian Forge que prioriza requisitos no funcionales mediante el Índice de Prioridad de Auditoría (IPA). El proyecto integra de forma explícita la norma ISO/IEC 25010 en el algoritmo de cálculo para distinguir la criticidad normativa de cada requisito.

## Resumen

Este repositorio contiene la implementación del Trabajo Fin de Máster titulado Integración de ISO/IEC 25010 en la Priorización Continua de Requisitos No Funcionales en Entornos Ágiles mediante un Plugin para Jira sobre Atlassian Forge.

La solución permite:

- cargar catálogos de requisitos no funcionales,
- calcular el IPA para el sprint activo,
- mostrar un ranking priorizado en un dashboard,
- consultar el desglose de variables de cada requisito,
- almacenar y recuperar el histórico de auditorías.

## Aportación principal

La aportación diferenciadora del trabajo es incorporar el peso de la característica ISO/IEC 25010 como variable activa del algoritmo de priorización. De este modo, dos requisitos con un perfil técnico similar pueden recibir una prioridad distinta en función de su criticidad normativa.

Las características ISO consideradas en esta versión son:

- Seguridad
- Fiabilidad
- Mantenibilidad
- Rendimiento

## Arquitectura

La aplicación sigue una arquitectura serverless con separación clara entre frontend, backend y persistencia:

- Frontend: React 18 + Atlassian UI Kit 10 + TypeScript.
- Backend: Forge Functions con Resolver Pattern.
- Persistencia: Forge Storage (Key-Value).
- Integración externa: Jira REST API y Agile API.

### Componentes principales

- `src/resolvers/index.ts`: motor IPA y resolvers del backend.
- `src/resolvers/jiraService.ts`: acceso a Jira Cloud.
- `src/frontend/index.tsx`: punto de entrada de la interfaz.
- `src/frontend/components/DashboardIPA.tsx`: ranking IPA y panel de detalle.
- `src/frontend/components/CatalogManager.tsx`: gestión de catálogos.
- `src/frontend/components/AuditHistory.tsx`: histórico de auditorías.

## Algoritmo IPA

El cálculo del IPA combina la importancia del requisito con factores estructurales y temporales:

- importancia estratégica,
- peso ISO/IEC 25010,
- número de requisitos hijos,
- profundidad en el árbol,
- dependencias,
- antigüedad desde la última auditoría.

La función principal de cálculo se encuentra en `src/resolvers/index.ts` y normaliza el resultado al rango [0, 100].

## Validación

La validación del proyecto se basa en un escenario controlado con 10 requisitos representativos de las cuatro características ISO seleccionadas. El resultado esperado es que los requisitos de Seguridad y Fiabilidad obtengan una prioridad superior a los de Mantenibilidad y Rendimiento cuando el resto de variables es comparable.

En el TFM, este comportamiento se utiliza para demostrar que la integración de ISO/IEC 25010 actúa como un factor real de diferenciación en la priorización.

## Instalación

```bash
npm install
npm run build
```

## Despliegue

```bash
npm run deploy
npm run install
```

Para desarrollo local con recarga continua:

```bash
npm run tunnel
```

## Estructura del proyecto

- `manifest.yml`: configuración de la app Forge y permisos.
- `package.json`: scripts y dependencias.
- `src/`: implementación frontend y backend.
- `scripts/`: utilidades auxiliares para validación o cálculo.

## Uso básico

1. Instalar dependencias.
2. Desplegar la aplicación en Jira Cloud.
3. Cargar un catálogo de requisitos.
4. Calcular el IPA.
5. Revisar el ranking y el histórico.

## Licencia

Este proyecto se comparte con fines académicos y de defensa del TFM.
