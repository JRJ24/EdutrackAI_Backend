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

const itlaNetworksSubjects: CatalogSubject[] = [
  { key: "TRI-TI-101", code: "TI-101", name: "Fundamentos del computador", credits: 4, period: 1 },
  { key: "TRI-TI-301", code: "TI-301", name: "Sistemas Operativos", credits: 3, period: 1 },
  { key: "TRI-HIS-101", code: "HIS-101", name: "Historia Universal", credits: 3, period: 1 },
  { key: "TRI-ESP-101", code: "ESP-101", name: "Redacción Castellana", credits: 4, period: 1 },
  { key: "TRI-MAT-001", code: "MAT-001", name: "Pre-cálculo", credits: 5, period: 1 },
  { key: "TRI-OAI-001", code: "OAI-001", name: "Orientación Institucional", credits: 1, period: 1 },
  { key: "TRI-CBG-110", code: "CBG-110", name: "Ética 1", credits: 3, period: 1 },
  { key: "TRI-ING-001", code: "ING-001", name: "Inglés Nivel 1-3", credits: 0, period: 1 },
  { key: "TRI-HIS-102", code: "HIS-102", name: "Historia Dominicana", credits: 3, period: 2 },
  { key: "TRI-MAT-101", code: "MAT-101", name: "Cálculo Diferencial", credits: 5, period: 2 },
  { key: "TRI-DEP-101", code: "DEP-101", name: "Educación Física", credits: 0, period: 2 },
  { key: "TRI-ING-002", code: "ING-002", name: "Inglés Nivel 4-6", credits: 0, period: 2 },
  { key: "TRI-TI-201", code: "TI-201", name: "Fundamentos de Redes", credits: 4, period: 2 },
  { key: "TRI-TI-302", code: "TI-302", name: "Sistemas Operativos II", credits: 3, period: 2 },
  { key: "TRI-TDS-001", code: "TDS-001", name: "Introducción a la elaboración de Algoritmos", credits: 4, period: 2 },
  { key: "TRI-TI-303", code: "TI-303", name: "Sistemas Operativos III", credits: 3, period: 3 },
  { key: "TRI-TI-202", code: "TI-202", name: "Fundamentos de Enrutamiento", credits: 4, period: 3 },
  { key: "TRI-TI-202-L", code: "TI-202-L", name: "Laboratorio Fundamentos de Enrutamiento", credits: 1, period: 3 },
  { key: "TRI-TDS-002", code: "TDS-002", name: "Fundamentos de programación", credits: 4, period: 3 },
  { key: "TRI-MAT-102", code: "MAT-102", name: "Cálculo Integral", credits: 5, period: 3 },
  { key: "TRI-TI-115", code: "TI-115", name: "Contabilidad Financiera", credits: 4, period: 3 },
  { key: "TRI-ING-003", code: "ING-003", name: "Inglés Nivel 7-9", credits: 0, period: 3 },
  { key: "TRI-TI-203", code: "TI-203", name: "Conmutación y Enrutamiento", credits: 4, period: 4 },
  { key: "TRI-TI-203-L", code: "TI-203-L", name: "Laboratorio Conmutación y Enrutamiento", credits: 1, period: 4 },
  { key: "TRI-CBG-210", code: "CBG-210", name: "Probabilidad y Estadística", credits: 3, period: 4 },
  { key: "TRI-TDS-101", code: "TDS-101", name: "Introducción a las Bases de Datos", credits: 4, period: 4 },
  { key: "TRI-ADM-001", code: "ADM-001", name: "Administración I", credits: 3, period: 4 },
  { key: "TRI-FIS-110", code: "FIS-110", name: "Física General", credits: 4, period: 4 },
  { key: "TRI-FIS-110-L", code: "FIS-110-L", name: "Laboratorio Física General", credits: 1, period: 4 },
  { key: "TRI-ING-004", code: "ING-004", name: "Inglés Nivel 10-12", credits: 0, period: 4 },
  { key: "TRI-TSI-102", code: "TSI-102", name: "Fundamentos de Seguridad", credits: 3, period: 5 },
  { key: "TRI-CBG-115", code: "CBG-115", name: "Ética 2", credits: 3, period: 5 },
  { key: "TRI-CBG-215", code: "CBG-215", name: "Metodología de la Investigación", credits: 3, period: 5 },
  { key: "TRI-TI-313", code: "TI-313", name: "Instalación de Redes", credits: 3, period: 5 },
  { key: "TRI-TI-313-L", code: "TI-313-L", name: "Laboratorio Instalación de Redes", credits: 1, period: 5 },
  { key: "TRI-TI-204", code: "TI-204", name: "Redes WAN", credits: 4, period: 5 },
  { key: "TRI-ELECTIVE-5", code: null, name: "Electiva", credits: 3, period: 5 },
  { key: "TRI-TI-402", code: "TI-402", name: "Redes Inalámbricas", credits: 4, period: 6 },
  { key: "TRI-TME-001", code: "TME-001", name: "Fundamentos de Electrónica", credits: 4, period: 6 },
  { key: "TRI-TME-001-L", code: "TME-001-L", name: "Laboratorio Fundamentos de Electrónica", credits: 1, period: 6 },
  { key: "TRI-ADM-110", code: "ADM-110", name: "Desarrollo de Emprendedores", credits: 3, period: 6 },
  { key: "TRI-CBG-120", code: "CBG-120", name: "Ética 3", credits: 3, period: 6 },
  { key: "TRI-ING-110", code: "ING-110", name: "Inglés Técnico", credits: 4, period: 6 },
  { key: "TRI-ELECTIVE-6", code: null, name: "Electiva", credits: 3, period: 6 },
  { key: "TRI-TI-501", code: "TI-501", name: "Introducción a la Gerencia de Proyectos", credits: 3, period: 7 },
  { key: "TRI-TI-415", code: "TI-415", name: "Enrutamiento Avanzado", credits: 4, period: 7 },
  { key: "TRI-ADM-111", code: "ADM-111", name: "Plan de Negocios", credits: 3, period: 7 },
  { key: "TRI-TI-601", code: "TI-601", name: "Proyecto Final TRI", credits: 3, period: 7 },
  { key: "TRI-TI-314", code: "TI-314", name: "Introducción al Diseño de Redes", credits: 3, period: 7 },
];

