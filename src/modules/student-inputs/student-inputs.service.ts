import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import type {
  CreateStudentInput,
  UpdateStudentInput,
} from "./student-inputs.validation";

const itemSelect = {
  id: true,
  itemType: true,
  title: true,
  description: true,
  topic: true,
  url: true,
  scheduledAt: true,
  createdAt: true,
  updateAt: true,
  subject: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
} as const;

const ensureActiveSubject = async (userId: string, subjectId: string) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { userId, subjectId, status: "active" },
    select: { id: true },
  });
  if (!assignment) throw new HttpError(400, "Subject is not active in your current term");
};

const deadlinePriority = (scheduledAt: Date) => {
  const days = Math.max(0, Math.ceil((scheduledAt.getTime() - Date.now()) / 86_400_000));
  if (days <= 1) return { score: 75, level: "high", delayHours: 1 };
  if (days <= 3) return { score: 62, level: "attention", delayHours: 3 };
  if (days <= 7) return { score: 48, level: "watch", delayHours: 8 };
  return { score: 32, level: "watch", delayHours: 24 };
};

const syncDeadlinePlan = async (item: {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description: string | null;
  topic: string | null;
  scheduledAt: Date;
}) => {
  const priority = deadlinePriority(item.scheduledAt);
  const scheduledFor = new Date(Date.now() + priority.delayHours * 60 * 60 * 1000);
  const engineKey = `student_deadline:${item.id}`;
  const reason = `${item.title} está programado para ${item.scheduledAt.toLocaleDateString("es-DO")}. EduTrack lo incorporó porque tú marcaste esta fecha como importante.`;

  await prisma.studyPlanActivity.upsert({
    where: { engineKey },
    update: {
      title: `Prepárate para ${item.title}`,
      description: item.description ?? `Repaso guiado para ${item.title}.`,
      topic: item.topic,
      scheduledFor,
      durationMinutes: priority.level === "high" ? 40 : 30,
      priorityScore: priority.score,
      priorityLevel: priority.level,
      status: "pending",
      source: "student_deadline",
      reason,
      completedAt: null,
    },
    create: {
      engineKey,
      userId: item.userId,
      subjectId: item.subjectId,
      title: `Prepárate para ${item.title}`,
      description: item.description ?? `Repaso guiado para ${item.title}.`,
      activityType: "exam_preparation",
      topic: item.topic,
      scheduledFor,
      durationMinutes: priority.level === "high" ? 40 : 30,
      priorityScore: priority.score,
      priorityLevel: priority.level,
      status: "pending",
      source: "student_deadline",
      reason,
    },
  });
};

const list = async (userId: string, subjectId?: string, itemType?: string) => {
  return prisma.studentAcademicItem.findMany({
    where: {
      userId,
      ...(subjectId ? { subjectId } : {}),
      ...(itemType ? { itemType } : {}),
    },
    select: itemSelect,
    orderBy: [
      { scheduledAt: "asc" },
      { createdAt: "desc" },
    ],
    take: 100,
  });
};

const create = async (userId: string, data: CreateStudentInput) => {
  await ensureActiveSubject(userId, data.subjectId);

  const item = await prisma.studentAcademicItem.create({
    data: {
      userId,
      subjectId: data.subjectId,
      itemType: data.itemType,
      title: data.title,
      description: data.description,
      topic: data.topic,
      url: data.url,
      scheduledAt: data.scheduledAt,
    },
    select: itemSelect,
  });

  if (data.itemType === "deadline" && data.scheduledAt) {
    await syncDeadlinePlan({
      id: item.id,
      userId,
      subjectId: data.subjectId,
      title: item.title,
      description: item.description,
      topic: item.topic,
      scheduledAt: data.scheduledAt,
    });
  }

  return item;
};

const update = async (userId: string, id: string, data: UpdateStudentInput) => {
  const existing = await prisma.studentAcademicItem.findFirst({
    where: { id, userId },
    select: {
      id: true,
      userId: true,
      subjectId: true,
      itemType: true,
      title: true,
      description: true,
      topic: true,
      scheduledAt: true,
    },
  });
  if (!existing) throw new HttpError(404, "Academic item not found");

  const item = await prisma.studentAcademicItem.update({
    where: { id },
    data,
    select: itemSelect,
  });

  const scheduledAt = data.scheduledAt === null
    ? null
    : data.scheduledAt ?? existing.scheduledAt;

  if (existing.itemType === "deadline" && scheduledAt) {
    await syncDeadlinePlan({
      id,
      userId,
      subjectId: existing.subjectId,
      title: data.title ?? existing.title,
      description: data.description === undefined ? existing.description : data.description,
      topic: data.topic === undefined ? existing.topic : data.topic,
      scheduledAt,
    });
  }

  return item;
};

const remove = async (userId: string, id: string) => {
  const existing = await prisma.studentAcademicItem.findFirst({
    where: { id, userId },
    select: { id: true, itemType: true },
  });
  if (!existing) throw new HttpError(404, "Academic item not found");

  await prisma.$transaction([
    prisma.studentAcademicItem.delete({ where: { id } }),
    ...(existing.itemType === "deadline"
      ? [prisma.studyPlanActivity.deleteMany({ where: { engineKey: `student_deadline:${id}` } })]
      : []),
  ]);
};

export const studentInputsService = {
  list,
  create,
  update,
  remove,
};
