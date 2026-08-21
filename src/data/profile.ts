export const profile = {
  name: 'Cristóbal Catalán Guerrero',
  shortName: 'Cristóbal Catalán',
  eyebrow: 'Ciberseguridad · Concientización · Desarrollo seguro',
  positioning:
    'Especialista en ciberseguridad que combina operaciones SOC, liderazgo en concientización y desarrollo de plataformas full-stack para entornos críticos.',
  summary:
    'Transformo necesidades complejas de seguridad en operaciones, contenidos y productos digitales claros, seguros y mantenibles.',
  location: 'Santiago, Chile',
  email: 'c.c.guerrero107@gmail.com',
  links: {
    github: 'https://github.com/cknight775',
    linkedin:
      'https://www.linkedin.com/in/crist%C3%B3bal-catal%C3%A1n-guerrero-5a2299183',
    credly: 'https://www.credly.com/users/cristobal-catalan',
  },
  metrics: [
    { value: '+7', label: 'años de experiencia' },
    { value: '5', label: 'personas lideradas' },
    { value: '2', label: 'plataformas en producción' },
  ],
  status: 'Perfil profesional verificado',
} as const;

export const experience = [
  {
    period: '2021 — Actualidad',
    title: 'Jefe de Concientización en Ciberseguridad',
    description:
      'Dirección de un equipo de cinco personas, campañas y formación para audiencias institucionales.',
    concurrent: true,
    validation: 'verified',
  },
  {
    period: '2019 — Actualidad',
    title: 'Analista de Amenazas y Respuesta a Incidentes',
    description:
      'Monitoreo, correlación y respuesta en operaciones SOC dentro de un entorno crítico.',
    concurrent: true,
    validation: 'verified',
  },
  {
    period: '2020 — 2021',
    title: 'Administrador de Sitios Web',
    description:
      'Administración de servidores, portales educativos y mantenimiento de soluciones web.',
    concurrent: false,
    validation: 'verified',
  },
] as const;

// Se mantienen vacíos hasta contar con evidencia verificable y aprobación.
export const education = [] as const;
export const certifications = [] as const;

export const contact = {
  email: profile.email,
  links: profile.links,
  visibility: 'public',
  excludes: ['phone', 'physicalAddress'],
} as const;

export const contentGovernance = {
  locale: 'es',
  futureLocales: [] as const,
  education: { validation: 'pending', visibility: 'private' },
  certifications: { validation: 'pending', visibility: 'private' },
} as const;

export const specialties = [
  {
    number: '01',
    title: 'Operaciones de ciberseguridad',
    description:
      'Monitoreo, detección, correlación y respuesta a incidentes en entornos SOC.',
    tags: ['Blue Team', 'SIEM', 'EDR/XDR'],
  },
  {
    number: '02',
    title: 'Concientización y comunicación',
    description:
      'Programas, campañas y charlas que convierten amenazas complejas en acciones comprensibles.',
    tags: ['Cultura', 'Formación', 'Comunicación'],
  },
  {
    number: '03',
    title: 'Desarrollo full-stack seguro',
    description:
      'Plataformas web que responden a necesidades operacionales dentro de entornos críticos.',
    tags: ['React', 'TypeScript', 'Node.js'],
  },
  {
    number: '04',
    title: 'Liderazgo técnico',
    description:
      'Coordinación de equipos y trabajo transversal entre seguridad, contenido y tecnología.',
    tags: ['Equipo', 'Estrategia', 'Ejecución'],
  },
] as const;

export const technologies = [
  {
    title: 'Ciberseguridad',
    items: [
      'Blue Team',
      'Respuesta a incidentes',
      'SIEM',
      'EDR/XDR',
      'Hardening',
    ],
  },
  {
    title: 'Desarrollo',
    items: ['React', 'TypeScript', 'Vite', 'Node.js', 'Express'],
  },
  {
    title: 'Datos y sistemas',
    items: ['PostgreSQL', 'Prisma ORM', 'Linux', 'Windows Server', 'Git'],
  },
  {
    title: 'Gestión',
    items: [
      'Concientización',
      'Liderazgo',
      'Comunicación técnica',
      'Formación',
    ],
  },
] as const;
