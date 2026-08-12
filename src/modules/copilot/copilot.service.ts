import { prisma } from "../../database/prisma";
import { adaptiveEngineService } from "../adaptive-engine/adaptive-engine.service";
import { dashboardService } from "../dashboard/dashboard.service";
import type { CopilotAskInput } from "./copilot.validation";

const suggestedPrompts = [
  "¿Qué debería estudiar ahora?",
  "Tengo 30 minutos, ¿qué hago?",
  "¿Qué tengo pendiente?",
  "No entiendo el tema que estoy viendo.",
];

const daysUntil = (value: Date) =>
  Math.max(0, Math.ceil((value.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

const normalizeForMatch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const buildPulse = async (userId: string) => {
  const [overview, summary, streak, context, assignments] = await Promise.all([
    adaptiveEngineService.getOverview(userId),
    dashboardService.getSummary(userId),
    dashboardService.getStreak(userId),
    prisma.studentContext.findUnique({ where: { userId } }),
    prisma.userSubject.findMany({
      where: { userId, status: "active" },
      select: {
        id: true,
        curriculumCode: true,
        curriculumPeriod: true,
        source: true,
        subject: { select: { id: true, name: true } },
      },
    }),
  ]);

  const subjectIds = assignments.map((assignment) => assignment.subject.id);
  const [officialEvaluation, personalDeadline] = subjectIds.length
    ? await Promise.all([
        prisma.evaluation.findFirst({
          where: {
            subjectId: { in: subjectIds },
            isActive: true,
            scheduledAt: { gte: new Date() },
          },
          select: {
            id: true,
            title: true,
            evaluationType: true,
            scheduledAt: true,
            subject: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
        prisma.studentAcademicItem.findFirst({
          where: {
            userId,
            subjectId: { in: subjectIds },
            itemType: "deadline",
            scheduledAt: { gte: new Date() },
          },
          select: {
            id: true,
            title: true,
            topic: true,
            scheduledAt: true,
            subject: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: "asc" },
        }),
      ])
    : [null, null];

  const official = officialEvaluation
    ? { ...officialEvaluation, source: "institution" as const }
    : null;
  const personal = personalDeadline?.scheduledAt
    ? {
        id: personalDeadline.id,
        title: personalDeadline.title,
        evaluationType: "Fecha personal",
        scheduledAt: personalDeadline.scheduledAt,
        subject: personalDeadline.subject,
        topic: personalDeadline.topic,
        source: "student" as const,
      }
    : null;

  const upcomingEvaluation = official && personal
    ? (official.scheduledAt <= personal.scheduledAt ? official : personal)
    : official ?? personal;

  const activity = overview.plan[0] ?? null;
  const priority = overview.priority;

  let headline = "Hoy puedes avanzar sin complicarte.";
  let message = "EduTrack todavía está reuniendo señales. Empieza con una práctica o registra una sesión y ajustaremos el siguiente paso.";

  if (activity) {
    headline = activity.title;
    message = activity.evaluation
      ? `${activity.subject.name} merece atención ahora porque ${activity.evaluation.title} está cerca.`
      : activity.reason;
  } else if (upcomingEvaluation) {
    const days = daysUntil(upcomingEvaluation.scheduledAt);
    headline = `Prepárate para ${upcomingEvaluation.title}`;
    message = days === 0
      ? `${upcomingEvaluation.title} de ${upcomingEvaluation.subject.name} es hoy.`
      : `Faltan ${days} día${days === 1 ? "" : "s"} para ${upcomingEvaluation.title} de ${upcomingEvaluation.subject.name}.`;
  } else if (assignments.length > 0) {
    headline = "Ya conozco tus materias. Ahora vamos a entender tu ritmo.";
    message = "Añade una fecha o una nota, o empieza un repaso. Con esas señales EduTrack podrá decidir mejor qué te conviene hacer después.";
  }

  return {
    generatedAt: new Date(),
    context,
    headline,
    message,
    priorityState: priority?.level ?? "stable",
    action: activity
      ? {
          activityId: activity.id,
          subjectId: activity.subject.id,
          subjectName: activity.subject.name,
          title: activity.title,
          durationMinutes: activity.durationMinutes,
          activityType: activity.activityType,
          topic: activity.topic,
          label: `Empezar · ${activity.durationMinutes} min`,
        }
      : null,
    upcomingEvaluation: upcomingEvaluation
      ? {
          ...upcomingEvaluation,
          daysUntil: daysUntil(upcomingEvaluation.scheduledAt),
        }
      : null,
    week: {
      studyMinutes: summary.totalStudyMinutesLast7Days,
      studySessions: summary.studySessionsLast7Days,
      quizScore: summary.averageQuizScore,
      quizAttempts: summary.quizAttemptsLast7Days,
      streakDays: streak.currentStreak,
    },
    activeSubjects: assignments,
    suggestedPrompts,
  };
};

const extractRequestedMinutes = (message: string) => {
  const match = message.match(/(\d{1,3})\s*(?:min|minuto|minutos)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.min(180, Math.max(10, value)) : null;
};

const removeSubjectFromTopic = (value: string, subjectName?: string | null) => {
  if (!subjectName) return value;
  const normalizedValue = normalizeForMatch(value);
  const normalizedSubject = normalizeForMatch(subjectName);
  const index = normalizedValue.indexOf(normalizedSubject);
  if (index < 0) return value;

  // This is intentionally approximate: it is used only to prevent a full
  // subject name from becoming a resource query. The direct user topic stays
  // before the subject phrase in normal questions such as "MAUI en <materia>".
  const words = value.trim().split(/\s+/);
  const subjectWords = subjectName.trim().split(/\s+/).length;
  const normalizedWords = words.map(normalizeForMatch);
  const subjectFirstToken = normalizeForMatch(subjectName.trim().split(/\s+/)[0] ?? "");
  const start = normalizedWords.findIndex((word) => word === subjectFirstToken);

  if (start >= 0) {
    const before = words.slice(0, Math.max(0, start - 1)).join(" ");
    const after = words.slice(start + subjectWords).join(" ");
    return `${before} ${after}`.trim();
  }

  return value;
};

const normalizeTopic = (value: string, subjectName?: string | null) => {
  let topic = removeSubjectFromTopic(value, subjectName)
    .trim()
    .replace(/^["“”']+|["“”']+$/g, "")
    .replace(/[¿?!.]+$/g, "")
    .replace(/^(?:hoy|ahora|esta semana)\s*/i, "")
    .replace(/^(?:el tema|tema)\s+/i, "")
    .replace(/^(?:en|sobre|de|para)\s+/i, "")
    .replace(/\s+(?:en|de|para)\s*$/i, "")
    .trim();

  if (!topic) return null;
  if (/^(?:tema|materia|clase|video|videos|recurso|recursos|material|materiales|lo de hoy)$/i.test(topic)) {
    return null;
  }

  if (subjectName) {
    const normalizedTopic = normalizeForMatch(topic);
    const normalizedSubject = normalizeForMatch(subjectName);
    if (normalizedTopic === normalizedSubject) return null;
    if (normalizedTopic === `la materia ${normalizedSubject}`) return null;
  }

  return topic;
};

const extractTopic = (message: string, subjectName?: string | null) => {
  const patterns = [
    /(?:no\s+entiendo|ayúdame\s+con|ayudame\s+con|explícame|explicame)\s+(?:el\s+tema\s+)?(.+)/i,
    /(?:quiero\s+repasar|debo\s+repasar|repasar|practicar)\s+(?:el\s+tema\s+)?(.+)/i,
    /(?:sobre\s+el\s+tema|sobre|tema)\s+["“]?(.+?)["”]?(?:\?|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (!match?.[1]) continue;
    const topic = normalizeTopic(match[1], subjectName);
    if (topic) return topic;
  }

  return null;
};

const isConcreteActivityTopic = (value?: string | null) => {
  if (!value?.trim()) return false;
  const normalized = normalizeForMatch(value);
  if (/^(?:tema|repaso|general)$/.test(normalized)) return false;
  if (/\b(?:presentacion|proyecto|entrega|parcial|examen|evaluacion|tarea|fecha|final)\b/.test(normalized)) {
    return false;
  }
  return true;
};

const ask = async (userId: string, input: CopilotAskInput) => {
  const pulse = await buildPulse(userId);
  const normalized = normalizeForMatch(input.message);
  const requestedMinutes = extractRequestedMinutes(input.message);
  const action = pulse.action;
  const mentionedSubject = pulse.activeSubjects.find((item) =>
    normalized.includes(normalizeForMatch(item.subject.name)),
  ) ?? null;

  if (/pendiente|que tengo|agenda|examen|evaluaci/.test(normalized)) {
    const parts: string[] = [];
    if (action) parts.push(`Tu siguiente acción es ${action.title} en ${action.subjectName}.`);
    if (pulse.upcomingEvaluation) {
      parts.push(
        `${pulse.upcomingEvaluation.title} de ${pulse.upcomingEvaluation.subject.name} está a ${pulse.upcomingEvaluation.daysUntil} día${pulse.upcomingEvaluation.daysUntil === 1 ? "" : "s"}.`,
      );
    }
    if (parts.length === 0) parts.push("No veo una urgencia académica pendiente ahora mismo.");

    return {
      answer: parts.join(" "),
      action,
      suggestedPrompts,
    };
  }

  if (requestedMinutes) {
    if (!action) {
      return {
        answer: `Tienes ${requestedMinutes} minutos disponibles. Todavía no tengo una prioridad suficientemente clara; elige una materia y usa ese bloque para un repaso corto.`,
        action: null,
        suggestedPrompts,
      };
    }

    return {
      answer: `Perfecto. Usa esos ${requestedMinutes} minutos en ${action.subjectName}. Lo más útil ahora es ${action.title.toLowerCase()}.`,
      action: {
        ...action,
        durationMinutes: Math.min(requestedMinutes, action.durationMinutes),
        label: `Empezar · ${Math.min(requestedMinutes, action.durationMinutes)} min`,
      },
      suggestedPrompts,
    };
  }

  if (/no entiendo|ayudame|explicame|repasar|practicar/.test(normalized)) {
    const subjectId = mentionedSubject?.subject.id ?? action?.subjectId ?? pulse.activeSubjects[0]?.subject.id ?? null;
    const subjectName = mentionedSubject?.subject.name ?? action?.subjectName ?? pulse.activeSubjects[0]?.subject.name ?? null;

    const explicitTopic = extractTopic(input.message, subjectName);
    let effectiveTopic = explicitTopic;

    if (!effectiveTopic && subjectId) {
      const recentContext = await prisma.studentAcademicItem.findFirst({
        where: {
          userId,
          subjectId,
          topic: { not: null },
        },
        select: { topic: true },
        orderBy: { createdAt: "desc" },
      });
      effectiveTopic = recentContext?.topic ?? null;
    }

    if (!effectiveTopic && isConcreteActivityTopic(action?.topic)) {
      effectiveTopic = action?.topic ?? null;
    }

    if (!subjectName) {
      return {
        answer: "Primero configura tus materias actuales para que pueda ayudarte con el contenido correcto.",
        action: null,
        suggestedPrompts,
      };
    }

    if (!effectiveTopic) {
      return {
        answer: `Sé que estás hablando de ${subjectName}, pero me falta el tema concreto. Escríbeme algo como “No entiendo MAUI” o “Quiero repasar navegación” y buscaré apoyo para ese tema, no para una entrega o para el nombre completo de la materia.`,
        action: null,
        resourceDiscovery: null,
        suggestedPrompts,
      };
    }

    return {
      answer: `Vamos con ${effectiveTopic} en ${subjectName}. Primero revisa una explicación o recurso corto del tema y después usa una práctica para comprobar qué quedó claro.`,
      action: explicitTopic ? null : action,
      resourceDiscovery: subjectId
        ? { subjectId, topic: effectiveTopic }
        : null,
      suggestedPrompts,
    };
  }

  if (/materia|asignatura|semestre|cuatrimestre|pensum/.test(normalized)) {
    const names = pulse.activeSubjects.map((item) => item.subject.name);
    return {
      answer: names.length
        ? `Ahora mismo tengo ${names.length} materias activas para ti: ${names.join(", ")}. Puedes administrarlas desde Materias sin perder el contexto del plan.`
        : "Todavía no tienes materias activas. Completa la configuración académica y cargaré las de tu período.",
      action: null,
      suggestedPrompts,
    };
  }

  return {
    answer: action
      ? `Ahora mismo me enfocaría en ${action.subjectName}. ${pulse.message}`
      : pulse.message,
    action,
    suggestedPrompts,
  };
};

export const copilotService = {
  getPulse: buildPulse,
  ask,
};
