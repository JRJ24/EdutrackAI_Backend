import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";

export interface DiscoveredLearningResource {
  id: string;
  title: string;
  description: string;
  url: string;
  provider: string;
  resourceType: string;
  topic: string;
  difficulty: string;
  sourceKind: "student_material" | "course_resource" | "provider_search";
  verifiedProvider: boolean;
}

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Recurso del curso";
  }
};

const normalizeRequestedTopic = (value?: string, subjectName?: string) => {
  if (!value?.trim()) return undefined;

  let topic = value
    .trim()
    .replace(/[¿?!.]+$/g, "")
    .replace(/^(?:hoy|ahora|esta semana)\s*/i, "")
    .replace(/^(?:en|sobre|de)\s+/i, "")
    .trim();

  if (!topic) return undefined;
  if (/^(?:video|videos|recurso|recursos|material|materiales|tema|clase|lo de hoy)$/i.test(topic)) {
    return undefined;
  }

  if (subjectName && topic.toLowerCase() === subjectName.toLowerCase()) {
    return undefined;
  }

  return topic;
};

const providerResource = (
  id: string,
  title: string,
  description: string,
  url: string,
  provider: string,
  resourceType: string,
  topic: string,
  difficulty = "Variable",
): DiscoveredLearningResource => ({
  id,
  title,
  description,
  url,
  provider,
  resourceType,
  topic,
  difficulty,
  sourceKind: "provider_search",
  verifiedProvider: true,
});

