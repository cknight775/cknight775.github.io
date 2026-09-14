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

## Decisión del propietario — Paleta obligatoria

Decisión registrada para la PR #14. El propietario definió como sistema
principal, obligatorio para todo el rediseño, la paleta ya vigente en
`src/styles/global.css` (`:root`):

| Token           | Uso                    | Valor     |
| --------------- | ---------------------- | --------- |
| `--bg`          | Fondo principal        | `#08111f` |
| `--bg-soft`     | Fondo secundario       | `#0d1929` |
| `--surface`     | Superficies y tarjetas | `#111f31` |
| `--text`        | Texto principal        | `#f4f7fb` |
| `--muted`       | Texto secundario       | `#9eacbc` |
| `--accent`      | Acento turquesa        | `#4ee1b3` |
| `--accent-blue` | Acento azul (NFCores)  | `#70a5ff` |

Reglas:

- La barra lateral, la navegación activa, Portafolio, Certificaciones,
  botones, tarjetas y estados (hover, foco, activo) deben construirse sobre
  estos mismos tokens.
- Se autorizan transparencias, degradados y tonos derivados de estos valores
  (por ejemplo `rgba(78, 225, 179, 0.08)` para el estado activo del sidebar o
  `rgba(2, 6, 12, 0.6)` para el scrim del drawer móvil) cuando mejoren
  profundidad, jerarquía, hover, foco o contraste.
- No se autoriza reemplazar la identidad oscura/turquesa por otra paleta ni
  recuperar el fondo claro de la plantilla heredada (retirada de este
  repositorio).
- Todo componente nuevo (sidebar, drawer móvil, grupos de credenciales,
  cuadrícula de evidencia) reutiliza estos tokens en vez de declarar colores
  nuevos.

La combinación solicitada es: la paleta y calidad visual de este portafolio +
la barra lateral característica del sitio anterior + las secciones completas
y mejoras funcionales de la PR #14. El sidebar implementado en
`src/components/Sidebar.astro` sustituye la cabecera horizontal (`Header.astro`,
retirado) manteniendo estos mismos tokens de color.
