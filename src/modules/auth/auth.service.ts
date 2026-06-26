import { prisma } from "../../database/prisma";
import { comparePassword, hashPassword } from "../../helpers/hashpassword";
import { HttpError } from "../../helpers/http-error";
import { signAuthToken } from "../../helpers/jwt";
import { normalizeEmail } from "../../helpers/secure-fields";
import { LoginInput, RegisterInput } from "./auth.validation";

const DEFAULT_ROLE_NAME = "student";

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

  const password = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      studentCode: data.studentCode,
      career: data.career,
      email,
      password,
      avatarUrl: data.avatarUrl,
      roleId: defaultRole.id,
    },
    select: userSelect,
  });

  return buildAuthResponse(user);
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