const externalResourcesFor = (subjectName: string, rawTopic?: string) => {
  const topic = normalizeRequestedTopic(rawTopic, subjectName);
  const contextualQuery = topic ? `${topic} ${subjectName}` : subjectName;
  const encoded = encodeURIComponent(contextualQuery);
  const normalized = `${subjectName} ${topic ?? ""}`.toLowerCase();
  const resources: DiscoveredLearningResource[] = [];

  if (/maui/.test(normalized)) {
    resources.push(
      providerResource(
        "microsoft:maui-overview",
        "¿Qué es .NET MAUI?",
        "Introducción oficial de Microsoft a .NET MAUI, su arquitectura y plataformas compatibles.",
        "https://learn.microsoft.com/en-us/dotnet/maui/what-is-maui?view=net-maui-10.0",
        "Microsoft Learn",
        "Documentación oficial",
        topic ?? ".NET MAUI",
        "Inicial",
      ),
      providerResource(
        "microsoft:maui-docs",
        "Documentación de .NET MAUI",
        "Portal oficial con guías de XAML, navegación, listas, ciclo de vida y tareas comunes.",
        "https://learn.microsoft.com/en-us/dotnet/maui/?view=net-maui-10.0",
        "Microsoft Learn",
        "Documentación oficial",
        topic ?? ".NET MAUI",
        "Variable",
      ),
      providerResource(
        "microsoft:maui-training",
        "Ruta de aprendizaje: crear apps con .NET MAUI",
        "Ruta oficial de Microsoft Learn con módulos guiados para aplicaciones móviles y de escritorio.",
        "https://learn.microsoft.com/en-us/training/paths/build-apps-with-dotnet-maui/",
        "Microsoft Learn",
        "Curso guiado",
        topic ?? ".NET MAUI",
        "Inicial",
      ),
    );
  }

  resources.push(
    providerResource(
      `youtube:${contextualQuery}`,
      topic ? `Ver explicaciones de ${topic}` : `Explorar videos de ${subjectName}`,
      `Búsqueda en YouTube contextualizada con ${subjectName}${topic ? ` y el tema ${topic}` : ""}.`,
      `https://www.youtube.com/results?search_query=${encoded}`,
      "YouTube",
      "Video",
      topic ?? subjectName,
    ),
  );

  const isMobile = /móvil|movil|android|ios|maui|xamarin|aplicaciones móviles/.test(normalized);
  const isWeb = /programación web|programacion web|html|css|javascript|typescript|frontend|web/.test(normalized);
  const isProgramming = /program|software|algorit|estructura de datos|c#|java|python|typescript|javascript/.test(normalized);
  const isDatabase = /base de dato|database|sql|postgres|data|minería|mineria|inteligencia de negocios/.test(normalized);
  const isMath = /cálculo|calculo|matem|física|fisica|estadíst|estadist|probabilidad|pre-cálculo|precalculo|álgebra|algebra/.test(normalized);
  const isSecurity = /seguridad|ciberseguridad|criptograf|hacker|forense|vulnerab/.test(normalized);
  const isNetworks = /redes|enrutamiento|network|telecomunic/.test(normalized);
  const isAI = /inteligencia artificial|machine learning|aprendizaje|python|modelo|ia\b/.test(normalized);
  const isEnglish = /inglés|ingles|english/.test(normalized);

  if (isMobile && !/maui/.test(normalized)) {
    resources.push(
      providerResource(
        `microsoft-mobile:${contextualQuery}`,
        topic ? `Buscar ${topic} en Microsoft Learn` : "Explorar desarrollo móvil en Microsoft Learn",
        "Búsqueda contextual en documentación y rutas oficiales de Microsoft para desarrollo de aplicaciones.",
        `https://learn.microsoft.com/en-us/search/?terms=${encoded}`,
        "Microsoft Learn",
        "Documentación / curso",
        topic ?? subjectName,
      ),
    );
  }

  if (isWeb) {
    resources.push(
      providerResource(
        `mdn:${contextualQuery}`,
        topic ? `Buscar ${topic} en MDN` : "Aprender desarrollo web en MDN",
        "MDN se usa únicamente cuando el contexto es desarrollo web, HTML, CSS o JavaScript.",
        `https://developer.mozilla.org/en-US/search?q=${encoded}`,
        "MDN Web Docs",
        "Documentación",
        topic ?? subjectName,
        "Intermedio",
      ),
    );
  }

  if (isProgramming && !isWeb && !isMobile) {
    resources.push(
      providerResource(
        `microsoft-programming:${contextualQuery}`,
        topic ? `Buscar ${topic} en Microsoft Learn` : `Explorar ${subjectName} en Microsoft Learn`,
        "Documentación y módulos técnicos filtrados por el contexto de la materia.",
        `https://learn.microsoft.com/en-us/search/?terms=${encoded}`,
        "Microsoft Learn",
        "Documentación / curso",
        topic ?? subjectName,
      ),
    );
  }

  if (isDatabase) {
    resources.push(
      providerResource(
        `postgresql:${contextualQuery}`,
        topic ? `Buscar ${topic} en PostgreSQL` : "Explorar documentación de PostgreSQL",
        "Documentación y resultados del sitio oficial de PostgreSQL para conceptos de bases de datos y SQL.",
        `https://www.postgresql.org/search/?q=${encoded}`,
        "PostgreSQL",
        "Documentación oficial",
        topic ?? subjectName,
        "Intermedio",
      ),
    );
  }

  if (isMath) {
    resources.push(
      providerResource(
        `khan:${contextualQuery}`,
        topic ? `Practicar ${topic} en Khan Academy` : `Explorar ${subjectName} en Khan Academy`,
        "Lecciones y ejercicios para matemáticas, estadística y ciencias.",
        `https://www.khanacademy.org/search?page_search_query=${encoded}`,
        "Khan Academy",
        "Lección / práctica",
        topic ?? subjectName,
      ),
    );
  }

  if (isSecurity) {
    resources.push(
      providerResource(
        "owasp:top-ten",
        "OWASP Top 10",
        "Referencia abierta y reconocida para riesgos frecuentes de seguridad en aplicaciones web.",
        "https://owasp.org/www-project-top-ten/",
        "OWASP",
        "Guía técnica",
        topic ?? subjectName,
        "Intermedio",
      ),
      providerResource(
        "portswigger:web-security",
        "Web Security Academy",
        "Material práctico gratuito de PortSwigger para aprender vulnerabilidades y seguridad web.",
        "https://portswigger.net/web-security",
        "PortSwigger",
        "Laboratorio / guía",
        topic ?? subjectName,
        "Intermedio",
      ),
    );
  }

  if (isNetworks) {
    resources.push(
      providerResource(
        "cisco:skills-for-all",
        "Cisco Skills for All",
        "Cursos y rutas de Cisco para redes, infraestructura y fundamentos de ciberseguridad.",
        "https://skillsforall.com/",
        "Cisco",
        "Curso",
        topic ?? subjectName,
        "Variable",
      ),
    );
  }

  if (isAI) {
    resources.push(
      providerResource(
        `microsoft-ai:${contextualQuery}`,
        topic ? `Buscar ${topic} en Microsoft Learn` : "Explorar inteligencia artificial en Microsoft Learn",
        "Documentación y rutas de aprendizaje técnicas contextualizadas con la materia.",
        `https://learn.microsoft.com/en-us/search/?terms=${encoded}`,
        "Microsoft Learn",
        "Curso / documentación",
        topic ?? subjectName,
      ),
      providerResource(
        "kaggle:learn",
        "Kaggle Learn",
        "Microcursos prácticos de Python, machine learning, visualización y ciencia de datos.",
        "https://www.kaggle.com/learn",
        "Kaggle",
        "Curso práctico",
        topic ?? subjectName,
      ),
    );
  }

  if (isEnglish) {
    resources.push(
      providerResource(
        "british-council:learnenglish",
        "British Council LearnEnglish",
        "Recursos de inglés por nivel con práctica de comprensión, gramática y vocabulario.",
        "https://learnenglish.britishcouncil.org/",
        "British Council",
        "Lección / práctica",
        topic ?? subjectName,
      ),
    );
  }

  return [...new Map(resources.map((resource) => [resource.id, resource])).values()];
};

