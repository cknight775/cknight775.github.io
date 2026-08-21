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

Se fijó explícitamente `sharp 0.35.3` mediante `overrides` en `package.json` y se
regeneró el lockfile. No se ejecutó `npm audit fix` ni `npm audit fix --force`.

La remediación debe considerarse válida únicamente cuando se cumpla todo lo
siguiente:

- `npm ls sharp` resuelve exactamente `0.35.3`.
- `npm audit --omit=dev --audit-level=high` finaliza sin vulnerabilidades.
- `astro check` y `astro build` continúan funcionando.
- CI ejecuta las mismas comprobaciones desde un `npm ci` limpio.

No se requiere excepción temporal porque existe una versión correctiva
compatible. Esta decisión deberá revisarse si Astro modifica su rango aceptado o
si un advisory nuevo afecta a `sharp 0.35.3`.

