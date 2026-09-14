# Evidencia de implementación UX

> **Documento histórico.** El "menú móvil" descrito aquí pertenece a la
> cabecera horizontal (`Header.astro`), retirada en favor de la barra
> lateral documentada en `docs/ux/sidebar-navigation.md`. La tabla de
> contraste de texto/fondo principal sigue vigente porque los tokens de
> color no cambiaron.

Implementación conceptual autorizada para revisión de los issues #3 y #15. No
constituye autorización de publicación.

## Viewports

- `docs/evidence/ux/mobile-320x568.jpg`
- `docs/evidence/ux/mobile-390x844.jpg`
- `docs/evidence/ux/mobile-menu-open-390x844.jpg`
- `docs/evidence/ux/tablet-768x1024.jpg`
- `docs/evidence/ux/desktop-1440x900.jpg`
- `docs/evidence/ux/nfcores-desktop-1440x900.jpg`

Las imágenes conservan exactamente los viewports indicados. La captura específica
de NFCores se generó con `CONTENT_PREVIEW=true` para permitir que el Consejo revise
su diferenciación visual. Ese modo no forma parte del build normal; las demás
capturas documentan la portada y la navegación.

## Menú móvil

- Cerrado: `aria-expanded=false`, navegación no visible e `inert`.
- Abierto: `aria-expanded=true`, `aria-controls=primary-navigation`, cuatro
  enlaces visibles y navegables.
- Escape: cierra el panel y devuelve el foco al botón.
- Seleccionar un enlace cierra el panel.
- Botón: 56.94 × 44 px.
- Enlaces: 337.60 × 44 px en viewport 390 × 844.

## Contraste medido

| Uso                | Frente    | Fondo     | Relación |
| ------------------ | --------- | --------- | -------: |
| Texto principal    | `#f4f7fb` | `#08111f` |  17.60:1 |
| Texto secundario   | `#9eacbc` | `#08111f` |   8.18:1 |
| Acento turquesa    | `#4ee1b3` | `#08111f` |  11.48:1 |
| Texto sobre acción | `#07120f` | `#4ee1b3` |  11.56:1 |
| Acento NFCores     | `#70a5ff` | `#08111f` |   7.67:1 |

Todas las combinaciones medidas superan 4.5:1. Los estados de foco utilizan un
contorno turquesa de 3 px con separación de 4 px. Hover modifica color, borde o
superficie sin depender únicamente de movimiento.
