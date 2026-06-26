import { prisma } from "../../database/prisma";
import { Prisma } from "../../../generated/prisma/client";

const HOURS_24 = 24 * 60 * 60 * 1000;
const DAYS_7 = 7 * HOURS_24;

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const dashboardService = {
  async getSummary(userId: string) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - DAYS_7);

    const [subjectsCount, sessionsLastWeek, attemptsLastWeek, unreadNotifications] =
      await Promise.all([
        prisma.userSubject.count({ where: { userId } }),
        prisma.studySessions.findMany({
          where: { userId, startedAt: { gte: lastWeek } },
          select: { durationMinutes: true, productivityRating: true },
        }),
        prisma.quizAttempts.findMany({
          where: { userId, startedAt: { gte: lastWeek } },
          select: { score: true, correctAnswers: true, totalQuestion: true, startedAt: true, finishedAt: true },
        }),
        prisma.notifications.count({ where: { userId, isRead: false } }),
      ]);

    const totalStudyMinutes = sessionsLastWeek.reduce(
      (acc, s) => acc + s.durationMinutes,
      0,
    );
    const avgProductivity =
      sessionsLastWeek.length > 0
        ? Number(
            (
              sessionsLastWeek.reduce((acc, s) => acc + s.productivityRating, 0) /
              sessionsLastWeek.length
            ).toFixed(2),
          )
        : 0;

    const finishedAttempts = attemptsLastWeek.filter((a) => a.finishedAt);
    const avgScore =
      finishedAttempts.length > 0
        ? Number(
            (
              finishedAttempts.reduce((acc, a) => acc + Number(a.score), 0) /
              finishedAttempts.length
            ).toFixed(2),
          )
        : 0;

    return {
      enrolledSubjects: subjectsCount,
      studySessionsLast7Days: sessionsLastWeek.length,
      totalStudyMinutesLast7Days: totalStudyMinutes,
      averageProductivity: avgProductivity,
      quizAttemptsLast7Days: attemptsLastWeek.length,
      averageQuizScore: avgScore,
      unreadNotifications,
    };
  },

  async getPerformance(userId: string) {
    const subjects = await prisma.userSubject.findMany({
      where: { userId },
      select: {
        currentAverage: true,
        subject: { select: { id: true, name: true, level: true } },
      },
    });

    const gradesBySubject = await prisma.grades.groupBy({
      by: ["subjectId"],
      where: { userId },
      _avg: { gradeValue: true },
      _count: { _all: true },
    });

    const sessionsBySubject = await prisma.studySessions.groupBy({
      by: ["subjectId"],
      where: { userId },
      _sum: { durationMinutes: true },
      _count: { _all: true },
    });

    const gradesMap = new Map(
      gradesBySubject.map((g) => [
        g.subjectId,
        {
          average: g._avg.gradeValue ? Number(g._avg.gradeValue.toFixed(2)) : 0,
          count: g._count._all,
        },
      ]),
    );

    const sessionsMap = new Map(
      sessionsBySubject.map((s) => [
        s.subjectId,
        {
          totalMinutes: s._sum.durationMinutes ?? 0,
          count: s._count._all,
        },
      ]),
    );

    return subjects.map((s) => ({
      subject: s.subject,
      declaredAverage: s.currentAverage,
      grades: gradesMap.get(s.subject.id) ?? { average: 0, count: 0 },
      studySessions: sessionsMap.get(s.subject.id) ?? { totalMinutes: 0, count: 0 },
    }));
  },

  async getStreak(userId: string) {
    const sessions = await prisma.studySessions.findMany({
      where: { userId },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
    });

    if (sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0, activeDaysLast30: 0 };
    }

    const dayKeys = new Set(
      sessions.map((s) => startOfDay(s.startedAt).toISOString().slice(0, 10)),
    );

    const sortedKeys = Array.from(dayKeys)
      .sort()
      .reverse();

    const today = startOfDay(new Date()).toISOString().slice(0, 10);
    let currentStreak = 0;

    if (sortedKeys[0] === today) {
      let cursor = new Date(today);
      while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
        currentStreak += 1;
        cursor = new Date(cursor.getTime() - HOURS_24);
      }
    }

    let longestStreak = 0;
    let running = 0;
    let previousDate: Date | null = null;

    for (const key of sortedKeys.slice().reverse()) {
      const currentDate = new Date(key);
      if (previousDate && currentDate.getTime() - previousDate.getTime() === HOURS_24) {
        running += 1;
      } else {
        running = 1;
      }

      longestStreak = Math.max(longestStreak, running);
      previousDate = currentDate;
    }

    const last30Days = new Date(Date.now() - 30 * HOURS_24);
    const activeDaysLast30 = Array.from(dayKeys).filter(
      (key) => new Date(key) >= last30Days,
    ).length;

    return { currentStreak, longestStreak, activeDaysLast30 };
  },
};

export type DashboardSummary = Prisma.JsonObject;