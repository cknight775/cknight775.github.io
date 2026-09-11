# Estado de los gates de #9, #12 y #13

Evidencia reproducible generada contra el commit `1333d341f57c5c6767bb2200124cffeba8888a44`
(build de producción, `CONTENT_PREVIEW` deshabilitado), servido con `astro
preview` y auditado con Lighthouse, `@axe-core/playwright` y comprobaciones
manuales de enlaces vía Playwright. Ninguna herramienta usada aquí (Lighthouse,
axe-core) se agregó como dependencia del proyecto; se instalaron en un
directorio temporal fuera del repositorio solo para esta verificación.

## Lighthouse

| Página                            | Preset  | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --------------------------------- | ------- | ----------: | ------------: | ---------------: | --: |
| `/` (portada)                     | desktop |         100 |           100 |              100 | 100 |
| `/` (portada)                     | mobile  |         100 |           100 |              100 | 100 |
| `/proyectos/portafolio-personal/` | desktop |         100 |           100 |              100 | 100 |

Umbrales exigidos (rendimiento ≥90, accesibilidad ≥95, buenas prácticas ≥95,
SEO ≥95): **superados en las tres combinaciones evaluadas**, la única página
pública distinta de la portada es actualmente `/proyectos/portafolio-personal/`.

## Accesibilidad automatizada (axe-core, reglas WCAG 2.0/2.1 A y AA)

| Página                            | Violaciones | Incompletos                                     |
| --------------------------------- | ----------: | ----------------------------------------------- |
| `/`                               |           0 | 1 — `color-contrast` (17 nodos, ver nota abajo) |
| `/proyectos/portafolio-personal/` |           0 | 0                                               |

**Cero violaciones confirmadas** en ambas páginas. El único resultado
"incompleto" es el chequeo automático de contraste en la portada: axe no
puede calcularlo de forma automática cuando hay degradados de fondo
(`.hero::before`) o texto con `-webkit-text-stroke` y relleno transparente
(el span "entiende y funciona" del titular). Esos pares
de color ya se verificaron manualmente con la fórmula de contraste relativo
de WCAG en `docs/ux/implementation-evidence.md` y
`docs/ux/sidebar-navigation.md`, y todos superan 4.5:1.

Comprobación manual de accesibilidad por teclado (drawer, trampa de foco,
`Escape`, navegación directa por hash y por teclado hasta cada sección) ya
documentada en `docs/ux/sidebar-navigation.md`.

## Movimiento reducido

Verificado con `reducedMotion: 'reduce'` emulado en Chromium: la transición
del drawer pasa a `0.00001s` (la regla `@media (prefers-reduced-motion:
reduce)` de `global.css` se aplica) y `scroll-behavior` de `<html>` pasa de
`smooth` a `auto`.

## Enlaces

Todos los internos (anclas de sección, `/proyectos/portafolio-personal/`,
`#contenido`) resuelven con HTTP 200 o apuntan a un elemento existente en el
DOM. Externos:

| Enlace                                               | Resultado                                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `https://github.com/cknight775`                      | HTTP 200                                                                                                              |
| `https://github.com/cknight775/cknight775.github.io` | HTTP 200                                                                                                              |
| `https://www.credly.com/users/cristobal-catalan`     | HTTP 200                                                                                                              |
| LinkedIn (perfil del propietario)                    | HTTP 999 vía automatización (bloqueo anti-bot conocido de LinkedIn a clientes no autenticados; no indica enlace roto) |

El enlace de LinkedIn no pudo verificarse por este medio porque LinkedIn
devuelve `999` a clientes automatizados/sin sesión de forma sistemática,
independientemente del enlace. Recomendado: verificación manual del
propietario abriendo el enlace en un navegador con sesión iniciada.

## Dispositivos reales

**No verificado en este informe.** Todo lo anterior se ejecutó contra
Chromium headless emulando viewports; no sustituye una pasada en hardware
físico (iOS Safari, Android Chrome, lector de pantalla real). Pendiente de
que el propietario o el Consejo la realicen antes de la aprobación final de
#12/#13.

## Equivalente formal de lint/pruebas

Este proyecto no usa un framework de pruebas unitarias ni ESLint. Las
puertas de calidad equivalentes, ejecutadas en cada PR vía
`.github/workflows/validate.yml`, son:

- **`astro check`** (parte de `npm run build`): type-checking estricto de
  TypeScript sobre toda la aplicación (`src/**/*`), incluyendo las
  plantillas `.astro`. Cumple el rol de un linter estático: detecta props
  mal tipadas, colecciones de contenido que no cumplen su esquema Zod, y
  errores de referencia.
- **`prettier --check .`**: formato consistente, sin configuración
  discrecional por archivo.
- **`check:secrets`** y **`check:production-content`**: pruebas de política
  específicas del proyecto (ausencia de secretos; ausencia de contenido no
  público en el HTML generado), ejecutadas como scripts de Node sin
  framework de test runner.
- **`npm audit --omit=dev --audit-level=high`**: puerta de seguridad de
  dependencias.

No existe lógica de negocio con ramas condicionales complejas que
justifique un framework de pruebas unitarias adicional en este momento; si
el sitio incorpora lógica más compleja (por ejemplo, formularios con
validación), debe evaluarse agregar Vitest antes de esa función.

## Procedimiento de rollback

El despliegue (`deploy.yml`) publica en GitHub Pages únicamente desde
`main`. Para revertir una publicación problemática:

1. **Revertir el commit en `main`**: `git revert <commit-o-merge>` y `git
push origin main`. Esto dispara automáticamente un nuevo `Deploy` que
   reconstruye y publica el estado anterior. Es el método preferido: deja
   rastro en el historial y pasa de nuevo por todas las puertas de CI
   (secretos, contenido, auditoría).
2. **Alternativa de emergencia**: en la pestaña Actions, abrir la última
   ejecución exitosa de `Deploy` anterior a la problemática y usar "Re-run
   all jobs". Esto reconstruye desde el commit de esa ejecución (no desde
   `main` actual) y lo vuelve a publicar sin necesidad de un revert
   inmediato, útil si se necesita restaurar el sitio en minutos mientras se
   prepara el revert correcto.
3. En ambos casos, `concurrency: {group: pages, cancel-in-progress: false}`
   ya impide que dos despliegues se pisen entre sí.
4. No se han creado backups adicionales del artefacto: GitHub Pages sirve
   siempre el último despliegue exitoso, y el historial de despliegues es
   visible en Settings → Pages y en la pestaña Environments → github-pages.

## Revisión OPSEC y aprobación final

Pendiente de registro formal. Esta ronda promovió únicamente contenido no
institucional ("Este portafolio"); Portal CSIRT, Concentrador de
Plataformas, NFCores, educación, Fortinet y SFPC permanecen sin promover y
sin cambios en sus estados de OPSEC. El cierre de #9 requiere que el
propietario registre explícitamente la aprobación final, no solo la
ausencia de cambios pendientes.
