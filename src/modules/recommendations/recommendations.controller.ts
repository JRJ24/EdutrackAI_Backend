import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { recommendationsService } from "./recommendations.service";

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }
  return req.user;
};

const getAll = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await recommendationsService.getAll(user.userId, user.role === "admin");

    return res.status(200).json({
      ok: true,
      message: "Recommendations fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch recommendations");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await recommendationsService.getById(
      String(req.params.id),
      user.userId,
      user.role === "admin",
    );

    return res.status(200).json({
      ok: true,
      message: "Recommendation fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch recommendation");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const data = await recommendationsService.create(req.body);

    return res.status(201).json({
      ok: true,
      message: "Recommendation created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create recommendation");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await recommendationsService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Recommendation updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update recommendation");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await recommendationsService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete recommendation");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const recommendationsController = {
  getAll,
  getById,
  create,
  update,
  remove,
};