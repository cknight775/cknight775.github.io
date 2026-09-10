# Revisión de dependencias

## GHSA-f88m-g3jw-g9cj

Revisión realizada el 21 de agosto de 2026.

### Identificación

- Paquete afectado: `sharp`.
- Dependencia nativa heredada: `libvips`.
- Advisory: `GHSA-f88m-g3jw-g9cj`.
- CVE agrupados: `CVE-2026-33327`, `CVE-2026-33328`, `CVE-2026-35590` y
  `CVE-2026-35591`.
- Severidad informada por npm/GitHub: alta.
- Rango vulnerable: `sharp <0.35.0`.
- Versión encontrada inicialmente: `sharp 0.34.5`, transitiva de `astro 7.2.4`.
- Primera versión corregida: `sharp 0.35.0`.
- Versión correctiva seleccionada: `sharp 0.35.3`.

### Alcance en este proyecto

Astro declara compatibilidad con `sharp ^0.34.0 || ^0.35.0`. Sharp se utiliza
como herramienta de procesamiento de imágenes durante desarrollo o build; no se
incluye como código ejecutable en el sitio estático entregado al navegador.

La versión actual del portafolio no importa ni transforma imágenes mediante el
servicio de imágenes de Astro. Tampoco existe backend, carga de archivos o una
ruta que permita a visitantes proporcionar imágenes para procesamiento. Por lo
tanto, la posibilidad de explotación en producción era muy baja, aunque la
dependencia vulnerable sí estaba instalada en CI y en entornos de desarrollo.

### Remediación

Se ejecutó `npm audit fix` (sin `--force`) y adicionalmente se fijó
explícitamente `sharp 0.35.3` mediante `overrides` en `package.json`,
regenerando el lockfile.

La remediación debe considerarse válida únicamente cuando se cumpla todo lo
siguiente:

- `npm ls sharp` resuelve exactamente `0.35.3`.
- `npm audit --omit=dev --audit-level=high` finaliza sin vulnerabilidades.
- `astro check` y `astro build` continúan funcionando.
- CI ejecuta las mismas comprobaciones desde un `npm ci` limpio.

No se requiere excepción temporal porque existe una versión correctiva
compatible. Esta decisión deberá revisarse si Astro modifica su rango aceptado o
si un advisory nuevo afecta a `sharp 0.35.3`.

## Actualización — 9 de septiembre de 2026

Revisión realizada el 9 de septiembre de 2026, motivada por dos advisories
publicados el 8 de septiembre de 2026.

### GHSA-26w7-cxv4-gfx2 (crítico)

- Paquete afectado: `astro`.
- Descripción: ejecución remota de código a través de la optimización de
  imágenes AVIF.
- Rango vulnerable: `astro < 7.2.8`.
- Versión encontrada: `astro 7.2.4` (vulnerable).
- Versión correctiva seleccionada: `astro 7.3.2`.
- Alcance en este proyecto: el portafolio no utiliza `astro:assets`, el
  componente `<Image />` ni el endpoint `/_image`; ninguna ruta procesa
  imágenes subidas por visitantes. La explotabilidad en este proyecto era
  nula, pero la dependencia vulnerable estaba instalada.

### GHSA-rgj7-g3m4-5g8c (alto)

- Paquete afectado: `sharp` (dependencia transitiva de `astro`).
- Descripción: vulnerabilidades heredadas de `libheif`
  (`GHSA-g89c-p67h-r497` y `GHSA-2jg2-4ch7-h545`).
- Rango vulnerable: `sharp < 0.35.4`.
- Versión encontrada: `sharp 0.35.3` (vulnerable).
- Versión correctiva seleccionada: `sharp 0.35.4`.
- Alcance en este proyecto: igual que en la revisión anterior de
  `GHSA-f88m-g3jw-g9cj` — `sharp` no procesa imágenes en producción ni recibe
  entradas de visitantes.

### Nota sobre GHSA-376h-93r7-7g6f (medio)

Este advisory (bypass de autorización al eliminar el `base` configurado)
afecta a `astro <= 7.2.3`. La versión ya instalada antes de esta actualización
(`7.2.4`) ya incluía la corrección; no fue un motivo de esta actualización,
pero queda documentado por completitud al revisar el mismo rango de versiones.

### Remediación

Se ejecutó `npm audit fix` (sin `--force`), que actualizó `astro` a `7.3.2` y
fijó `sharp` a `0.35.4` mediante `overrides` en `package.json`, regenerando el
lockfile.

### Validación posterior

- `npm ls astro` resuelve `7.3.2`; `npm ls sharp` resuelve `0.35.4`.
- `npm audit --omit=dev --audit-level=high` finaliza sin vulnerabilidades.
- `npm audit --audit-level=high` (incluyendo dependencias de desarrollo)
  finaliza sin vulnerabilidades.
- `astro check` y `astro build` continúan funcionando sin errores.
