import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { evaluationsService } from "./evaluations.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const getAll = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await evaluationsService.getAll(user.userId, user.role === "admin");
    return res.status(200).json({ ok: true, message: "Evaluations fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch evaluations");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const getUpcoming = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await evaluationsService.getUpcoming(user.userId, user.role === "admin");
    return res.status(200).json({ ok: true, message: "Upcoming evaluations fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch upcoming evaluations");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await evaluationsService.getById(String(req.params.id), user.userId, user.role === "admin");
    return res.status(200).json({ ok: true, message: "Evaluation fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch evaluation");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await evaluationsService.create(req.body, user.userId);
    return res.status(201).json({ ok: true, message: "Evaluation created successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to create evaluation");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await evaluationsService.update(String(req.params.id), req.body);
    return res.status(200).json({ ok: true, message: "Evaluation updated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to update evaluation");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await evaluationsService.remove(String(req.params.id));
    return res.status(200).json({ ok: true, message: "Evaluation deactivated successfully" });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to deactivate evaluation");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const evaluationsController = {
  getAll,
  getUpcoming,
  getById,
  create,
  update,
  remove,
};
