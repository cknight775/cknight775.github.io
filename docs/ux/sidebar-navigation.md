# Evidencia de la barra lateral — PR #14 (Track B)

Reemplaza la cabecera horizontal (`Header.astro`, retirada) por
`src/components/Sidebar.astro`. Referencia de paleta obligatoria en
[`docs/ux/direction.md`](./direction.md#decisión-del-propietario--paleta-obligatoria).

## Arquitectura

- **Escritorio (> 900px):** rail fijo de 92px a la izquierda
  (`position: sticky; height: 100vh`), con monograma "CC", íconos SVG en
  línea (sin librería de íconos completa) y etiqueta de texto por enlace.
  El contenido principal (`.page-shell`) ocupa el espacio restante como
  hijo flex de `.app-shell`.
- **Móvil/tablet (≤ 900px):** el rail se convierte en un drawer
  (`position: fixed`, `transform: translateX(-100%)` cuando está cerrado) que
  se activa con un botón hamburguesa fijo (`.sidebar-toggle`, 44×44px como
  mínimo). Un scrim (`[data-scrim]`) cubre el contenido detrás del drawer.

## Comportamiento accesible

- `aria-expanded` en el botón y `aria-controls="primary-navigation"`
  enlazando al `<nav>` dentro del `<aside>`.
- Cierre con `Escape` (con retorno de foco al botón), al hacer clic en un
  enlace de navegación en modo móvil, o al hacer clic en el scrim.
- `document.body` recibe la clase `scroll-locked`
  (`overflow: hidden`) mientras el drawer está abierto, bloqueando el scroll
  de fondo.
- El estado activo (`aria-current="true"`) se calcula con
  `IntersectionObserver` sobre las secciones ancladas
  (`inicio`, `perfil`, `experiencia`, `proyectos`, `herramientas`,
  `credenciales`, `contacto`). Si `IntersectionObserver` no está disponible,
  el bloque completo se omite (comprobado con `'IntersectionObserver' in
window`): la navegación permanece completamente funcional como enlaces
  ancla normales, solo sin el resaltado de sección activa.
- Todos los enlaces de navegación cumplen el objetivo táctil mínimo de
  44×44px (`min-height: 44px` más relleno horizontal).
- La animación de apertura del drawer respeta
  `prefers-reduced-motion` mediante la regla global existente que fuerza
  `transition-duration: 0.01ms` cuando el usuario lo solicita.

## Contraste medido (paleta obligatoria)

| Uso                                                | Frente    | Fondo     | Relación |
| -------------------------------------------------- | --------- | --------- | -------: |
| Texto del sidebar (`--text`) sobre `--bg-soft`     | `#f4f7fb` | `#0d1929` |  16.45:1 |
| Etiquetas inactivas (`--muted`) sobre `--bg-soft`  | `#9eacbc` | `#0d1929` |   7.64:1 |
| Enlace activo (`--accent`) sobre `--bg-soft`       | `#4ee1b3` | `#0d1929` |  10.73:1 |
| Texto sobre `--surface` (tarjetas de credenciales) | `#f4f7fb` | `#111f31` |  15.46:1 |

Todas las combinaciones superan holgadamente 4.5:1 (WCAG AA). Los cálculos se
verificaron con la fórmula de contraste relativo de WCAG 2.x sobre los
valores hexadecimales exactos de `src/styles/global.css`; los pares que ya
constaban en `docs/ux/implementation-evidence.md` (texto/fondo principal,
acento sobre fondo principal, acento sobre botón) no cambiaron y siguen
vigentes.

## Limitación de esta entrega: sin capturas automatizadas

Este entorno de ejecución no tiene un navegador headless instalado
(`npx playwright` falla por falta de paquetes y no hay `chromium` ni
`google-chrome` disponibles), por lo que **no fue posible generar capturas
reales** de escritorio, tablet, móvil ni del estado abierto del drawer para
esta entrega. Documentar aquí una captura sin haberla generado sería
inexacto, así que se deja pendiente explícitamente.

Antes de aprobar esta parte de la PR, el propietario o el Consejo deben
verificar visualmente, en un entorno con navegador:

1. El rail fijo en escritorio (≥ 1440px) con la paleta obligatoria.
2. El botón hamburguesa y el drawer en 390×844 y 768×1024, incluido el
   estado abierto con foco visible en el primer enlace.
3. Que `aria-current` se aplique al enlace de la sección visible al hacer
   scroll.
4. Navegación completa por teclado (Tab, Shift+Tab, Escape) sin trampas de
   foco.
