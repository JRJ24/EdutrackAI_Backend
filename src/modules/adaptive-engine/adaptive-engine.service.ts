import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";

export type AdaptiveTrigger =
  | "manual"
  | "daily_scheduler"
  | "grade_created"
  | "grade_updated"
  | "quiz_finished"
  | "study_session_saved"
  | "plan_activity_completed"
  | "evaluation_changed";

type RiskLevel = "stable" | "watch" | "attention" | "high";

interface RiskComponents {
  [key: string]: number;
  performance: number;
  evaluationUrgency: number;
  inactivity: number;
  recentQuiz: number;
  difficulty: number;
}

interface SubjectAnalysis {
  subjectId: string;
  subjectName: string;
  score: number;
  level: RiskLevel;
  components: RiskComponents;
  reasons: string[];
  average: number | null;
  recentQuizScore: number | null;
  daysWithoutStudy: number | null;
  nextEvaluation: {
    id: string;
    title: string;
    scheduledAt: Date;
    daysUntil: number;
  } | null;
  weakTopic: string | null;
}

const DAY_MS = 86_400_000;
const OPEN_ATTEMPT_DATE = new Date(0);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 70) return "high";
  if (score >= 50) return "attention";
  if (score >= 30) return "watch";
  return "stable";
};

const performanceRisk = (average: number | null) => {
  if (average === null) return 8;
  if (average >= 85) return 0;
  if (average >= 75) return 8;
  if (average >= 70) return 15;
  if (average >= 60) return 25;
  return 35;
};

const evaluationRisk = (daysUntil: number | null) => {
  if (daysUntil === null) return 0;
  if (daysUntil <= 1) return 25;
  if (daysUntil <= 3) return 22;
  if (daysUntil <= 7) return 16;
  if (daysUntil <= 14) return 8;
  return 0;
};

const inactivityRisk = (daysWithoutStudy: number | null) => {
  if (daysWithoutStudy === null) return 12;
  if (daysWithoutStudy <= 1) return 0;
  if (daysWithoutStudy <= 3) return 5;
  if (daysWithoutStudy <= 5) return 10;
  if (daysWithoutStudy <= 7) return 15;
  return 20;
};

const quizRisk = (score: number | null) => {
  if (score === null) return 0;
  if (score >= 85) return 0;
  if (score >= 75) return 4;
  if (score >= 60) return 9;
  return 15;
};

const difficultyRisk = (difficultyLevel: string | null | undefined) => {
  const normalized = difficultyLevel?.trim().toLowerCase() ?? "";
  if (["high", "hard", "difficult", "alta", "alto", "difícil", "dificil"].includes(normalized)) {
    return 5;
  }
  if (["medium", "moderate", "media", "medio"].includes(normalized)) {
    return 3;
  }
  return 0;
};

const nextRelativeSchedule = (level: RiskLevel) => {
  const now = Date.now();
  const hours = level === "high" ? 2 : level === "attention" ? 6 : 24;
  return new Date(now + hours * 60 * 60 * 1000);
};

const durationFor = (level: RiskLevel, weeklyGoalHours?: number | null) => {
  const base = level === "high" ? 45 : level === "attention" ? 35 : 25;
  if (!weeklyGoalHours) return base;
  if (weeklyGoalHours <= 3) return Math.min(base, 30);
  if (weeklyGoalHours >= 10 && level !== "watch") return base + 10;
  return base;
};

const buildReasonText = (analysis: SubjectAnalysis) => analysis.reasons.join(" ");

const chooseActivityType = (analysis: SubjectAnalysis) => {
  if (analysis.nextEvaluation && analysis.nextEvaluation.daysUntil <= 7) return "exam_preparation";
  if (analysis.recentQuizScore !== null && analysis.recentQuizScore < 60) return "quiz_review";
  if (analysis.weakTopic) return "topic_review";
  return "study_session";
};

