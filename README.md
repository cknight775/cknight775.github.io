# Portafolio profesional de Cristóbal Catalán

Reconstrucción del portafolio profesional con Astro y TypeScript. El sitio está orientado principalmente a reclutamiento y presenta casos de estudio sanitizados sobre ciberseguridad, concientización y desarrollo de plataformas.

## Desarrollo local

```bash
npm ci
npm run dev
```

`npm ci` instala exactamente lo fijado en `package-lock.json`; úsalo también en
lugar de `npm install` al preparar un entorno de revisión o CI.

## Validación

```bash
npm run format
npm run check:secrets
npm run build
npm run check:production-content
npm audit --omit=dev --audit-level=high
```

## Vista previa con contenido en `preview`

Los casos y credenciales en estado `preview` (Portal CSIRT, Concentrador de
Plataformas, NFCores, educación, certificaciones y formación complementaria)
no se generan en el build normal. Para revisarlos localmente:

```bash
CONTENT_PREVIEW=true npm run build
CONTENT_PREVIEW=true npm run dev
```

Este modo es exclusivamente para revisión del Consejo y del propietario; no se
usa en CI de producción ni en el despliegue de GitHub Pages. El job `build` de
`.github/workflows/deploy.yml` fija explícitamente `CONTENT_PREVIEW: 'false'`,
por lo que el despliegue siempre compila con el contenido público únicamente.
`.github/workflows/validate.yml` ejecuta además un build adicional con
`CONTENT_PREVIEW=true` en cada pull request, solo para verificar que el
contenido en preview compila; ese resultado nunca se publica ni se sube como
artefacto.

## Astro y TypeScript

`tsconfig.json` analiza toda la aplicación Astro (`src/**/*`), sin
excepciones para plantillas heredadas: el sitio estático anterior
(`index.html`, `assets/`, `forms/`) fue retirado del repositorio.

## Despliegue en GitHub Pages

`.github/workflows/deploy.yml` compila el sitio y lo publica en GitHub Pages
únicamente ante un `push` a `main` ya aprobado (o `workflow_dispatch` manual).
No se ejecuta en pull requests; `.github/workflows/validate.yml` sigue siendo
la única puerta de calidad para las PR. El despliegue usa el `environment`
`github-pages`, permisos mínimos (`contents: read` en el job de build;
`pages: write` e `id-token: write` solo en el job de despliegue) y
`concurrency` para evitar despliegues simultáneos. Todas las Actions están
fijadas por SHA de commit.

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
- No publicar teléfono, dirección física ni correo electrónico.
- Los casos institucionales requieren revisión OPSEC antes del despliegue.
- La visibilidad en el sitio (`review.visibility`) y la autorización para que
  un archivo fuente sanitizado exista en este repositorio público
  (`review.repositoryPublication`) son gates independientes; ver
  [`docs/content-governance.md`](docs/content-governance.md).

El seguimiento del proyecto se mantiene en el [issue maestro #1](https://github.com/cknight775/cknight775.github.io/issues/1).
