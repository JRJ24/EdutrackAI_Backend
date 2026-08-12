import { Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { getErrorResponse } from "../../helpers/http-error";
import { studentContextService } from "./student-context.service";

const requireUser = (req: Request) => {
  if (!req.user) throw new Error("Authentication required");
  return req.user;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(?:tecnologo|tecnico superior|en|de|la|el)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const careerMatchScore = (career: string, programName: string) => {
  const left = normalizeText(career);
  const right = normalizeText(programName);
  if (!left || !right) return 0;
  if (left === right) return 3;
  if (left.includes(right) || right.includes(left)) return 2;

  const leftTokens = new Set(left.split(" "));
  const rightTokens = right.split(" ");
  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  return overlap >= Math.max(1, Math.ceil(rightTokens.length / 2)) ? 1 : 0;
};

const getCatalog = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { career: true },
    });
    const career = profile?.career?.trim() ?? "";

    const data = studentContextService.getCatalog().map((institution) => ({
      ...institution,
      programs: [...institution.programs].sort(
        (a, b) => careerMatchScore(career, b.name) - careerMatchScore(career, a.name),
      ),
    }));

    return res.status(200).json({
      ok: true,
      message: "Academic catalog fetched successfully",
      data,
    });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch academic catalog");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    const data = studentContextService.getProgram(
      String(req.params.institutionKey),
      String(req.params.programKey),
    );
    return res.status(200).json({ ok: true, message: "Program fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch academic program");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const getMe = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentContextService.getMyContext(user.userId);
    return res.status(200).json({ ok: true, message: "Student context fetched successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to fetch student context");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const applyCatalog = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentContextService.applyCatalog(user.userId, req.body);
    return res.status(200).json({ ok: true, message: "Academic context configured successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to configure academic context");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const saveCustomContext = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentContextService.saveCustomContext(user.userId, req.body);
    return res.status(200).json({ ok: true, message: "Manual academic context configured successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to configure manual academic context");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const addCustomSubject = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentContextService.addCustomSubject(user.userId, req.body);
    return res.status(201).json({ ok: true, message: "Subject added successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to add subject");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const updateMySubject = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentContextService.updateMySubject(
      user.userId,
      String(req.params.assignmentId),
      req.body,
    );
    return res.status(200).json({ ok: true, message: "Subject updated successfully", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to update subject");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

const removeMySubject = async (req: Request, res: Response) => {
  try {
    const user = requireUser(req);
    const data = await studentContextService.removeMySubject(
      user.userId,
      String(req.params.assignmentId),
    );
    return res.status(200).json({ ok: true, message: "Subject removed from current term", data });
  } catch (error) {
    const result = getErrorResponse(error, "Failed to remove subject");
    return res.status(result.statusCode).json({ ok: false, message: result.message });
  }
};

export const studentContextController = {
  getCatalog,
  getProgram,
  getMe,
  applyCatalog,
  saveCustomContext,
  addCustomSubject,
  updateMySubject,
  removeMySubject,
};
