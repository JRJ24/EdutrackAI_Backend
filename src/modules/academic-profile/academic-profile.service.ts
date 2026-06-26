import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  CreateAcademicProfileInput,
  UpdateAcademicProfileInput,
} from "./academic-profile.validation";

const academicProfileSelect = {
  id: true,
  academicLevel: true,
  learningStyle: true,
  preferredStudyTime: true,
  weeklyStudyGoalHours: true,
  mainDifficulties: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      studentCode: true,
    },
  },
  createdAt: true,
  updateAt: true,
} as const;

const ensureUserActive = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, deletedAt: true },
  });

  if (!user || !user.isActive || user.deletedAt) {
    throw new HttpError(404, "User not found or inactive");
  }
};

const ensureUserAvailable = async (userId: string, ignoreProfileId?: string) => {
  const existing = await prisma.academicProfile.findFirst({
    where: {
      user_id: userId,
      ...(ignoreProfileId ? { NOT: { id: ignoreProfileId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new HttpError(409, "User already has an academic profile");
  }
};

const getAll = async () => {
  return prisma.academicProfile.findMany({
    select: academicProfileSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  const profile = await prisma.academicProfile.findUnique({
    where: { id },
    select: academicProfileSelect,
  });

  if (!profile) {
    throw new HttpError(404, "Academic profile not found");
  }

  return profile;
};

const getByUser = async (userId: string) => {
  const profile = await prisma.academicProfile.findFirst({
    where: { user_id: userId },
    select: academicProfileSelect,
  });

  if (!profile) {
    throw new HttpError(404, "Academic profile not found for user");
  }

  return profile;
};

const create = async (data: CreateAcademicProfileInput) => {
  await ensureUserActive(data.user_id);
  await ensureUserAvailable(data.user_id);

  return prisma.academicProfile.create({
    data: {
      user_id: data.user_id,
      academicLevel: data.academicLevel,
      learningStyle: data.learningStyle,
      preferredStudyTime: data.preferredStudyTime,
      weeklyStudyGoalHours: data.weeklyStudyGoalHours,
      mainDifficulties: data.mainDifficulties,
    },
    select: academicProfileSelect,
  });
};

const update = async (id: string, data: UpdateAcademicProfileInput) => {
  await getById(id);

  const updateData: Record<string, unknown> = {};

  if (data.academicLevel !== undefined) updateData.academicLevel = data.academicLevel;
  if (data.learningStyle !== undefined) updateData.learningStyle = data.learningStyle;
  if (data.preferredStudyTime !== undefined) updateData.preferredStudyTime = data.preferredStudyTime;
  if (data.weeklyStudyGoalHours !== undefined) {
    updateData.weeklyStudyGoalHours = data.weeklyStudyGoalHours;
  }
  if (data.mainDifficulties !== undefined) updateData.mainDifficulties = data.mainDifficulties;

  return prisma.academicProfile.update({
    where: { id },
    data: updateData,
    select: academicProfileSelect,
  });
};

const remove = async (id: string) => {
  await prisma.academicProfile.delete({ where: { id } });
};

export const academicProfileService = {
  getAll,
  getById,
  getByUser,
  create,
  update,
  remove,
};