const analyzeSubject = async (
  userId: string,
  subjectId: string,
  subjectName: string,
  difficultyLevel: string,
): Promise<SubjectAnalysis> => {
  const now = new Date();

  const [grades, lastSession, nextEvaluation, lastQuiz] = await Promise.all([
    prisma.grades.findMany({
      where: { userId, subjectId },
      select: { gradeValue: true, date: true },
      orderBy: { date: "desc" },
      take: 3,
    }),
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
      select: { id: true, title: true, scheduledAt: true },
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
        finishedAt: true,
        studenAnswers: {
          where: { isCorrect: false },
          select: {
            question: { select: { topic: true } },
          },
        },
      },
      orderBy: { finishedAt: "desc" },
    }),
  ]);

  const gradeValues = grades
    .map((grade) => toNumber(grade.gradeValue))
    .filter((value): value is number => value !== null);
  const average = gradeValues.length
    ? gradeValues.reduce((sum, value) => sum + value, 0) / gradeValues.length
    : null;

  const recentQuizScore = toNumber(lastQuiz?.score);
  const daysWithoutStudy = lastSession
    ? Math.max(0, Math.floor((now.getTime() - lastSession.endedAt.getTime()) / DAY_MS))
    : null;
  const daysUntilEvaluation = nextEvaluation
    ? Math.max(0, Math.ceil((nextEvaluation.scheduledAt.getTime() - now.getTime()) / DAY_MS))
    : null;

  const topicCounts = new Map<string, number>();
  for (const answer of lastQuiz?.studenAnswers ?? []) {
    const topic = answer.question.topic?.trim();
    if (topic) topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  }
  const weakTopic = [...topicCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const components: RiskComponents = {
    performance: performanceRisk(average),
    evaluationUrgency: evaluationRisk(daysUntilEvaluation),
    inactivity: inactivityRisk(daysWithoutStudy),
    recentQuiz: quizRisk(recentQuizScore),
    difficulty: difficultyRisk(difficultyLevel),
  };

  const score = clamp(
    components.performance +
      components.evaluationUrgency +
      components.inactivity +
      components.recentQuiz +
      components.difficulty,
    0,
    100,
  );

  const reasons: string[] = [];
  if (average !== null && average < 70) {
    reasons.push(`El promedio reciente de ${subjectName} es ${Math.round(average)}%.`);
  } else if (average === null) {
    reasons.push(`Todavía no hay suficientes calificaciones recientes en ${subjectName}.`);
  }
  if (recentQuizScore !== null && recentQuizScore < 70) {
    reasons.push(`El quiz más reciente fue ${Math.round(recentQuizScore)}%.`);
  }
  if (weakTopic) reasons.push(`El tema con más errores recientes es ${weakTopic}.`);
  if (daysWithoutStudy === null) {
    reasons.push("Aún no se ha registrado una sesión de estudio para esta materia.");
  } else if (daysWithoutStudy >= 4) {
    reasons.push(`Han pasado ${daysWithoutStudy} días desde la última sesión.`);
  }
  if (nextEvaluation && daysUntilEvaluation !== null && daysUntilEvaluation <= 14) {
    reasons.push(
      `${nextEvaluation.title} está programada en ${daysUntilEvaluation} día${daysUntilEvaluation === 1 ? "" : "s"}.`,
    );
  }
  if (reasons.length === 0) reasons.push("El rendimiento y la actividad reciente se mantienen estables.");

  return {
    subjectId,
    subjectName,
    score,
    level: getRiskLevel(score),
    components,
    reasons,
    average,
    recentQuizScore,
    daysWithoutStudy,
    nextEvaluation: nextEvaluation && daysUntilEvaluation !== null
      ? { ...nextEvaluation, daysUntil: daysUntilEvaluation }
      : null,
    weakTopic,
  };
};

