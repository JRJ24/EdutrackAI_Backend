import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import {
  CreateQuestionInput,
  CreateQuestionOptionInput,
  UpdateQuestionInput,
  UpdateQuestionOptionInput,
} from "./questions.validation";

const questionSelect = {
  id: true,
  questionText: true,
  questionType: true,
  points: true,
  topic: true,
  difficulty: true,
  quizzies: {
    select: {
      id: true,
      title: true,
    },
  },
  questionOptions: {
    select: {
      id: true,
      optionText: true,
      isCorrect: true,
    },
  },
} as const;

const publicOptionSelect = {
  id: true,
  optionText: true,
} as const;

const ensureQuizExists = async (quizId: string) => {
  const quiz = await prisma.quizzies.findUnique({
    where: { id: quizId },
    select: { id: true },
  });

  if (!quiz) {
    throw new HttpError(404, "Quiz not found");
  }
};

const ensureQuestionExists = async (questionId: string) => {
  const question = await prisma.questions.findUnique({
    where: { id: questionId },
    select: { id: true, quizId: true },
  });

  if (!question) {
    throw new HttpError(404, "Question not found");
  }

  return question;
};

const deactivateQuizIfIncomplete = async (quizId: string) => {
  const quiz = await prisma.quizzies.findUnique({
    where: { id: quizId },
    select: { isActive: true },
  });

  if (!quiz?.isActive) return;

  const questions = await prisma.questions.findMany({
    where: { quizId },
    select: {
      questionOptions: { select: { isCorrect: true } },
    },
  });

  const ready = questions.length > 0 && questions.every(
    (question) =>
      question.questionOptions.length >= 2 &&
      question.questionOptions.some((option) => option.isCorrect),
  );

  if (!ready) {
    await prisma.quizzies.update({
      where: { id: quizId },
      data: { isActive: false },
    });
  }
};

const getQuestionsByQuiz = async (quizId: string, hideCorrect: boolean) => {
  await ensureQuizExists(quizId);

  const questions = await prisma.questions.findMany({
    where: { quizId },
    select: questionSelect,
    orderBy: { id: "asc" },
  });

  if (!hideCorrect) return questions;

  return questions.map((q) => ({
    ...q,
    questionOptions: q.questionOptions.map((opt) => ({
      id: opt.id,
      optionText: opt.optionText,
    })),
  }));
};

const getQuestionById = async (id: string, hideCorrect: boolean) => {
  const question = await prisma.questions.findUnique({
    where: { id },
    select: questionSelect,
  });

  if (!question) {
    throw new HttpError(404, "Question not found");
  }

  if (hideCorrect) {
    return {
      ...question,
      questionOptions: question.questionOptions.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
      })),
    };
  }

  return question;
};

const createQuestion = async (data: CreateQuestionInput) => {
  await ensureQuizExists(data.quizId);

  const result = await prisma.questions.create({
    data: {
      quizId: data.quizId,
      questionText: data.questionText,
      questionType: data.questionType,
      points: data.points,
      topic: data.topic,
      difficulty: data.difficulty,
    },
    select: questionSelect,
  });

  await deactivateQuizIfIncomplete(data.quizId);
  return result;
};

const updateQuestion = async (id: string, data: UpdateQuestionInput) => {
  const question = await ensureQuestionExists(id);

  const updateData: Record<string, unknown> = {};

  if (data.questionText !== undefined) updateData.questionText = data.questionText;
  if (data.questionType !== undefined) updateData.questionType = data.questionType;
  if (data.points !== undefined) updateData.points = data.points;
  if (data.topic !== undefined) updateData.topic = data.topic;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;

  const result = await prisma.questions.update({
    where: { id },
    data: updateData,
    select: questionSelect,
  });

  await deactivateQuizIfIncomplete(question.quizId);
  return result;
};

const removeQuestion = async (id: string) => {
  const question = await ensureQuestionExists(id);
  await prisma.questions.delete({ where: { id } });
  await deactivateQuizIfIncomplete(question.quizId);
};

const getOptionsByQuestion = async (questionId: string) => {
  await ensureQuestionExists(questionId);

  return prisma.questionOptions.findMany({
    where: { questionId },
    select: publicOptionSelect,
  });
};

const createOption = async (data: CreateQuestionOptionInput) => {
  const question = await ensureQuestionExists(data.questionId);

  const result = await prisma.questionOptions.create({
    data: {
      questionId: data.questionId,
      optionText: data.optionText,
      isCorrect: data.isCorrect,
    },
    select: {
      id: true,
      questionId: true,
      optionText: true,
      isCorrect: true,
    },
  });

  await deactivateQuizIfIncomplete(question.quizId);
  return result;
};

const updateOption = async (id: string, data: UpdateQuestionOptionInput) => {
  const existing = await prisma.questionOptions.findUnique({
    where: { id },
    select: {
      id: true,
      question: { select: { quizId: true } },
    },
  });

  if (!existing) {
    throw new HttpError(404, "Question option not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.optionText !== undefined) updateData.optionText = data.optionText;
  if (data.isCorrect !== undefined) updateData.isCorrect = data.isCorrect;

  const result = await prisma.questionOptions.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      questionId: true,
      optionText: true,
      isCorrect: true,
    },
  });

  await deactivateQuizIfIncomplete(existing.question.quizId);
  return result;
};

const removeOption = async (id: string) => {
  const existing = await prisma.questionOptions.findUnique({
    where: { id },
    select: {
      question: { select: { quizId: true } },
    },
  });

  if (!existing) {
    throw new HttpError(404, "Question option not found");
  }

  await prisma.questionOptions.delete({ where: { id } });
  await deactivateQuizIfIncomplete(existing.question.quizId);
};

export const questionsService = {
  getQuestionsByQuiz,
  getQuestionById,
  createQuestion,
  updateQuestion,
  removeQuestion,
  getOptionsByQuestion,
  createOption,
  updateOption,
  removeOption,
};
