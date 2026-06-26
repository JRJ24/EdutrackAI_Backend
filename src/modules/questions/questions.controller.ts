import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { questionsService } from "./questions.service";

const isAdminRequest = (req: Request) => req.user?.role === "admin";

const getQuestionsByQuiz = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.getQuestionsByQuiz(
      String(req.params.quizId),
      !isAdminRequest(req),
    );

    return res.status(200).json({
      ok: true,
      message: "Questions fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch questions");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getQuestionById = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.getQuestionById(
      String(req.params.id),
      !isAdminRequest(req),
    );

    return res.status(200).json({
      ok: true,
      message: "Question fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch question");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const createQuestion = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.createQuestion(req.body);

    return res.status(201).json({
      ok: true,
      message: "Question created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create question");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const updateQuestion = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.updateQuestion(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Question updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update question");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const removeQuestion = async (req: Request, res: Response) => {
  try {
    await questionsService.removeQuestion(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete question");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getOptionsByQuestion = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.getOptionsByQuestion(String(req.params.questionId));

    return res.status(200).json({
      ok: true,
      message: "Question options fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch question options");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const createOption = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.createOption(req.body);

    return res.status(201).json({
      ok: true,
      message: "Question option created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create question option");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const updateOption = async (req: Request, res: Response) => {
  try {
    const data = await questionsService.updateOption(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Question option updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update question option");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const removeOption = async (req: Request, res: Response) => {
  try {
    await questionsService.removeOption(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Question option deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete question option");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const questionsController = {
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