const itlaAISubjects: CatalogSubject[] = [
  { key: "TIA-100", code: "TIA-100", name: "Introducción a la Inteligencia Artificial", credits: 3, period: 1 },
  { key: "TIA-TI-101", code: "TI-101", name: "Fundamentos del computador", credits: 4, period: 1 },
  { key: "TIA-ESP-101", code: "ESP-101", name: "Redacción Castellana", credits: 4, period: 1 },
  { key: "TIA-MAT-001", code: "MAT-001", name: "Pre-cálculo", credits: 5, period: 1 },
  { key: "TIA-CBG-110", code: "CBG-110", name: "Ética 1", credits: 3, period: 1 },
  { key: "TIA-OAI-001", code: "OAI-001", name: "Orientación Institucional", credits: 1, period: 1 },
  { key: "TIA-ING-001", code: "ING-001", name: "Inglés Nivel 1-3", credits: 0, period: 1 },
  { key: "TIA-200", code: "TIA-200", name: "Bases de Datos: Diseño e Implementación", credits: 3, period: 2 },
  { key: "TIA-110", code: "TIA-110", name: "Álgebra Matricial", credits: 3, period: 2 },
  { key: "TIA-ING-002", code: "ING-002", name: "Inglés Nivel 4-6", credits: 0, period: 2 },
  { key: "TIA-TDS-002", code: "TDS-002", name: "Fundamentos de Programación", credits: 4, period: 2 },
  { key: "TIA-202", code: "TIA-202", name: "Lógica Matemática", credits: 3, period: 2 },
  { key: "TIA-CBG-210", code: "CBG-210", name: "Probabilidad y Estadística", credits: 3, period: 2 },
  { key: "TIA-301", code: "TIA-301", name: "Python", credits: 4, period: 3 },
  { key: "TIA-300", code: "TIA-300", name: "Estadística Avanzada", credits: 3, period: 3 },
  { key: "TIA-310", code: "TIA-310", name: "Lenguajes de Programación para IA", credits: 4, period: 3 },
  { key: "TIA-303", code: "TIA-303", name: "Matemáticas Discretas", credits: 3, period: 3 },
  { key: "TIA-311", code: "TIA-311", name: "Modelado de Agentes Inteligentes", credits: 4, period: 3 },
  { key: "TIA-ING-003", code: "ING-003", name: "Inglés Nivel 7-9", credits: 0, period: 3 },
  { key: "TIA-CBG-215", code: "CBG-215", name: "Metodología de la Investigación", credits: 3, period: 4 },
  { key: "TIA-401", code: "TIA-401", name: "Procesamiento del Lenguaje Natural", credits: 3, period: 4 },
  { key: "TIA-410", code: "TIA-410", name: "Modelos de Representación del Conocimiento y Razonamiento", credits: 3, period: 4 },
  { key: "TIA-ING-004", code: "ING-004", name: "Inglés Nivel 10-12", credits: 0, period: 4 },
  { key: "TIA-DEP-101", code: "DEP-101", name: "Educación Física", credits: 0, period: 4 },
  { key: "TIA-430", code: "TIA-430", name: "Seminario I", credits: 2, period: 4 },
  { key: "TIA-501", code: "TIA-501", name: "Aprendizaje Automático", credits: 3, period: 5 },
  { key: "TIA-502", code: "TIA-502", name: "Planificación Inteligente", credits: 3, period: 5 },
  { key: "TIA-503", code: "TIA-503", name: "Reconocimiento de Escenas", credits: 3, period: 5 },
  { key: "TIA-504", code: "TIA-504", name: "Inteligencia Artificial Distribuida", credits: 3, period: 5 },
  { key: "TIA-ADM-110", code: "ADM-110", name: "Desarrollo de Emprendedores", credits: 3, period: 5 },
  { key: "TIA-ING-110", code: "ING-110", name: "Inglés Técnico", credits: 4, period: 5 },
  { key: "TIA-530", code: "TIA-530", name: "Seminario II", credits: 2, period: 5 },
  { key: "TIA-601", code: "TIA-601", name: "Aprendizaje Profundo", credits: 3, period: 6 },
  { key: "TIA-602", code: "TIA-602", name: "Inteligencia Artificial e IoT", credits: 3, period: 6 },
  { key: "TIA-603", code: "TIA-603", name: "Juegos Inteligentes", credits: 3, period: 6 },
  { key: "TIA-604", code: "TIA-604", name: "Robótica Inteligente", credits: 3, period: 6 },
  { key: "TIA-ADM-111", code: "ADM-111", name: "Plan de Negocios", credits: 3, period: 6 },
  { key: "TIA-800", code: "TIA-800", name: "Proyecto Final TIA", credits: 4, period: 6 },
];

