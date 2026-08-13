import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { adminService } from "./admin.service";
import { userFilterSchema } from "../dashboard/dashboard.validations";
import { auditLogFilterSchema } from "./admin.validation";

const requireAdmin = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }

  return req.user;
};

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
    return res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
  }
};

const listRoles = async (_req: Request, res: Response) => {
  try {
    const data = await adminService.listRoles();

    return res.status(200).json({
      ok: true,
      message: "Roles fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch roles");
    return res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
  }
};

const setUserActive = async (req: Request, res: Response) => {
  try {
    const admin = requireAdmin(req);
    const data = await adminService.setUserActive(
      String(req.params.id),
      req.body,
      admin.userId,
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
    return res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
  }
};

const setUserRole = async (req: Request, res: Response) => {
  try {
    const admin = requireAdmin(req);
    const data = await adminService.setUserRole(
      String(req.params.id),
      req.body,
      admin.userId,
      req.ip,
      req.headers["user-agent"],
    );

    return res.status(200).json({
      ok: true,
      message: "User role updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update user role");
    return res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
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
    return res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
  }
};

const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const filter = auditLogFilterSchema.parse(req.query);
    const data = await adminService.listAuditLogs(filter);

    return res.status(200).json({
      ok: true,
      message: "Audit logs fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch audit logs");
    return res.status(errorResponse.statusCode).json({ ok: false, message: errorResponse.message });
  }
};

export const adminController = {
  listUsers,
  listRoles,
  setUserActive,
  setUserRole,
  getStats,
  listAuditLogs,
};
