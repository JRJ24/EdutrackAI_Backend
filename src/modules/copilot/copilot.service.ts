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
    headline = "Tu semestre está bajo control.";
    message = "No hay una urgencia académica detectada. Puedes practicar una materia o continuar con tu ritmo actual.";
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

const extractTopic = (message: string) => {
  const match = message.match(
    /(?:no entiendo|ayúdame con|ayudame con|explícame|explicame|repasar|practicar)\s+(.+)/i,
  );
  return match?.[1]?.trim().replace(/[?.!]+$/, "") || null;
};

const ask = async (userId: string, input: CopilotAskInput) => {
  const pulse = await buildPulse(userId);
  const normalized = input.message.toLowerCase();
  const requestedMinutes = extractRequestedMinutes(input.message);
  const topic = extractTopic(input.message);
  const action = pulse.action;

  if (/pendiente|qué tengo|que tengo|agenda|examen|evaluaci/.test(normalized)) {
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
        answer: `Tienes ${requestedMinutes} minutos disponibles. No hay una prioridad crítica ahora, así que elige una de tus materias y hagamos una práctica corta.`,
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

  if (/no entiendo|ayúdame|ayudame|explícame|explicame|repasar|practicar/.test(normalized)) {
    const subjectId = action?.subjectId ?? pulse.activeSubjects[0]?.subject.id ?? null;
    const subjectName = action?.subjectName ?? pulse.activeSubjects[0]?.subject.name ?? null;
    const effectiveTopic = topic || action?.topic || subjectName;

    return {
      answer: subjectName
        ? `Vamos a hacerlo más simple. Empecemos por ${effectiveTopic ?? subjectName} dentro de ${subjectName}: primero una explicación o recurso corto y después práctica para comprobar si quedó claro.`
        : "Primero configura tus materias actuales para que pueda ayudarte con el contenido correcto.",
      action,
      resourceDiscovery: subjectId
        ? { subjectId, topic: effectiveTopic ?? undefined }
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
