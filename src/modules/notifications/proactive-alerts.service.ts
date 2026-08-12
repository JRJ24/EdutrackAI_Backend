import { prisma } from "../../database/prisma";
import { notificationsService } from "./notifications.service";

const DAY_MS = 86_400_000;
const OPEN_ATTEMPT_DATE = new Date(0);

const daysUntil = (date: Date) =>
  Math.max(0, Math.ceil((date.getTime() - Date.now()) / DAY_MS));

const quizPercentage = (attempt: {
  score: unknown;
  correctAnswers: number;
  totalQuestion: number;
} | null) => {
  if (!attempt) return null;
  if (attempt.totalQuestion > 0) {
    return Math.max(0, Math.min(100, (attempt.correctAnswers / attempt.totalQuestion) * 100));
  }
  const fallback = Number(attempt.score);
  return Number.isFinite(fallback) ? Math.max(0, Math.min(100, fallback)) : null;
};

const createOnce = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  dedupeHours = 20,
) => {
  const since = new Date(Date.now() - dedupeHours * 60 * 60 * 1000);
  const duplicate = await prisma.notifications.findFirst({
    where: {
      userId,
      type,
      message,
      createdAt: { gte: since },
    },
    select: { id: true },
  });

  if (duplicate) return false;

  await notificationsService.create({
    userId,
    title,
    message,
    type,
    isRead: false,
    scheduleAt: new Date(),
  });

  return true;
};

const evaluationCopy = (evaluationTitle: string, subjectName: string, remainingDays: number) => {
  const when = remainingDays === 0
    ? "es hoy"
    : remainingDays === 1
      ? "es mañana"
      : `es en ${remainingDays} días`;

  return {
    title: `Evaluación próxima: ${evaluationTitle}`,
    message: `${evaluationTitle} de ${subjectName} ${when}. EduTrack ya la tomó en cuenta para priorizar tu próximo repaso.`,
  };
};

const runForUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
      subjectUser: {
        where: { status: "active" },
        select: {
          subject: { select: { id: true, name: true, isActive: true } },
        },
      },
    },
  });

  if (!user?.isActive) return { userId, created: 0 };

  let created = 0;
  const now = new Date();
  const recentQuizThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

  for (const assignment of user.subjectUser) {
    if (!assignment.subject.isActive) continue;

    const subjectId = assignment.subject.id;
    const subjectName = assignment.subject.name;

    const [lastSession, nextEvaluation, lastQuiz] = await Promise.all([
      prisma.studySessions.findFirst({
        where: { userId, subjectId },
        select: { endedAt: true },
        orderBy: { endedAt: "desc" },
      }),
      prisma.evaluation.findFirst({
        where: {
          subjectId,
          isActive: true,
          scheduledAt: { gte: now },
        },
        select: { title: true, scheduledAt: true },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.quizAttempts.findFirst({
        where: {
          userId,
          finishedAt: { gt: OPEN_ATTEMPT_DATE },
          quizzies: { subjectId },
        },
        select: {
          score: true,
          correctAnswers: true,
          totalQuestion: true,
          finishedAt: true,
        },
        orderBy: { finishedAt: "desc" },
      }),
    ]);

    if (nextEvaluation) {
      const remaining = daysUntil(nextEvaluation.scheduledAt);
      if (remaining <= 3) {
        const copy = evaluationCopy(nextEvaluation.title, subjectName, remaining);
        if (await createOnce(userId, "evaluation_reminder", copy.title, copy.message)) created += 1;
      }
    }

    if (lastSession) {
      const inactiveDays = Math.max(0, Math.floor((Date.now() - lastSession.endedAt.getTime()) / DAY_MS));
      if (inactiveDays >= 5) {
        const title = `Hace ${inactiveDays} días que no repasas ${subjectName}`;
        const message = `Una sesión corta de 25 minutos puede ayudarte a retomar ${subjectName}. EduTrack te recomienda volver antes de que se acumule más contenido.`;
        if (await createOnce(userId, "study_inactivity", title, message)) created += 1;
      }
    }

    const recentQuizScore = quizPercentage(lastQuiz);
    if (
      recentQuizScore !== null &&
      recentQuizScore < 60 &&
      lastQuiz?.finishedAt &&
      lastQuiz.finishedAt >= recentQuizThreshold
    ) {
      const rounded = Math.round(recentQuizScore);
      const title = `Conviene reforzar ${subjectName}`;
      const message = `Tu práctica más reciente quedó en ${rounded}%. EduTrack te recomienda un repaso breve antes de volver a intentarlo.`;
      if (await createOnce(userId, "quiz_followup", title, message, 36)) created += 1;
    }
  }

  const deadlineHorizon = new Date(Date.now() + 3 * DAY_MS);
  const deadlines = await prisma.studentAcademicItem.findMany({
    where: {
      userId,
      itemType: "deadline",
      scheduledAt: { gte: now, lte: deadlineHorizon },
    },
    select: {
      title: true,
      scheduledAt: true,
      subject: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  for (const deadline of deadlines) {
    if (!deadline.scheduledAt) continue;
    const remaining = daysUntil(deadline.scheduledAt);
    const when = remaining === 0
      ? "es hoy"
      : remaining === 1
        ? "es mañana"
        : `es en ${remaining} días`;
    const title = `Fecha importante: ${deadline.title}`;
    const message = `${deadline.title} de ${deadline.subject.name} ${when}. EduTrack la incorporó a tu plan para que no se te pase.`;
    if (await createOnce(userId, "deadline_reminder", title, message)) created += 1;
  }

  return { userId, created };
};

const runAllActiveUsers = async () => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const results: Array<{ userId: string; created: number; ok: boolean; error?: string }> = [];
  for (const user of users) {
    try {
      const result = await runForUser(user.id);
      results.push({ ...result, ok: true });
    } catch (error) {
      results.push({
        userId: user.id,
        created: 0,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown proactive alert error",
      });
    }
  }

  return results;
};

export const proactiveAlertsService = {
  runForUser,
  runAllActiveUsers,
};
