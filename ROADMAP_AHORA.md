# 📍 HOJA DE RUTA: Qué Hacer Ahora Mismo

## 🎯 Tu Situación Actual

✅ Tienes los archivos creados en:
```
d:\OneDrive - UNIVERSIDAD DE MURCIA\TFM\Archivo comprimido\Codigo\audit-manager-ipa\
```

## 🚀 AHORA MISMO: Próximos 5 Minutos

### 1. Abre una terminal en esa carpeta
```bash
cd "d:/OneDrive - UNIVERSIDAD DE MURCIA/TFM/Archivo comprimido/Codigo/audit-manager-ipa"
```

### 2. Instala dependencias
```bash
npm install
```
Esto toma 1-2 minutos. Ve a tomarte un café ☕

### 3. Construye el proyecto
```bash
npm run build
```
Si sale todo verde sin errores, ¡perfecto!

---

## 📅 HOY (Próximas 2-3 horas)

### 4. Haz login en Forge
```bash
forge login
# Usa tu email de Atlassian y el API Token que creaste
```

### 5. Despliega
```bash
npm run deploy
npm run install
# Te pedirá tu sitio: tu-nombre.atlassian.net
```

### 6. Abre el plugin en Jira
Ve a `https://tu-nombre.atlassian.net` y busca el plugin en el menú lateral.

---

## 📋 VALIDACIÓN: Próximas 24 horas

### 7. Carga un catálogo de prueba
En el plugin → "Gestión de Catálogos" → "+ Nuevo Catálogo"

Nombre: `Test`
Contenido:
```
SEC-001;Cifrado TLS;Seguridad;90
PERF-001;Rendimiento;Rendimiento;90
```

### 8. Calcula IPA
Dashboard → "Calcular IPA"

**Esperado**: SEC-001 debe tener IPA > PERF-001

---

## 📊 PARA LA DEFENSA: Próxima Semana

### 9. Prepara el escenario de validación
Carga los 10 requisitos de `CATALOGS_EXAMPLES.md`

### 10. Toma capturas del dashboard
- Tabla con ranking
- Panel de detalle mostrando variables
- Histórico de cálculos

### 11. Ten el código listo
- Abre `src/resolvers/index.ts`
- Marca la línea de `calculateIpaScore()`
- Eso es tu aportación

---

## 📁 Estructura de Archivos (Para Referencia)

```
audit-manager-ipa/
├── 📄 README.md                      ← Lee esto primero
├── 📄 PASOS_DESPLIEGUE.md           ← Instrucciones detalladas paso a paso
├── 📄 APORTACION_DIFERENCIADORA.md  ← Explica qué es nuevo en tu TFM
├── 📄 CATALOGS_EXAMPLES.md          ← CSVs para cargar datos de prueba
├── 📄 ROADMAP_AHORA.md              ← Este archivo
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 manifest.yml
└── src/
    ├── 🖥️  frontend/
    │   ├── index.tsx                 ← App principal (React)
    │   └── components/
    │       ├── DashboardIPA.tsx      ← Vista principal: ranking
    │       ├── CatalogManager.tsx    ← Gestión de catálogos
    │       └── AuditHistory.tsx      ← Histórico
    └── ⚙️  resolvers/
        └── index.ts                  ← ⭐ Backend: Algoritmo IPA mejorado
```

---

## 🔗 Documentos para Cada Tarea

| Tarea | Lee Este Archivo |
|-------|-----------------|
| "No sé por dónde empezar" | README.md |
| "Quiero instalar paso a paso" | PASOS_DESPLIEGUE.md |
| "¿Cuál es mi aportación?" | APORTACION_DIFERENCIADORA.md |
| "Cómo cargar datos de prueba" | CATALOGS_EXAMPLES.md |
| "Necesito validar que funciona" | CATALOGS_EXAMPLES.md → Escenario de Validación |

---

## ❓ Si Algo Sale Mal

**Error en npm install**
→ Llama a `npm cache clean --force` y reintentas

**Error en forge login**
→ Verifica que tu API Token es correcto (ve a Atlassian > Settings)

**Error en npm run deploy**
→ Abre una nueva terminal, espera 10 segundos, reintentas

**Plugin no aparece en Jira**
→ Recarga la página (F5) o borra cookies

---

## ✅ Checklist Final

- [ ] Carpeta creada con todos los archivos
- [ ] `npm install` funcionó
- [ ] `npm run build` sin errores
- [ ] `forge login` completado
- [ ] `npm run deploy` ejecutado
- [ ] `npm run install` completado
- [ ] Plugin visible en Jira
- [ ] Catálogo cargado
- [ ] IPA calculado correctamente
- [ ] Capturas tomadas para la defensa

---

## 🎤 Antes de la Defensa

1. **Practica la demostración**:
   - Abre el plugin
   - Carga el catálogo
   - Calcula IPA
   - Explica la diferencia entre SEC-001 y PERF-001

2. **Ten el código a mano**:
   - Abre VS Code con `src/resolvers/index.ts`
   - Marca la función `calculateIpaScore()`
   - Señala donde está `W_ISO`

3. **Memoriza estas líneas**:
   > "El peso ISO (W_ISO) modula la puntuación según criticidad normativa. Seguridad tiene 1.0 porque tiene consecuencias legales (ENS, RGPD). Rendimiento tiene 0.6 porque es menos crítico. Esto es nuestra aportación: ISO/IEC 25010 no es decorativa, es parte activa del algoritmo."

---

## 📞 Dudas Frecuentes

**P: ¿Dónde están todos los archivos?**
R: En `audit-manager-ipa/`. Abre esa carpeta en VS Code.

**P: ¿Tengo que cambiar algo en el código?**
R: No, está listo. Solo instala dependencias y deploya.

**P: ¿Qué si falló la instalación?**
R: Lee `PASOS_DESPLIEGUE.md` sección "Si Algo No Funciona".

**P: ¿Dónde está mi aportación diferenciadora?**
R: En `src/resolvers/index.ts` línea ~90, la variable `wIso`.

---

**Tiempo estimado hasta tener todo funcionando: 30 minutos**

Creado: Mayo 2026
Universidad de Murcia - Máster en Ingeniería del Software

¡Adelante con tu TFM! 🚀
