# 📖 Tu Aportación al TFM: Explicada

Este documento explica **exactamente** dónde está tu aportación diferenciadora en relación a los trabajos anteriores de Molina Gallego.

---

## 🎯 La Brecha que Cierra Tu TFM

### Trabajos Anteriores (Torreblanca 2019, Molina Gallego 2025)
Tenían un algoritmo de priorización, pero **no consideraban ISO/IEC 25010 como variable del algoritmo**. La norma era solo referencia externa.

**Fórmula anterior (Molina 2025)**:
```
Riesgo = [0.5×Importancia + 0.2×log(Hijos) + 0.2×Dependencias] × Factor_Antigüedad
```

❌ Problema: Un requisito de Seguridad recibía la misma puntuación que uno de Rendimiento si tenían idéntico perfil técnico.

---

### Tu Aportación (Trabajo Actual)

Tu mejora es **incorporar los pesos ISO 25010 directamente en la fórmula**:

**Nueva Fórmula IPA (Tu TFM)**:
```
IPA = (w1·I·W_ISO + w2·log(H+1)·100 + w3·P·10 + w4·D·5 + w5·A·10) / MAX × 100
```

✅ Mejora: Ahora **W_ISO (Peso ISO)** es una variable que modula la puntuación según criticidad normativa.

---

## 📍 Dónde Está Tu Aportación

### Archivo: `src/resolvers/index.ts`

# Aportación diferenciadora

Este proyecto incorpora ISO/IEC 25010 como parte activa del algoritmo de priorización. La mejora principal frente a enfoques previos es que la criticidad normativa no se usa solo como referencia documental, sino como una variable real del cálculo IPA.

## Qué aporta este trabajo

- Integración de pesos ISO en la fórmula de priorización.
- Diferenciación de requisitos con el mismo perfil técnico en función de su criticidad normativa.
- Normalización del resultado para ordenar los requisitos dentro de un catálogo.
- Visualización del desglose de factores en el dashboard.

## Dónde se implementa

- `src/resolvers/index.ts`: algoritmo de cálculo y tabla de pesos ISO.
- `src/frontend/components/DashboardIPA.tsx`: visualización del ranking y del detalle de cada requisito.

## Validación

La validación funcional consiste en cargar catálogos con requisitos equivalentes en importancia y comprobar que la prioridad final cambia según la característica ISO asignada. En particular, los requisitos asociados a Seguridad deben obtener una prioridad superior a los de Rendimiento cuando el resto de variables es comparable.

## Mensaje principal para la defensa

La aportación del trabajo es que la priorización deja de ser genérica y pasa a estar alineada con la criticidad de calidad definida por ISO/IEC 25010.
    FORMULA_WEIGHTS.w3 * requirement.depth * 10 +
