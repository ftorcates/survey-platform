# Plataforma de Encuestas

Source: http://localhost:3000

To create a video from this capture, use the `product-launch-video` skill.

## What's in This Capture

| File | Contents |
|------|----------|
| `screenshots/contact-sheet.jpg` | **View this first.** All scroll screenshots in labeled grid — see the entire page at a glance |
| `screenshots/scroll-*.png` | Individual viewport screenshots if you need detail on a specific section. |
| `extracted/tokens.json` | Design tokens: 20 colors, 5 fonts, 1 headings, 1 CTAs |
| `extracted/design-styles.json` | Computed styles from live DOM: typography hierarchy, button/card/nav styles, spacing scale, border-radius, box shadows. Primary data source for DESIGN.md. |
| `extracted/asset-descriptions.md` | One-line description of every downloaded asset. Read this for asset selection — only open individual files for safe-zone checking. |
| `extracted/visible-text.txt` | Page text in DOM order, prefixed with HTML tag (`[h1]`, `[p]`, `[a]`). Use as context — rephrase freely. |
| `assets/contact-sheet.jpg` | All downloaded images in one labeled grid. |
| `assets/svgs/contact-sheet.jpg` | SVGs rendered as thumbnails in labeled grid |
| `assets/` | Individual downloaded images, SVGs, and font files. |

## Brand Summary

- **Colors**: #F7FBFF (bg-light), #121B2D (accent), #B3CDFF (surface-light), #6EA3FF (accent), #172033 (accent), #23B7A4 (accent), #101622 (accent), #121A29 (accent), #0C1719 (accent), #EBF4FF (bg-light)
- **Fonts**: __nextjs-Geist (400-600 variable), __nextjs-Geist Mono (400-600 variable), Aptos Display (760), Aptos (400,700,760,820), IBM Plex Mono (750,800)
