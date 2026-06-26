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

  return prisma.questions.create({
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
};

const updateQuestion = async (id: string, data: UpdateQuestionInput) => {
  await ensureQuestionExists(id);

  const updateData: Record<string, unknown> = {};

  if (data.questionText !== undefined) updateData.questionText = data.questionText;
  if (data.questionType !== undefined) updateData.questionType = data.questionType;
  if (data.points !== undefined) updateData.points = data.points;
  if (data.topic !== undefined) updateData.topic = data.topic;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;

  return prisma.questions.update({
    where: { id },
    data: updateData,
    select: questionSelect,
  });
};

const removeQuestion = async (id: string) => {
  await prisma.questions.delete({ where: { id } });
};

const getOptionsByQuestion = async (questionId: string) => {
  await ensureQuestionExists(questionId);

  return prisma.questionOptions.findMany({
    where: { questionId },
    select: publicOptionSelect,
  });
};

const createOption = async (data: CreateQuestionOptionInput) => {
  await ensureQuestionExists(data.questionId);

  return prisma.questionOptions.create({
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
};

const updateOption = async (id: string, data: UpdateQuestionOptionInput) => {
  const existing = await prisma.questionOptions.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new HttpError(404, "Question option not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.optionText !== undefined) updateData.optionText = data.optionText;
  if (data.isCorrect !== undefined) updateData.isCorrect = data.isCorrect;

  return prisma.questionOptions.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      questionId: true,
      optionText: true,
      isCorrect: true,
    },
  });
};

const removeOption = async (id: string) => {
  await prisma.questionOptions.delete({ where: { id } });
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