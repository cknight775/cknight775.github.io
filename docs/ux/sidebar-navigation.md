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
- **Corrección de apilamiento móvil:** el scrim (`z-index: 35`) quedaba por
  encima del drawer (`z-index: 30`), lo que dejaba el panel abierto cubierto
  por el velo. Se corrigió subiendo `.sidebar` a `z-index: 40`, de modo que
  el drawer queda siempre encima del scrim.
- **Corrección de ancho en escritorio:** `.page-shell` fijaba `width: min(...)`
  siendo hijo de un contenedor flex con `flex: 1` (`flex-basis: 0%`), lo que
  hace que la propiedad `width` no tenga efecto en el tamaño del ítem flex.
  El resultado visible era que el contenido ocupaba todo el ancho restante
  sin margen ni centrado, quedando pegado al rail. Se corrigió reemplazando
  `width` por `max-width` en esa regla, que sí se respeta como límite tras el
  cálculo de flex y permite que `margin: auto` centre la columna.

## Comportamiento accesible

- `aria-expanded` en el botón y `aria-controls="primary-navigation"`
  enlazando al `<nav>` dentro del `<aside>`.
- El scrim (`z-index: 35`) queda siempre por debajo del drawer
  (`z-index: 40`) en móvil, de modo que el panel abierto permanece encima del
  velo y sigue siendo interactivo.
- Mientras el drawer está cerrado en móvil, `<aside data-sidebar>` recibe el
  atributo `inert`: sus enlaces quedan fuera del orden de tabulación y del
  árbol de accesibilidad. Al abrirlo se retira `inert` del drawer y se aplica
  a `.page-shell` (el contenido de fondo), que vuelve a ser interactivo al
  cerrar.
- Al abrir el drawer, el foco inicial se mueve al primer enlace de la
  navegación (`Inicio`).
- Cierre con `Escape` o con clic en el scrim, ambos con retorno de foco al
  botón. Cierre también al hacer clic en un enlace de navegación en modo
  móvil; el manejador usa `event.target.closest('a')` para reconocer clics
  sobre el texto, el ícono SVG o el propio enlace.
- **Frontera de foco móvil**: `.skip-link` vive fuera de `.page-shell` (es
  hermano de `.app-shell` dentro de `<body>`), así que aplicarle `inert`
  solo a `.page-shell` no bastaba para evitar que `Shift+Tab` desde el botón
  alcanzara el skip-link mientras el drawer estaba abierto. Ahora
  `.skip-link` también recibe `inert` mientras el drawer está abierto. Además
  se agregó una trampa de foco real: mientras el drawer está abierto,
  `Tab` desde el último enlace del drawer vuelve al botón hamburguesa, y
  `Shift+Tab` desde el botón vuelve al último enlace; así el recorrido por
  teclado queda contenido entre el botón y el drawer sin poder salir hacia
  contenido exterior ni caer fuera del documento.
- **Foco al seleccionar una sección**: al hacer clic en un enlace de
  navegación en modo móvil, además de cerrar el drawer, el foco se mueve a
  la sección de destino (cada `<section>` ancla tiene `tabindex="-1"`) si
  existe en la página actual; si el enlace apunta a otra página o a una
  sección ausente, el foco vuelve al botón hamburguesa en su lugar.
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

## Evidencia visual — seguimiento PR #14

La entrega anterior de este documento afirmaba que no era posible generar
capturas reales porque el entorno de ejecución carecía de un navegador
headless. Eso ya no es exacto: `npx playwright` descarga Chromium
correctamente, y aunque este entorno sandbox no tiene instaladas (ni permite
instalar mediante `apt-get install`, por falta de `sudo`) las bibliotecas
compartidas que Chromium requiere en tiempo de ejecución
(`libnspr4`, `libnss3`, `libnssutil3`, `libsmime3`, `libasound.so.2`,
`libgbm.so.1`, `libwayland-server.so.0`, `libxcb-randr.so.0`), fue posible
obtenerlas sin privilegios de root con `apt-get download` (que solo
descarga el `.deb`, sin instalarlo en el sistema) y extraerlas con
`dpkg-deb -x` a un directorio temporal fuera del repositorio, apuntando
`LD_LIBRARY_PATH` a esa carpeta al lanzar Chromium. Con eso, sí fue posible
levantar `astro preview` y generar capturas reales con Playwright contra el
sitio construido.