const itlaSecuritySubjects: CatalogSubject[] = [
  { key: "TSI-TI-101", code: "TI-101", name: "Fundamentos del computador", credits: 4, period: 1 },
  { key: "TSI-TI-301", code: "TI-301", name: "Sistemas Operativos", credits: 3, period: 1 },
  { key: "TSI-ESP-101", code: "ESP-101", name: "Redacción Castellana", credits: 4, period: 1 },
  { key: "TSI-MAT-001", code: "MAT-001", name: "Pre-cálculo", credits: 5, period: 1 },
  { key: "TSI-OAI-001", code: "OAI-001", name: "Orientación Institucional", credits: 1, period: 1 },
  { key: "TSI-101", code: "TSI-101", name: "Introducción a la Ciberseguridad", credits: 3, period: 1 },
  { key: "TSI-ING-001", code: "ING-001", name: "Inglés Nivel 1-3", credits: 0, period: 1 },
  { key: "TSI-MAT-101", code: "MAT-101", name: "Cálculo Diferencial", credits: 5, period: 2 },
  { key: "TSI-DEP-101", code: "DEP-101", name: "Educación Física", credits: 0, period: 2 },
  { key: "TSI-ING-002", code: "ING-002", name: "Inglés Nivel 4-6", credits: 0, period: 2 },
  { key: "TSI-TI-201", code: "TI-201", name: "Fundamentos de Redes", credits: 4, period: 2 },
  { key: "TSI-CBG-110", code: "CBG-110", name: "Ética 1", credits: 3, period: 2 },
  { key: "TSI-TI-302", code: "TI-302", name: "Sistemas Operativos II", credits: 3, period: 2 },
  { key: "TSI-TDS-001", code: "TDS-001", name: "Introducción a la elaboración de Algoritmos", credits: 4, period: 2 },
  { key: "TSI-TI-303", code: "TI-303", name: "Sistemas Operativos III", credits: 3, period: 3 },
  { key: "TSI-TI-202", code: "TI-202", name: "Fundamentos de Enrutamiento", credits: 4, period: 3 },
  { key: "TSI-TI-202-L", code: "TI-202-L", name: "Laboratorio Fundamentos de Enrutamiento", credits: 1, period: 3 },
  { key: "TSI-TDS-002", code: "TDS-002", name: "Fundamentos de Programación", credits: 4, period: 3 },
  { key: "TSI-MAT-102", code: "MAT-102", name: "Cálculo Integral", credits: 5, period: 3 },
  { key: "TSI-102", code: "TSI-102", name: "Fundamentos de Seguridad", credits: 3, period: 3 },
  { key: "TSI-ING-003", code: "ING-003", name: "Inglés Nivel 7-9", credits: 0, period: 3 },
  { key: "TSI-TI-203", code: "TI-203", name: "Conmutación y Enrutamiento", credits: 4, period: 4 },
  { key: "TSI-TI-203-L", code: "TI-203-L", name: "Laboratorio Conmutación y Enrutamiento", credits: 1, period: 4 },
  { key: "TSI-TDS-101", code: "TDS-101", name: "Introducción a las Bases de Datos", credits: 4, period: 4 },
  { key: "TSI-201", code: "TSI-201", name: "Seguridad en Sistemas Operativos", credits: 4, period: 4 },
  { key: "TSI-315", code: "TSI-315", name: "Aspectos Legales de Ciberseguridad", credits: 3, period: 4 },
  { key: "TSI-310", code: "TSI-310", name: "Criptografía", credits: 4, period: 4 },
  { key: "TSI-301", code: "TSI-301", name: "Hacker Ético I", credits: 4, period: 5 },
  { key: "TSI-202", code: "TSI-202", name: "Seguridad de Aplicaciones", credits: 3, period: 5 },
  { key: "TSI-316", code: "TSI-316", name: "Gestión de Riesgos Tecnológicos y Cibernéticos", credits: 3, period: 5 },
  { key: "TSI-317", code: "TSI-317", name: "Políticas y Procedimientos de Seguridad", credits: 3, period: 5 },
  { key: "TSI-ING-004", code: "ING-004", name: "Inglés Nivel 10-12", credits: 0, period: 5 },
  { key: "TSI-303", code: "TSI-303", name: "Hacker Ético II", credits: 3, period: 6 },
  { key: "TSI-203", code: "TSI-203", name: "Seguridad de Redes", credits: 4, period: 6 },
  { key: "TSI-302", code: "TSI-302", name: "Informática Forense", credits: 4, period: 6 },
  { key: "TSI-TI-501", code: "TI-501", name: "Introducción a la Gerencia de Proyectos", credits: 3, period: 6 },
  { key: "TSI-320", code: "TSI-320", name: "Auditoría de Seguridad Informática", credits: 3, period: 6 },
  { key: "TSI-405", code: "TSI-405", name: "Proyecto Final TSI", credits: 4, period: 7 },
  { key: "TSI-406", code: "TSI-406", name: "Seguridad en la Nube", credits: 3, period: 7 },
  { key: "TSI-404", code: "TSI-404", name: "Gestión de Continuidad de Negocio", credits: 3, period: 7 },
  { key: "TSI-ADM-110", code: "ADM-110", name: "Desarrollo de Emprendedores", credits: 3, period: 7 },
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
      {
        key: "itla-networks",
        name: "Tecnólogo en Redes de Información",
        degreeType: "Técnico Superior",
        totalCredits: 141,
        periods: 7,
        sourceUrl: "https://itla.edu.do/wp-content/uploads/2025/03/Plan-de-estudios-redes-de-la-informacion.pdf",
        subjects: itlaNetworksSubjects,
      },
      {
        key: "itla-ai",
        name: "Tecnólogo en Inteligencia Artificial",
        degreeType: "Técnico Superior",
        totalCredits: 105,
        periods: 6,
        sourceUrl: "https://itla.edu.do/wp-content/uploads/2025/03/Plan-de-estudios-inteligencia-artificial.pdf",
        subjects: itlaAISubjects,
      },
      {
        key: "itla-security",
        name: "Tecnólogo en Seguridad Informática",
        degreeType: "Técnico Superior",
        totalCredits: 122,
        periods: 7,
        sourceUrl: "https://itla.edu.do/wp-content/uploads/2025/09/Pensums-WEB-2020-Seguridad-informatica.pdf",
        subjects: itlaSecuritySubjects,
      },
    ],
  },
];

export const findInstitution = (institutionKey: string) =>
  academicCatalog.find((institution) => institution.key === institutionKey);

export const findProgram = (institutionKey: string, programKey: string) =>
  findInstitution(institutionKey)?.programs.find((program) => program.key === programKey);
