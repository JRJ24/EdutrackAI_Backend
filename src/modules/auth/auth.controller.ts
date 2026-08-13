import { Request, Response } from "express";
import { getErrorResponse } from "../../helpers/http-error";
import { authService } from "./auth.service";

const verificationPage = (ok: boolean, title: string, message: string) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box;">
    <main style="width:100%;max-width:560px;background:#fff;border:1px solid #e4e8f0;border-radius:22px;padding:34px;box-sizing:border-box;box-shadow:0 18px 45px rgba(23,32,51,.08);">
      <div style="display:inline-grid;width:52px;height:52px;place-items:center;border-radius:16px;background:${ok ? "#e8f7ef" : "#fff0f0"};color:${ok ? "#168a52" : "#c83b3b"};font-size:26px;font-weight:700;">${ok ? "✓" : "!"}</div>
      <div style="margin-top:22px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#5b6bff;font-weight:700;">EduTrack AI</div>
      <h1 style="font-size:30px;line-height:1.2;margin:8px 0 12px;">${title}</h1>
      <p style="font-size:16px;line-height:1.7;color:#526078;margin:0;">${message}</p>
      <p style="font-size:13px;color:#8a94a8;margin-top:24px;">Ya puedes volver a la pestaña de EduTrack.</p>
    </main>
  </body>
</html>`;

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

const resendVerification = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Authentication required" });
    }

    const data = await authService.sendEmailVerification(req.user.userId);
    return res.status(200).json({
      ok: true,
      message: data.status === "already_verified"
        ? "Email is already verified"
        : "Verification email processed",
      data,
    });
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to send verification email");
    return res.status(errorResponse.statusCode).json({
      ok: false,
      message: errorResponse.message,
    });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const data = await authService.verifyEmail(token);
    return res
      .status(200)
      .type("html")
      .send(verificationPage(
        true,
        "Correo verificado",
        `Listo, ${data.firstName}. EduTrack ya puede usar ${data.email} para enviarte alertas académicas automáticas.`,
      ));
  } catch (error) {
    const errorResponse = getErrorResponse(error, "Failed to verify email");
    return res
      .status(errorResponse.statusCode)
      .type("html")
      .send(verificationPage(
        false,
        "No pude verificar este correo",
        errorResponse.message,
      ));
  }
};

export const authController = {
  register,
  login,
  resendVerification,
  verifyEmail,
};
