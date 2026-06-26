import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { academicProfileService } from "./academic-profile.service";

const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await academicProfileService.getAll();

    return res.status(200).json({
      ok: true,
      message: "Academic profiles fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch academic profiles");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const data = await academicProfileService.getById(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Academic profile fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch academic profile");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getByUser = async (req: Request, res: Response) => {
  try {
    const data = await academicProfileService.getByUser(String(req.params.userId));

    return res.status(200).json({
      ok: true,
      message: "Academic profile fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch academic profile");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const data = await academicProfileService.create(req.body);

    return res.status(201).json({
      ok: true,
      message: "Academic profile created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create academic profile");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await academicProfileService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Academic profile updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update academic profile");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await academicProfileService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Academic profile deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete academic profile");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const academicProfileController = {
  getAll,
  getById,
  getByUser,
  create,
  update,
  remove,
};