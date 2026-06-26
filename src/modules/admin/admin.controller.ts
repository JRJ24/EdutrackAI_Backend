import { Request, Response } from "express";
import { z } from "zod";
import { getErrorResponse } from "../../helpers/http-error";
import { adminService } from "./admin.service";
import { userFilterSchema } from "../dashboard/dashboard.validations";
import { activeToggleSchema } from "./admin.validation";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listUsers = async (req: Request, res: Response) => {
  try {
    const filter = userFilterSchema.parse(req.query);

    const data = await adminService.listUsers(filter);

    return res.status(200).json({
      ok: true,
      message: "Users fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch users");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const setUserActive = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const data = await adminService.setUserActive(
      String(req.params.id),
      req.body,
      req.user.userId,
      req.ip,
      req.headers["user-agent"],
    );

    return res.status(200).json({
      ok: true,
      message: "User status updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update user status");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getStats = async (_req: Request, res: Response) => {
  try {
    const data = await adminService.getStats();

    return res.status(200).json({
      ok: true,
      message: "Admin stats fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch admin stats");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);

    const data = await adminService.listAuditLogs(page, limit);

    return res.status(200).json({
      ok: true,
      message: "Audit logs fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch audit logs");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const adminController = {
  listUsers,
  setUserActive,
  getStats,
  listAuditLogs,
};