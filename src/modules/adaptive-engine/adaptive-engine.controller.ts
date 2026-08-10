import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { adaptiveEngineService } from "./adaptive-engine.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const getOverview = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await adaptiveEngineService.getOverview(user.userId);
    return res.status(200).json({ ok: true, message: "Adaptive overview fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch adaptive overview");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const recalculate = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await adaptiveEngineService.recalculateUser(user.userId, "manual");
    return res.status(200).json({ ok: true, message: "Adaptive plan recalculated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to recalculate adaptive plan");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const recalculateAll = async (_req: Request, res: Response) => {
  try {
    const data = await adaptiveEngineService.recalculateAllActiveUsers("manual");
    return res.status(200).json({ ok: true, message: "Adaptive plans recalculated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to recalculate adaptive plans");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const adaptiveEngineController = {
  getOverview,
  recalculate,
  recalculateAll,
};
