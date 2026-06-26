import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  AssignUserToSubjectInput,
  CreateSubjectInput,
  UpdateSubjectInput,
  UpdateUserSubjectInput,
} from "./subjects.validation";

const subjectSelect = {
  id: true,
  name: true,
  description: true,
  level: true,
  isActive: true,
  createdAt: true,
  updateAt: true,
  _count: {
    select: {
      subject: true,
      quizzies: true,
      grades: true,
      studySessions: true,
      resouces: true,
      recommendations: true,
    },
  },
} as const;

const userSubjectSelect = {
  id: true,
  currentAverage: true,
  difficultyLevel: true,
  status: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      studentCode: true,
      career: true,
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

const ensureSubjectActive = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, isActive: true },
  });

  if (!subject || !subject.isActive) {
    throw new HttpError(404, "Subject not found or inactive");
  }

  return subject;
};

const ensureUserActive = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, deletedAt: true },
  });

  if (!user || !user.isActive || user.deletedAt) {
    throw new HttpError(404, "User not found or inactive");
  }

  return user;
};

const getAll = async () => {
  return prisma.subject.findMany({
    select: subjectSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
    select: subjectSelect,
  });

  if (!subject) {
    throw new HttpError(404, "Subject not found");
  }

  return subject;
};

const create = async (data: CreateSubjectInput) => {
  return prisma.subject.create({
    data: {
      name: data.name,
      description: data.description,
      level: data.level,
      isActive: data.isActive ?? true,
    },
    select: subjectSelect,
  });
};

const update = async (id: string, data: UpdateSubjectInput) => {
  await getById(id);

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.subject.update({
    where: { id },
    data: updateData,
    select: subjectSelect,
  });
};

const remove = async (id: string) => {
  await prisma.subject.delete({ where: { id } });
};

const getUsersBySubject = async (subjectId: string) => {
  await ensureSubjectActive(subjectId);

  return prisma.userSubject.findMany({
    where: { subjectId },
    select: userSubjectSelect,
  });
};

const assignUser = async (subjectId: string, data: AssignUserToSubjectInput) => {
  await ensureSubjectActive(subjectId);
  await ensureUserActive(data.userId);

  return prisma.userSubject.create({
    data: {
      userId: data.userId,
      subjectId,
      currentAverage: data.currentAverage,
      difficultyLevel: data.difficultyLevel,
      status: data.status,
    },
    select: userSubjectSelect,
  });
};

const updateUserAssignment = async (
  subjectId: string,
  userId: string,
  data: UpdateUserSubjectInput,
) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { subjectId, userId },
    select: { id: true },
  });

  if (!assignment) {
    throw new HttpError(404, "User is not assigned to this subject");
  }

  const updateData: Record<string, unknown> = {};

  if (data.currentAverage !== undefined) updateData.currentAverage = data.currentAverage;
  if (data.difficultyLevel !== undefined) updateData.difficultyLevel = data.difficultyLevel;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.userSubject.update({
    where: { id: assignment.id },
    data: updateData,
    select: userSubjectSelect,
  });
};

const unassignUser = async (subjectId: string, userId: string) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { subjectId, userId },
    select: { id: true },
  });

  if (!assignment) {
    throw new HttpError(404, "User is not assigned to this subject");
  }

  await prisma.userSubject.delete({ where: { id: assignment.id } });
};

export const subjectsService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getUsersBySubject,
  assignUser,
  updateUserAssignment,
  unassignUser,
};