import {
  contactSchema,
  credentialSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  specialtySchema,
  technologySchema,
  trainingSchema,
} from './schemas';

const publicReview = () => ({
  validation: 'approved' as const,
  visibility: 'public' as const,
  status: 'active' as const,
  opsec: 'not-required' as const,
  institutionalAuthorization: 'not-required' as const,
  repositoryPublication: 'not-required' as const,
  sanitized: true,
  verifiedLinks: [],
  lastReviewed: '2026-08-21',
});

export const profile = profileSchema.parse({
  name: 'Cristóbal Catalán Guerrero',
  shortName: 'Cristóbal Catalán',
  eyebrow: 'Ciberseguridad · Concientización · Desarrollo seguro',
  positioning:
    'Especialista en ciberseguridad que combina operaciones SOC, liderazgo en concientización y desarrollo de plataformas full-stack para entornos críticos.',
  summary:
    'Transformo necesidades complejas de seguridad en operaciones, contenidos y productos digitales claros, seguros y mantenibles.',
  location: 'Santiago, Chile',
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
  review: {
    validation: 'approved',
    visibility: 'public',
    status: 'active',
    opsec: 'not-required',
    institutionalAuthorization: 'not-required',
    repositoryPublication: 'not-required',
    sanitized: true,
    verifiedLinks: [
      { label: 'GitHub', url: 'https://github.com/cknight775' },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/crist%C3%B3bal-catal%C3%A1n-guerrero-5a2299183',
      },
      {
        label: 'Credly',
        url: 'https://www.credly.com/users/cristobal-catalan',
      },
    ],
    lastReviewed: '2026-08-21',
  },
});

export const experience = [
  {
    period: '2021 — Actualidad',
    title: 'Jefe de Concientización en Ciberseguridad',
    description:
      'Dirección de un equipo de cinco personas, campañas y formación para audiencias institucionales.',
    concurrent: true,
    review: publicReview(),
  },
  {
    period: '2019 — Actualidad',
    title: 'Analista de Amenazas y Respuesta a Incidentes',
    description:
      'Monitoreo, correlación y respuesta en operaciones SOC dentro de un entorno crítico.',
    concurrent: true,
    review: publicReview(),
  },
  {
    period: '2020 — 2021',
    title: 'Administrador de Sitios Web',
    description:
      'Administración de servidores, portales educativos y mantenimiento de soluciones web.',
    concurrent: false,
    review: publicReview(),
  },
].map((item) => experienceSchema.parse(item));

export const education = [
  {
    program: 'Ingeniería en Ciberseguridad',
    institution: 'Instituto Profesional San Sebastián',
    period: '2019 — 2022',
    review: {
      validation: 'verified',
      visibility: 'preview',
      status: 'completed',
      opsec: 'pending',
      institutionalAuthorization: 'not-required',
      repositoryPublication: 'approved',
      sanitized: true,
      verifiedLinks: [],
      lastReviewed: '2026-08-21',
    },
  },
  {
    program: 'Diplomado en Gestión de Ciberseguridad',
    institution: 'Academia Politécnica Militar',
    period: '2022',
    review: {
      validation: 'verified',
      visibility: 'preview',
      status: 'completed',
      opsec: 'pending',
      institutionalAuthorization: 'not-required',
      repositoryPublication: 'approved',
      sanitized: true,
      verifiedLinks: [],
      lastReviewed: '2026-08-21',
    },
  },
  {
    program: 'Técnico de Nivel Superior en Telecomunicaciones',
    institution: 'Escuela de Telecomunicaciones del Ejército de Chile',
    period: '2017 — 2018',
    review: {
      validation: 'verified',
      visibility: 'preview',
      status: 'completed',
      opsec: 'pending',
      institutionalAuthorization: 'not-required',
      repositoryPublication: 'approved',
      sanitized: true,
      verifiedLinks: [],
      lastReviewed: '2026-08-21',
    },
  },
].map((item) => educationSchema.parse(item));

