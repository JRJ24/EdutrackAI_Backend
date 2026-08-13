import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { recordAudit } from "../../helpers/audit";
import {
  ActiveToggleInput,
  AuditLogFilterInput,
  RoleChangeInput,
} from "./admin.validation";
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
      description: true,
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

const listRoles = async () => {
  return prisma.roles.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
};

const setUserActive = async (
  userId: string,
  data: ActiveToggleInput,
  adminId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  if (userId === adminId && !data.isActive) {
    throw new HttpError(400, "You cannot deactivate your own account");
  }

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

const setUserRole = async (
  userId: string,
  data: RoleChangeInput,
  adminId: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  const [existing, targetRole] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: { select: { id: true, name: true } },
      },
    }),
    prisma.roles.findUnique({
      where: { id: data.roleId },
      select: { id: true, name: true, description: true },
    }),
  ]);

  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  if (!targetRole) {
    throw new HttpError(404, "Role not found");
  }

  if (userId === adminId && targetRole.name.toLowerCase() !== "admin") {
    throw new HttpError(400, "You cannot remove your own administrator role");
  }

  if (existing.role.id === targetRole.id) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: adminUserSelect,
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { roleId: targetRole.id },
    select: adminUserSelect,
  });

  await recordAudit({
    userId: adminId,
    action: "CHANGE_USER_ROLE",
    entityName: "User",
    entityId: userId,
    oldValues: { roleId: existing.role.id, role: existing.role.name },
    newValues: {
      roleId: targetRole.id,
      role: targetRole.name,
      reason: data.reason ?? null,
    },
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

const listAuditLogs = async (filter: AuditLogFilterInput) => {
  const where: Prisma.AuditLogWhereInput = {};

  if (filter.action) {
    where.action = { contains: filter.action, mode: "insensitive" };
  }

  if (filter.entityName) {
    where.entityName = { contains: filter.entityName, mode: "insensitive" };
  }

  if (filter.userId) {
    where.userId = filter.userId;
  }

  if (filter.search) {
    where.OR = [
      { action: { contains: filter.search, mode: "insensitive" } },
      { entityName: { contains: filter.search, mode: "insensitive" } },
      { entityId: { contains: filter.search, mode: "insensitive" } },
      { user: { firstName: { contains: filter.search, mode: "insensitive" } } },
      { user: { lastName: { contains: filter.search, mode: "insensitive" } } },
      { user: { email: { contains: filter.search, mode: "insensitive" } } },
    ];
  }

  const skip = (filter.page - 1) * filter.limit;

  const [total, records] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filter.limit,
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
      page: filter.page,
      limit: filter.limit,
      total,
      totalPages: Math.ceil(total / filter.limit),
    },
  };
};

export const adminService = {
  listUsers,
  listRoles,
  setUserActive,
  setUserRole,
  getStats,
  listAuditLogs,
};
