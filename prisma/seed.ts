import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const roles = [
  {
    name: "student",
    description: "Default role for registered students",
  },
  {
    name: "admin",
    description: "Administrator role with elevated permissions",
  },
];

type DemoQuestion = {
  text: string;
  topic: string;
  options: Array<{ text: string; correct?: boolean }>;
};

type DemoQuiz = {
  title: string;
  description: string;
  difficulty: string;
  timeLimitMinutes: number;
  subjectAliases: string[];
  questions: DemoQuestion[];
};

const demoQuizzes: DemoQuiz[] = [
  {
    title: "MAUI: fundamentos para aplicaciones móviles",
    description: "Repaso corto sobre .NET MAUI, XAML, navegación y estructura básica de una aplicación móvil.",
    difficulty: "Intermedio",
    timeLimitMinutes: 12,
    subjectAliases: ["introduccion al desarrollo de aplicaciones moviles", "aplicaciones moviles", "desarrollo de aplicaciones moviles"],
    questions: [
      {
        text: "¿Cuál es el objetivo principal de .NET MAUI?",
        topic: ".NET MAUI",
        options: [
          { text: "Crear aplicaciones multiplataforma con una base de código compartida", correct: true },
          { text: "Administrar bases de datos relacionales" },
          { text: "Sustituir HTML en aplicaciones web" },
          { text: "Crear únicamente aplicaciones para Windows" },
        ],
      },
      {
        text: "¿Qué lenguaje de marcado se usa habitualmente para definir interfaces en .NET MAUI?",
        topic: "XAML",
        options: [
          { text: "XAML", correct: true },
          { text: "SQL" },
          { text: "Markdown" },
          { text: "YAML" },
        ],
      },
      {
        text: "¿Qué componente ayuda a organizar rutas y navegación entre páginas en una app MAUI?",
        topic: "Navegación",
        options: [
          { text: "Shell", correct: true },
          { text: "DbContext" },
          { text: "HttpClientFactory exclusivamente" },
          { text: "CSS Grid del navegador" },
        ],
      },
      {
        text: "¿Cuál archivo suele contener la lógica asociada a una página XAML?",
        topic: "Code-behind",
        options: [
          { text: "El archivo .xaml.cs asociado", correct: true },
          { text: "package.json" },
          { text: "schema.prisma" },
          { text: "index.sql" },
        ],
      },
    ],
  },
  {
    title: "Programación Web: HTTP, APIs y JavaScript",
    description: "Comprueba conceptos esenciales de desarrollo web moderno, solicitudes HTTP y consumo de APIs.",
    difficulty: "Intermedio",
    timeLimitMinutes: 12,
    subjectAliases: ["programacion web", "desarrollo web"],
    questions: [
      {
        text: "¿Qué método HTTP se utiliza normalmente para obtener un recurso sin modificarlo?",
        topic: "HTTP",
        options: [
          { text: "GET", correct: true },
          { text: "DELETE" },
          { text: "PATCH" },
          { text: "POST" },
        ],
      },
      {
        text: "¿Qué código HTTP representa normalmente una creación exitosa de un recurso?",
        topic: "HTTP",
        options: [
          { text: "201", correct: true },
          { text: "404" },
          { text: "500" },
          { text: "301" },
        ],
      },
      {
        text: "¿Para qué se usa JSON con frecuencia en una API web?",
        topic: "APIs",
        options: [
          { text: "Para intercambiar datos estructurados entre cliente y servidor", correct: true },
          { text: "Para compilar código C#" },
          { text: "Para reemplazar el protocolo HTTP" },
          { text: "Para crear índices de base de datos automáticamente" },
        ],
      },
      {
        text: "¿Qué palabra clave moderna de JavaScript permite esperar una Promise dentro de una función async?",
        topic: "JavaScript",
        options: [
          { text: "await", correct: true },
          { text: "yield-only" },
          { text: "defer-now" },
          { text: "resolve-if" },
        ],
      },
    ],
  },
  {
    title: "Estructuras de Datos: pilas, colas y complejidad",
    description: "Repaso de estructuras fundamentales y razonamiento básico de complejidad algorítmica.",
    difficulty: "Intermedio",
    timeLimitMinutes: 14,
    subjectAliases: ["estructura de datos", "estructuras de datos"],
    questions: [
      {
        text: "¿Qué principio describe mejor una pila (stack)?",
        topic: "Pilas",
        options: [
          { text: "LIFO: el último en entrar es el primero en salir", correct: true },
          { text: "FIFO: el primero en entrar es el primero en salir" },
          { text: "Orden alfabético obligatorio" },
          { text: "Acceso únicamente aleatorio" },
        ],
      },
      {
        text: "¿Qué principio describe normalmente una cola (queue)?",
        topic: "Colas",
        options: [
          { text: "FIFO: el primero en entrar es el primero en salir", correct: true },
          { text: "LIFO: el último en entrar es el primero en salir" },
          { text: "Siempre elimina el elemento más grande" },
          { text: "No permite insertar elementos" },
        ],
      },
      {
        text: "En promedio, ¿qué expresa O(n) para un algoritmo?",
        topic: "Complejidad",
        options: [
          { text: "El trabajo crece aproximadamente de forma lineal con el tamaño de la entrada", correct: true },
          { text: "El algoritmo tarda siempre exactamente un segundo" },
          { text: "El algoritmo no utiliza memoria" },
          { text: "La entrada debe estar ordenada" },
        ],
      },
      {
        text: "¿Qué estructura es apropiada para modelar una jerarquía padre-hijo?",
        topic: "Árboles",
        options: [
          { text: "Árbol", correct: true },
          { text: "Pila únicamente" },
          { text: "Cadena de texto" },
          { text: "Booleano" },
        ],
      },
    ],
  },
  {
    title: "Bases de Datos: SQL, claves y normalización",
    description: "Práctica sobre diseño relacional, SQL, claves y consistencia de datos.",
    difficulty: "Intermedio",
    timeLimitMinutes: 14,
    subjectAliases: ["base de datos avanzada", "introduccion a las bases de datos", "bases de datos", "base de datos"],
    questions: [
      {
        text: "¿Cuál es la función principal de una clave primaria?",
        topic: "Modelo relacional",
        options: [
          { text: "Identificar de forma única cada fila de una tabla", correct: true },
          { text: "Duplicar registros automáticamente" },
          { text: "Ocultar todas las columnas" },
          { text: "Eliminar la necesidad de índices" },
        ],
      },
      {
        text: "¿Qué instrucción SQL se usa para consultar datos?",
        topic: "SQL",
        options: [
          { text: "SELECT", correct: true },
          { text: "DROP" },
          { text: "ALTER" },
          { text: "TRUNCATE" },
        ],
      },
      {
        text: "¿Qué busca reducir principalmente la normalización de una base de datos relacional?",
        topic: "Normalización",
        options: [
          { text: "Redundancia y anomalías de actualización", correct: true },
          { text: "La cantidad de usuarios del sistema" },
          { text: "La velocidad de Internet" },
          { text: "El uso de claves foráneas" },
        ],
      },
      {
        text: "¿Qué propiedad de una transacción significa que se ejecuta completa o no se ejecuta?",
        topic: "Transacciones",
        options: [
          { text: "Atomicidad", correct: true },
          { text: "Presentación" },
          { text: "Serialización visual" },
          { text: "Compresión" },
        ],
      },
    ],
  },
  {
    title: "Inglés Técnico: vocabulario de software",
    description: "Repaso de términos comunes que aparecen en documentación, APIs y equipos de desarrollo.",
    difficulty: "Básico",
    timeLimitMinutes: 10,
    subjectAliases: ["ingles tecnico"],
    questions: [
      {
        text: "En documentación de software, ¿qué significa normalmente “bug”?",
        topic: "Vocabulario técnico",
        options: [
          { text: "Un defecto o error del software", correct: true },
          { text: "Una nueva versión estable" },
          { text: "Una base de datos" },
          { text: "Un lenguaje de programación" },
        ],
      },
      {
        text: "¿Cuál es la mejor traducción técnica de “deployment”?",
        topic: "Vocabulario técnico",
        options: [
          { text: "Despliegue", correct: true },
          { text: "Borrado" },
          { text: "Contraseña" },
          { text: "Cableado" },
        ],
      },
      {
        text: "En una API, ¿qué significa “request”?",
        topic: "APIs",
        options: [
          { text: "Solicitud", correct: true },
          { text: "Respuesta" },
          { text: "Base de datos" },
          { text: "Compilador" },
        ],
      },
      {
        text: "¿Qué frase indica que una operación terminó correctamente?",
        topic: "Comprensión técnica",
        options: [
          { text: "The operation completed successfully", correct: true },
          { text: "The server is unavailable" },
          { text: "The request was rejected" },
          { text: "The build failed" },
        ],
      },
    ],
  },
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const seedRoles = async () => {
  for (const role of roles) {
    const existingRole = await prisma.roles.findFirst({
      where: { name: role.name },
      select: { id: true },
    });

    if (existingRole) {
      await prisma.roles.update({
        where: { id: existingRole.id },
        data: { description: role.description },
      });
      continue;
    }

    await prisma.roles.create({ data: role });
  }
};

const seedDemoQuizzes = async () => {
  const creator = await prisma.user.findFirst({
    where: { isActive: true, role: { name: "admin" } },
    select: { id: true, email: true },
  }) ?? await prisma.user.findFirst({
    where: { isActive: true },
    select: { id: true, email: true },
  });

  if (!creator) {
    console.warn("[seed] Demo quizzes skipped: no active user exists to own them.");
    return;
  }

  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  let created = 0;
  let skipped = 0;

  for (const quiz of demoQuizzes) {
    const subject = subjects.find((candidate) => {
      const candidateName = normalize(candidate.name);
      return quiz.subjectAliases.some((alias) => candidateName.includes(normalize(alias)));
    });

    if (!subject) {
      console.warn(`[seed] Quiz skipped because no active operational subject matched: ${quiz.title}`);
      skipped += 1;
      continue;
    }

    const existing = await prisma.quizzies.findFirst({
      where: { subjectId: subject.id, title: quiz.title },
      select: { id: true },
    });

    if (existing) {
      console.log(`[seed] Quiz already exists: ${quiz.title}`);
      skipped += 1;
      continue;
    }

    await prisma.quizzies.create({
      data: {
        subjectId: subject.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        timeLimitMinutes: quiz.timeLimitMinutes,
        isActive: true,
        createBy: creator.id,
        createAt: new Date(),
        question: {
          create: quiz.questions.map((question) => ({
            questionText: question.text,
            questionType: "multiple-choice",
            points: 1,
            topic: question.topic,
            difficulty: quiz.difficulty,
            questionOptions: {
              create: question.options.map((option) => ({
                optionText: option.text,
                isCorrect: Boolean(option.correct),
              })),
            },
          })),
        },
      },
    });

    console.log(`[seed] Created quiz: ${quiz.title} → ${subject.name}`);
    created += 1;
  }

  console.log(`[seed] Demo quiz summary: ${created} created, ${skipped} skipped. Owner: ${creator.email}`);
};

const seed = async () => {
  await seedRoles();
  await seedDemoQuizzes();
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
