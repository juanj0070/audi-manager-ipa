# 🚀 GUÍA COMPLETA: Cómo Desplegar Tu TFM paso a paso

## ✅ PASO 1: Verificar que Node.js está instalado

Abre tu terminal WSL y ejecuta:

```bash
node --version   # Debe mostrar v18 o superior
npm --version    # Debe mostrar 9.x o superior
```

Si no tienes Node.js, descárgalo de [nodejs.org](https://nodejs.org)

---

## ✅ PASO 2: Instalar Atlassian Forge CLI

```bash
npm install -g @forge/cli
forge --version  # Verificar que se instaló
```

---

## ✅ PASO 3: Crear Cuenta Atlassian Gratuita

1. Abre [atlassian.com/software/jira](https://atlassian.com/software/jira)
2. Crea una cuenta gratuita
3. Crea un sitio Jira (te dan uno: `tu-nombre.atlassian.net`)
4. Ve a [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
5. **Crea un API Token** y cópialo (solo lo ves una vez)

⚠️ **Guarda el API Token en un lugar seguro**

---

## ✅ PASO 4: Login en Forge desde tu Terminal

```bash
forge login
# Te pedirá:
# - Email: tu email de Atlassian
# - API Token: pega el que creaste en el paso 3
```

---

## ✅ PASO 5: Navegar a Tu Proyecto

En tu terminal, entra a la carpeta `audit-manager-ipa`:

```bash
cd "d:/OneDrive - UNIVERSIDAD DE MURCIA/TFM/Archivo comprimido/Codigo/audit-manager-ipa"
```

---

## ✅ PASO 6: Instalar Dependencias npm

```bash
npm install
```

Esto descargará React, TypeScript, Forge libs, etc. Espera a que termine (1-2 minutos).

---

## ✅ PASO 7: Construir el Proyecto

```bash
npm run build
```

Si no da errores, está todo correcto.

---

## ✅ PASO 8: Desplegar en Jira (Primera Vez)

```bash
npm run deploy
```

Verás mensajes como:
```
✔ Deployed new version of app
✔ App ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## ✅ PASO 9: Instalar el Plugin en Tu Sitio Jira

```bash
npm run install
```

Te pedirá:
```
Enter the Jira site your app will be installed on: tu-nombre.atlassian.net
```

Ingresa tu sitio (sin `https://`, solo el dominio).

---

## ✅ PASO 10: Abrir el Plugin en Jira

1. Ve a `https://tu-nombre.atlassian.net`
2. Abre cualquier proyecto Jira
3. En el menú izquierdo, busca **"IPA Audit Manager"**
4. ¡Haz clic y entra al plugin!

---

## 🔄 PASO 11: Modo Desarrollo (Hot Reload)

Cuando hagas cambios en el código, usa:

```bash
npm run tunnel
```

Esto hace que los cambios se vean en tiempo real sin redeploy.

---

## 📋 PASO 12: Cargar tu Primer Catálogo

1. En el plugin, ve a **"Gestión de Catálogos"**
2. Haz clic en **"+ Nuevo Catálogo"**
3. Nombre: `Seguridad ENS`
4. Contenido (pega esto):
   ```
   SEC-001;Cifrado TLS 1.3;Seguridad;90
   SEC-002;Autenticación OAuth 2.0;Seguridad;70
   PERF-001;Tiempo respuesta <200ms;Rendimiento;90
   ```
5. Haz clic en **"Guardar"**

---

## 📊 PASO 13: Calcular IPA

1. Ve a **"Dashboard IPA"**
2. Haz clic en **"Calcular IPA"**
3. Verás una tabla con los requisitos ordenados por puntuación

**Resultado esperado**:
- SEC-001: IPA = 100 (Seguridad, Importancia 90) 🔒
- PERF-001: IPA = 71 (Rendimiento, Importancia 90) ⚡

**¿Por qué distinto si tienen la misma importancia?** Porque el peso ISO es diferente:
- Seguridad W_ISO = 1.0
- Rendimiento W_ISO = 0.6

Esto demuestra que tu algoritmo mejorado funciona correctamente ✅

---

## 🐛 Si Algo No Funciona

### Error: "Module not found"
```bash
npm install
npm run build
```

### Error: "Cannot connect to Jira"
```bash
forge login
# Verifica que ingresaste bien el email y API Token
```

### El plugin no aparece en Jira
```bash
npm run deploy
npm run install
# Luego recarga la página de Jira (F5)
```

### Cambios no aparecen
```bash
npm run tunnel
# Abre una nueva terminal mientras tunnel está corriendo
```

---

## 📚 Próximos Pasos

Una vez que tengas todo funcionando:

1. **Carga más catálogos** (usa el archivo `CATALOGS_EXAMPLES.md`)
2. **Valida el escenario de prueba** (10 requisitos de diferentes ISO)
3. **Toma capturas** para tu presentación del TFM

---

## ✨ Checklist de Despliegue

- [ ] Node.js instalado (v18+)
- [ ] Forge CLI instalado
- [ ] Cuenta Atlassian creada
- [ ] API Token creado y guardado
- [ ] `forge login` ejecutado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto construido (`npm run build`)
- [ ] Plugin desplegado (`npm run deploy`)
- [ ] Plugin instalado en Jira (`npm run install`)
- [ ] Plugin visible en Jira
- [ ] Catálogo cargado
- [ ] IPA calculado correctamente

**Cuando todo esté ✅, ¡tu TFM está en marcha!**

---

Creado: Mayo 2026
Universidad de Murcia - Máster en Ingeniería del Software
