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

  return prisma.studentAcademicItem.create({
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
};

const update = async (userId: string, id: string, data: UpdateStudentInput) => {
  const existing = await prisma.studentAcademicItem.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new HttpError(404, "Academic item not found");

  return prisma.studentAcademicItem.update({
    where: { id },
    data,
    select: itemSelect,
  });
};

const remove = async (userId: string, id: string) => {
  const existing = await prisma.studentAcademicItem.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new HttpError(404, "Academic item not found");

  await prisma.studentAcademicItem.delete({ where: { id } });
};

export const studentInputsService = {
  list,
  create,
  update,
  remove,
};
