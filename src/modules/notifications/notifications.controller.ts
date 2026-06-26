import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { notificationsService } from "./notifications.service";

const requireUser = (req: Request) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }
  return req.user;
};

const getAll = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await notificationsService.getAll(user.userId, user.role === "admin");

    return res.status(200).json({
      ok: true,
      message: "Notifications fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch notifications");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await notificationsService.getById(
      String(req.params.id),
      user.userId,
      user.role === "admin",
    );

    return res.status(200).json({
      ok: true,
      message: "Notification fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch notification");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const data = await notificationsService.create(req.body);

    return res.status(201).json({
      ok: true,
      message: "Notification created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create notification");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await notificationsService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "Notification updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update notification");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await notificationsService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete notification");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const markAsRead = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await notificationsService.markAsRead(
      String(req.params.id),
      user.userId,
      user.role === "admin",
    );

    return res.status(200).json({
      ok: true,
      message: "Notification marked as read",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to mark notification as read");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);

    const data = await notificationsService.markAllAsRead(user.userId);

    return res.status(200).json({
      ok: true,
      message: "All notifications marked as read",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to mark all notifications as read");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const notificationsController = {
  getAll,
  getById,
  create,
  update,
  remove,
  markAsRead,
  markAllAsRead,
};