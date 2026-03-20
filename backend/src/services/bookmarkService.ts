import prisma from '../config/database';

interface BookmarkWithQuestion {
  id: string;
  userId: string;
  questionId: string;
  note: string | null;
  createdAt: Date;
  question: {
    id: string;
    question: string;
    subject: string;
    topic: string | null;
    difficulty: string;
    type: string;
  } | null;
}

class BookmarkService {
  private static instance: BookmarkService;

  private constructor() {}

  public static getInstance(): BookmarkService {
    if (!BookmarkService.instance) {
      BookmarkService.instance = new BookmarkService();
    }
    return BookmarkService.instance;
  }

  public async toggle(userId: string, questionId: string, note?: string): Promise<{ bookmarked: boolean }> {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.bookmark.create({
      data: { userId, questionId, note: note || null },
    });
    return { bookmarked: true };
  }

  public async getAll(userId: string, subject?: string): Promise<BookmarkWithQuestion[]> {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const questionIds = bookmarks.map(b => b.questionId);
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        ...(subject ? { subject } : {}),
      },
      select: {
        id: true,
        question: true,
        subject: true,
        topic: true,
        difficulty: true,
        type: true,
      },
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    const result = bookmarks
      .map(b => ({
        ...b,
        question: questionMap.get(b.questionId) || null,
      }))
      .filter(b => !subject || b.question !== null);

    return result;
  }

  public async isBookmarked(userId: string, questionId: string): Promise<boolean> {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    return !!bookmark;
  }

  public async remove(userId: string, questionId: string): Promise<void> {
    await prisma.bookmark.deleteMany({
      where: { userId, questionId },
    });
  }
}

export default BookmarkService.getInstance();
