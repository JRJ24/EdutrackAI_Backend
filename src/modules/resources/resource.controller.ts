import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { resourcesService } from "./resource.service";

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }
  return req.user;
};

const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await resourcesService.getAll();

    return res.status(200).json({
      ok: true,
      message: "Resources fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch resources");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const data = await resourcesService.getById(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Resource fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch resource");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getBySubject = async (req: Request, res: Response) => {
  try {
    const data = await resourcesService.getBySubject(String(req.params.subjectId));

    return res.status(200).json({
      ok: true,
      message: "Resources by subject fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch resources by subject");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await resourcesService.create(req.body, user.userId);

    return res.status(201).json({
      ok: true,
      message: "Resource created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create resource");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await resourcesService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Resource updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update resource");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await resourcesService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete resource");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const resourcesController = {
  getAll,
  getById,
  getBySubject,
  create,
  update,
  remove,
};