Capturas generadas (`docs/evidence/pr14-followup/`), todas contra el **build
de producción real** (`CONTENT_PREVIEW` deshabilitado) con Chromium headless
sin extensiones (el binario de Playwright no carga ninguna por defecto):

- `desktop-1440x900.png` — portada en escritorio.
- `tablet-768x1024.png` — portada en tablet.
- `mobile-390x844-cerrado.png` — móvil con el drawer cerrado.
- `mobile-390x844-abierto.png` — móvil con el drawer abierto.
- `proyectos.png` — sección Proyectos con la tarjeta "Este portafolio".
- `caso-portafolio-personal.png` — página completa del caso "Este
  portafolio" (ahora pública en `/proyectos/portafolio-personal/`).

Ahora que "Este portafolio" pasó a `public`/`approved` (ver
[`docs/content-visibility-matrix.md`](../content-visibility-matrix.md)), el
build de producción **sí tiene** sección de Proyectos y el elemento de menú
correspondiente; las capturas de arriba lo reflejan. Fortinet, SFPC y el
resto de casos siguen en `preview`, así que Credenciales y "Formación y
credenciales" siguen ausentes — no hay capturas `PREVIEW-SOLO-*` en esta
ronda porque no queda contenido pendiente que capturar solo para revisión.

Comprobaciones automatizadas ejecutadas sobre el build de producción real
(no son capturas, sino aserciones sobre el DOM y la consola):

- **Consola limpia**: cero mensajes `console.error`, `console.warning`,
  `pageerror` o `requestfailed` en ninguna navegación ni interacción,
  incluida la navegación directa por hash y por teclado descritas abajo.
- **Menú de producción correcto**: los enlaces del menú son exactamente
  Inicio, Perfil, Experiencia, Proyectos, Herramientas y Contacto (sin
  Formación y credenciales).
- **Drawer cerrado no tabulable**: `<aside data-sidebar>` recibe el atributo
  `inert` mientras está cerrado en móvil.
- **Fondo inerte al abrir**: `.page-shell` y `.skip-link` reciben `inert`
  mientras el drawer está abierto.
- **Foco inicial dentro del menú**: al abrir, el foco cae en el primer
  enlace de navegación (`Inicio`).
- **Trampa de foco**: con el drawer abierto, `Tab` desde el último enlace
  (`Contacto`) mueve el foco al botón hamburguesa; `Shift+Tab` desde el
  botón mueve el foco de vuelta al último enlace.
- **Escape con retorno de foco**: `Escape` cierra el drawer
  (`aria-expanded=false`) y devuelve el foco al botón hamburguesa.
- **Navegación por teclado a Proyectos, en móvil**: con el drawer abierto,
  se recorrió la navegación con `Tab` hasta el enlace "Proyectos" y se
  activó con `Enter`; el drawer se cerró y el foco quedó en `#proyectos`.
- **Navegación por teclado a Proyectos, en escritorio**: partiendo del
  monograma "CC", se recorrió con `Tab` hasta "Proyectos" y se activó con
  `Enter`; la URL resultante fue `.../#proyectos`.
- **Navegación directa por hash**: se navegó directamente a `/#inicio`,
  `/#perfil`, `/#experiencia`, `/#proyectos`, `/#herramientas` y
  `/#contacto` (las seis secciones presentes en este build); en los seis
  casos la sección correspondiente queda dentro del viewport tras la carga,
  sin errores de consola. También se confirmó que `#credenciales` no existe
  en el DOM de este build.

El script usado (`capture-evidence-round3.mjs`) no forma parte del
repositorio: es una herramienta de verificación puntual para esta revisión,
no un artefacto de producción. Si se desea repetirlo, requiere Playwright y
las bibliotecas de Chromium indicadas arriba; ninguna de las dos cosas se
agregó como dependencia del proyecto.

Puntos que siguen requiriendo verificación visual humana antes de aprobar
esta parte de la PR (las aserciones automatizadas no sustituyen el juicio
del Consejo sobre legibilidad, jerarquía visual o sensación general):

1. Que la paleta obligatoria se perciba correctamente en las capturas.
2. Contraste y comodidad de lectura en dispositivos reales (las capturas son
   de un viewport emulado, no de hardware físico).
3. Navegación completa por teclado más allá de los puntos verificados
   arriba (Tab/Shift+Tab a través de todos los enlaces).
