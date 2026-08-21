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
npm run build
```

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

## Reglas de contenido

- No publicar información operacional o institucional sensible.
- No incorporar métricas, certificaciones o resultados sin validación.
- No publicar teléfono ni dirección física.
- Los casos institucionales requieren revisión OPSEC antes del despliegue.

El seguimiento del proyecto se mantiene en el [issue maestro #1](https://github.com/cknight775/cknight775.github.io/issues/1).

