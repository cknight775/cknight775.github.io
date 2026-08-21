# Portafolio profesional de Cristóbal Catalán

Reconstrucción del portafolio profesional con Astro y TypeScript. El sitio está orientado principalmente a reclutamiento y presenta casos de estudio sanitizados sobre ciberseguridad, concientización y desarrollo de plataformas.

## Desarrollo local

```bash
npm install
npm run dev
```

## Validación

```bash
npm run format
npm run check:secrets
npm run build
```

## Alcance de Astro y TypeScript

- `tsconfig.json` limita el análisis a `.astro/types.d.ts`, `astro.config.mjs` y
  `src/**/*`, que constituyen la nueva aplicación Astro.
- `assets/**`, `forms/**`, `index.html`, `dist/**` y `node_modules/**` quedan
  excluidos. Los tres primeros pertenecen al sitio heredado que debe conservarse
  mientras la PR permanezca en borrador; se retirarán de esta excepción cuando la
  reconstrucción reemplace formalmente al sitio antiguo.
- Esta exclusión solo evita diagnósticos ajenos a Foundation. No incorpora ni
  publica código legado en la aplicación Astro.

## Alcance temporal de Prettier

- `.prettierignore` excluye dependencias y artefactos generados: `node_modules/`,
  `.npm-cache/`, `.astro/` y `dist/`.
- También excluye temporalmente `assets/`, `forms/` e `index.html`, que pertenecen
  a la plantilla heredada. Estas rutas se eliminarán cuando la reconstrucción sea
  aprobada para reemplazar el sitio actual; hasta entonces se conservan para no
  modificar el comportamiento de producción.
- Todo archivo nuevo de Astro, TypeScript, CSS, configuración y documentación sí
  queda sujeto a `npm run format`.

## Seguridad de dependencias

El análisis vigente y las decisiones de remediación se documentan en
[`docs/security/dependency-review.md`](docs/security/dependency-review.md).

## Revisión de secretos

`npm run check:secrets` inspecciona los archivos versionables del repositorio y
falla ante claves privadas, tokens conocidos, credenciales incrustadas o archivos
`.env` reales. Se permiten únicamente archivos de ejemplo sin valores privados.
El chequeo se ejecuta también en CI. Es una barrera preventiva y no sustituye la
revocación inmediata si alguna credencial llegara a exponerse.

## Reglas de contenido

- No publicar información operacional o institucional sensible.
- No incorporar métricas, certificaciones o resultados sin validación.
- No publicar teléfono ni dirección física.
- Los casos institucionales requieren revisión OPSEC antes del despliegue.

El seguimiento del proyecto se mantiene en el [issue maestro #1](https://github.com/cknight775/cknight775.github.io/issues/1).
