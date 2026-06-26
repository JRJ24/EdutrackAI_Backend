import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { subjectsService } from "./subjects.service";

const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await subjectsService.getAll();

    return res.status(200).json({
      ok: true,
      message: "Subjects fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch subjects");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const data = await subjectsService.getById(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Subject fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const data = await subjectsService.create(req.body);

    return res.status(201).json({
      ok: true,
      message: "Subject created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await subjectsService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Subject updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await subjectsService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getUsersBySubject = async (req: Request, res: Response) => {
  try {
    const data = await subjectsService.getUsersBySubject(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Subject users fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch subject users");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const assignUser = async (req: Request, res: Response) => {
  try {
    const data = await subjectsService.assignUser(String(req.params.id), req.body);

    return res.status(201).json({
      ok: true,
      message: "User assigned to subject successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to assign user to subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const updateUserAssignment = async (req: Request, res: Response) => {
  try {
    const data = await subjectsService.updateUserAssignment(
      String(req.params.id),
      String(req.params.userId),
      req.body,
    );

    return res.status(200).json({
      ok: true,
      message: "User assignment updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update user assignment");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const unassignUser = async (req: Request, res: Response) => {
  try {
    await subjectsService.unassignUser(String(req.params.id), String(req.params.userId));

    return res.status(200).json({
      ok: true,
      message: "User unassigned from subject successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to unassign user from subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const subjectsController = {
  getAll,
  getById,
  create,
  update,
  remove,
  getUsersBySubject,
  assignUser,
  updateUserAssignment,
  unassignUser,
};