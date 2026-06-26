import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  CreateRecommendationInput,
  UpdateRecommendationInput,
} from "./recommendations.validation";

const recommendationSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  reason: true,
  priority: true,
  status: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  subject: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
  resource: {
    select: {
      id: true,
      title: true,
      url: true,
      resourceType: true,
    },
  },
} as const;

const ensureRelationsExist = async (userId: string, subjectId: string, resourceId: string) => {
  const [user, subject, resource] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } }),
    prisma.resouces.findUnique({ where: { id: resourceId }, select: { id: true } }),
  ]);

  if (!user) throw new HttpError(404, "User not found");
  if (!subject) throw new HttpError(404, "Subject not found");
  if (!resource) throw new HttpError(404, "Resource not found");
};

const getAll = async (requestingUserId: string, isAdmin: boolean) => {
  return prisma.recommendations.findMany({
    where: isAdmin ? {} : { userId: requestingUserId },
    select: recommendationSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const recommendation = await prisma.recommendations.findUnique({
    where: { id },
    select: recommendationSelect,
  });

  if (!recommendation) {
    throw new HttpError(404, "Recommendation not found");
  }

  if (!isAdmin && recommendation.user.id !== requestingUserId) {
    throw new HttpError(403, "You can only access your own recommendations");
  }

  return recommendation;
};

const create = async (data: CreateRecommendationInput) => {
  await ensureRelationsExist(data.userId, data.subjectId, data.resourceId);

  return prisma.recommendations.create({
    data: {
      userId: data.userId,
      subjectId: data.subjectId,
      resourceId: data.resourceId,
      type: data.type,
      title: data.title,
      description: data.description,
      reason: data.reason,
      priority: data.priority,
      status: data.status,
      createdAt: new Date(),
    },
    select: recommendationSelect,
  });
};

const update = async (id: string, data: UpdateRecommendationInput) => {
  await getById(id, (await prisma.recommendations.findUnique({ where: { id }, select: { userId: true } }))?.userId ?? "", true);

  const updateData: Record<string, unknown> = {};

  if (data.type !== undefined) updateData.type = data.type;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.reason !== undefined) updateData.reason = data.reason;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.recommendations.update({
    where: { id },
    data: updateData,
    select: recommendationSelect,
  });
};

const remove = async (id: string) => {
  await prisma.recommendations.delete({ where: { id } });
};

export const recommendationsService = {
  getAll,
  getById,
  create,
  update,
  remove,
};