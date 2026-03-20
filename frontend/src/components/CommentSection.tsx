import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

import api from '../services/api';
import { useAuthStore } from '../store/authStore';

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
  createdAt: string;
  replies: CommentData[];
}

interface CommentSectionProps {
  questionId: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

export function CommentSection({ questionId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/comments/${questionId}?page=${pageNum}&limit=10`);
      const data = response.data.data;
      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      setTotal(data.total);
      setPage(pageNum);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    if (isExpanded) {
      void loadComments(1);
    }
  }, [isExpanded, loadComments]);

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/comments/${questionId}`, {
        content: newComment.trim(),
      });
      setComments(prev => [response.data.data, ...prev]);
      setTotal(prev => prev + 1);
      setNewComment('');
      toast.success('Комментарий добавлен');
    } catch {
      toast.error('Ошибка добавления комментария');
    } finally {
      setSubmitting(false);
    }
  }, [questionId, newComment]);

  const handleReply = useCallback(async (parentId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/comments/${questionId}`, {
        content: replyText.trim(),
        parentId,
      });
      // Add reply to parent comment
      setComments(prev => prev.map(c =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, response.data.data] }
          : c
      ));
      setReplyTo(null);
      setReplyText('');
      toast.success('Ответ добавлен');
    } catch {
      toast.error('Ошибка');
    } finally {
      setSubmitting(false);
    }
  }, [questionId, replyText]);

  const handleLike = useCallback(async (commentId: string) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      const { liked, likesCount } = response.data.data;

      const updateComment = (c: CommentData): CommentData =>
        c.id === commentId
          ? { ...c, likes: likesCount, isLiked: liked }
          : { ...c, replies: c.replies.map(updateComment) };

      setComments(prev => prev.map(updateComment));
    } catch {
      toast.error('Ошибка');
    }
  }, []);

  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      const removeComment = (c: CommentData): CommentData =>
        c.id === commentId
          ? { ...c, isDeleted: true, content: '[Комментарий удалён]' }
          : { ...c, replies: c.replies.map(removeComment) };

      setComments(prev => prev.map(removeComment));
      toast.success('Комментарий удалён');
    } catch {
      toast.error('Ошибка удаления');
    }
  }, []);

  const renderComment = (comment: CommentData, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mt-4'}`}>
      <div className={`p-4 rounded-xl ${isReply ? 'bg-slate-50' : 'bg-white border border-slate-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">
                {comment.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-medium text-slate-900 truncate block">
                {comment.name}
              </span>
              <span className="text-xs text-slate-400">
                @{comment.username} · {timeAgo(comment.createdAt)}
              </span>
            </div>
          </div>
          {user?.id === comment.userId && !comment.isDeleted && (
            <button
              onClick={() => void handleDelete(comment.id)}
              className="text-slate-400 hover:text-red-500 transition-colors text-xs"
            >
              Удалить
            </button>
          )}
        </div>

        <p className={`mt-2 text-sm ${comment.isDeleted ? 'text-slate-400 italic' : 'text-slate-700'}`}>
          {comment.content}
        </p>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => void handleLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              comment.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            }`}
          >
            {comment.isLiked ? '❤️' : '🤍'} {comment.likes > 0 && comment.likes}
          </button>
          {!isReply && !comment.isDeleted && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
            >
              Ответить
            </button>
          )}
        </div>

        {/* Reply Input */}
        {replyTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleReply(comment.id); else if (e.key === 'Escape') setReplyTo(null); }}
              placeholder="Ваш ответ..."
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
            />
            <button
              onClick={() => void handleReply(comment.id)}
              disabled={submitting || !replyText.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '...' : 'Отправить'}
            </button>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && comment.replies.map(reply => renderComment(reply, true))}
    </div>
  );

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        {isExpanded ? 'Скрыть комментарии' : `Комментарии${total > 0 ? ` (${total})` : ''}`}
      </button>

      {isExpanded && (
        <div className="mt-4">
          {/* New Comment Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSubmit(); }}
              placeholder="Написать комментарий..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
            />
            <button
              onClick={() => void handleSubmit()}
              disabled={submitting || !newComment.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '...' : 'Отправить'}
            </button>
          </div>

          {/* Comments List */}
          {loading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Пока нет комментариев. Будьте первым!
            </div>
          ) : (
            <>
              {comments.map(c => renderComment(c))}

              {/* Load More */}
              {comments.length < total && (
                <button
                  onClick={() => void loadComments(page + 1)}
                  disabled={loading}
                  className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {loading ? 'Загрузка...' : 'Показать ещё'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
