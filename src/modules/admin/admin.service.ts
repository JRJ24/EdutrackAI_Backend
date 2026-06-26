import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { recordAudit } from "../../helpers/audit";
import { ActiveToggleInput } from "./admin.validation";
import { UserFilterInput } from "../dashboard/dashboard.validations";

const adminUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  studentCode: true,
  career: true,
  isActive: true,
  emailVerified: true,
  lastLogin: true,
  createdAt: true,
  updateAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const listUsers = async (filter: UserFilterInput) => {
  const where: Prisma.UserWhereInput = {};

  if (filter.isActive !== undefined) {
    where.isActive = filter.isActive;
  }

  if (filter.role) {
    where.role = { name: filter.role };
  }

  if (filter.search) {
    where.OR = [
      { firstName: { contains: filter.search, mode: "insensitive" } },
      { lastName: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
      { studentCode: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const skip = (filter.page - 1) * filter.limit;

  const [total, records] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: adminUserSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: filter.limit,
    }),
  ]);

  return {
    data: records,
    pagination: {
      page: filter.page,
      limit: filter.limit,
      total,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

const setUserActive = async (
  userId: string,
  data: ActiveToggleInput,
  adminId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  if (existing.isActive === data.isActive) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: adminUserSelect,
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: data.isActive },
    select: adminUserSelect,
  });

  await recordAudit({
    userId: adminId,
    action: data.isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    entityName: "User",
    entityId: userId,
    oldValues: { isActive: existing.isActive },
    newValues: { isActive: data.isActive, reason: data.reason ?? null },
    ipAddress,
    userAgent,
  });

  return updated;
};

const getStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalSubjects,
    totalQuizzes,
    totalAttempts,
    totalGrades,
    totalSessions,
    totalResources,
    totalRecommendations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.subject.count(),
    prisma.quizzies.count(),
    prisma.quizAttempts.count(),
    prisma.grades.count(),
    prisma.studySessions.count(),
    prisma.resouces.count(),
    prisma.recommendations.count(),
  ]);

  return {
    users: { total: totalUsers, active: activeUsers },
    subjects: { total: totalSubjects },
    quizzes: { total: totalQuizzes, attempts: totalAttempts },
    grades: { total: totalGrades },
    studySessions: { total: totalSessions },
    resources: { total: totalResources },
    recommendations: { total: totalRecommendations },
  };
};

const listAuditLogs = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [total, records] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
  ]);

  return {
    data: records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const adminService = {
  listUsers,
  setUserActive,
  getStats,
  listAuditLogs,
};