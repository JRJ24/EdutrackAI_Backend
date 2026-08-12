import { prisma } from "../../database/prisma";
import { comparePassword, hashPassword } from "../../helpers/hashpassword";
import { HttpError } from "../../helpers/http-error";
import { signAuthToken } from "../../helpers/jwt";
import { normalizeEmail } from "../../helpers/secure-fields";
import { findProgram } from "../student-context/academic-catalog";
import { studentContextService } from "../student-context/student-context.service";
import { LoginInput, RegisterInput } from "./auth.validation";

const DEFAULT_ROLE_NAME = "student";
const DEMO_ACCOUNT_EMAIL = normalizeEmail(process.env.DEMO_ACCOUNT_EMAIL ?? "prueba@gmail.com");
const DEMO_SUBJECT_KEYS = [
  "TDS-011",
  "TDS-010",
  "TDS-302",
  "TDS-601",
  "ING-110",
  "TDS-008",
];

const userSelect = {
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
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
} as const;

const buildAuthResponse = (user: any) => ({
  user,
  token: signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  }),
});

const register = async (data: RegisterInput) => {
  const email = normalizeEmail(data.email);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { studentCode: data.studentCode }],
    },
    select: {
      email: true,
      studentCode: true,
    },
  });

  if (existingUser?.email === email) {
    throw new HttpError(409, "Email is already registered");
  }

  if (existingUser?.studentCode === data.studentCode) {
    throw new HttpError(409, "Student code is already registered");
  }

  const defaultRole = await prisma.roles.findFirst({
    where: { name: DEFAULT_ROLE_NAME },
    select: { id: true },
  });

  if (!defaultRole) {
    throw new HttpError(500, "Default student role is not configured");
  }

  let institution: Awaited<ReturnType<typeof studentContextService.getCatalog>>[number] | null = null;
  let program: Awaited<ReturnType<typeof studentContextService.getCatalog>>[number]["programs"][number] | null = null;

  if (data.institutionKey && data.programKey) {
    const catalog = await studentContextService.getCatalog();
    institution = catalog.find((item) => item.key === data.institutionKey) ?? null;
    program = institution?.programs.find((item) => item.key === data.programKey) ?? null;
  }

  if ((data.institutionKey || data.programKey) && (!institution || !program)) {
    throw new HttpError(400, "Academic catalog selection is not valid");
  }

  const password = await hashPassword(data.password);
  const career = program?.name ?? data.career.trim();
  const manualInstitutionName = data.institutionName?.trim() || null;

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        studentCode: data.studentCode,
        career,
        email,
        password,
        avatarUrl: data.avatarUrl,
        roleId: defaultRole.id,
      },
      select: userSelect,
    });

    if (institution && program) {
      await tx.studentContext.create({
        data: {
          userId: created.id,
          institutionKey: institution.key,
          institutionName: institution.name,
          programKey: program.key,
          programName: program.name,
          currentPeriod: 1,
          sourceUrl: program.sourceUrl || null,
          onboardingCompleted: false,
        },
      });
    } else if (manualInstitutionName) {
      await tx.studentContext.create({
        data: {
          userId: created.id,
          institutionKey: "custom",
          institutionName: manualInstitutionName,
          programKey: "custom",
          programName: career,
          currentPeriod: 1,
          sourceUrl: null,
          onboardingCompleted: false,
        },
      });
    }

    return created;
  });

  return buildAuthResponse(user);
};

const ensureDemoAccountReady = async (userId: string, email: string, roleName: string) => {
  if (email !== DEMO_ACCOUNT_EMAIL || roleName.toLowerCase() === "admin") return;

  const context = await prisma.studentContext.findUnique({
    where: { userId },
    select: { onboardingCompleted: true },
  });

  if (context?.onboardingCompleted) return;

  const program = findProgram("itla", "itla-software");
  if (!program) return;

  const selectedSubjectKeys = DEMO_SUBJECT_KEYS.filter((key) =>
    program.subjects.some((subject) => subject.key === key),
  );

  if (selectedSubjectKeys.length === 0) return;

  await studentContextService.applyCatalog(userId, {
    institutionKey: "itla",
    programKey: "itla-software",
    currentPeriod: 7,
    selectedSubjectKeys,
  });
};

const login = async (data: LoginInput) => {
  const email = normalizeEmail(data.email);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  await ensureDemoAccountReady(user.id, email, user.role.name);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
    select: userSelect,
  });

  return buildAuthResponse(updatedUser);
};

export const authService = {
  register,
  login,
};
