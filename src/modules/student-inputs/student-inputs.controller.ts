import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { studentInputsService } from "./student-inputs.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const list = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentInputsService.list(
      user.userId,
      typeof req.query.subjectId === "string" ? req.query.subjectId : undefined,
      typeof req.query.itemType === "string" ? req.query.itemType : undefined,
    );
    return res.status(200).json({ ok: true, message: "Academic inputs fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch academic inputs");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentInputsService.create(user.userId, req.body);
    return res.status(201).json({ ok: true, message: "Academic input created successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to create academic input");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentInputsService.update(user.userId, String(req.params.id), req.body);
    return res.status(200).json({ ok: true, message: "Academic input updated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to update academic input");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    await studentInputsService.remove(user.userId, String(req.params.id));
    return res.status(200).json({ ok: true, message: "Academic input removed successfully" });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to remove academic input");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const studentInputsController = { list, create, update, remove };
