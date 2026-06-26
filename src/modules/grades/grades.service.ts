import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { CreateGradeInput, UpdateGradeInput } from "./grades.validation";

const gradeSelect = {
  id: true,
  gradeValue: true,
  gradeType: true,
  description: true,
  date: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true,
    },
  },
  subject: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
  gradeChanges: {
    select: {
      id: true,
      oldValue: true,
      newValue: true,
      reason: true,
      createdAt: true,
    },
  },
} as const;

const ensureUserSubjectLink = async (userId: string, subjectId: string) => {
  const link = await prisma.userSubject.findFirst({
    where: { userId, subjectId },
    select: { id: true },
  });

  if (!link) {
    throw new HttpError(400, "User is not enrolled in this subject");
  }
};

const getAll = async (requestingUserId: string, isAdmin: boolean) => {
  return prisma.grades.findMany({
    where: isAdmin ? {} : { userId: requestingUserId },
    select: gradeSelect,
    orderBy: { date: "desc" },
  });
};

const getById = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const grade = await prisma.grades.findUnique({
    where: { id },
    select: gradeSelect,
  });

  if (!grade) {
    throw new HttpError(404, "Grade not found");
  }

  if (!isAdmin && grade.user.id !== requestingUserId) {
    throw new HttpError(403, "You can only access your own grades");
  }

  return grade;
};

const getBySubject = async (subjectId: string, requestingUserId: string, isAdmin: boolean) => {
  return prisma.grades.findMany({
    where: {
      subjectId,
      ...(isAdmin ? {} : { userId: requestingUserId }),
    },
    select: gradeSelect,
    orderBy: { date: "desc" },
  });
};

const create = async (data: CreateGradeInput, changedById: string) => {
  await ensureUserSubjectLink(data.userId, data.subjectId);

  return prisma.grades.create({
    data: {
      userId: data.userId,
      subjectId: data.subjectId,
      gradeValue: new Prisma.Decimal(data.gradeValue),
      gradeType: data.gradeType,
      description: data.description,
      date: data.date,
    },
    select: gradeSelect,
  });
};

const update = async (
  id: string,
  data: UpdateGradeInput,
  changedById: string,
) => {
  const existing = await prisma.grades.findUnique({
    where: { id },
    select: { id: true, gradeValue: true },
  });

  if (!existing) {
    throw new HttpError(404, "Grade not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.gradeType !== undefined) updateData.gradeType = data.gradeType;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.date !== undefined) updateData.date = data.date;

  let oldValueDecimal: Prisma.Decimal | null = null;
  let newValueDecimal: Prisma.Decimal | null = null;

  if (data.gradeValue !== undefined) {
    oldValueDecimal = existing.gradeValue;
    newValueDecimal = new Prisma.Decimal(data.gradeValue);
    updateData.gradeValue = newValueDecimal;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.grades.update({
      where: { id },
      data: updateData,
      select: gradeSelect,
    });

    if (oldValueDecimal && newValueDecimal && !oldValueDecimal.equals(newValueDecimal)) {
      await tx.gradeChange.create({
        data: {
          gradeId: id,
          changedById,
          oldValue: oldValueDecimal,
          newValue: newValueDecimal,
          reason: data.description ?? null,
        },
      });
    }

    return updated;
  });

  return result;
};

const remove = async (id: string) => {
  await prisma.grades.delete({ where: { id } });
};

export const gradesService = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
};