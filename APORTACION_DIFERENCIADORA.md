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

**Línea ~40-50**: Configuración de pesos ISO
```typescript
const ISO_WEIGHTS: Record<string, number> = {
  'Seguridad': 1.0,      // Máxima criticidad: ENS, RGPD
  'Fiabilidad': 0.8,     // Alta criticidad
  'Mantenibilidad': 0.7, // Criticidad media-alta
  'Rendimiento': 0.6,    // Criticidad media
};
```

**Línea ~85-130**: Función `calculateIpaScore()` que implementa la fórmula mejorada
```typescript
function calculateIpaScore(
  requirement: Requirement,
  currentSprint: number,
  maxScore: number
): number {
  // ✨ AQUÍ ESTÁ TU APORTACIÓN
  const wIso = ISO_WEIGHTS[requirement.isoCharacteristic] || 0.6;
  
  const unnormalizedScore =
    FORMULA_WEIGHTS.w1 * requirement.importance * wIso +  // ← W_ISO aquí
    FORMULA_WEIGHTS.w2 * Math.log10(requirement.children.length + 1) * 100 +
    FORMULA_WEIGHTS.w3 * requirement.depth * 10 +
    FORMULA_WEIGHTS.w4 * requirement.dependencies.length * 5 +
    FORMULA_WEIGHTS.w5 * antiquity * 10;
  
  return (unnormalizedScore / maxScore) * 100;
}
```

---

## 🔍 Cómo Demostrar Tu Aportación en la Defensa

### Escenario de Validación (en tu TFM, Capítulo 6.4)

Carga este catálogo en el plugin:
```csv
SEC-001;Cifrado TLS 1.3;Seguridad;90
PERF-001;Tiempo resp. <200ms;Rendimiento;90
```

### Resultado que debes obtener:
```
SEC-001:  IPA = 100 (Seguridad, W_ISO = 1.0)
PERF-001: IPA = 71  (Rendimiento, W_ISO = 0.6)
Diferencia: 29 puntos
```

### Explicación en tu defensa:
> **"Como ves, ambos requisitos tienen exactamente el mismo perfil técnico (Importancia=90, misma profundidad, mismos hijos). Sin embargo, SEC-001 obtiene IPA=100 mientras PERF-001 obtiene IPA=71. Esta diferencia de 29 puntos es exclusivamente por el peso ISO: Seguridad tiene W_ISO=1.0 porque cumple regulaciones legales (ENS, RGPD), mientras Rendimiento tiene W_ISO=0.6 porque es menos crítico normativamente. Esto demuestra que nuestra mejora funciona correctamente."**

---

## 📋 Comparativa: Antes vs Después

| Aspecto | Molina Gallego 2025 | Tu TFM 2026 |
|--------|-------------------|-----------|
| **Variable Normativa** | No contemplada | ✅ W_ISO integrada |
| **Característica ISO** | Referencia externa | ✅ Variable del algoritmo |
| **Clasificación ISO** | No aplicada | ✅ Seguridad, Fiabilidad, etc. |
| **Pesos ISO** | No aplicados | ✅ 1.0, 0.8, 0.7, 0.6 |
| **Normalización** | Estática (rango fijo) | ✅ Dinámica (relativa al conjunto) |

---

## 🧠 Lo que Explicar en la Defensa

1. **El problema**: Los trabajos anteriores no diferenciaban la criticidad normativa de los requisitos.

2. **Tu solución**: Incorporar ISO/IEC 25010 como variable activa en la fórmula.

3. **El resultado**: 
   - Requisitos críticos (Seguridad) tienen mayor prioridad de auditoría
   - Mismo perfil técnico ≠ misma puntuación si ISO es diferente
   - Priorización es **objetiva y normativamente justificable**

4. **Validación**: El escenario de prueba demuestra que funciona.

---

## 📚 Secciones del TFM donde mencionas esto

- **Capítulo 1.4**: "La Propuesta: Auditoría Continua Basada en ISO/IEC 25010"
- **Capítulo 2.6**: "Brecha de Investigación" - explicas por qué Molina no lo tenía
- **Capítulo 4.3**: "Fórmula del IPA" - aquí está implementada
- **Capítulo 6.4**: "Validación Controlada" - demuestras con 10 requisitos

---

## 🎬 Demostración En Vivo en la Defensa

Cuando presentes:

1. Muestra el plugin funcionando en Jira
2. Carga el catálogo de 10 requisitos (CATALOGS_EXAMPLES.md)
3. Calcula IPA
4. Señala en el dashboard: "Ves que SEC-001 está primero (IPA=100) mientras PERF-001 está cuarto (IPA=71), aunque ambos tienen Importancia=90"
5. Abre el código (`src/resolvers/index.ts` línea ~90) en VS Code
6. Muestra la línea donde multiplicas por `wIso`: esa es tu aportación
7. Explica por qué W_ISO = 1.0 para Seguridad y 0.6 para Rendimiento

**Impacto en los tribunales**: Demostrará que entiende cómo funciona el algoritmo y que realmente agregaste valor.

---

## ✨ Puntos Clave para Resaltar

✅ **Integración normativa**: ISO/IEC 25010 no es decorativa, es parte del cálculo
✅ **Reproducibilidad**: La fórmula es exacta, matemática, auditable
✅ **Transparencia**: El panel lateral del dashboard muestra el desglose de variables
✅ **Validación**: El escenario de prueba contrasta 4 hipótesis que se verifican

---

Creado: Mayo 2026
Universidad de Murcia - Máster en Ingeniería del Software

Para más detalles técnicos, revisa:
- `src/resolvers/index.ts` (línea ~85)
- Capítulo 4 de tu TFM (Diseño de la Solución)
