import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { authService } from "./auth.service";

const register = async (req: Request, res: Response) => {
  try {
    const data = await authService.register(req.body);

    return res.status(201).json({
      ok: true,
      message: "User registered successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to register user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const data = await authService.login(req.body);

    return res.status(200).json({
      ok: true,
      message: "User authenticated successfully",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to authenticate user");

    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

export const authController = {
  register,
  login,
};
