# Matriz de visibilidad de contenido

Estado correspondiente al issue #5. La matriz describe qué puede incluir el build
normal y qué requiere el modo explícito `CONTENT_PREVIEW=true`.

| Grupo                    | Contenido                                        | Visibilidad | Validación | OPSEC          | Autorización   | Build normal |
| ------------------------ | ------------------------------------------------ | ----------- | ---------- | -------------- | -------------- | ------------ |
| Perfil                   | Identidad, posicionamiento y métricas aprobadas  | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Trayectoria              | Tres responsabilidades profesionales sanitizadas | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Especialidades           | Cuatro capacidades profesionales                 | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Tecnologías              | Cuatro grupos sin porcentajes                    | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Contacto                 | Correo, LinkedIn, GitHub y Credly                | `public`    | `approved` | `not-required` | `not-required` | Sí           |
| Casos                    | Portal CSIRT                                     | `preview`   | `draft`    | `pending`      | `pending`      | No           |
| Casos                    | Concentrador de Plataformas                      | `preview`   | `draft`    | `pending`      | `pending`      | No           |
| Casos                    | NFCores                                          | `preview`   | `draft`    | `not-required` | `not-required` | No           |
| Educación                | Ingeniería en Ciberseguridad                     | `preview`   | `verified` | `pending`      | `not-required` | No           |
| Educación                | Diplomado en Gestión de Ciberseguridad           | `preview`   | `verified` | `pending`      | `not-required` | No           |
| Educación                | Técnico de Nivel Superior en Telecomunicaciones  | `preview`   | `verified` | `pending`      | `not-required` | No           |
| Credencial               | Fortinet Certified Fundamentals                  | `preview`   | `verified` | `not-required` | `not-required` | No           |
| Credencial               | SFPC                                             | `preview`   | `verified` | `not-required` | `not-required` | No           |
| Formación complementaria | Desarrollo Full Stack JavaScript, en curso       | `preview`   | `verified` | `not-required` | `not-required` | No           |
| Privado                  | Ninguna entrada activa                           | `private`   | —          | —              | —              | No           |

Todos los grupos estructurados que llegan a la página principal se filtran mediante
`isVisibleContent`. La sección de proyectos y la sección de formación no se
renderizan cuando no contienen entradas elegibles. La navegación y las acciones
también omiten anclas a secciones ausentes.

El script `scripts/verify-production-content.mjs` revisa el HTML y sitemap
generados. Bloquea títulos y slugs no públicos de Content Collections y los
marcadores de educación, credenciales y formación complementaria.
