import { connect, type TLSSocket } from "node:tls";
import { prisma } from "../../database/prisma";

interface GmailSmtpConfig {
  user: string;
  appPassword: string;
}

interface DeliveryResult {
  status: "disabled" | "sent" | "failed" | "unverified";
  reason?: string;
}

interface EmailOptions {
  type?: string;
  actionLabel?: string;
  actionUrl?: string;
  allowUnverified?: boolean;
  eyebrow?: string;
}

const cleanHeader = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const config = (): GmailSmtpConfig | null => {
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED?.trim().toLowerCase() !== "true") {
    return null;
  }

  const user = process.env.GMAIL_SMTP_USER?.trim();
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !appPassword) return null;
  return { user, appPassword };
};

const readResponse = (socket: TLSSocket) =>
  new Promise<string>((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onTimeout = () => {
      cleanup();
      reject(new Error("Gmail SMTP response timed out"));
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1];
      if (/^\d{3} /.test(lastLine ?? "")) {
        cleanup();
        resolve(buffer.trim());
      }
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });

const responseCode = (response: string) => Number(response.slice(0, 3));

const expectCode = (response: string, allowed: number[]) => {
  const code = responseCode(response);
  if (!allowed.includes(code)) {
    throw new Error(`Gmail SMTP rejected the request (${code || "unknown"})`);
  }
};

const command = async (socket: TLSSocket, value: string, allowed: number[]) => {
  socket.write(`${value}\r\n`);
  const response = await readResponse(socket);
  expectCode(response, allowed);
  return response;
};

const openSocket = (timeoutMs = 10_000) =>
  new Promise<TLSSocket>((resolve, reject) => {
    const socket = connect({
      host: "smtp.gmail.com",
      port: 465,
      servername: "smtp.gmail.com",
      rejectUnauthorized: true,
    });

    socket.setTimeout(timeoutMs);
    socket.once("secureConnect", () => resolve(socket));
    socket.once("error", reject);
  });

const dotStuff = (value: string) =>
  value.replace(/(^|\r?\n)\./g, "$1..");

const sendSmtpMessage = async (
  smtp: GmailSmtpConfig,
  to: string,
  title: string,
  textBody: string,
  htmlBody: string,
) => {
  const socket = await openSocket();

  try {
    expectCode(await readResponse(socket), [220]);
    await command(socket, "EHLO edutrack.local", [250]);
    await command(socket, "AUTH LOGIN", [334]);
    await command(socket, Buffer.from(smtp.user).toString("base64"), [334]);
    await command(socket, Buffer.from(smtp.appPassword).toString("base64"), [235]);
    await command(socket, `MAIL FROM:<${cleanHeader(smtp.user)}>`, [250]);
    await command(socket, `RCPT TO:<${cleanHeader(to)}>`, [250, 251]);
    await command(socket, "DATA", [354]);

    const encodedSubject = Buffer.from(cleanHeader(title), "utf8").toString("base64");
    const boundary = `edutrack-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const raw = [
      `From: EduTrack AI <${cleanHeader(smtp.user)}>`,
      `To: ${cleanHeader(to)}`,
      `Subject: =?UTF-8?B?${encodedSubject}?=`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      textBody.trim(),
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      htmlBody.trim(),
      "",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    socket.write(`${dotStuff(raw)}\r\n.\r\n`);
    expectCode(await readResponse(socket), [250]);
    await command(socket, "QUIT", [221]);
  } finally {
    if (!socket.destroyed) socket.end();
  }
};

const appUrl = () =>
  (process.env.FRONTEND_PUBLIC_URL?.trim() || "http://localhost:5173").replace(/\/$/, "");

const defaultActionFor = (type?: string) => {
  const base = appUrl();
  if (["evaluation_reminder", "deadline_reminder", "study_inactivity", "adaptive_priority"].includes(type ?? "")) {
    return { label: "Ver mi siguiente paso", url: `${base}/practice` };
  }
  if (type === "quiz_followup") {
    return { label: "Volver a practicar", url: `${base}/practice` };
  }
  return { label: "Abrir EduTrack", url: base };
};

const buildTemplate = (
  firstName: string,
  title: string,
  message: string,
  options: EmailOptions = {},
) => {
  const action = {
    label: options.actionLabel ?? defaultActionFor(options.type).label,
    url: options.actionUrl ?? defaultActionFor(options.type).url,
  };
  const safeName = escapeHtml(firstName || "estudiante");
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const safeEyebrow = escapeHtml(options.eyebrow ?? "Tu copiloto académico");
  const safeAction = escapeHtml(action.label);
  const safeUrl = escapeHtml(action.url);

  const text = [
    `Hola ${firstName || ""}`.trim() + ",",
    "",
    title,
    message,
    "",
    `${action.label}: ${action.url}`,
    "",
    "— EduTrack AI",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e8f0;box-shadow:0 10px 30px rgba(23,32,51,.06);">
            <tr>
              <td style="background:#172033;padding:24px 28px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.75;">EduTrack AI</div>
                <div style="font-size:24px;font-weight:700;margin-top:5px;">Menos ruido. Más siguiente paso.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5b6bff;">${safeEyebrow}</div>
                <p style="font-size:16px;line-height:1.6;margin:14px 0 0;">Hola <strong>${safeName}</strong>,</p>
                <h1 style="font-size:26px;line-height:1.25;margin:14px 0 10px;color:#172033;">${safeTitle}</h1>
                <p style="font-size:16px;line-height:1.7;margin:0;color:#526078;">${safeMessage}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:26px;">
                  <tr>
                    <td style="border-radius:12px;background:#5b6bff;">
                      <a href="${safeUrl}" style="display:inline-block;padding:13px 20px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">${safeAction}</a>
                    </td>
                  </tr>
                </table>
                <p style="font-size:12px;line-height:1.6;margin:26px 0 0;color:#8a94a8;">Este mensaje fue generado por EduTrack a partir de tu contexto académico. No necesitas responder este correo.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { text, html };
};

const sendToUser = async (
  userId: string,
  title: string,
  message: string,
  options: EmailOptions = {},
): Promise<DeliveryResult> => {
  const smtp = config();
  if (!smtp) {
    return { status: "disabled", reason: "Gmail email notifications are not configured" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, isActive: true, emailVerified: true },
  });

  if (!user?.isActive || !user.email) {
    return { status: "failed", reason: "Active user email not found" };
  }

  if (!options.allowUnverified && !user.emailVerified) {
    return { status: "unverified", reason: "User email has not been verified" };
  }

  try {
    const template = buildTemplate(user.firstName?.trim() ?? "", title, message, options);
    await sendSmtpMessage(smtp, user.email, title, template.text, template.html);
    return { status: "sent" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Gmail SMTP error";
    console.error("[email-notifications]", reason);
    return { status: "failed", reason };
  }
};

const sendVerificationEmail = async (
  userId: string,
  verificationUrl: string,
): Promise<DeliveryResult> => {
  return sendToUser(
    userId,
    "Confirma tu correo para activar las alertas de EduTrack",
    "Confirma que esta dirección realmente te pertenece. Después de verificarla, EduTrack podrá enviarte recordatorios automáticos de evaluaciones, fechas importantes y períodos largos sin repaso.",
    {
      allowUnverified: true,
      eyebrow: "Verificación de correo",
      actionLabel: "Verificar mi correo",
      actionUrl: verificationUrl,
      type: "email_verification",
    },
  );
};

export const notificationEmailService = {
  sendToUser,
  sendVerificationEmail,
};
