---
name: github-pr-creator
description: Pushes local changes for a specific issue branch and creates a GitHub Pull Request automatically, returning the PR URL for manual review.
---

# GitHub PR Creator

Esta skill se activa cuando el usuario te pide subir, hacer push, finalizar o crear el PR de un issue en el que ya trabajaste (ejemplo: "Crea el PR del issue #12", "Sube el issue 25" o "Finaliza el issue 1").

## Flujo de Trabajo

### 1. Cambio de Rama
Asegúrate de estar en el directorio del proyecto (`/Users/freddytorcates/.gemini/antigravity/scratch/survey-platform`).
Cambia a la rama correspondiente al issue especificado:
```bash
git checkout feature/issue-<ID_DEL_ISSUE>
```

### 2. Verificación de Cambios sin Commitear
Verifica si hay cambios pendientes por commitear (por ejemplo, si el usuario hizo pruebas y modificó algo):
```bash
git status -s
```
Si el comando devuelve salida (hay archivos modificados), agrégalos y haz un commit final:
```bash
git add .
git commit -m "chore: ajustes finales para el issue #<ID_DEL_ISSUE>"
```

### 3. Subir la Rama (Push)
Sube la rama local al repositorio remoto:
```bash
git push -u origin feature/issue-<ID_DEL_ISSUE>
```

### 4. Crear el Pull Request
Utiliza el CLI de GitHub (`gh`) para crear el Pull Request automáticamente. Es importante que enlaces el PR al issue usando "Closes #ID" en la descripción:
```bash
gh pr create --title "feat: resuelve el issue #<ID_DEL_ISSUE>" --body "Closes #<ID_DEL_ISSUE>" --head feature/issue-<ID_DEL_ISSUE>
```
*Nota: Este comando devolverá la URL del Pull Request recién creado.*

### 5. Entregar la URL al Usuario
Lee la salida del comando anterior y preséntale la URL al usuario en tu respuesta. Indícale que el PR ha sido creado exitosamente y que ahora puede revisarlo y aprobarlo manualmente desde la interfaz de GitHub.
