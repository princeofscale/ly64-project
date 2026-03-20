import crypto from 'crypto';

import prisma from '../config/database';

class ClassroomService {
  async createClassroom(teacherId: string, name: string) {
    const code = await this.generateUniqueCode();
    return prisma.classroom.create({
      data: { name, code, teacherId },
      include: { members: true },
    });
  }

  async joinByCode(userId: string, code: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { code },
    });

    if (!classroom) {
      throw new Error('Класс не найден');
    }

    // Check if already a member
    const existing = await prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId: classroom.id, userId } },
    });

    if (existing) {
      throw new Error('Вы уже в этом классе');
    }

    await prisma.classroomMember.create({
      data: { classroomId: classroom.id, userId },
    });

    return classroom;
  }

  async getTeacherClassrooms(teacherId: string) {
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId },
      include: {
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      memberCount: c.members.length,
      createdAt: c.createdAt,
    }));
  }

  async getStudentClassrooms(userId: string) {
    const memberships = await prisma.classroomMember.findMany({
      where: { userId },
      include: {
        classroom: true,
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map(m => ({
      id: m.classroom.id,
      name: m.classroom.name,
      code: m.classroom.code,
      teacherId: m.classroom.teacherId,
      joinedAt: m.joinedAt,
    }));
  }

  async getClassroomStudents(classroomId: string) {
    const members = await prisma.classroomMember.findMany({
      where: { classroomId },
      orderBy: { joinedAt: 'asc' },
    });

    const studentIds = members.map(m => m.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, username: true, avatar: true },
    });

    // Get test stats for each student
    const results = await Promise.all(
      users.map(async (user) => {
        const stats = await prisma.testAttempt.aggregate({
          where: { userId: user.id, completedAt: { not: null } },
          _count: true,
          _avg: { score: true },
          _max: { score: true },
        });

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          testsCompleted: stats._count,
          avgScore: Math.round(stats._avg.score || 0),
          bestScore: stats._max.score || 0,
        };
      }),
    );

    return results;
  }

  async getClassroomStats(classroomId: string) {
    const members = await prisma.classroomMember.findMany({
      where: { classroomId },
    });

    const studentIds = members.map(m => m.userId);

    const aggr = await prisma.testAttempt.aggregate({
      where: { userId: { in: studentIds }, completedAt: { not: null } },
      _count: true,
      _avg: { score: true },
    });

    return {
      totalStudents: members.length,
      totalTests: aggr._count,
      averageScore: Math.round(aggr._avg.score || 0),
    };
  }

  async deleteClassroom(classroomId: string, teacherId: string) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new Error('Класс не найден');
    }

    if (classroom.teacherId !== teacherId) {
      throw new Error('Нет прав для удаления');
    }

    await prisma.classroom.delete({ where: { id: classroomId } });
  }

  private async generateUniqueCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      const existing = await prisma.classroom.findUnique({ where: { code } });
      if (!existing) return code;
    }
    throw new Error('Не удалось сгенерировать уникальный код');
  }
}

export default new ClassroomService();
