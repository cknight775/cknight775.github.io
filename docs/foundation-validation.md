# Evidencia de validación de Foundation

> **Documento histórico.** Corresponde a la revisión inicial del issue #2,
> antes del sidebar (`docs/ux/sidebar-navigation.md`) y de las secciones
> completas de la PR #14. La mención al "desplazamiento horizontal" de la
> navegación se refiere a una versión ya reemplazada por el menú móvil
> compacto y luego por la barra lateral; no describe el estado actual.

Este documento reúne la evidencia reproducible solicitada para la revisión final
del issue #2. La PR debe permanecer como borrador y no autoriza merge ni despliegue.

## Comandos

La validación se ejecuta con Node.js 22.19.x mediante:

```bash
npm ci
npm run format
npm run check:secrets
npm run check
npm run build
npm audit --omit=dev --audit-level=high
npm run dev -- --host 127.0.0.1
```

La prueba del servidor de desarrollo se confirma solicitando la portada y
verificando una respuesta HTTP 200. El servidor se detiene después de capturar la
evidencia; no se realiza despliegue.

## Evidencia visual

La captura `docs/evidence/mobile-home-390x844.jpg` corresponde a la portada con un
viewport de 390 × 844 px. Confirma que la navegación principal permanece accesible
en móvil. El desplazamiento horizontal de esta navegación se mantiene como mejora
de UX posterior y deberá resolverse antes de publicar.

## Revisión de secretos

`npm run check:secrets` revisa el árbol del repositorio, incluido el sitio legado,
y excluye únicamente metadatos Git, dependencias y artefactos generados. Busca
claves privadas, formatos conocidos de tokens, claves AWS, asignaciones de
credenciales y archivos `.env` privados. El resultado esperado y exigido por CI es
cero hallazgos.
