import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { CreateResourceInput, UpdateResourceInput } from "./resource.validation";

const resourceSelect = {
  id: true,
  title: true,
  description: true,
  resourceType: true,
  url: true,
  difficulty: true,
  topic: true,
  isActive: true,
  createdAt: true,
  subject: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
} as const;

const ensureSubjectExists = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true },
  });

  if (!subject) {
    throw new HttpError(404, "Subject not found");
  }
};

const getAll = async () => {
  return prisma.resouces.findMany({
    select: resourceSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  const resource = await prisma.resouces.findUnique({
    where: { id },
    select: resourceSelect,
  });

  if (!resource) {
    throw new HttpError(404, "Resource not found");
  }

  return resource;
};

const getBySubject = async (subjectId: string) => {
  await ensureSubjectExists(subjectId);

  return prisma.resouces.findMany({
    where: { subjectId, isActive: true },
    select: resourceSelect,
    orderBy: { createdAt: "desc" },
  });
};

const create = async (data: CreateResourceInput, createdById: string) => {
  await ensureSubjectExists(data.subjectId);

  return prisma.resouces.create({
    data: {
      subjectId: data.subjectId,
      title: data.title,
      description: data.description,
      resourceType: data.resourceType,
      url: data.url,
      difficulty: data.difficulty,
      topic: data.topic,
      createdBy: data.createdBy ?? createdById,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
    },
    select: resourceSelect,
  });
};

const update = async (id: string, data: UpdateResourceInput) => {
  await getById(id);

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.resourceType !== undefined) updateData.resourceType = data.resourceType;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.topic !== undefined) updateData.topic = data.topic;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.resouces.update({
    where: { id },
    data: updateData,
    select: resourceSelect,
  });
};

const remove = async (id: string) => {
  await prisma.resouces.delete({ where: { id } });
};

export const resourcesService = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
};