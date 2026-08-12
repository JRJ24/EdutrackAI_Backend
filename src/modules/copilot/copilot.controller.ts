import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { copilotService } from "./copilot.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const getPulse = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await copilotService.getPulse(user.userId);
    return res.status(200).json({ ok: true, message: "Student pulse fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch student pulse");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const ask = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await copilotService.ask(user.userId, req.body);
    return res.status(200).json({ ok: true, message: "Copilot response generated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to answer copilot request");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const copilotController = { getPulse, ask };
