import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  CreateQuizziesInput,
  SubmitAttemptAnswerInput,
  UpdateQuizziesInput,
} from "./quizzies.validation";

const OPEN_ATTEMPT_DATE = new Date(0);

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

const attemptSummarySelect = {
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
      description: true,
      difficulty: true,
      timeLimitMinutes: true,
      subject: {
        select: { id: true, name: true, level: true },
      },
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
    select: { studenAnswers: true },
  },
} as const;

const isFinished = (finishedAt: Date) => finishedAt.getTime() > OPEN_ATTEMPT_DATE.getTime();

const ensureSubjectActive = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, isActive: true },
  });

  if (!subject || !subject.isActive) {
    throw new HttpError(404, "Subject not found or inactive");
  }
};

const ensureQuizExists = async (quizId: string, allowInactive = false) => {
  const quiz = await prisma.quizzies.findUnique({
    where: { id: quizId },
    select: { id: true, isActive: true, timeLimitMinutes: true },
  });

  if (!quiz || (!allowInactive && !quiz.isActive)) {
    throw new HttpError(404, "Quiz not found or inactive");
  }

  return quiz;
};

const getAll = async (isAdmin: boolean) => {
  return prisma.quizzies.findMany({
    where: isAdmin ? {} : { isActive: true },
    select: quizziesSelect,
    orderBy: { createAt: "desc" },
  });
};

const getById = async (id: string, isAdmin: boolean) => {
  const quiz = await prisma.quizzies.findFirst({
    where: { id, ...(isAdmin ? {} : { isActive: true }) },
    select: quizziesSelect,
  });

  if (!quiz) {
    throw new HttpError(404, "Quiz not found");
  }

  return quiz;
};

const getBySubject = async (subjectId: string, isAdmin: boolean) => {
  await ensureSubjectActive(subjectId);

  return prisma.quizzies.findMany({
    where: { subjectId, ...(isAdmin ? {} : { isActive: true }) },
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
  await ensureQuizExists(id, true);

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
  const attempts = await prisma.quizAttempts.count({ where: { quizId: id } });

  if (attempts > 0) {
    throw new HttpError(409, "Quiz with attempts cannot be deleted; deactivate it instead");
  }

  await prisma.quizzies.delete({ where: { id } });
};

const startAttempt = async (quizId: string, userId: string) => {
  await ensureQuizExists(quizId);

  const [questionCount, existingAttempt] = await Promise.all([
    prisma.questions.count({ where: { quizId } }),
    prisma.quizAttempts.findFirst({
      where: { quizId, userId, finishedAt: OPEN_ATTEMPT_DATE },
      select: attemptSummarySelect,
    }),
  ]);

  if (questionCount === 0) {
    throw new HttpError(400, "Quiz has no questions");
  }

  if (existingAttempt) {
    return {
      ...existingAttempt,
      finishedAt: null,
      isFinished: false,
      resumed: true,
    };
  }

  const attempt = await prisma.quizAttempts.create({
    data: {
      quizId,
      userId,
      score: new Prisma.Decimal(0),
      totalQuestion: questionCount,
      correctAnswers: 0,
      startedAt: new Date(),
      finishedAt: OPEN_ATTEMPT_DATE,
    },
    select: attemptSummarySelect,
  });

  return {
    ...attempt,
    finishedAt: null,
    isFinished: false,
    resumed: false,
  };
};

const getAttemptRecord = async (attemptId: string) => {
  const attempt = await prisma.quizAttempts.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      quizId: true,
      score: true,
      totalQuestion: true,
      correctAnswers: true,
      startedAt: true,
      finishedAt: true,
      quizzies: {
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          timeLimitMinutes: true,
          subject: { select: { id: true, name: true, level: true } },
        },
      },
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      studenAnswers: {
        select: {
          id: true,
          questionId: true,
          selectedOptionId: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new HttpError(404, "Quiz attempt not found");
  }

  return attempt;
};

const assertAttemptOwner = (attemptUserId: string, userId: string, isAdmin = false) => {
  if (!isAdmin && attemptUserId !== userId) {
    throw new HttpError(403, "You can only access your own attempts");
  }
};

const assertAttemptOpen = (finishedAt: Date) => {
  if (isFinished(finishedAt)) {
    throw new HttpError(400, "Attempt has already been finished");
  }
};

const assertAttemptNotExpired = (startedAt: Date, timeLimitMinutes: number) => {
  const expiresAt = startedAt.getTime() + timeLimitMinutes * 60_000;

  if (Date.now() > expiresAt) {
    throw new HttpError(400, "Attempt has expired");
  }
};

const submitAttemptAnswer = async (
  attemptId: string,
  userId: string,
  data: SubmitAttemptAnswerInput,
) => {
  const attempt = await getAttemptRecord(attemptId);
  assertAttemptOwner(attempt.userId, userId);
  assertAttemptOpen(attempt.finishedAt);
  assertAttemptNotExpired(attempt.startedAt, attempt.quizzies.timeLimitMinutes);

  const question = await prisma.questions.findUnique({
    where: { id: data.questionId },
    select: { quizId: true },
  });

  if (!question || attempt.quizId !== question.quizId) {
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

  const answer = existingAnswer
    ? await prisma.studenAnswers.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOptionId: data.selectedOptionId,
          isCorrect: option.isCorrect,
        },
        select: { id: true, questionId: true, selectedOptionId: true },
      })
    : await prisma.studenAnswers.create({
        data: {
          quizAttemptId: attemptId,
          questionId: data.questionId,
          selectedOptionId: data.selectedOptionId,
          isCorrect: option.isCorrect,
        },
        select: { id: true, questionId: true, selectedOptionId: true },
      });

  return answer;
};

