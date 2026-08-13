import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { adaptiveEngineService } from "../adaptive-engine/adaptive-engine.service";
import { triggerAdaptiveRecalculation } from "../adaptive-engine/adaptive-engine.events";
import type { UpdateStudyPlanActivityInput } from "./study-plan.validation";

const planSelect = {
  id: true,
  engineKey: true,
  title: true,
  description: true,
  activityType: true,
  topic: true,
  scheduledFor: true,
  durationMinutes: true,
  priorityScore: true,
  priorityLevel: true,
  status: true,
  source: true,
  reason: true,
  completedAt: true,
  createdAt: true,
  updateAt: true,
  subject: { select: { id: true, name: true, level: true } },
  evaluation: {
    select: {
      id: true,
      title: true,
      evaluationType: true,
      scheduledAt: true,
    },
  },
  recommendation: {
    select: {
      id: true,
      title: true,
      description: true,
      reason: true,
      priority: true,
      resource: {
        select: {
          id: true,
          title: true,
          description: true,
          resourceType: true,
          url: true,
          topic: true,
        },
      },
    },
  },
} as const;

const getMyPlan = async (userId: string, includeHistory = false) => {
  return prisma.studyPlanActivity.findMany({
    where: {
      userId,
      ...(includeHistory ? {} : { status: { in: ["pending", "in_progress"] } }),
    },
    select: planSelect,
    orderBy: [{ status: "asc" }, { priorityScore: "desc" }, { scheduledFor: "asc" }],
    take: includeHistory ? 100 : 30,
  });
};

const getById = async (id: string, userId: string, isAdmin: boolean) => {
  const activity = await prisma.studyPlanActivity.findUnique({
    where: { id },
    select: { ...planSelect, userId: true },
  });
  if (!activity) throw new HttpError(404, "Study plan activity not found");
  if (!isAdmin && activity.userId !== userId) {
    throw new HttpError(403, "You can only access your own study plan");
  }
  return activity;
};

const update = async (
  id: string,
  userId: string,
  isAdmin: boolean,
  data: UpdateStudyPlanActivityInput,
) => {
  const existing = await prisma.studyPlanActivity.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  });
  if (!existing) throw new HttpError(404, "Study plan activity not found");
  if (!isAdmin && existing.userId !== userId) {
    throw new HttpError(403, "You can only update your own study plan");
  }

  const updateData: Record<string, unknown> = {};
  if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
  if (data.status !== undefined) {
    updateData.status = data.status;
    updateData.completedAt = data.status === "completed" ? new Date() : null;
  }

  const activity = await prisma.studyPlanActivity.update({
    where: { id },
    data: updateData,
    select: planSelect,
  });

  if (data.status === "completed" || data.status === "skipped") {
    triggerAdaptiveRecalculation(existing.userId, "plan_activity_completed");
  }

  return activity;
};

const regenerate = async (userId: string) => {
  await adaptiveEngineService.recalculateUser(userId, "manual");
  return getMyPlan(userId);
};

export const studyPlanService = {
  getMyPlan,
  getById,
  update,
  regenerate,
};
