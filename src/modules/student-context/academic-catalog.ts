export interface CatalogSubject {
  key: string;
  code: string | null;
  name: string;
  credits: number;
  period: number;
  prerequisites?: string[];
}

export interface AcademicProgramCatalog {
  key: string;
  name: string;
  degreeType: string;
  totalCredits: number;
  periods: number;
  sourceUrl: string;
  subjects: CatalogSubject[];
}

export interface InstitutionCatalog {
  key: string;
  name: string;
  shortName: string;
  country: string;
  websiteUrl: string;
  programs: AcademicProgramCatalog[];
}

const itlaSoftwareSubjects: CatalogSubject[] = [
  { key: "TI-101", code: "TI-101", name: "Fundamentos del computador", credits: 4, period: 1 },
  { key: "TDS-001", code: "TDS-001", name: "Introducción a la elaboración de Algoritmos", credits: 4, period: 1 },
  { key: "HIS-101", code: "HIS-101", name: "Historia Universal", credits: 3, period: 1 },
  { key: "ESP-101", code: "ESP-101", name: "Redacción Castellana", credits: 4, period: 1 },
  { key: "MAT-001", code: "MAT-001", name: "Pre-cálculo", credits: 5, period: 1 },
  { key: "OAI-001", code: "OAI-001", name: "Orientación Institucional", credits: 1, period: 1 },
  { key: "CBG-110", code: "CBG-110", name: "Ética 1", credits: 3, period: 1 },
  { key: "ING-001", code: "ING-001", name: "Inglés Nivel 1-3", credits: 0, period: 1 },

  { key: "HIS-102", code: "HIS-102", name: "Historia Dominicana", credits: 3, period: 2, prerequisites: ["HIS-101"] },
  { key: "MAT-101", code: "MAT-101", name: "Cálculo Diferencial", credits: 5, period: 2, prerequisites: ["MAT-001"] },
  { key: "TI-115", code: "TI-115", name: "Contabilidad Financiera", credits: 4, period: 2, prerequisites: ["MAT-001"] },
  { key: "ING-002", code: "ING-002", name: "Inglés Nivel 4-6", credits: 0, period: 2, prerequisites: ["ING-001"] },
  { key: "TDS-002", code: "TDS-002", name: "Fundamentos de programación", credits: 4, period: 2, prerequisites: ["TI-101", "TDS-001"] },
  { key: "CBG-115", code: "CBG-115", name: "Ética 2", credits: 3, period: 2, prerequisites: ["CBG-110"] },
  { key: "TDS-101", code: "TDS-101", name: "Introducción a las bases de Datos", credits: 4, period: 2, prerequisites: ["TDS-001"] },

  { key: "CBG-210", code: "CBG-210", name: "Probabilidad y estadística", credits: 3, period: 3, prerequisites: ["MAT-101"] },
  { key: "TDS-003", code: "TDS-003", name: "Programación I", credits: 4, period: 3, prerequisites: ["TDS-002", "TDS-101"] },
  { key: "TDS-004", code: "TDS-004", name: "Análisis y Diseño de Sistemas", credits: 4, period: 3, prerequisites: ["TDS-002"] },
  { key: "MAT-102", code: "MAT-102", name: "Cálculo Integral", credits: 5, period: 3, prerequisites: ["MAT-101"] },
  { key: "FIS-110", code: "FIS-110", name: "Física General", credits: 4, period: 3, prerequisites: ["MAT-101"] },
  { key: "FIS-110-L", code: "FIS-110-L", name: "Laboratorio Física General", credits: 1, period: 3, prerequisites: ["MAT-101"] },
  { key: "ING-003", code: "ING-003", name: "Inglés Nivel 7-9", credits: 0, period: 3, prerequisites: ["ING-002"] },
  { key: "CBG-120", code: "CBG-120", name: "Ética 3", credits: 3, period: 3, prerequisites: ["CBG-115"] },

  { key: "TDS-005", code: "TDS-005", name: "Diseño Centrado en el usuario", credits: 4, period: 4, prerequisites: ["TDS-003", "TDS-004"] },
  { key: "CBG-215", code: "CBG-215", name: "Metodología de la Investigación", credits: 3, period: 4, prerequisites: ["CBG-210"] },
  { key: "TDS-102", code: "TDS-102", name: "Base de Datos Avanzada", credits: 4, period: 4, prerequisites: ["TDS-101", "TDS-002"] },
  { key: "TDS-006", code: "TDS-006", name: "Programación II", credits: 4, period: 4, prerequisites: ["TDS-003", "TDS-004"] },
  { key: "TDS-201", code: "TDS-201", name: "Inteligencia Artificial", credits: 4, period: 4, prerequisites: ["TDS-003", "TDS-004", "CBG-210"] },
  { key: "ING-004", code: "ING-004", name: "Inglés Nivel 10-12", credits: 0, period: 4, prerequisites: ["ING-003"] },

  { key: "TDS-301", code: "TDS-301", name: "Auditoría Informática", credits: 4, period: 5, prerequisites: ["TDS-102", "TDS-006"] },
  { key: "TDS-007", code: "TDS-007", name: "Programación III", credits: 4, period: 5, prerequisites: ["TDS-005", "TDS-006", "TDS-102"] },
  { key: "TDS-103", code: "TDS-103", name: "Minería de Datos e Inteligencia de Negocios", credits: 4, period: 5, prerequisites: ["TDS-102", "TDS-006"] },
  { key: "TME-001", code: "TME-001", name: "Fundamentos de Electrónica", credits: 4, period: 5, prerequisites: ["MAT-001"] },
  { key: "TME-001-L", code: "TME-001-L", name: "Laboratorio Fundamentos de Electrónica", credits: 1, period: 5, prerequisites: ["MAT-001"] },
  { key: "TDS-008", code: "TDS-008", name: "Programación Web", credits: 4, period: 5, prerequisites: ["TDS-102", "TDS-003"] },
  { key: "ITLA-SW-ELECTIVE-5", code: null, name: "Electiva", credits: 3, period: 5 },

  { key: "TDS-009", code: "TDS-009", name: "Programación Paralela", credits: 4, period: 6, prerequisites: ["TDS-102", "TDS-006"] },
  { key: "TDS-303", code: "TDS-303", name: "Introducción a la ingeniería de software", credits: 4, period: 6, prerequisites: ["TDS-007", "TDS-103"] },
  { key: "ITLA-SW-ELECTIVE-6", code: null, name: "Electiva", credits: 3, period: 6, prerequisites: ["TDS-301"] },
  { key: "DEP-101", code: "DEP-101", name: "Educación Física", credits: 0, period: 6 },
  { key: "ADM-110", code: "ADM-110", name: "Desarrollo de Emprendedores", credits: 3, period: 6, prerequisites: ["CBG-215"] },
  { key: "ING-110", code: "ING-110", name: "Inglés Técnico", credits: 4, period: 6, prerequisites: ["ING-004"] },

  { key: "TDS-010", code: "TDS-010", name: "Estructura de Datos", credits: 4, period: 7, prerequisites: ["TDS-007"] },
  { key: "TDS-302", code: "TDS-302", name: "Administración de Proyectos de Software", credits: 4, period: 7, prerequisites: ["TDS-007"] },
  { key: "TDS-011", code: "TDS-011", name: "Introducción al desarrollo de aplicaciones móviles", credits: 4, period: 7, prerequisites: ["TDS-007"] },
  { key: "ADM-111", code: "ADM-111", name: "Plan de Negocios", credits: 3, period: 7, prerequisites: ["ADM-110"] },
  { key: "TDS-601", code: "TDS-601", name: "Proyecto Final TDS", credits: 3, period: 7, prerequisites: ["TDS-009", "TDS-303"] },
];

export const academicCatalog: InstitutionCatalog[] = [
  {
    key: "itla",
    name: "Instituto Tecnológico de Las Américas",
    shortName: "ITLA",
    country: "República Dominicana",
    websiteUrl: "https://itla.edu.do/",
    programs: [
      {
        key: "itla-software",
        name: "Tecnólogo en Desarrollo de Software",
        degreeType: "Técnico Superior",
        totalCredits: 150,
        periods: 7,
        sourceUrl: "https://itla.edu.do/wp-content/uploads/2025/09/Plan-de-estudio-software.pdf",
        subjects: itlaSoftwareSubjects,
      },
    ],
  },
];

export const findInstitution = (institutionKey: string) =>
  academicCatalog.find((institution) => institution.key === institutionKey);

export const findProgram = (institutionKey: string, programKey: string) =>
  findInstitution(institutionKey)?.programs.find((program) => program.key === programKey);
