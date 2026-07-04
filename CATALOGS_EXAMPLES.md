# Catálogos de Ejemplo para Cargar en el Plugin

## 📋 Formato del CSV
```
KEY;Título;Característica ISO;Importancia (1-100)
```

## 🔒 CATÁLOGO: Seguridad ENS

```csv
SEC-001;Cifrado TLS 1.3;Seguridad;90
SEC-002;Autenticación OAuth 2.0;Seguridad;70
SEC-003;Control de acceso RBAC;Seguridad;60
```

## ✅ CATÁLOGO: Fiabilidad

```csv
REL-001;Disponibilidad 99.9%;Fiabilidad;85
REL-002;Tolerancia a fallos;Fiabilidad;65
```

## 🔧 CATÁLOGO: Mantenibilidad

```csv
MAN-001;Cobertura de tests >80%;Mantenibilidad;80
MAN-002;Documentación de API;Mantenibilidad;50
```

## ⚡ CATÁLOGO: Rendimiento

```csv
PERF-001;Tiempo respuesta <200ms;Rendimiento;90
PERF-002;Carga máx. 10k usuarios;Rendimiento;75
PERF-003;Uso CPU <70%;Rendimiento;55
```

---

## 🧪 Escenario de Validación Completo (del TFM)

Usa este CSV para validar que el algoritmo IPA funciona correctamente:

```csv
SEC-001;Cifrado TLS 1.3;Seguridad;90
SEC-002;Autenticación OAuth 2.0;Seguridad;70
SEC-003;Control de acceso RBAC;Seguridad;60
REL-001;Disponibilidad 99.9%;Fiabilidad;85
REL-002;Tolerancia a fallos;Fiabilidad;65
MAN-001;Cobertura de tests >80%;Mantenibilidad;80
MAN-002;Documentación de API;Mantenibilidad;50
PERF-001;Tiempo respuesta <200ms;Rendimiento;90
PERF-002;Carga máx. 10k usuarios;Rendimiento;75
PERF-003;Uso CPU <70%;Rendimiento;55
```

### ✅ Resultado esperado después de calcular IPA:

| Posición | Requisito | ISO | IPA | Esperado |
|----------|-----------|-----|-----|----------|
| 1 | SEC-001 | Seguridad | 100 | ✅ |
| 2 | REL-001 | Fiabilidad | 84 | ✅ |
| 3 | MAN-001 | Mantenibilidad | 79 | ✅ |
| 4 | PERF-001 | Rendimiento | 71 | ✅ (< SEC-001) |
| 5 | SEC-002 | Seguridad | 63 | ✅ |

**Nota**: PERF-001 tiene el mismo perfil técnico que SEC-001 pero IPA más bajo porque su peso ISO es 0.6 vs 1.0. Esto demuestra que el algoritmo funciona correctamente.

---

Creado: Mayo 2026
