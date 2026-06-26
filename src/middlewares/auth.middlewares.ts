import { NextFunction, Request, Response } from "express";
import { HttpError } from "../helpers/http-error";
import { verifyAuthToken } from "../helpers/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authorization header missing or invalid"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new HttpError(401, "Access token is required"));
  }

  try {
    const payload = verifyAuthToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (_error) {
    return next(new HttpError(401, "Invalid or expired token"));
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Insufficient permissions"));
    }

    return next();
  };
};