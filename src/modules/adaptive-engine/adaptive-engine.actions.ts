import { prisma } from "../../database/prisma";

export const completeInProgressPlanActivity = async (
  userId: string,
  subjectId: string,
  activityType?: string,
) => {
  const activity = await prisma.studyPlanActivity.findFirst({
    where: {
      userId,
      subjectId,
      status: "in_progress",
      ...(activityType ? { activityType } : {}),
    },
    select: { id: true },
    orderBy: { updateAt: "desc" },
  });

  if (!activity) return null;

  return prisma.studyPlanActivity.update({
    where: { id: activity.id },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
    select: {
      id: true,
      userId: true,
      subjectId: true,
      activityType: true,
      completedAt: true,
    },
  });
};
