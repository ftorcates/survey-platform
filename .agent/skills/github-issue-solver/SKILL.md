---
name: github-issue-solver
description: Automates the process of reading a GitHub issue from ftorcates/survey-platform and implementing its requirements locally on a new branch.
---

# GitHub Issue Solver

Esta skill se activa cuando el usuario te pide resolver, implementar o trabajar en un issue de GitHub (ejemplo: "trabaja en el issue #12" o "resuelve el issue 25").

## Flujo de Trabajo

### 1. Obtener la Información del Issue
Obtén los detalles del issue especificado en el repositorio `ftorcates/survey-platform`.
Ejecuta este comando en la terminal para leer el issue usando la API pública de GitHub:
```bash
curl -s https://api.github.com/repos/ftorcates/survey-platform/issues/<ID_DEL_ISSUE>
```
*Nota: Si el repositorio es privado o requieres autenticación, utiliza el CLI de GitHub (`gh issue view <ID> -R ftorcates/survey-platform`).*

Lee cuidadosamente el `title` y el `body` del JSON devuelto para entender los requerimientos exactos que pide el usuario en el issue.

### 2. Preparar el Entorno Local
Asegúrate de estar en el directorio del proyecto (`/Users/freddytorcates/.gemini/antigravity/scratch/survey-platform`).
Crea y muévete a una nueva rama git local para trabajar en este issue:
```bash
git checkout main
git pull
git checkout -b feature/issue-<ID_DEL_ISSUE>
```

### 3. Implementación
- Investiga la base de código actual para localizar los archivos que necesitan ser modificados.
- Realiza los cambios necesarios utilizando tus herramientas de edición de código (`replace_file_content` o `multi_replace_file_content`).
- Asegúrate de seguir las convenciones de código del proyecto y satisfacer todo lo solicitado en la descripción del issue.

### 4. Revisión y Commit Local
- Verifica que no haya errores obvios de sintaxis.
- Realiza un commit local con los cambios:
```bash
git add .
git commit -m "feat: implementa requerimientos del issue #<ID_DEL_ISSUE>"
```

### 5. Finalización (CRÍTICO)
- **NO hagas push de la rama al repositorio remoto.**
- **NO abras un Pull Request (PR).**
- Notifica al usuario que has terminado la implementación, que los cambios están guardados en la rama local `feature/issue-<ID_DEL_ISSUE>` y que ya puede probarlos localmente antes de decidir abrir el PR. Resume brevemente los archivos que modificaste y la lógica que implementaste.
