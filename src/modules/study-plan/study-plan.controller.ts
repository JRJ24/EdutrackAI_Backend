import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { studyPlanService } from "./study-plan.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const getMyPlan = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const includeHistory = String(req.query.includeHistory ?? "false") === "true";
    const data = await studyPlanService.getMyPlan(user.userId, includeHistory);
    return res.status(200).json({ ok: true, message: "Study plan fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch study plan");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studyPlanService.getById(String(req.params.id), user.userId, user.role === "admin");
    return res.status(200).json({ ok: true, message: "Study plan activity fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch study plan activity");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studyPlanService.update(
      String(req.params.id),
      user.userId,
      user.role === "admin",
      req.body,
    );
    return res.status(200).json({ ok: true, message: "Study plan activity updated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to update study plan activity");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const regenerate = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studyPlanService.regenerate(user.userId);
    return res.status(200).json({ ok: true, message: "Study plan regenerated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to regenerate study plan");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const studyPlanController = {
  getMyPlan,
  getById,
  update,
  regenerate,
};
