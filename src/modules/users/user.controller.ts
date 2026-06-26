import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { userService } from "./user.service";

const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await userService.getAll();

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

const getById = async (req: Request, res: Response) => {
  try {
    const data = await userService.getById(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "User fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const data = await userService.getMe(req.user.userId);

    return res.status(200).json({
      ok: true,
      message: "Current user fetched successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to fetch current user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const data = await userService.create(req.body);

    return res.status(201).json({
      ok: true,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to create user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const data = await userService.update(String(req.params.id), req.body);

    return res.status(200).json({
      ok: true,
      message: "User updated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to update user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await userService.remove(String(req.params.id));

    return res.status(200).json({
      ok: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to delete user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    await userService.changePassword(req.user.userId, req.body);

    return res.status(200).json({
      ok: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to change password");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const userController = {
  getAll,
  getById,
  getMe,
  create,
  update,
  remove,
  changePassword,
};