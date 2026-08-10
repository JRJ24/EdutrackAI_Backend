import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { triggerAdaptiveRecalculation } from "../adaptive-engine/adaptive-engine.events";
import { studySessionsService } from "./study-sessions.service";

const getAll = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    const data = await studySessionsService.getAll(req.user.userId, isAdmin);

    return res.status(200).json({
      ok: true,
      message: "Study sessions fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch study sessions");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    const data = await studySessionsService.getById(
      String(req.params.id),
      req.user.userId,
      isAdmin,
    );

    return res.status(200).json({
      ok: true,
      message: "Study session fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch study session");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getBySubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    const data = await studySessionsService.getBySubject(
      String(req.params.subjectId),
      req.user.userId,
      isAdmin,
    );

    return res.status(200).json({
      ok: true,
      message: "Study sessions by subject fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch study sessions by subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const data = await studySessionsService.create(req.body);
    triggerAdaptiveRecalculation(data.user.id, "study_session_saved");

    return res.status(201).json({
      ok: true,
      message: "Study session created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create study session");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await studySessionsService.update(String(req.params.id), req.body);
    triggerAdaptiveRecalculation(data.user.id, "study_session_saved");

    return res.status(200).json({
      ok: true,
      message: "Study session updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update study session");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await studySessionsService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Study session deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete study session");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const studySessionsController = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
};