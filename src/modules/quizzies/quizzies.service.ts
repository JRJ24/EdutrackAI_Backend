import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  CreateQuizziesInput,
  SubmitAttemptAnswerInput,
  UpdateQuizziesInput,
} from "./quizzies.validation";

const quizziesSelect = {
  id: true,
  title: true,
  description: true,
  difficulty: true,
  timeLimitMinutes: true,
  isActive: true,
  createAt: true,
  subject: {
    select: {
      id: true,
      name: true,
      level: true,
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  _count: {
    select: {
      quizziesAttempts: true,
      question: true,
    },
  },
} as const;

const attemptSelect = {
  id: true,
  score: true,
  totalQuestion: true,
  correctAnswers: true,
  startedAt: true,
  finishedAt: true,
  quizzies: {
    select: {
      id: true,
      title: true,
      timeLimitMinutes: true,
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  studenAnswers: true,
} as const;

const ensureSubjectActive = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, isActive: true },
  });

  if (!subject || !subject.isActive) {
    throw new HttpError(404, "Subject not found or inactive");
  }
};

const ensureQuizExists = async (quizId: string) => {
  const quiz = await prisma.quizzies.findUnique({
    where: { id: quizId },
    select: { id: true, isActive: true },
  });

  if (!quiz || !quiz.isActive) {
    throw new HttpError(404, "Quiz not found or inactive");
  }

  return quiz;
};

const getAll = async () => {
  return prisma.quizzies.findMany({
    select: quizziesSelect,
    orderBy: { createAt: "desc" },
  });
};

const getById = async (id: string) => {
  const quiz = await prisma.quizzies.findUnique({
    where: { id },
    select: quizziesSelect,
  });

  if (!quiz) {
    throw new HttpError(404, "Quiz not found");
  }

  return quiz;
};

const getBySubject = async (subjectId: string) => {
  await ensureSubjectActive(subjectId);

  return prisma.quizzies.findMany({
    where: { subjectId },
    select: quizziesSelect,
    orderBy: { createAt: "desc" },
  });
};

const create = async (data: CreateQuizziesInput, createdById: string) => {
  await ensureSubjectActive(data.subjectId);

  return prisma.quizzies.create({
    data: {
      subjectId: data.subjectId,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      timeLimitMinutes: data.timeLimitMinutes,
      isActive: data.isActive ?? true,
      createBy: createdById,
      createAt: new Date(),
    },
    select: quizziesSelect,
  });
};

const update = async (id: string, data: UpdateQuizziesInput) => {
  await ensureQuizExists(id);

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.timeLimitMinutes !== undefined) updateData.timeLimitMinutes = data.timeLimitMinutes;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.quizzies.update({
    where: { id },
    data: updateData,
    select: quizziesSelect,
  });
};

const remove = async (id: string) => {
  await prisma.quizzies.delete({ where: { id } });
};

const startAttempt = async (quizId: string, userId: string) => {
  await ensureQuizExists(quizId);

  const questionCount = await prisma.questions.count({ where: { quizId } });

  return prisma.quizAttempts.create({
    data: {
      quizId,
      userId,
      score: new Prisma.Decimal(0),
      totalQuestion: questionCount,
      correctAnswers: 0,
      startedAt: new Date(),
      finishedAt: new Date(0),
    },
    select: attemptSelect,
  });
};

const submitAttemptAnswer = async (
  attemptId: string,
  userId: string,
  data: SubmitAttemptAnswerInput,
) => {
  const attempt = await prisma.quizAttempts.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, quizId: true, finishedAt: true },
  });

  if (!attempt) {
    throw new HttpError(404, "Quiz attempt not found");
  }

  if (attempt.userId !== userId) {
    throw new HttpError(403, "You can only submit answers for your own attempts");
  }

  if (attempt.finishedAt) {
    throw new HttpError(400, "Attempt has already been finished");
  }

  if (attempt.quizId !== (await prisma.questions.findUnique({
    where: { id: data.questionId },
    select: { quizId: true },
  }))?.quizId) {
    throw new HttpError(400, "Question does not belong to this quiz");
  }

  const option = await prisma.questionOptions.findUnique({
    where: { id: data.selectedOptionId },
    select: { id: true, questionId: true, isCorrect: true },
  });

  if (!option || option.questionId !== data.questionId) {
    throw new HttpError(400, "Selected option does not belong to the question");
  }

  const existingAnswer = await prisma.studenAnswers.findFirst({
    where: { quizAttemptId: attemptId, questionId: data.questionId },
    select: { id: true },
  });

  if (existingAnswer) {
    return prisma.studenAnswers.update({
      where: { id: existingAnswer.id },
      data: {
        selectedOptionId: data.selectedOptionId,
        isCorrect: option.isCorrect,
      },
      select: {
        id: true,
        questionId: true,
        selectedOptionId: true,
        isCorrect: true,
      },
    });
  }

  return prisma.studenAnswers.create({
    data: {
      quizAttemptId: attemptId,
      questionId: data.questionId,
      selectedOptionId: data.selectedOptionId,
      isCorrect: option.isCorrect,
    },
    select: {
      id: true,
      questionId: true,
      selectedOptionId: true,
      isCorrect: true,
    },
  });
};

const finishAttempt = async (attemptId: string, userId: string) => {
  const attempt = await prisma.quizAttempts.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, finishedAt: true, quizId: true },
  });

  if (!attempt) {
    throw new HttpError(404, "Quiz attempt not found");
  }

  if (attempt.userId !== userId) {
    throw new HttpError(403, "You can only finish your own attempts");
  }

  if (attempt.finishedAt) {
    throw new HttpError(400, "Attempt has already been finished");
  }

  return prisma.$transaction(async (tx) => {
    const answers = await tx.studenAnswers.findMany({
      where: { quizAttemptId: attemptId },
      select: { isCorrect: true, questionId: true },
    });

    const correctAnswers = answers.filter((a) => a.isCorrect).length;

    const questions = await tx.questions.findMany({
      where: { quizId: attempt.quizId, id: { in: answers.map((a) => a.questionId) } },
      select: { id: true, points: true },
    });

    const pointsByQuestion = new Map(questions.map((q) => [q.id, q.points]));
    const score = answers.reduce((acc, a) => {
      if (!a.isCorrect) return acc;
      return acc + (pointsByQuestion.get(a.questionId) ?? 0);
    }, 0);

    const totalQuestions = await tx.questions.count({ where: { quizId: attempt.quizId } });

    return tx.quizAttempts.update({
      where: { id: attemptId },
      data: {
        finishedAt: new Date(),
        correctAnswers,
        totalQuestion: totalQuestions,
        score: new Prisma.Decimal(score),
      },
      select: attemptSelect,
    });
  });
};

const getAttemptById = async (attemptId: string, userId: string, isAdmin: boolean) => {
  const attempt = await prisma.quizAttempts.findUnique({
    where: { id: attemptId },
    select: attemptSelect,
  });

  if (!attempt) {
    throw new HttpError(404, "Quiz attempt not found");
  }

  if (!isAdmin && attempt.user.id !== userId) {
    throw new HttpError(403, "You can only access your own attempts");
  }

  return attempt;
};

const getAttemptsByUser = async (userId: string) => {
  return prisma.quizAttempts.findMany({
    where: { userId },
    select: attemptSelect,
    orderBy: { startedAt: "desc" },
  });
};

export const quizziesService = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
  startAttempt,
  submitAttemptAnswer,
  finishAttempt,
  getAttemptById,
  getAttemptsByUser,
};