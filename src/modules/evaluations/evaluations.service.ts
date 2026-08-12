import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { triggerAdaptiveRecalculation } from "../adaptive-engine/adaptive-engine.events";
import { proactiveAlertsService } from "../notifications/proactive-alerts.service";
import type { CreateEvaluationInput, UpdateEvaluationInput } from "./evaluations.validation";

const evaluationSelect = {
  id: true,
  title: true,
  description: true,
  evaluationType: true,
  scheduledAt: true,
  weight: true,
  isActive: true,
  createdAt: true,
  updateAt: true,
  subject: { select: { id: true, name: true, level: true } },
  creator: { select: { id: true, firstName: true, lastName: true } },
} as const;

const ensureSubject = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, isActive: true },
  });
  if (!subject || !subject.isActive) throw new HttpError(404, "Subject not found or inactive");
};

const getVisibleSubjectIds = async (userId: string) => {
  const links = await prisma.userSubject.findMany({
    where: { userId },
    select: { subjectId: true },
  });
  return links.map((link) => link.subjectId);
};

const notifyAffectedUsers = async (subjectId: string) => {
  const users = await prisma.userSubject.findMany({
    where: { subjectId, status: "active" },
    select: { userId: true },
  });

  for (const user of users) {
    triggerAdaptiveRecalculation(user.userId, "evaluation_changed");
    void proactiveAlertsService.runForUser(user.userId).catch((error) => {
      console.error("[proactive-alerts] evaluation trigger failed:", error);
    });
  }
};

const getAll = async (requestingUserId: string, isAdmin: boolean) => {
  const subjectIds = isAdmin ? null : await getVisibleSubjectIds(requestingUserId);
  return prisma.evaluation.findMany({
    where: isAdmin
      ? {}
      : { subjectId: { in: subjectIds ?? [] }, isActive: true },
    select: evaluationSelect,
    orderBy: { scheduledAt: "asc" },
  });
};

const getUpcoming = async (requestingUserId: string, isAdmin: boolean) => {
  const subjectIds = isAdmin ? null : await getVisibleSubjectIds(requestingUserId);
  return prisma.evaluation.findMany({
    where: {
      isActive: true,
      scheduledAt: { gte: new Date() },
      ...(isAdmin ? {} : { subjectId: { in: subjectIds ?? [] } }),
    },
    select: evaluationSelect,
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });
};

const getById = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    select: evaluationSelect,
  });
  if (!evaluation) throw new HttpError(404, "Evaluation not found");
  if (!isAdmin) {
    const subjectIds = await getVisibleSubjectIds(requestingUserId);
    if (!subjectIds.includes(evaluation.subject.id)) {
      throw new HttpError(403, "You can only access evaluations from your subjects");
    }
  }
  return evaluation;
};

const create = async (data: CreateEvaluationInput, createdBy: string) => {
  await ensureSubject(data.subjectId);
  const evaluation = await prisma.evaluation.create({
    data: {
      subjectId: data.subjectId,
      title: data.title,
      description: data.description ?? null,
      evaluationType: data.evaluationType,
      scheduledAt: data.scheduledAt,
      weight: data.weight === undefined ? null : new Prisma.Decimal(data.weight),
      isActive: data.isActive ?? true,
      createdBy,
    },
    select: evaluationSelect,
  });

  await notifyAffectedUsers(data.subjectId);
  return evaluation;
};

const update = async (id: string, data: UpdateEvaluationInput) => {
  const existing = await prisma.evaluation.findUnique({
    where: { id },
    select: { id: true, subjectId: true },
  });
  if (!existing) throw new HttpError(404, "Evaluation not found");

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.evaluationType !== undefined) updateData.evaluationType = data.evaluationType;
  if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt;
  if (data.weight !== undefined) updateData.weight = new Prisma.Decimal(data.weight);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const evaluation = await prisma.evaluation.update({
    where: { id },
    data: updateData,
    select: evaluationSelect,
  });

  await notifyAffectedUsers(existing.subjectId);
  return evaluation;
};

const remove = async (id: string) => {
  const existing = await prisma.evaluation.findUnique({
    where: { id },
    select: { id: true, subjectId: true },
  });
  if (!existing) throw new HttpError(404, "Evaluation not found");

  await prisma.evaluation.update({ where: { id }, data: { isActive: false } });
  await notifyAffectedUsers(existing.subjectId);
};

export const evaluationsService = {
  getAll,
  getUpcoming,
  getById,
  create,
  update,
  remove,
};
