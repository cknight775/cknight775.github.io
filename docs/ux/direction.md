# Propuesta de arquitectura y dirección visual

Documento para revisión del Consejo. No constituye aprobación ni diseño
definitivo.

## Arquitectura propuesta

1. Hero: posicionamiento, prueba profesional y acciones principales.
2. Perfil: cuatro capacidades complementarias.
3. Trayectoria: responsabilidades concurrentes claramente señaladas.
4. Casos: Portal CSIRT, Concentrador y NFCores.
5. Tecnologías: categorías sin porcentajes.
6. Educación y credenciales verificables.
7. Contacto: correo y redes profesionales, sin formulario.

Los casos mantienen páginas independientes. NFCores utiliza un tratamiento visual
secundario para distinguir el emprendimiento de la experiencia institucional.

## Dirección visual propuesta

- Base oscura azul petróleo con superficies ligeramente elevadas.
- Acento turquesa reservado para acciones, estados y orientación.
- Tipografía sans serif de alta legibilidad; monoespaciada solo para etiquetas.
- Espaciado amplio, bordes finos y componentes sobrios.
- Movimiento reducido por defecto cuando el sistema lo solicite.
- Contraste mínimo WCAG AA en texto, controles y estados de foco.

## Navegación móvil

Se recomienda sustituir el desplazamiento horizontal por un botón compacto
`Menú` que revele las cuatro rutas en un panel vertical. Debe:

- funcionar con teclado y sin gestos especiales;
- exponer estado expandido mediante `aria-expanded`;
- conservar foco visible y objetivos táctiles de al menos 44 × 44 px;
- cerrarse al seleccionar una ruta o pulsar Escape;
- probarse a 320 × 568 y 390 × 844 px.

## Decisiones solicitadas al Consejo

1. Aprobar o ajustar la arquitectura de siete bloques.
2. Aprobar la dirección oscura con acento turquesa.
3. Aprobar el menú compacto como reemplazo de la navegación horizontal móvil.
4. Aprobar el tratamiento diferenciado de NFCores.
5. Autorizar la siguiente iteración visual en componentes reales.

La referencia visual está en `docs/ux/wireframes.svg`.
