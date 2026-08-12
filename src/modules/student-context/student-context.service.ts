import { randomUUID } from "node:crypto";

import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { academicCatalog } from "./academic-catalog";
import type {
  ApplyCatalogInput,
  CustomContextInput,
  CustomSubjectInput,
  ManagedCatalogSubjectInput,
  ManagedInstitutionInput,
  ManagedProgramInput,
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

type ManagedInstitutionRow = {
  id: string;
  key: string;
  name: string;
  shortName: string;
  country: string;
  websiteUrl: string | null;
  isActive: boolean;
};

type ManagedProgramRow = {
  id: string;
  institutionId: string;
  key: string;
  name: string;
  degreeType: string;
  totalCredits: number;
  periods: number;
  sourceUrl: string | null;
  isActive: boolean;
};

type ManagedSubjectRow = {
  id: string;
  programId: string;
  key: string;
  code: string | null;
  name: string;
  credits: number;
  period: number;
  isActive: boolean;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "catalog";

const readManagedCatalog = async (includeInactive = false) => {
  const [institutions, programs, subjects] = await Promise.all([
    prisma.$queryRaw<ManagedInstitutionRow[]>`
      SELECT "id", "key", "name", "short_name" AS "shortName", "country",
             "website_url" AS "websiteUrl", "is_active" AS "isActive"
      FROM academics."ManagedInstitution"
      ORDER BY "name" ASC
    `,
    prisma.$queryRaw<ManagedProgramRow[]>`
      SELECT "id", "institution_id" AS "institutionId", "key", "name",
             "degree_type" AS "degreeType", "total_credits" AS "totalCredits",
             "periods", "source_url" AS "sourceUrl", "is_active" AS "isActive"
      FROM academics."ManagedProgram"
      ORDER BY "name" ASC
    `,
    prisma.$queryRaw<ManagedSubjectRow[]>`
      SELECT "id", "program_id" AS "programId", "key", "code", "name",
             "credits", "period", "is_active" AS "isActive"
      FROM academics."ManagedCatalogSubject"
      ORDER BY "period" ASC, "name" ASC
    `,
  ]);

  return institutions
    .filter((institution) => includeInactive || institution.isActive)
    .map((institution) => ({
      id: institution.id,
      key: institution.key,
      name: institution.name,
      shortName: institution.shortName,
      country: institution.country,
      websiteUrl: institution.websiteUrl ?? "",
      isActive: institution.isActive,
      managed: true as const,
      programs: programs
        .filter((program) => program.institutionId === institution.id && (includeInactive || program.isActive))
        .map((program) => ({
          id: program.id,
          key: program.key,
          name: program.name,
          degreeType: program.degreeType,
          totalCredits: program.totalCredits,
          periods: program.periods,
          sourceUrl: program.sourceUrl ?? "",
          isActive: program.isActive,
          managed: true as const,
          subjects: subjects
            .filter((subject) => subject.programId === program.id && (includeInactive || subject.isActive))
            .map((subject) => ({
              id: subject.id,
              key: subject.key,
              code: subject.code,
              name: subject.name,
              credits: subject.credits,
              period: subject.period,
              isActive: subject.isActive,
              managed: true as const,
            })),
        })),
    }));
};

const getCatalog = async () => {
  try {
    const managed = await readManagedCatalog(false);
    const publicManaged = managed
      .map((institution) => ({
        key: institution.key,
        name: institution.name,
        shortName: institution.shortName,
        country: institution.country,
        websiteUrl: institution.websiteUrl,
        programs: institution.programs
          .filter((program) => program.subjects.length > 0)
          .map((program) => ({
            key: program.key,
            name: program.name,
            degreeType: program.degreeType,
            totalCredits: program.totalCredits,
            periods: program.periods,
            sourceUrl: program.sourceUrl,
            subjects: program.subjects.map((subject) => ({
              key: subject.key,
              code: subject.code,
              name: subject.name,
              credits: subject.credits,
              period: subject.period,
            })),
          })),
      }))
      .filter((institution) => institution.programs.length > 0);

    return [...academicCatalog, ...publicManaged];
  } catch {
    // Existing deployments keep working before the new optional catalog migration is applied.
    return academicCatalog;
  }
};

const getManagedCatalog = async () => {
  try {
    return await readManagedCatalog(true);
  } catch {
    throw new HttpError(503, "Managed academic catalog is not initialized. Apply the latest database migration.");
  }
};

const getProgram = async (institutionKey: string, programKey: string) => {
  const catalog = await getCatalog();
  const institution = catalog.find((item) => item.key === institutionKey);
  if (!institution) throw new HttpError(404, "Institution catalog not found");

  const program = institution.programs.find((item) => item.key === programKey);
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

const createManagedInstitution = async (data: ManagedInstitutionInput) => {
  const id = randomUUID();
  const key = `managed-${slugify(data.shortName)}-${id.slice(0, 8)}`;

  try {
    await prisma.$executeRaw`
      INSERT INTO academics."ManagedInstitution"
        ("id", "key", "name", "short_name", "country", "website_url")
      VALUES
        (${id}, ${key}, ${data.name}, ${data.shortName}, ${data.country}, ${data.websiteUrl || null})
    `;
  } catch {
    throw new HttpError(409, "Could not create institution. Check that it is not already registered.");
  }

  return getManagedCatalog();
};

const createManagedProgram = async (institutionId: string, data: ManagedProgramInput) => {
  const institution = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM academics."ManagedInstitution" WHERE "id" = ${institutionId} LIMIT 1
  `;
  if (!institution[0]) throw new HttpError(404, "Managed institution not found");

  const id = randomUUID();
  const key = `managed-${slugify(data.name)}-${id.slice(0, 8)}`;

  try {
    await prisma.$executeRaw`
      INSERT INTO academics."ManagedProgram"
        ("id", "institution_id", "key", "name", "degree_type", "total_credits", "periods", "source_url")
      VALUES
        (${id}, ${institutionId}, ${key}, ${data.name}, ${data.degreeType}, ${data.totalCredits}, ${data.periods}, ${data.sourceUrl || null})
    `;
  } catch {
    throw new HttpError(409, "Could not create program. Check that it is not already registered for this institution.");
  }

  return getManagedCatalog();
};

const createManagedCatalogSubject = async (programId: string, data: ManagedCatalogSubjectInput) => {
  const program = await prisma.$queryRaw<Array<{ id: string; periods: number }>>`
    SELECT "id", "periods" FROM academics."ManagedProgram" WHERE "id" = ${programId} LIMIT 1
  `;
  if (!program[0]) throw new HttpError(404, "Managed program not found");
  if (data.period > program[0].periods) {
    throw new HttpError(400, "Subject period is outside the configured program duration");
  }

  const id = randomUUID();
  const key = `${slugify(data.code || data.name)}-${id.slice(0, 8)}`;

  try {
    await prisma.$executeRaw`
      INSERT INTO academics."ManagedCatalogSubject"
        ("id", "program_id", "key", "code", "name", "credits", "period")
      VALUES
        (${id}, ${programId}, ${key}, ${data.code || null}, ${data.name}, ${data.credits}, ${data.period})
    `;
  } catch {
    throw new HttpError(409, "Could not create subject. Check that it is not already registered in this program.");
  }

  return getManagedCatalog();
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
  const resolved = await getProgram(data.institutionKey, data.programKey);
  const institution = resolved.institution;
  const program = resolved.program;

  if (data.currentPeriod > program.periods) {
    throw new HttpError(400, "Current period is outside the selected program");
  }

  const selectedSubjects = program.subjects.filter((subject) =>
    data.selectedSubjectKeys.includes(subject.key),
  );

  if (selectedSubjects.length === 0) {
    throw new HttpError(400, "Select at least one subject from the program");
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
        sourceUrl: program.sourceUrl || null,
        onboardingCompleted: true,
      },
      create: {
        userId,
        institutionKey: institution.key,
        institutionName: institution.name,
        programKey: program.key,
        programName: program.name,
        currentPeriod: data.currentPeriod,
        sourceUrl: program.sourceUrl || null,
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
            description: `Asignatura importada desde el catálogo académico de ${institution.shortName}.`,
            level: String(catalogSubject.period),
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

const syncCatalogSubjects = async () => {
  const catalog = await getCatalog();
  const uniqueSubjects = new Map<
    string,
    { name: string; period: number; institution: string; program: string }
  >();

  for (const institution of catalog) {
    for (const program of institution.programs) {
      for (const subject of program.subjects) {
        const key = subject.name.trim().toLowerCase();
        if (!uniqueSubjects.has(key)) {
          uniqueSubjects.set(key, {
            name: subject.name,
            period: subject.period,
            institution: institution.shortName,
            program: program.name,
          });
        }
      }
    }
  }

  return prisma.$transaction(async (tx) => {
    let created = 0;
    let reused = 0;
    let reactivated = 0;

    for (const catalogSubject of uniqueSubjects.values()) {
      const existing = await tx.subject.findFirst({
        where: {
          name: { equals: catalogSubject.name, mode: "insensitive" },
        },
        select: { id: true, isActive: true, level: true },
      });

      if (existing) {
        reused += 1;
        const normalizedLevel = /^\d+$/.test(existing.level.trim())
          ? existing.level
          : String(catalogSubject.period);

        if (!existing.isActive || normalizedLevel !== existing.level) {
          await tx.subject.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              level: normalizedLevel,
            },
          });
        }
        if (!existing.isActive) reactivated += 1;
        continue;
      }

      await tx.subject.create({
        data: {
          name: catalogSubject.name,
          description: `Catálogo académico ${catalogSubject.institution} · ${catalogSubject.program}`,
          level: String(catalogSubject.period),
          isActive: true,
        },
      });
      created += 1;
    }

    return {
      institutions: catalog.length,
      programs: catalog.reduce((total, institution) => total + institution.programs.length, 0),
      uniqueSubjects: uniqueSubjects.size,
      created,
      reused,
      reactivated,
    };
  });
};

export const studentContextService = {
  getCatalog,
  getManagedCatalog,
  getProgram,
  createManagedInstitution,
  createManagedProgram,
  createManagedCatalogSubject,
  getMyContext,
  saveCustomContext,
  applyCatalog,
  addCustomSubject,
  updateMySubject,
  removeMySubject,
  syncCatalogSubjects,
};
