---
name: Survey Platform
description: Cartografía viva para construir, publicar y leer encuestas con flujos dinámicos.
colors:
  route-blue: "#2f6df6"
  route-cyan: "#23b7a4"
  route-amber: "#d99b2b"
  route-red: "#d95c4a"
  night-ink: "#101622"
  night-panel: "#172033"
  paper-bg: "#f5f1e8"
  paper-panel: "#fffaf0"
  text-dark: "#111827"
  text-light: "#f7fbff"
typography:
  display:
    fontFamily: "Aptos Display, Avenir Next, Segoe UI, sans-serif"
    fontSize: "clamp(2.8rem, 7vw, 5.8rem)"
    fontWeight: 760
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Aptos, Avenir Next, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.65
  label:
    fontFamily: "IBM Plex Mono, SFMono-Regular, monospace"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  sm: "10px"
  md: "14px"
  lg: "18px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.route-blue}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  card:
    backgroundColor: "{colors.night-panel}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.lg}"
    padding: "18px"
---

# Design System: Survey Platform

## Overview

**Creative North Star: "Cartografía Viva de Flujos"**

The interface behaves like a working map of survey routes. Every survey is a line, every question is a node, every response is movement through the system. The visual language rejects generic dashboard cards and command-center glow in favor of route maps, transit diagrams, branching paths, station labels, and operational panels.

The product stays professional and practical: expressive enough to make dynamic flows visible, disciplined enough for teams to operate daily. Home and login introduce the map; dashboard, audiences, settings, metrics, builder, and public surveys use the same route grammar.

**Key Characteristics:**
- Route lines, nodes, stations, branches, and segment states are the signature language.
- Dense operational surfaces use compact labels, clear hierarchy, and scan-friendly panels.
- Motion represents state changes: a route activates, a node completes, a branch appears.
- Theme toggle is a map-mode control, not a decorative floating widget.

## Colors

The palette uses transit-map clarity: dark navy or warm paper grounds, one active route blue, secondary route colors for state and comparison, and restrained neutrals for legibility.

### Primary
- **Route Blue** (#2f6df6): primary action, active route, selected state, focus.

### Secondary
- **Signal Cyan** (#23b7a4): successful/completed route segments and audience traces.
- **Transfer Amber** (#d99b2b): warnings, alternate paths, highlights.
- **Detour Red** (#d95c4a): destructive actions, blocked routes, errors.

### Neutral
- **Night Ink** (#101622): dark-mode ground.
- **Night Panel** (#172033): dark-mode panels.
- **Paper Ground** (#f5f1e8): light-mode ground.
- **Paper Panel** (#fffaf0): light-mode panels.

### Named Rules
**The Route First Rule.** Color must identify state or path. Do not scatter accent colors as decoration.

## Typography

**Display Font:** Aptos Display with Avenir Next / Segoe UI fallback  
**Body Font:** Aptos with Avenir Next / Segoe UI fallback  
**Label/Mono Font:** IBM Plex Mono with SFMono fallback

**Character:** The typography is engineered and legible, closer to wayfinding systems than editorial pages. Labels can be compact and technical; body copy stays plain Spanish.

### Hierarchy
- **Display** (760, clamp, 0.95): home and major page statements.
- **Headline** (720, 2rem-3.5rem): dashboard and form section titles.
- **Title** (700, 1.1rem-1.5rem): survey cards, stations, modal titles.
- **Body** (450, 1rem, 1.65): descriptions and instructions, capped around 70ch.
- **Label** (700, 0.72rem, tracked): station codes, states, metric labels.

## Layout

The system uses map topology. Desktop layouts favor a route diagram or route rail paired with an information panel. Dashboards use equal-width route cards and full-width map headers. Public surveys use a vertical route timeline so participants always know where they are. Mobile collapses to a single vertical route with sticky or bottom navigation affordances where needed.

## Elevation & Depth

Depth is structural, not glassy. Panels are solid surfaces with one shadow layer and occasional thin route lines. No heavy blur or glowing terminal effects.

## Shapes

Cards use 14-18px corners. Small chips and station nodes may be circular, but large panels are not pills. Route lines are rounded strokes with circular nodes and square transfer markers.

## Components

### Buttons
- **Shape:** rounded rectangular, not oversized pills.
- **Primary:** route blue fill with clear icon/text alignment.
- **Secondary:** transparent or panel-colored with route-blue stroke.
- **Danger:** detour red, used only for destructive actions.

### Chips
- **Style:** station-label badges with compact mono type and optional node dot.
- **State:** active chips show route blue; completed chips use signal cyan.

### Cards / Containers
- **Corner Style:** 18px panels.
- **Background:** solid navy/paper panels by theme.
- **Shadow Strategy:** one soft directional shadow.
- **Internal Padding:** 16-24px, denser in tables and builder views.

### Inputs / Fields
- **Style:** solid panel fields with clear border and label.
- **Focus:** route-blue border and subtle outline.
- **Error / Disabled:** red/low-contrast state with explanatory copy.

### Navigation
- Navigation behaves like a route selector. Active page is a filled station; inactive pages are labeled stops. Mobile navigation becomes a compact station bar.

### Signature Component
**Flow Map:** a reusable visual motif made of SVG or CSS route lines with nodes, branches, and active states. It appears in the home hero, dashboard headers, survey cards, and public survey progress.

## Do's and Don'ts

- Do use routes and nodes to explain dynamic survey behavior.
- Do keep cards equal and scan-friendly in operational pages.
- Do preserve Google OAuth, theme toggle, and current product flows.
- Don't use command-center language, signal-wall panels, decorative glass, or neon grid styling.
- Don't invent clients, commercial metrics, testimonials, or proof.
- Don't make the product feel gamified; the map metaphor must stay operational.
