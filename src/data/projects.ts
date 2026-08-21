export type Project = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  context: string;
  role: string;
  approach: string[];
  technologies: string[];
  notice?: string;
};

export const projects: Project[] = [
  {
    slug: 'portal-csirt',
    eyebrow: 'Caso institucional sanitizado',
    title: 'Portal CSIRT',
    summary:
      'Plataforma que organiza y distribuye contenidos, alertas y recursos de ciberseguridad desde una administración centralizada.',
    context:
      'El trabajo se desarrolló para el CSIRT de una institución del sector defensa. La información pública se limita deliberadamente a decisiones generales de producto y desarrollo.',
    role: 'Diseño y desarrollo full-stack, desde la evolución conceptual hasta una plataforma preparada para operar en infraestructura institucional.',
    approach: [
      'Centralización de contenidos y recursos en una experiencia coherente.',
      'Administración desacoplada para facilitar actualización y mantenimiento.',
      'Diseño orientado a funcionar sin depender de servicios externos.',
    ],
    technologies: ['React', 'TypeScript', 'Vite', 'Node.js', 'Express'],
    notice:
      'No se publican repositorio, capturas, topología ni detalles operacionales. El activo pertenece a la institución correspondiente.',
  },
  {
    slug: 'concentrador-plataformas',
    eyebrow: 'Caso institucional sanitizado',
    title: 'Concentrador de Plataformas',
    summary:
      'Portal que ordena el acceso a aplicaciones y servicios, con gestión de contenidos e identidad visual desde un panel administrativo.',
    context:
      'La solución respondió a una necesidad de organización y acceso dentro de un entorno institucional crítico.',
    role: 'Diseño y desarrollo completo, evolucionando desde un sitio estático hacia una aplicación full-stack con persistencia de datos.',
    approach: [
      'Arquitectura de información por secciones y subsecciones.',
      'Gestión centralizada de accesos, avisos y documentos.',
      'Persistencia y administración mediante una interfaz propia.',
    ],
    technologies: [
      'React',
      'Vite',
      'Node.js',
      'Express',
      'Prisma ORM',
      'PostgreSQL',
    ],
    notice:
      'Este caso no representa la arquitectura real ni expone servicios, accesos o controles institucionales.',
  },
  {
    slug: 'nfcores',
    eyebrow: 'Emprendimiento tecnológico',
    title: 'Ecosistema NFCores',
    summary:
      'Línea independiente de productos y experimentación tecnológica dirigida por Cristóbal.',
    context:
      'NFCores se presenta como una identidad separada del trabajo institucional y de la marca profesional personal.',
    role: 'Dirección de producto, diseño técnico y desarrollo de conceptos orientados a resolver necesidades digitales concretas.',
    approach: [
      'Exploración de productos pequeños y enfocados.',
      'Desarrollo iterativo con tecnologías web modernas.',
      'Uso de NFC únicamente cuando aporta valor real a la solución.',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'NFC'],
    notice:
      'El catálogo y los resultados se incorporarán únicamente después de validar cada producto y enlace público.',
  },
];

