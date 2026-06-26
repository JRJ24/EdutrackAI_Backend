import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { dashboardService } from "./dashboard.service";

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }
  return req.user;
};

const getSummary = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await dashboardService.getSummary(user.userId);

    return res.status(200).json({
      ok: true,
      message: "Dashboard summary fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch dashboard summary");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getPerformance = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await dashboardService.getPerformance(user.userId);

    return res.status(200).json({
      ok: true,
      message: "Dashboard performance fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch dashboard performance");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getStreak = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await dashboardService.getStreak(user.userId);

    return res.status(200).json({
      ok: true,
      message: "Dashboard streak fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch dashboard streak");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const dashboardController = {
  getSummary,
  getPerformance,
  getStreak,
};