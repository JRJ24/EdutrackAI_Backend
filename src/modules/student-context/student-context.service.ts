import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { academicCatalog, findInstitution, findProgram } from "./academic-catalog";
import type {
  ApplyCatalogInput,
  CustomContextInput,
  CustomSubjectInput,
  UpdateMySubjectInput,
} from "./student-context.validation";

const subjectSelect = {
  id: true,
  currentAverage: true,
  difficultyLevel: true,
  status: true,
  curriculumCode: true,
  curriculumPeriod: true,
  source: true,
  subject: {
    select: {
      id: true,
      name: true,
      description: true,
      level: true,
      isActive: true,
    },
  },
} as const;

const getCatalog = () => academicCatalog;

const getProgram = (institutionKey: string, programKey: string) => {
  const institution = findInstitution(institutionKey);
  if (!institution) throw new HttpError(404, "Institution catalog not found");

  const program = findProgram(institutionKey, programKey);
  if (!program) throw new HttpError(404, "Academic program catalog not found");

  return {
    institution: {
      key: institution.key,
      name: institution.name,
      shortName: institution.shortName,
      country: institution.country,
      websiteUrl: institution.websiteUrl,
    },
    program,
  };
};

const getMyContext = async (userId: string) => {
  const [context, subjects] = await Promise.all([
    prisma.studentContext.findUnique({ where: { userId } }),
    prisma.userSubject.findMany({
      where: { userId },
      select: subjectSelect,
      orderBy: [{ status: "asc" }, { curriculumPeriod: "asc" }],
    }),
  ]);

  return { context, subjects };
};

const saveCustomContext = async (userId: string, data: CustomContextInput) => {
  await prisma.$transaction([
    prisma.studentContext.upsert({
      where: { userId },
      update: {
        institutionKey: "custom",
        institutionName: data.institutionName,
        programKey: "custom",
        programName: data.programName,
        currentPeriod: data.currentPeriod,
        sourceUrl: null,
        onboardingCompleted: true,
      },
      create: {
        userId,
        institutionKey: "custom",
        institutionName: data.institutionName,
        programKey: "custom",
        programName: data.programName,
        currentPeriod: data.currentPeriod,
        sourceUrl: null,
        onboardingCompleted: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { career: data.programName },
    }),
  ]);

  return getMyContext(userId);
};

const applyCatalog = async (userId: string, data: ApplyCatalogInput) => {
  const institution = findInstitution(data.institutionKey);
  const program = findProgram(data.institutionKey, data.programKey);

  if (!institution || !program) {
    throw new HttpError(404, "Academic catalog not found");
  }

  if (data.currentPeriod > program.periods) {
    throw new HttpError(400, "Current period is outside the selected program");
  }

  const periodSubjects = program.subjects.filter(
    (subject) => subject.period === data.currentPeriod,
  );
  const selectedSubjects = periodSubjects.filter((subject) =>
    data.selectedSubjectKeys.includes(subject.key),
  );

  if (selectedSubjects.length === 0) {
    throw new HttpError(400, "Select at least one subject from the current period");
  }

  const selectedKeys = selectedSubjects.map((subject) => subject.key);

  await prisma.$transaction(async (tx) => {
    await tx.studentContext.upsert({
      where: { userId },
      update: {
        institutionKey: institution.key,
        institutionName: institution.name,
        programKey: program.key,
        programName: program.name,
        currentPeriod: data.currentPeriod,
        sourceUrl: program.sourceUrl,
        onboardingCompleted: true,
      },
      create: {
        userId,
        institutionKey: institution.key,
        institutionName: institution.name,
        programKey: program.key,
        programName: program.name,
        currentPeriod: data.currentPeriod,
        sourceUrl: program.sourceUrl,
        onboardingCompleted: true,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { career: program.name },
    });

    await tx.userSubject.updateMany({
      where: {
        userId,
        source: "institution_catalog",
        curriculumPeriod: data.currentPeriod,
        curriculumCode: { notIn: selectedKeys },
      },
      data: { status: "inactive" },
    });

    for (const catalogSubject of selectedSubjects) {
      let subject = await tx.subject.findFirst({
        where: {
          name: { equals: catalogSubject.name, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (!subject) {
        subject = await tx.subject.create({
          data: {
            name: catalogSubject.name,
            description: `Asignatura importada desde el plan de estudios oficial de ${institution.shortName}.`,
            level: `Período ${catalogSubject.period}`,
            isActive: true,
          },
          select: { id: true },
        });
      }

      const assignment = await tx.userSubject.findFirst({
        where: {
          userId,
          curriculumCode: catalogSubject.key,
        },
        select: { id: true },
      });

      if (assignment) {
        await tx.userSubject.update({
          where: { id: assignment.id },
          data: {
            subjectId: subject.id,
            status: "active",
            curriculumCode: catalogSubject.key,
            curriculumPeriod: catalogSubject.period,
            source: "institution_catalog",
          },
        });
      } else {
        await tx.userSubject.create({
          data: {
            userId,
            subjectId: subject.id,
            currentAverage: "0",
            difficultyLevel: "medium",
            status: "active",
            curriculumCode: catalogSubject.key,
            curriculumPeriod: catalogSubject.period,
            source: "institution_catalog",
          },
        });
      }
    }
  });

  return getMyContext(userId);
};

const addCustomSubject = async (userId: string, data: CustomSubjectInput) => {
  let subject = await prisma.subject.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });

  if (!subject) {
    subject = await prisma.subject.create({
      data: {
        name: data.name,
        description: data.description ?? "Materia agregada por el estudiante.",
        level: "Personal",
        isActive: true,
      },
    });
  }

  const existing = await prisma.userSubject.findFirst({
    where: { userId, subjectId: subject.id },
  });

  if (existing) {
    return prisma.userSubject.update({
      where: { id: existing.id },
      data: {
        status: "active",
        difficultyLevel: data.difficultyLevel,
        source: existing.source || "manual",
      },
      select: subjectSelect,
    });
  }

  return prisma.userSubject.create({
    data: {
      userId,
      subjectId: subject.id,
      currentAverage: "0",
      difficultyLevel: data.difficultyLevel,
      status: "active",
      source: "manual",
    },
    select: subjectSelect,
  });
};

const updateMySubject = async (
  userId: string,
  assignmentId: string,
  data: UpdateMySubjectInput,
) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { id: assignmentId, userId },
    select: { id: true },
  });

  if (!assignment) throw new HttpError(404, "Subject assignment not found");

  return prisma.userSubject.update({
    where: { id: assignmentId },
    data,
    select: subjectSelect,
  });
};

const removeMySubject = async (userId: string, assignmentId: string) => {
  const assignment = await prisma.userSubject.findFirst({
    where: { id: assignmentId, userId },
    select: { id: true },
  });

  if (!assignment) throw new HttpError(404, "Subject assignment not found");

  return prisma.userSubject.update({
    where: { id: assignmentId },
    data: { status: "inactive" },
    select: subjectSelect,
  });
};

export const studentContextService = {
  getCatalog,
  getProgram,
  getMyContext,
  saveCustomContext,
  applyCatalog,
  addCustomSubject,
  updateMySubject,
  removeMySubject,
};
