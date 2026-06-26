import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  CreateStudySessionInput,
  UpdateStudySessionInput,
} from "./study-sessions.validation";

const studySessionSelect = {
  id: true,
  startedAt: true,
  endedAt: true,
  durationMinutes: true,
  notes: true,
  studyMethod: true,
  productivityRating: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true,
    },
  },
  subject: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
} as const;

const ensureUserSubjectLink = async (userId: string, subjectId: string) => {
  const link = await prisma.userSubject.findFirst({
    where: { userId, subjectId },
    select: { id: true },
  });

  if (!link) {
    throw new HttpError(400, "User is not enrolled in this subject");
  }
};

const computeDurationMinutes = (startedAt: Date, endedAt: Date) => {
  const diffMs = endedAt.getTime() - startedAt.getTime();

  if (diffMs < 0) {
    throw new HttpError(400, "endedAt must be greater than or equal to startedAt");
  }

  return Math.round(diffMs / 60000);
};

const getAll = async (requestingUserId: string, isAdmin: boolean) => {
  return prisma.studySessions.findMany({
    where: isAdmin ? {} : { userId: requestingUserId },
    select: studySessionSelect,
    orderBy: { startedAt: "desc" },
  });
};

const getById = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const session = await prisma.studySessions.findUnique({
    where: { id },
    select: studySessionSelect,
  });

  if (!session) {
    throw new HttpError(404, "Study session not found");
  }

  if (!isAdmin && session.user.id !== requestingUserId) {
    throw new HttpError(403, "You can only access your own study sessions");
  }

  return session;
};

const getBySubject = async (subjectId: string, requestingUserId: string, isAdmin: boolean) => {
  return prisma.studySessions.findMany({
    where: {
      subjectId,
      ...(isAdmin ? {} : { userId: requestingUserId }),
    },
    select: studySessionSelect,
    orderBy: { startedAt: "desc" },
  });
};

const create = async (data: CreateStudySessionInput) => {
  await ensureUserSubjectLink(data.userId, data.subjectId);

  const durationMinutes =
    data.durationMinutes ?? computeDurationMinutes(data.startedAt, data.endedAt);

  return prisma.studySessions.create({
    data: {
      userId: data.userId,
      subjectId: data.subjectId,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      durationMinutes,
      notes: data.notes,
      studyMethod: data.studyMethod,
      productivityRating: data.productivityRating,
    },
    select: studySessionSelect,
  });
};

const update = async (id: string, data: UpdateStudySessionInput) => {
  const existing = await prisma.studySessions.findUnique({
    where: { id },
    select: { id: true, startedAt: true, endedAt: true, durationMinutes: true },
  });

  if (!existing) {
    throw new HttpError(404, "Study session not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.startedAt !== undefined) updateData.startedAt = data.startedAt;
  if (data.endedAt !== undefined) updateData.endedAt = data.endedAt;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.studyMethod !== undefined) updateData.studyMethod = data.studyMethod;
  if (data.productivityRating !== undefined) updateData.productivityRating = data.productivityRating;

  const nextStartedAt = data.startedAt ?? existing.startedAt;
  const nextEndedAt = data.endedAt ?? existing.endedAt;

  if (data.durationMinutes !== undefined) {
    updateData.durationMinutes = data.durationMinutes;
  } else if (data.startedAt !== undefined || data.endedAt !== undefined) {
    updateData.durationMinutes = computeDurationMinutes(nextStartedAt, nextEndedAt);
  }

  return prisma.studySessions.update({
    where: { id },
    data: updateData,
    select: studySessionSelect,
  });
};

const remove = async (id: string) => {
  await prisma.studySessions.delete({ where: { id } });
};

export const studySessionsService = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
};