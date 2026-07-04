# IPA Audit Manager

Plugin de Jira para priorizar requisitos de auditoría mediante un Índice de Prioridad de Auditoría (IPA) basado en ISO/IEC 25010.

## Descripción

La aplicación permite cargar catálogos de requisitos, calcular su prioridad de auditoría y visualizar el resultado en un dashboard con historial de ejecuciones. La aportación principal del proyecto es la incorporación explícita de los pesos ISO en el algoritmo de priorización.

## Estructura

- `src/resolvers/index.ts`: lógica principal del cálculo IPA y resolvers de backend.
- `src/frontend/index.tsx`: punto de entrada de la interfaz.
- `src/frontend/components/DashboardIPA.tsx`: tabla principal con el ranking de requisitos.
- `src/frontend/components/CatalogManager.tsx`: carga y gestión de catálogos.
- `src/frontend/components/AuditHistory.tsx`: histórico de cálculos.

## Instalación

```bash
npm install
npm run build
```

## Despliegue en Forge

```bash
npm run deploy
npm run install
```

Para desarrollo local con recarga continua:

```bash
npm run tunnel
```

## Uso

1. Carga un catálogo desde la sección de gestión.
2. Abre el dashboard.
3. Ejecuta el cálculo de IPA.
4. Revisa el ranking, el desglose de variables y el historial.

## Validación técnica

El algoritmo diferencia el peso de cada requisito en función de:

- importancia funcional,
- características ISO/IEC 25010,
- número de hijos,
- profundidad,
- dependencias,
- antigüedad.

El comportamiento esperado es que requisitos con la misma importancia técnica obtengan puntuaciones distintas si su criticidad ISO es diferente.

## Notas de implementación

La función principal de priorización está en `src/resolvers/index.ts`. Ahí se concentra la lógica de normalización y ponderación del IPA.
