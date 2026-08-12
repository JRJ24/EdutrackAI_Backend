import { connect, type TLSSocket } from "node:tls";
import { prisma } from "../../database/prisma";

interface GmailSmtpConfig {
  user: string;
  appPassword: string;
}

interface DeliveryResult {
  status: "disabled" | "sent" | "failed";
  reason?: string;
}

const cleanHeader = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

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
  message: string,
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
    const body = dotStuff(message.trim());
    const raw = [
      `From: EduTrack AI <${cleanHeader(smtp.user)}>`,
      `To: ${cleanHeader(to)}`,
      `Subject: =?UTF-8?B?${encodedSubject}?=`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      body,
      "",
    ].join("\r\n");

    socket.write(`${raw}\r\n.\r\n`);
    expectCode(await readResponse(socket), [250]);
    await command(socket, "QUIT", [221]);
  } finally {
    if (!socket.destroyed) socket.end();
  }
};

const sendToUser = async (
  userId: string,
  title: string,
  message: string,
): Promise<DeliveryResult> => {
  const smtp = config();
  if (!smtp) {
    return { status: "disabled", reason: "Gmail email notifications are not configured" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, isActive: true },
  });

  if (!user?.isActive || !user.email) {
    return { status: "failed", reason: "Active user email not found" };
  }

  try {
    const greeting = user.firstName?.trim() ? `Hola ${user.firstName.trim()},\n\n` : "";
    await sendSmtpMessage(
      smtp,
      user.email,
      title,
      `${greeting}${message}\n\n— EduTrack AI`,
    );
    return { status: "sent" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Gmail SMTP error";
    console.error("[email-notifications]", reason);
    return { status: "failed", reason };
  }
};

export const notificationEmailService = {
  sendToUser,
};
