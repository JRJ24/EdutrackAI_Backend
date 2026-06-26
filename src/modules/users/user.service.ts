import { prisma } from "../../database/prisma";
import { comparePassword, hashPassword } from "../../helpers/hashpassword";
import { HttpError } from "../../helpers/http-error";
import { normalizeEmail } from "../../helpers/secure-fields";
import {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
} from "./user.validation";

const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  studentCode: true,
  career: true,
  email: true,
  avatarUrl: true,
  isActive: true,
  emailVerified: true,
  lastLogin: true,
  roleId: true,
  createdAt: true,
  updateAt: true,
  deletedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
} as const;

const STUDENT_ROLE_NAME = "student";

const ensureEmailAndCodeAvailable = async (
  email: string | undefined,
  studentCode: string | undefined,
  ignoreUserId?: string,
) => {
  const orFilters: Array<Record<string, string>> = [];

  if (email) orFilters.push({ email });
  if (studentCode) orFilters.push({ studentCode });

  if (orFilters.length === 0) return;

  const existing = await prisma.user.findFirst({
    where: {
      OR: orFilters,
      ...(ignoreUserId ? { NOT: { id: ignoreUserId } } : {}),
    },
    select: { id: true, email: true, studentCode: true },
  });

  if (!existing) return;

  if (existing.email === email) {
    throw new HttpError(409, "Email is already registered");
  }

  if (existing.studentCode === studentCode) {
    throw new HttpError(409, "Student code is already registered");
  }
};

const ensureRoleExists = async (roleId: string) => {
  const role = await prisma.roles.findUnique({
    where: { id: roleId },
    select: { id: true },
  });

  if (!role) {
    throw new HttpError(404, "Role not found");
  }
};

const resolveRoleId = async (roleId?: string) => {
  if (roleId) {
    await ensureRoleExists(roleId);
    return roleId;
  }

  const studentRole = await prisma.roles.findFirst({
    where: { name: STUDENT_ROLE_NAME },
    select: { id: true },
  });

  if (!studentRole) {
    throw new HttpError(500, "Default student role is not configured");
  }

  return studentRole.id;
};

const getAll = async () => {
  return prisma.user.findMany({
    select: safeUserSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
};

const getMe = async (userId: string) => {
  return getById(userId);
};

const create = async (data: CreateUserInput) => {
  const email = normalizeEmail(data.email);

  await ensureEmailAndCodeAvailable(email, data.studentCode);

  const roleId = await resolveRoleId(data.roleId);

  const password = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      studentCode: data.studentCode,
      career: data.career,
      email,
      password,
      avatarUrl: data.avatarUrl ?? null,
      roleId,
      isActive: data.isActive ?? true,
      emailVerified: data.emailVerified ?? false,
    },
    select: safeUserSelect,
  });

  return user;
};

const update = async (id: string, data: UpdateUserInput) => {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, studentCode: true },
  });

  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  const email = data.email ? normalizeEmail(data.email) : undefined;

  await ensureEmailAndCodeAvailable(email, data.studentCode, id);

  if (data.roleId) {
    await ensureRoleExists(data.roleId);
  }

  const updateData: Record<string, unknown> = {};

  if (data.firstName !== undefined) updateData.firstName = data.firstName;
  if (data.lastName !== undefined) updateData.lastName = data.lastName;
  if (data.studentCode !== undefined) updateData.studentCode = data.studentCode;
  if (data.career !== undefined) updateData.career = data.career;
  if (email !== undefined) updateData.email = email;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.roleId !== undefined) updateData.roleId = data.roleId;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: safeUserSelect,
  });
};

const remove = async (id: string) => {
  await prisma.user.delete({ where: { id } });
};

const changePassword = async (userId: string, data: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const isValid = await comparePassword(data.currentPassword, user.password);

  if (!isValid) {
    throw new HttpError(401, "Current password is incorrect");
  }

  const hashed = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
};

export const userService = {
  getAll,
  getById,
  getMe,
  create,
  update,
  remove,
  changePassword,
};