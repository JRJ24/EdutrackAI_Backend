import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { quizziesService } from "./quizzies.service";

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }
  return req.user;
};

const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await quizziesService.getAll();

    return res.status(200).json({
      ok: true,
      message: "Quizzes fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch quizzes");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const data = await quizziesService.getById(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Quiz fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch quiz");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getBySubject = async (req: Request, res: Response) => {
  try {
    const data = await quizziesService.getBySubject(String(req.params.subjectId));

    return res.status(200).json({
      ok: true,
      message: "Quizzes by subject fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch quizzes by subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await quizziesService.create(req.body, user.userId);

    return res.status(201).json({
      ok: true,
      message: "Quiz created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create quiz");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await quizziesService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Quiz updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update quiz");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await quizziesService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete quiz");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const startAttempt = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await quizziesService.startAttempt(String(req.params.id), user.userId);

    return res.status(201).json({
      ok: true,
      message: "Quiz attempt started successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to start quiz attempt");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const submitAttemptAnswer = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await quizziesService.submitAttemptAnswer(
      String(req.params.id),
      user.userId,
      req.body,
    );

    return res.status(201).json({
      ok: true,
      message: "Answer submitted successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to submit answer");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const finishAttempt = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await quizziesService.finishAttempt(String(req.params.id), user.userId);

    return res.status(200).json({
      ok: true,
      message: "Quiz attempt finished successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to finish quiz attempt");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getAttemptById = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await quizziesService.getAttemptById(
      String(req.params.id),
      user.userId,
      user.role === "admin",
    );

    return res.status(200).json({
      ok: true,
      message: "Quiz attempt fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch quiz attempt");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getAttemptsByUser = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await quizziesService.getAttemptsByUser(user.userId);

    return res.status(200).json({
      ok: true,
      message: "Quiz attempts fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch quiz attempts");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const quizziesController = {
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