# Gobierno de contenido

La fuente de verdad de los casos de estudio vive en
`src/content/projects/*.json`. Astro valida cada entrada durante la sincronización
de contenido y el build mediante `src/content.config.ts`.

## Estados

- `review.validation`: `draft`, `verified` o `approved`.
- `review.visibility`: `private`, `preview` o `public`.
- `review.opsec`: `not-required`, `pending` o `approved`.
- `review.institutionalAuthorization`: `not-required`, `pending` o
  `approved`.
- `review.sanitized`: confirma que la entrada fue preparada para no exponer
  información sensible; no equivale por sí sola a aprobación OPSEC.

`private` impide generar la entrada. El build normal incluye exclusivamente
`public`. Una entrada pública exige `validation: approved`,
`sanitized: true` y estados OPSEC y de autorización institucional en
`approved` o `not-required`. Una combinación pública inválida falla al
sincronizar la colección.

`preview` solo se habilita explícitamente con `CONTENT_PREVIEW=true` en un
entorno de revisión. Este modo no se utiliza en CI de producción. El paso
`npm run check:production-content` inspecciona el resultado normal y falla si
detecta títulos o rutas de entradas no públicas.

Los casos institucionales permanecen como borradores sanitizados, visibles
únicamente para preview, con OPSEC y autorización institucional pendientes.
NFCores no requiere revisión ni autorización institucional, pero su contenido
continúa como borrador de preview.

## Datos profesionales

`src/data/profile.ts` concentra perfil, experiencia, tecnologías, contacto,
educación y certificaciones. Educación permanece en `preview` mientras su
OPSEC esté `pending`. Las certificaciones (Fortinet, SFPC) permanecen en
`preview`/`verified`: el perfil general de Credly no es evidencia
individual verificable por insignia, así que no se presentan como públicas
hasta contar con la URL directa de cada una. El contacto excluye
explícitamente teléfono, dirección física y correo electrónico: el único
canal de contacto público es LinkedIn (además de GitHub y Credly como
enlaces informativos).

La estructura reserva `locale: es` sin publicar traducciones ni contenido en
inglés.

## Revisión OPSEC de experiencia institucional

`src/data/profile.ts` incluye dos responsabilidades institucionales
concurrentes marcadas `opsec: 'not-required'`: "Jefe de Concientización en
Ciberseguridad" (2021—actualidad) y "Analista de Amenazas y Respuesta a
Incidentes" (2019—actualidad). Ambas se revisaron explícitamente para esta
entrega.

Se mantiene `not-required` porque ninguna de las dos entradas nombra la
institución, la unidad, herramientas operacionales, topologías, métricas
sensibles ni activos internos: describen únicamente un cargo genérico
("Institución Pública / Sector Defensa" en el currículum interno, omitido en
la página pública), el tamaño de un equipo y el tipo de función (monitoreo,
correlación, respuesta). Este nivel de generalidad es equivalente al ya
aceptado para el resto del perfil público y no requiere el mismo tratamiento
que los casos de estudio (Portal CSIRT, Concentrador de Plataformas), que sí
describen arquitectura y decisiones de producto específicas de una
institución.

Si en una futura edición estas entradas incorporan el nombre de la
institución, unidades, sistemas o cualquier detalle operacional, deben
pasar a `opsec: 'pending'` antes de publicarse.
