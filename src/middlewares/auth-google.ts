import { NextFunction, Request, Response } from "express";
import { HttpError } from "../helpers/http-error";
import { verifyAuthToken } from "../helpers/jwt";

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAuthToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (_error) {
    return next(new HttpError(401, "Invalid or expired token"));
  }

  return next();
};