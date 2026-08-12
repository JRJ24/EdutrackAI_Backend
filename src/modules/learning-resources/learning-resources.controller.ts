import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { learningResourcesService } from "./learning-resources.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const discover = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await learningResourcesService.discover(
      user.userId,
      String(req.params.subjectId),
      typeof req.query.topic === "string" ? req.query.topic : undefined,
    );

    return res.status(200).json({
      ok: true,
      message: "Learning resources discovered successfully",
      data,
    });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to discover learning resources");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const learningResourcesController = { discover };
