import { prisma } from "../../database/prisma";

const getHistory = async (
  userId: string,
  subjectId?: string,
  requestedLimit = 60,
) => {
  const limit = Math.min(200, Math.max(1, Math.floor(requestedLimit)));

  return prisma.riskSnapshot.findMany({
    where: {
      userId,
      ...(subjectId ? { subjectId } : {}),
    },
    select: {
      id: true,
      subjectId: true,
      score: true,
      level: true,
      components: true,
      reasons: true,
      trigger: true,
      evaluatedAt: true,
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { evaluatedAt: "desc" },
    take: limit,
  });
};

export const adaptiveHistoryService = {
  getHistory,
};
