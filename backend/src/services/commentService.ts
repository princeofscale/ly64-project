import prisma from '../config/database';

interface CommentData {
  id: string;
  questionId: string;
  userId: string;
  username: string;
  name: string;
  parentId: string | null;
  content: string;
  likes: number;
  isDeleted: boolean;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentData[];
}

interface PaginatedComments {
  comments: CommentData[];
  total: number;
  page: number;
  limit: number;
}

class CommentService {
  private static instance: CommentService;

  private constructor() {}

  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  public async getComments(
    questionId: string,
    userId: string | null,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedComments> {
    const skip = (page - 1) * limit;

    // Get top-level comments
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { questionId, parentId: null, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: { questionId, parentId: null, isDeleted: false },
      }),
    ]);

    // Get all replies for these comments
    const commentIds = comments.map(c => c.id);
    const replies = commentIds.length > 0
      ? await prisma.comment.findMany({
          where: { parentId: { in: commentIds }, isDeleted: false },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    // Get user info for all comments
    const allComments = [...comments, ...replies];
    const userIds = [...new Set(allComments.map(c => c.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, name: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Check which comments current user has liked
    let likedIds = new Set<string>();
    if (userId) {
      const likes = await prisma.commentLike.findMany({
        where: {
          commentId: { in: allComments.map(c => c.id) },
          userId,
        },
        select: { commentId: true },
      });
      likedIds = new Set(likes.map(l => l.commentId));
    }

    // Build response
    const formatComment = (comment: typeof comments[0], commentReplies: typeof replies): CommentData => {
      const user = userMap.get(comment.userId);
      return {
        id: comment.id,
        questionId: comment.questionId,
        userId: comment.userId,
        username: user?.username || 'unknown',
        name: user?.name || 'Пользователь',
        parentId: comment.parentId,
        content: comment.content,
        likes: comment.likes,
        isDeleted: comment.isDeleted,
        isLiked: likedIds.has(comment.id),
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        replies: commentReplies.map(r => formatComment(r, [])),
      };
    };

    const formattedComments = comments.map(c =>
      formatComment(c, replies.filter(r => r.parentId === c.id))
    );

    return {
      comments: formattedComments,
      total,
      page,
      limit,
    };
  }

  public async addComment(
    questionId: string,
    userId: string,
    content: string,
    parentId?: string
  ): Promise<CommentData> {
    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length > 2000) {
      throw new Error('Комментарий должен быть от 1 до 2000 символов');
    }

    // If replying, check parent exists
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.isDeleted) {
        throw new Error('Родительский комментарий не найден');
      }
      // Don't allow nested replies (only 1 level)
      if (parent.parentId) {
        throw new Error('Вложенные ответы не поддерживаются');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        questionId,
        userId,
        content: trimmedContent,
        parentId: parentId || null,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, name: true },
    });

    return {
      id: comment.id,
      questionId: comment.questionId,
      userId: comment.userId,
      username: user?.username || 'unknown',
      name: user?.name || 'Пользователь',
      parentId: comment.parentId,
      content: comment.content,
      likes: 0,
      isDeleted: false,
      isLiked: false,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: [],
    };
  }

  public async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Комментарий не найден');
    if (comment.userId !== userId) throw new Error('Нет прав для удаления');

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, content: '[Комментарий удалён]' },
    });
  }

  public async toggleLike(commentId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.isDeleted) throw new Error('Комментарий не найден');

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      // Unlike
      await prisma.commentLike.delete({ where: { id: existing.id } });
      await prisma.comment.update({
        where: { id: commentId },
        data: { likes: Math.max(0, comment.likes - 1) },
      });
      return { liked: false, likesCount: Math.max(0, comment.likes - 1) };
    } else {
      // Like
      await prisma.commentLike.create({
        data: { commentId, userId },
      });
      await prisma.comment.update({
        where: { id: commentId },
        data: { likes: comment.likes + 1 },
      });
      return { liked: true, likesCount: comment.likes + 1 };
    }
  }
}

export const commentService = CommentService.getInstance();
export default commentService;
