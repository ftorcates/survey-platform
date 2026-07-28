---
name: vercel-deployer
description: Automatiza el proceso de validación y despliegue a producción de la plataforma en Vercel utilizando Vercel CLI.
---

# Vercel Deployer

Esta skill se activa cuando el usuario te pide desplegar la aplicación a producción o actualizar el sitio web en Vercel (ejemplo: "Despliega en Vercel", "Despliega a producción", "Actualiza la web en Vercel" o "/deploy").

## Flujo de Trabajo

### 1. Sincronización de la Rama Principal
Asegúrate de estar en el directorio del proyecto (`/Users/freddytorcates/.gemini/antigravity/scratch/survey-platform`).
Cambia a la rama `main` y descarga los últimos cambios fusionados en GitHub:
```bash
git checkout main && git pull origin main
```

### 2. Validación Estricta
Verifica que el código cumpla al 100% con las reglas de linting y compilado de TypeScript antes de intentar desplegar:
```bash
npm run lint && npx tsc --noEmit
```
*Si se detecta cualquier error de sintaxis o tipos, DETÉN el despliegue de inmediato, soluciona el problema o repórtalo al usuario.*

### 3. Despliegue con Vercel CLI
Utiliza la CLI de Vercel para lanzar un despliegue a producción de manera limpia:
```bash
npx -y vercel@latest deploy --prod --yes
```

> [!NOTE]
> **Primera Ejecución / Proyecto sin enlazar:**
> Si Vercel indica que el proyecto no ha sido enlazado (linked) o pide autenticación con `vercel login`, indícale de inmediato al usuario que debe vincular el proyecto de GitHub directamente desde su consola web de Vercel (o correr `npx vercel login` por terminal) y verificar que en Vercel esté configurada la variable `DATABASE_URL` conectada a su base de datos de Neon/Supabase/Vercel Postgres.

### 4. Entrega de Resultados y URL Publicada
Al finalizar el comando exitosamente, lee la salida, captura la URL del despliegue en producción (por ejemplo, `https://survey-platform-xxx.vercel.app`) y compártela de forma destacada en tu respuesta para que el usuario pueda visitar y verificar su sitio web en vivo.
