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

`private` impide generar la entrada. `preview` permite revisarla dentro de la PR
sin declarar que está autorizada para producción. Solo `public`, junto con los
estados de aprobación aplicables, podrá utilizarse para publicación.

Los casos institucionales permanecen como borradores sanitizados, visibles
únicamente para preview, con OPSEC y autorización institucional pendientes.
NFCores no requiere revisión ni autorización institucional, pero su contenido
continúa como borrador de preview.

## Datos profesionales

`src/data/profile.ts` concentra perfil, experiencia, tecnologías, contacto,
educación y certificaciones. Educación y certificaciones permanecen como listas
vacías y privadas hasta contar con evidencia verificable; no se infieren datos.
El contacto excluye explícitamente teléfono y dirección física.

La estructura reserva `locale: es` sin publicar traducciones ni contenido en
inglés.
