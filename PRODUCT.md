# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El usuario primario son equipos generales que necesitan crear, publicar y analizar encuestas sin depender de una herramienta externa genérica. Incluye equipos internos, áreas operativas, coordinación académica, recursos humanos, investigación ligera y responsables de procesos que requieren levantar información estructurada.

Los participantes son personas que responden encuestas públicas desde un enlace compartido. Deben poder entender el contexto, seguir instrucciones, completar datos demográficos cuando se requieran y responder preguntas sin fricción.

## Product Purpose

La plataforma permite a usuarios autenticados crear encuestas, configurar preguntas, publicar enlaces de respuesta, revisar métricas y consultar un resumen agregado de audiencias. El éxito del producto es que un equipo pueda pasar de una intención de estudio a respuestas útiles y analizables dentro del mismo flujo.

## Positioning

La diferencia central frente a una herramienta genérica de encuestas son los flujos dinámicos. El producto soporta encuestas personalizadas, escalas fijas, preguntas de texto, selección simple, selección múltiple, opciones globales tipo Likert, bloques de preguntas y rutas condicionales mediante `nextQuestionId`.

## Operating Context

El flujo principal del creador es iniciar sesión con Google, entrar al dashboard, crear una encuesta, editar su estructura, compartirla y revisar resultados. Las páginas administrativas incluyen dashboard, audiencias y configuración.

El flujo del participante es abrir una encuesta pública, ver presentación e instrucciones, entregar datos demográficos cuando aplica, responder preguntas o bloques de escala fija y completar el envío.

Las encuestas pueden pertenecer a una organización, departamento y subdepartamento. Pueden incluir imagen, descripción, obligatoriedad, demografía requerida y tabla de opciones de escala.

## Capabilities and Constraints

Funcionalidades confirmadas por el código:

- Autenticación con NextAuth y Google OAuth.
- Persistencia con Prisma y PostgreSQL.
- Encuestas por usuario autenticado.
- Creación, edición, eliminación y publicación/compartición de encuestas.
- Dashboard con conteo de encuestas, preguntas y respuestas.
- Página de audiencias con respuestas agregadas, búsqueda y exportación CSV.
- Página de configuración de perfil.
- Encuestas públicas con presentación, instrucciones, demografía opcional, preguntas dinámicas y finalización.
- Soporte para encuestas `CUSTOM` y `FIXED_SCALE`.
- Soporte para preguntas `TEXT`, `SINGLE_CHOICE` y `MULTIPLE_CHOICE`.
- Theme toggle claro/oscuro existente.

Restricción durable confirmada por el usuario: el flujo de Google OAuth debe preservarse intacto en futuros cambios de diseño o producto.

## Brand Commitments

El nombre operativo actual es `Survey Platform` / `Plataforma de Encuestas`. El producto debe mantener tono profesional y claro. No hay una marca final, identidad corporativa externa, logotipo oficial ni lineamientos visuales definitivos confirmados.

## Evidence on Hand

Evidencia real disponible en el repo:

- Modelo de datos y capacidades: `prisma/schema.prisma`.
- Flujo administrativo y datos de dashboard/audiencias/configuración: `src/app/admin`.
- Flujo público de respuesta: `src/app/survey/[id]/SurveyClient.tsx`.
- Login con Google OAuth: `src/auth.ts`, `src/app/auth/login/page.tsx`.
- Theme toggle: `src/app/ThemeToggle.tsx`.
- Sistema visual incumbente: `src/app/globals.css`.

No hay evidencia confirmada de clientes, benchmarks comerciales, pricing, estudios publicados, testimonios, métricas de negocio o claims externos. Futuros diseños no deben inventarlos.

## Product Principles

1. Mantener el flujo completo en un solo producto: crear, publicar, responder y analizar.
2. Priorizar flujos dinámicos y estructura avanzada de encuestas sobre formularios planos.
3. Preservar autenticación Google OAuth y propiedad de encuestas por usuario.
4. Hacer que los resultados sean legibles para equipos no técnicos.
5. Evitar claims externos no respaldados por evidencia del proyecto.

## Accessibility & Inclusion

El producto debe funcionar para creadores y participantes en web, con controles navegables por teclado, foco visible, contraste suficiente en modo claro y oscuro, y formularios comprensibles en español. No hay un estándar formal específico confirmado más allá de buenas prácticas web.
