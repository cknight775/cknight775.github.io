# Evidencia de página principal — issue #5

> **Documento histórico.** Las capturas referenciadas corresponden a la
> cabecera horizontal (`Header.astro`), retirada en favor de la barra
> lateral documentada en `docs/ux/sidebar-navigation.md`. El comportamiento
> descrito sobre visibilidad de secciones y contenido sigue vigente.

Implementación para revisión del Consejo. No autoriza merge, despliegue ni
publicación.

## Capturas del build normal

- `docs/evidence/homepage/homepage-mobile-390x844.jpg`
- `docs/evidence/homepage/homepage-desktop-988x900.jpg`

Las capturas corresponden al build normal: proyectos, educación, credenciales y
formación complementaria no aparecen porque permanecen en `preview`.

## Comportamiento comprobado

- El encabezado omite enlaces a secciones que no se renderizan.
- Las acciones públicas apuntan a LinkedIn y GitHub verificados.
- No se presenta un botón de CV hasta que el activo sanitizado sea aprobado en
  #10.
- La trayectoria explicita la concurrencia de responsabilidades iniciadas en 2019
  y 2021.
- No se publica teléfono, dirección física, contenido institucional no autorizado
  ni indicadores sin respaldo.
- La página conserva contenido y navegación esenciales sin JavaScript; el script
  del menú móvil es una mejora progresiva.

La matriz completa de publicación se encuentra en
`docs/content-visibility-matrix.md`.