const discover = async (userId: string, subjectId: string, rawTopic?: string) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { userId, subjectId, status: "active" },
    select: {
      subject: { select: { id: true, name: true, level: true } },
    },
  });

  if (!assignment) {
    throw new HttpError(404, "Active subject not found in your current term");
  }

  const topic = normalizeRequestedTopic(rawTopic, assignment.subject.name);

  const [stored, personalMaterials] = await Promise.all([
    prisma.resouces.findMany({
      where: {
        subjectId,
        isActive: true,
        ...(topic
          ? { topic: { contains: topic, mode: "insensitive" } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.studentAcademicItem.findMany({
      where: {
        userId,
        subjectId,
        itemType: "material",
        url: { not: null },
        ...(topic
          ? { topic: { contains: topic, mode: "insensitive" } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const personal: DiscoveredLearningResource[] = personalMaterials
    .filter((item) => Boolean(item.url))
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? "Material que agregaste desde tu clase.",
      url: item.url ?? "",
      provider: item.url ? hostnameOf(item.url) : "Material de clase",
      resourceType: "Material de clase",
      topic: item.topic ?? topic ?? assignment.subject.name,
      difficulty: "Tu curso",
      sourceKind: "student_material",
      verifiedProvider: false,
    }));

  const realStored: DiscoveredLearningResource[] = stored
    .filter((resource) => !resource.url.includes("example.com"))
    .map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      provider: hostnameOf(resource.url),
      resourceType: resource.resourceType,
      topic: resource.topic,
      difficulty: resource.difficulty,
      sourceKind: "course_resource",
      verifiedProvider: false,
    }));

  return {
    subject: assignment.subject,
    topic: topic ?? null,
    resources: [
      ...personal,
      ...realStored,
      ...externalResourcesFor(assignment.subject.name, topic),
    ],
  };
};

export const learningResourcesService = { discover };