const syncRecommendation = async (userId: string, analysis: SubjectAnalysis) => {
  const existing = await prisma.recommendations.findFirst({
    where: {
      userId,
      subjectId: analysis.subjectId,
      type: "adaptive_study",
      status: "pending",
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  if (analysis.score < 50) {
    if (existing) {
      await prisma.recommendations.update({
        where: { id: existing.id },
        data: { status: "resolved" },
      });
    }
    return null;
  }

  const resource = await prisma.resouces.findFirst({
    where: {
      subjectId: analysis.subjectId,
      isActive: true,
      ...(analysis.weakTopic ? { topic: analysis.weakTopic } : {}),
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  }) ?? await prisma.resouces.findFirst({
    where: { subjectId: analysis.subjectId, isActive: true },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  if (!resource) return null;

  const priority = analysis.level === "high" ? "high" : "medium";
  const title = analysis.weakTopic
    ? `Refuerza ${analysis.weakTopic}`
    : `Refuerza ${analysis.subjectName}`;
  const description = analysis.nextEvaluation
    ? `Prepárate para ${analysis.nextEvaluation.title} con ${resource.title}.`
    : `Continúa con ${resource.title} para fortalecer tu progreso.`;
  const reason = buildReasonText(analysis);

  if (existing) {
    return prisma.recommendations.update({
      where: { id: existing.id },
      data: { title, description, reason, priority, resourceId: resource.id },
      select: { id: true },
    });
  }

  return prisma.recommendations.create({
    data: {
      userId,
      subjectId: analysis.subjectId,
      resourceId: resource.id,
      type: "adaptive_study",
      title,
      description,
      reason,
      priority,
      status: "pending",
      createdAt: new Date(),
    },
    select: { id: true },
  });
};

const syncPlanActivity = async (
  userId: string,
  analysis: SubjectAnalysis,
  recommendationId: string | null,
  weeklyGoalHours?: number | null,
) => {
  if (analysis.score < 30) return null;

  const todayKey = new Date().toISOString().slice(0, 10);
  const engineKey = `${userId}:${analysis.subjectId}:${todayKey}`;
  const existingActivity = await prisma.studyPlanActivity.findUnique({
    where: { engineKey },
    select: { id: true, engineKey: true, status: true },
  });

  if (existingActivity && ["completed", "skipped"].includes(existingActivity.status)) {
    return existingActivity;
  }

  const activityType = chooseActivityType(analysis);
  const scheduledFor = nextRelativeSchedule(analysis.level);
  const durationMinutes = durationFor(analysis.level, weeklyGoalHours);
  const title = analysis.weakTopic
    ? `Repasar ${analysis.weakTopic}`
    : analysis.nextEvaluation
      ? `Preparar ${analysis.nextEvaluation.title}`
      : `Sesión de ${analysis.subjectName}`;

  const data = {
    userId,
    subjectId: analysis.subjectId,
    evaluationId: analysis.nextEvaluation?.id ?? null,
    recommendationId,
    title,
    description: `Actividad generada automáticamente para ${analysis.subjectName}.`,
    activityType,
    topic: analysis.weakTopic,
    scheduledFor,
    durationMinutes,
    priorityScore: analysis.score,
    priorityLevel: analysis.level,
    reason: buildReasonText(analysis),
  };

  return prisma.studyPlanActivity.upsert({
    where: { engineKey },
    create: { engineKey, ...data },
    update: {
      ...data,
      status: "pending",
      completedAt: null,
    },
    select: { id: true, engineKey: true },
  });
};

const syncPriorityNotification = async (userId: string, analysis: SubjectAnalysis) => {
  if (analysis.score < 70) return;

  const message = analysis.nextEvaluation
    ? `${analysis.subjectName} es prioridad alta y ${analysis.nextEvaluation.title} está cerca.`
    : `${analysis.subjectName} necesita atención por tu rendimiento y actividad reciente.`;

  const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const duplicate = await prisma.notifications.findFirst({
    where: {
      userId,
      type: "adaptive_priority",
      message,
      createdAt: { gte: since },
    },
    select: { id: true },
  });

  if (!duplicate) {
    await prisma.notifications.create({
      data: {
        userId,
        title: "Tu plan académico cambió",
        message,
        type: "adaptive_priority",
        isRead: false,
        scheduleAt: new Date(),
        createdAt: new Date(),
      },
    });
  }
};

const recalculateUser = async (userId: string, trigger: AdaptiveTrigger = "manual") => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
      academicProfile: {
        select: { weeklyStudyGoalHours: true },
        take: 1,
      },
      subjectUser: {
        select: {
          difficultyLevel: true,
          status: true,
          subject: { select: { id: true, name: true, isActive: true } },
        },
      },
    },
  });

  if (!user || !user.isActive) throw new HttpError(404, "Active user not found");

  const activeLinks = user.subjectUser.filter(
    (link) => link.subject.isActive && link.status.trim().toLowerCase() !== "inactive",
  );

  const analyses: SubjectAnalysis[] = [];
  for (const link of activeLinks) {
    const analysis = await analyzeSubject(
      userId,
      link.subject.id,
      link.subject.name,
      link.difficultyLevel,
    );
    analyses.push(analysis);

    await prisma.riskSnapshot.create({
      data: {
        userId,
        subjectId: analysis.subjectId,
        score: analysis.score,
        level: analysis.level,
        components: analysis.components,
        reasons: analysis.reasons,
        trigger,
      },
    });

    const recommendation = await syncRecommendation(userId, analysis);
    await syncPlanActivity(
      userId,
      analysis,
      recommendation?.id ?? null,
      user.academicProfile[0]?.weeklyStudyGoalHours ?? null,
    );
    await syncPriorityNotification(userId, analysis);
  }

  analyses.sort((a, b) => b.score - a.score);

  return {
    userId,
    trigger,
    evaluatedAt: new Date(),
    priority: analyses[0] ?? null,
    subjects: analyses,
  };
};

const recalculateAllActiveUsers = async (trigger: AdaptiveTrigger = "daily_scheduler") => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const results: Array<{ userId: string; ok: boolean; error?: string }> = [];
  for (const user of users) {
    try {
      await recalculateUser(user.id, trigger);
      results.push({ userId: user.id, ok: true });
    } catch (error) {
      results.push({
        userId: user.id,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
};

const getOverview = async (userId: string) => {
  const [plan, snapshots] = await Promise.all([
    prisma.studyPlanActivity.findMany({
      where: {
        userId,
        status: { in: ["pending", "in_progress"] },
      },
      select: {
        id: true,
        title: true,
        description: true,
        activityType: true,
        topic: true,
        scheduledFor: true,
        durationMinutes: true,
        priorityScore: true,
        priorityLevel: true,
        status: true,
        reason: true,
        subject: { select: { id: true, name: true } },
        evaluation: { select: { id: true, title: true, scheduledAt: true } },
        recommendation: {
          select: {
            id: true,
            title: true,
            resource: { select: { id: true, title: true, url: true, resourceType: true } },
          },
        },
      },
      orderBy: [{ priorityScore: "desc" }, { scheduledFor: "asc" }],
      take: 20,
    }),
    prisma.riskSnapshot.findMany({
      where: { userId },
      select: {
        subjectId: true,
        score: true,
        level: true,
        components: true,
        reasons: true,
        trigger: true,
        evaluatedAt: true,
        subject: { select: { name: true } },
      },
      orderBy: { evaluatedAt: "desc" },
      take: 100,
    }),
  ]);

  const latestBySubject = new Map<string, (typeof snapshots)[number]>();
  for (const snapshot of snapshots) {
    if (!latestBySubject.has(snapshot.subjectId)) latestBySubject.set(snapshot.subjectId, snapshot);
  }

  const risks = [...latestBySubject.values()].sort((a, b) => b.score - a.score);

  return {
    generatedAt: new Date(),
    priority: risks[0] ?? null,
    risks,
    plan,
  };
};

export const adaptiveEngineService = {
  recalculateUser,
  recalculateAllActiveUsers,
  getOverview,
};