const getAttemptById = async (attemptId: string, userId: string, isAdmin: boolean) => {
  const attempt = await getAttemptRecord(attemptId);
  assertAttemptOwner(attempt.userId, userId, isAdmin);

  const finished = isFinished(attempt.finishedAt);
  const expiresAt = new Date(
    attempt.startedAt.getTime() + attempt.quizzies.timeLimitMinutes * 60_000,
  );

  const questions = await prisma.questions.findMany({
    where: { quizId: attempt.quizId },
    select: {
      id: true,
      questionText: true,
      questionType: true,
      points: true,
      topic: true,
      difficulty: true,
      questionOptions: {
        select: { id: true, optionText: true, isCorrect: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const selectedByQuestion = new Map(
    attempt.studenAnswers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  return {
    id: attempt.id,
    score: attempt.score,
    totalQuestion: attempt.totalQuestion,
    correctAnswers: attempt.correctAnswers,
    startedAt: attempt.startedAt,
    finishedAt: finished ? attempt.finishedAt : null,
    expiresAt,
    isFinished: finished,
    isExpired: !finished && Date.now() > expiresAt.getTime(),
    quizzies: attempt.quizzies,
    user: attempt.user,
    questions: questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points,
      topic: question.topic,
      difficulty: question.difficulty,
      selectedOptionId: selectedByQuestion.get(question.id) ?? null,
      questionOptions: question.questionOptions.map((option) =>
        finished || isAdmin
          ? option
          : { id: option.id, optionText: option.optionText },
      ),
    })),
  };
};

const finishAttempt = async (attemptId: string, userId: string) => {
  const attempt = await getAttemptRecord(attemptId);
  assertAttemptOwner(attempt.userId, userId);
  assertAttemptOpen(attempt.finishedAt);

  await prisma.$transaction(async (tx) => {
    const answers = await tx.studenAnswers.findMany({
      where: { quizAttemptId: attemptId },
      select: { isCorrect: true, questionId: true },
    });

    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const questions = await tx.questions.findMany({
      where: { quizId: attempt.quizId },
      select: { id: true, points: true },
    });

    const correctQuestionIds = new Set(
      answers.filter((answer) => answer.isCorrect).map((answer) => answer.questionId),
    );
    const score = questions.reduce(
      (total, question) => total + (correctQuestionIds.has(question.id) ? question.points : 0),
      0,
    );

    await tx.quizAttempts.update({
      where: { id: attemptId },
      data: {
        finishedAt: new Date(),
        correctAnswers,
        totalQuestion: questions.length,
        score: new Prisma.Decimal(score),
      },
    });
  });

  return getAttemptById(attemptId, userId, false);
};

const getAttemptsByUser = async (userId: string) => {
  const attempts = await prisma.quizAttempts.findMany({
    where: { userId },
    select: attemptSummarySelect,
    orderBy: { startedAt: "desc" },
  });

  return attempts.map((attempt) => ({
    ...attempt,
    finishedAt: isFinished(attempt.finishedAt) ? attempt.finishedAt : null,
    isFinished: isFinished(attempt.finishedAt),
  }));
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
