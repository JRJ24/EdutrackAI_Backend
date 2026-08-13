import { prisma } from "../../database/prisma";

interface LatestStudentRisk {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
    email: string;
  };
  subject: {
    id: string;
    name: string;
  };
  score: number;
  level: string;
  reasons: unknown;
  trigger: string;
  evaluatedAt: Date;
}

const getRiskOverview = async () => {
  const snapshots = await prisma.riskSnapshot.findMany({
    select: {
      userId: true,
      subjectId: true,
      score: true,
      level: true,
      reasons: true,
      trigger: true,
      evaluatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentCode: true,
          email: true,
          role: { select: { name: true } },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { evaluatedAt: "desc" },
    take: 2000,
  });

  const latestByUserSubject = new Map<string, (typeof snapshots)[number]>();
  for (const snapshot of snapshots) {
    const key = `${snapshot.userId}:${snapshot.subjectId}`;
    if (!latestByUserSubject.has(key)) latestByUserSubject.set(key, snapshot);
  }

  const highestByStudent = new Map<string, LatestStudentRisk>();
  for (const snapshot of latestByUserSubject.values()) {
    if (snapshot.user.role.name.trim().toLowerCase() === "admin") continue;

    const current = highestByStudent.get(snapshot.userId);
    if (!current || snapshot.score > current.score) {
      highestByStudent.set(snapshot.userId, {
        user: {
          id: snapshot.user.id,
          firstName: snapshot.user.firstName,
          lastName: snapshot.user.lastName,
          studentCode: snapshot.user.studentCode,
          email: snapshot.user.email,
        },
        subject: snapshot.subject,
        score: snapshot.score,
        level: snapshot.level,
        reasons: snapshot.reasons,
        trigger: snapshot.trigger,
        evaluatedAt: snapshot.evaluatedAt,
      });
    }
  }

  const students = [...highestByStudent.values()].sort((a, b) => b.score - a.score);

  return {
    generatedAt: new Date(),
    totalTrackedStudents: students.length,
    summary: {
      high: students.filter((item) => item.score >= 70).length,
      attention: students.filter((item) => item.score >= 50 && item.score < 70).length,
      watch: students.filter((item) => item.score >= 30 && item.score < 50).length,
      stable: students.filter((item) => item.score < 30).length,
    },
    students: students.slice(0, 30),
  };
};

export const adaptiveAdminService = {
  getRiskOverview,
};
