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

const externalResourcesFor = (subjectName: string, topic?: string) => {
  const searchTerm = (topic?.trim() || subjectName).trim();
  const encoded = encodeURIComponent(searchTerm);
  const normalized = `${subjectName} ${topic ?? ""}`.toLowerCase();
  const resources: DiscoveredLearningResource[] = [
    {
      id: `youtube:${searchTerm}`,
      title: `Explorar videos sobre ${searchTerm}`,
      description: "Resultados reales de YouTube para comparar explicaciones y ejemplos del tema.",
      url: `https://www.youtube.com/results?search_query=${encoded}`,
      provider: "YouTube",
      resourceType: "Video",
      topic: searchTerm,
      difficulty: "Variable",
      sourceKind: "provider_search",
      verifiedProvider: true,
    },
  ];

  if (/program|web|software|javascript|typescript|html|css|móvil|movil|algorit|estructura/.test(normalized)) {
    resources.push(
      {
        id: `mdn:${searchTerm}`,
        title: `Buscar ${searchTerm} en MDN`,
        description: "Documentación técnica de Mozilla para tecnologías web y fundamentos relacionados.",
        url: `https://developer.mozilla.org/en-US/search?q=${encoded}`,
        provider: "MDN Web Docs",
        resourceType: "Documentación",
        topic: searchTerm,
        difficulty: "Intermedio",
        sourceKind: "provider_search",
        verifiedProvider: true,
      },
      {
        id: `microsoft:${searchTerm}`,
        title: `Buscar ${searchTerm} en Microsoft Learn`,
        description: "Rutas, módulos y documentación oficial de Microsoft Learn.",
        url: `https://learn.microsoft.com/en-us/search/?terms=${encoded}`,
        provider: "Microsoft Learn",
        resourceType: "Curso / documentación",
        topic: searchTerm,
        difficulty: "Variable",
        sourceKind: "provider_search",
        verifiedProvider: true,
      },
    );
  }

  if (/base de dato|database|sql|postgres|data|minería|mineria|inteligencia de negocios/.test(normalized)) {
    resources.push({
      id: `postgresql:${searchTerm}`,
      title: `Buscar ${searchTerm} en PostgreSQL`,
      description: "Documentación y resultados del sitio oficial de PostgreSQL.",
      url: `https://www.postgresql.org/search/?q=${encoded}`,
      provider: "PostgreSQL",
      resourceType: "Documentación oficial",
      topic: searchTerm,
      difficulty: "Intermedio",
      sourceKind: "provider_search",
      verifiedProvider: true,
    });
  }

  if (/cálculo|calculo|matem|física|fisica|estadíst|estadist|probabilidad|pre-cálculo|precalculo/.test(normalized)) {
    resources.push({
      id: `khan:${searchTerm}`,
      title: `Buscar ${searchTerm} en Khan Academy`,
      description: "Lecciones y ejercicios de una plataforma educativa reconocida para ciencias y matemáticas.",
      url: `https://www.khanacademy.org/search?page_search_query=${encoded}`,
      provider: "Khan Academy",
      resourceType: "Lección / práctica",
      topic: searchTerm,
      difficulty: "Variable",
      sourceKind: "provider_search",
      verifiedProvider: true,
    });
  }

  return resources;
};

const discover = async (userId: string, subjectId: string, topic?: string) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { userId, subjectId, status: "active" },
    select: {
      subject: { select: { id: true, name: true, level: true } },
    },
  });

  if (!assignment) {
    throw new HttpError(404, "Active subject not found in your current term");
  }

  const [stored, personalMaterials] = await Promise.all([
    prisma.resouces.findMany({
      where: {
        subjectId,
        isActive: true,
        ...(topic?.trim()
          ? { topic: { contains: topic.trim(), mode: "insensitive" } }
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
        ...(topic?.trim()
          ? { topic: { contains: topic.trim(), mode: "insensitive" } }
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
      topic: item.topic ?? topic?.trim() ?? assignment.subject.name,
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
    topic: topic?.trim() || null,
    resources: [
      ...personal,
      ...realStored,
      ...externalResourcesFor(assignment.subject.name, topic),
    ],
  };
};

export const learningResourcesService = { discover };
