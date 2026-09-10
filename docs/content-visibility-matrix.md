# Matriz de visibilidad de contenido

Estado correspondiente al issue #5. La matriz describe qué puede incluir el build
normal y qué requiere el modo explícito `CONTENT_PREVIEW=true`.

| Grupo                    | Contenido                                                            | Visibilidad | Validación | OPSEC          | Autorización   | Build normal |
| ------------------------ | -------------------------------------------------------------------- | ----------- | ---------- | -------------- | -------------- | ------------ |
| Perfil                   | Identidad, posicionamiento y métricas aprobadas                      | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Trayectoria              | Tres responsabilidades profesionales sanitizadas                     | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Especialidades           | Cuatro capacidades profesionales                                     | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Tecnologías              | Cuatro grupos sin porcentajes                                        | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Contacto                 | LinkedIn, GitHub y Credly (sin correo)                               | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Casos                    | Este portafolio (concepto aceptado, contenido pendiente de revisión) | `preview`   | `draft`    | `not-required` | `not-required` | No           |
| Casos                    | Portal CSIRT                                                         | `preview`   | `draft`    | `pending`      | `pending`      | No           |
| Casos                    | Concentrador de Plataformas                                          | `preview`   | `draft`    | `pending`      | `pending`      | No           |
| Casos                    | NFCores                                                              | `preview`   | `draft`    | `not-required` | `not-required` | No           |
| Educación                | Ingeniería en Ciberseguridad                                         | `preview`   | `verified` | `pending`      | `not-required` | No           |
| Educación                | Diplomado en Gestión de Ciberseguridad                               | `preview`   | `verified` | `pending`      | `not-required` | No           |
| Educación                | Técnico de Nivel Superior en Telecomunicaciones                      | `preview`   | `verified` | `pending`      | `not-required` | No           |
| Credencial               | Fortinet Certified Fundamentals (sin URL de insignia individual)     | `preview`   | `verified` | `not-required` | `not-required` | No           |
| Credencial               | SFPC (sin URL de insignia individual)                                | `preview`   | `verified` | `not-required` | `not-required` | No           |
| Formación complementaria | Desarrollo Full Stack JavaScript, en curso                           | `preview`   | `verified` | `not-required` | `not-required` | No           |
| Privado                  | Ninguna entrada activa                                               | `private`   | —          | —              | —              | No           |

Todos los grupos estructurados que llegan a la página principal se filtran mediante
`isVisibleContent`. La sección de proyectos y la sección de formación no se
renderizan cuando no contienen entradas elegibles. La navegación y las acciones
también omiten anclas a secciones ausentes.

El script `scripts/verify-production-content.mjs` revisa el HTML y sitemap
generados. Bloquea títulos y slugs no públicos de Content Collections y los
marcadores de educación, credenciales y formación complementaria.

## Actualización — PR #14 (Track B)

- El esquema de proyectos se extendió con `period`, `status`, `outcome`,
  `publicLinks` (opcional) y `evidence` (opcional, `alt` obligatorio). Estos
  campos son descriptivos y no alteran las puertas de `review`; los tres
  casos existentes mantienen exactamente los mismos estados de
  `validation`/`visibility`/`opsec`/`institutionalAuthorization` que en la
  tabla anterior.
- Las credenciales (certificaciones y formación complementaria) admiten un
  `verificationUrl` opcional; no se agregó a educación ni se publican
  números de certificado.
- La barra lateral (`docs/ux/sidebar-navigation.md`) reemplaza la cabecera
  horizontal. Los anclajes `#inicio` y `#herramientas` se agregaron a las
  secciones correspondientes; la lógica de omitir enlaces a secciones sin
  contenido elegible (proyectos, credenciales) no cambió.
- NFCores permanece en `preview`/`draft`: no se cuenta con catálogo ni
  enlaces públicos verificados todavía, por lo que no se promovió a
  `public`/`approved` en esta entrega (ver "Decisiones pendientes del
  propietario" en la entrega de la PR).

## Actualización — seguimiento PR #14 (correcciones del Consejo)

- Se eliminó el correo de contacto de la página pública; `contactSchema` y
  `profileSchema` ya no incluyen el campo `email`. El botón de contacto y los
  enlaces sociales apuntan únicamente a LinkedIn, GitHub y Credly. Esta parte
  quedó aprobada y no se revirtió.
- Se agregó un nuevo caso (`portafolio-personal.json`, slug
  `portafolio-personal`): "Este portafolio". El concepto está aceptado, pero
  permanece en `preview`/`draft` — no se publica todavía — hasta que el
  Consejo revise el contenido exacto (resultado, estado y enlaces) y
  confirme que no exagera el estado actual del sitio. No es un caso
  institucional. Portal CSIRT, Concentrador de Plataformas y NFCores no se
  tocaron.
- **Revertido**: en una primera pasada se habían promovido ambas
  certificaciones (Fortinet Certified Fundamentals y SFPC) a
  `public`/`approved` usando el perfil general de Credly como
  `verificationUrl`. El Consejo indicó que un enlace de perfil general no
  constituye evidencia individual verificable por insignia, así que ambas
  volvieron a `preview`/`verified`, sin `verificationUrl` ni botón
  "Verificar". Publicarlas requiere la URL pública de cada insignia
  individual; no se dispone de esas URLs en este momento. Como consecuencia,
  la sección de Credenciales y el elemento de navegación "Formación y
  credenciales" vuelven a estar ausentes del build de producción, igual que
  antes de esta ronda — queda pendiente hasta contar con evidencia
  verificable por insignia.
- `scripts/verify-production-content.mjs` mantiene los nombres de ambas
  certificaciones en `structuredNonPublicMarkers`, ya que siguen sin ser
  contenido público.
- Como ni "Este portafolio" ni ningún otro caso está en `public`, la sección
  Proyectos y el elemento "Proyectos" del menú también están ausentes del
  build de producción actual (`projects.length === 0`).
