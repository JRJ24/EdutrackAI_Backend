import { prisma } from "../../database/prisma";
import { HttpError } from "../../helpers/http-error";
import { notificationEmailService } from "./notification-email.service";
import {
  CreateNotificationInput,
  UpdateNotificationInput,
} from "./notifications.validation";

const notificationSelect = {
  id: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  scheduleAt: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

const ensureUserExists = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }
};

const getAll = async (requestingUserId: string, isAdmin: boolean) => {
  return prisma.notifications.findMany({
    where: isAdmin ? {} : { userId: requestingUserId },
    select: notificationSelect,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const notification = await prisma.notifications.findUnique({
    where: { id },
    select: notificationSelect,
  });

  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  if (!isAdmin && notification.user.id !== requestingUserId) {
    throw new HttpError(403, "You can only access your own notifications");
  }

  return notification;
};

const create = async (data: CreateNotificationInput) => {
  await ensureUserExists(data.userId);
  const scheduleAt = data.scheduleAt ?? new Date();

  const notification = await prisma.notifications.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      scheduleAt,
      isRead: data.isRead ?? false,
      createdAt: new Date(),
    },
    select: notificationSelect,
  });

  // Email is an optional delivery channel. Database/in-app notification success
  // never depends on Gmail availability or credentials.
  if (scheduleAt.getTime() <= Date.now()) {
    void notificationEmailService.sendToUser(data.userId, data.title, data.message);
  }

  return notification;
};

const update = async (id: string, data: UpdateNotificationInput) => {
  await prisma.notifications.findUnique({ where: { id }, select: { id: true } })
    .then((existing) => {
      if (!existing) throw new HttpError(404, "Notification not found");
    });

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.message !== undefined) updateData.message = data.message;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.isRead !== undefined) updateData.isRead = data.isRead;
  if (data.scheduleAt !== undefined) updateData.scheduleAt = data.scheduleAt;

  return prisma.notifications.update({
    where: { id },
    data: updateData,
    select: notificationSelect,
  });
};

const remove = async (id: string) => {
  await prisma.notifications.delete({ where: { id } });
};

const markAsRead = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const notification = await prisma.notifications.findUnique({
    where: { id },
    select: { id: true, userId: true, isRead: true },
  });

  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  if (!isAdmin && notification.userId !== requestingUserId) {
    throw new HttpError(403, "You can only mark your own notifications");
  }

  if (notification.isRead) {
    return getById(id, requestingUserId, isAdmin);
  }

  await prisma.notifications.update({
    where: { id },
    data: { isRead: true },
  });

  return getById(id, requestingUserId, isAdmin);
};

const markAllAsRead = async (userId: string) => {
  const result = await prisma.notifications.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { updated: result.count };
};

export const notificationsService = {
  getAll,
  getById,
  create,
  update,
  remove,
  markAsRead,
  markAllAsRead,
};