export const certifications = [
  {
    name: 'Fortinet Certified Fundamentals in Cybersecurity',
    issuer: 'Fortinet',
    year: 2024,
    review: {
      validation: 'verified',
      visibility: 'preview',
      status: 'obtained',
      opsec: 'not-required',
      institutionalAuthorization: 'not-required',
      repositoryPublication: 'not-required',
      sanitized: true,
      verifiedLinks: [],
      lastReviewed: '2026-09-10',
    },
  },
  {
    name: 'Scrum Foundation Professional Certification (SFPC)',
    issuer: 'CertiProf',
    year: 2024,
    review: {
      validation: 'verified',
      visibility: 'preview',
      status: 'obtained',
      opsec: 'not-required',
      institutionalAuthorization: 'not-required',
      repositoryPublication: 'not-required',
      sanitized: true,
      verifiedLinks: [],
      lastReviewed: '2026-09-10',
    },
  },
].map((item) => credentialSchema.parse(item));

export const complementaryTraining = [
  {
    name: 'Desarrollo Full Stack JavaScript',
    issuer: 'Desafío Latam',
    year: 2026,
    review: {
      validation: 'verified',
      visibility: 'preview',
      status: 'in-progress',
      opsec: 'not-required',
      institutionalAuthorization: 'not-required',
      repositoryPublication: 'not-required',
      sanitized: true,
      verifiedLinks: [],
      lastReviewed: '2026-08-21',
    },
  },
].map((item) => trainingSchema.parse(item));

export const contact = contactSchema.parse({
  links: profile.links,
  excludes: ['phone', 'physicalAddress'],
  review: {
    ...publicReview(),
    verifiedLinks: profile.review.verifiedLinks,
  },
});

export const contentGovernance = {
  locale: 'es',
  futureLocales: [] as const,
  education: {
    validation: 'verified',
    visibility: 'preview',
    repositoryPublication: 'approved',
  },
  certifications: {
    validation: 'verified',
    visibility: 'preview',
    repositoryPublication: 'not-required',
  },
  complementaryTraining: {
    validation: 'verified',
    visibility: 'preview',
    repositoryPublication: 'not-required',
  },
} as const;

export const specialties = [
  {
    number: '01',
    title: 'Operaciones de ciberseguridad',
    description:
      'Monitoreo, detección, correlación y respuesta a incidentes en entornos SOC.',
    tags: ['Blue Team', 'SIEM', 'EDR/XDR'],
    review: publicReview(),
  },
  {
    number: '02',
    title: 'Concientización y comunicación',
    description:
      'Programas, campañas y charlas que convierten amenazas complejas en acciones comprensibles.',
    tags: ['Cultura', 'Formación', 'Comunicación'],
    review: publicReview(),
  },
  {
    number: '03',
    title: 'Desarrollo full-stack seguro',
    description:
      'Plataformas web que responden a necesidades operacionales dentro de entornos críticos.',
    tags: ['React', 'TypeScript', 'Node.js'],
    review: publicReview(),
  },
  {
    number: '04',
    title: 'Liderazgo técnico',
    description:
      'Coordinación de equipos y trabajo transversal entre seguridad, contenido y tecnología.',
    tags: ['Equipo', 'Estrategia', 'Ejecución'],
    review: publicReview(),
  },
].map((item) => specialtySchema.parse(item));

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
    review: publicReview(),
  },
  {
    title: 'Desarrollo',
    items: ['React', 'TypeScript', 'Vite', 'Node.js', 'Express'],
    review: publicReview(),
  },
  {
    title: 'Datos y sistemas',
    items: ['PostgreSQL', 'Prisma ORM', 'Linux', 'Windows Server', 'Git'],
    review: publicReview(),
  },
  {
    title: 'Gestión',
    items: [
      'Concientización',
      'Liderazgo',
      'Comunicación técnica',
      'Formación',
    ],
    review: publicReview(),
  },
].map((item) => technologySchema.parse(item));
