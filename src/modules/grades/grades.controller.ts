import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { gradesService } from "./grades.service";

const getAll = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    const data = await gradesService.getAll(req.user.userId, isAdmin);

    return res.status(200).json({
      ok: true,
      message: "Grades fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch grades");

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
    const data = await gradesService.getById(String(req.params.id), req.user.userId, isAdmin);

    return res.status(200).json({
      ok: true,
      message: "Grade fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch grade");

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
    const data = await gradesService.getBySubject(
      String(req.params.subjectId),
      req.user.userId,
      isAdmin,
    );

    return res.status(200).json({
      ok: true,
      message: "Grades by subject fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch grades by subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    const data = await gradesService.create(req.body, req.user.userId, isAdmin);

    return res.status(201).json({
      ok: true,
      message: "Grade created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create grade");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    const data = await gradesService.update(
      String(req.params.id),
      req.body,
      req.user.userId,
      isAdmin,
    );

    return res.status(200).json({
      ok: true,
      message: "Grade updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update grade");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const isAdmin = req.user.role === "admin";
    await gradesService.remove(String(req.params.id), req.user.userId, isAdmin);

    return res.status(200).json({
      ok: true,
      message: "Grade deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete grade");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const gradesController = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
};
