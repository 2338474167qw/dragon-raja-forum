import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Eye,
  Clock,
  ArrowLeft,
  Send,
  Trash2,
  Sparkles,
  Tag,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';
import { postsApi, commentsApi } from '../services/api';
import { useUserStore } from '../store/userStore';
import BloodlineBadge from '../components/common/BloodlineBadge';
import { Post, Comment, POST_CATEGORIES } from '../types';

const commentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, updateExp } = useUserStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showExpToast, setShowExpToast] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      const res = await postsApi.getById(id!);
      setPost(res.post);
    } catch (err: unknown) {
      console.error('获取帖子失败:', err);
      setError('帖子不存在或已被删除');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await commentsApi.getList(id!, { limit: 50 });
      setComments(res.comments);
    } catch (err: unknown) {
      console.error('获取评论失败:', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id, fetchPost, fetchComments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (catValue: string) => {
    return POST_CATEGORIES.find((c) => c.value === catValue)?.label || catValue;
  };

  const getCategoryColor = (catValue: string) => {
    const colors: Record<string, string> = {
      discussion: 'bg-blue-900/60 text-blue-300 border-blue-700/40',
      experience: 'bg-green-900/60 text-green-300 border-green-700/40',
      question: 'bg-orange-900/60 text-orange-300 border-orange-700/40',
      news: 'bg-purple-900/60 text-purple-300 border-purple-700/40',
      casual: 'bg-pink-900/60 text-pink-300 border-pink-700/40',
    };
    return colors[catValue] || 'bg-gray-800 text-gray-400 border-gray-700';
  };

  const handleLikePost = async () => {
    if (!isAuthenticated || !post) return;
    try {
      const res = await postsApi.like(post.id);
      setPost({
        ...post,
        isLiked: res.liked,
        likes: res.liked ? post.likes + 1 : post.likes - 1,
      });
      if (res.likeExpGained && user) {
        updateExp(user.exp + res.likeExpGained);
        setShowExpToast(`+${res.likeExpGained} EXP`);
        setTimeout(() => setShowExpToast(null), 3000);
      }
    } catch (err: unknown) {
      console.error('点赞失败:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !confirm('确定要删除这篇帖子吗？')) return;
    try {
      await postsApi.delete(post.id);
      navigate('/forum');
    } catch (err: unknown) {
      console.error('删除帖子失败:', err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !commentContent.trim() || !post) return;
    setSubmittingComment(true);
    setCommentError(null);
    try {
      const res = await commentsApi.create(post.id, {
        content: commentContent.trim(),
        parentId: replyTo || undefined,
      });
      setComments([res.comment, ...comments]);
      setCommentContent('');
      setReplyTo(null);
      if (res.expGained && user) {
        updateExp(user.exp + res.expGained);
        setShowExpToast(`+${res.expGained} EXP`);
        setTimeout(() => setShowExpToast(null), 3000);
      }
    } catch (err: unknown) {
      console.error('发表评论失败:', err);
      setCommentError('评论提交失败，请稍后重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (comment: Comment) => {
    if (!isAuthenticated || !post) return;
    try {
      const res = await commentsApi.like(post.id, comment.id);
      setComments(
        comments.map((c) =>
          c.id === comment.id
            ? { ...c, likes: res.liked ? c.likes + 1 : c.likes - 1 }
            : c
        )
      );
      if (res.likeExpGained && user) {
        updateExp(user.exp + res.likeExpGained);
        setShowExpToast(`+${res.likeExpGained} EXP`);
        setTimeout(() => setShowExpToast(null), 3000);
      }
    } catch (err: unknown) {
      console.error('评论点赞失败:', err);
    }
  };

  const canDeletePost =
    post && (user?.id === post.userId || isAdmin);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="bg-gray-900/50 rounded-2xl border border-amber-900/10 p-8 space-y-4">
            <div className="h-8 bg-gray-800 rounded w-2/3" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-800" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-24" />
                <div className="h-3 bg-gray-800 rounded w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded w-full" />
              <div className="h-4 bg-gray-800 rounded w-5/6" />
              <div className="h-4 bg-gray-800 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">{error}</p>
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回论坛
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">帖子不存在</p>
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回论坛
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* EXP 获得提示 */}
      <AnimatePresence>
        {showExpToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-xl shadow-amber-900/40"
          >
            <Sparkles className="w-5 h-5" />
            {showExpToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        返回
      </button>

      {/* 帖子内容卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 sm:p-8"
      >
        {/* 标题 */}
        {post.title && (
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4">
            {post.title}
          </h1>
        )}

        {/* 作者信息行 */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {post.user.nickname?.[0] || '?'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-200">
                  {post.user.nickname}
                </span>
                <BloodlineBadge
                  bloodline={post.user.bloodline}
                  size="sm"
                  showTitle={false}
                />
                {post.user.title && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold border"
                    style={{
                      color: post.user.titleColor || '#f59e0b',
                      borderColor:
                        (post.user.titleColor || '#f59e0b') + '40',
                      backgroundColor:
                        (post.user.titleColor || '#f59e0b') + '15',
                    }}
                  >
                    {post.user.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatFullDate(post.createdAt)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(post.category)}`}
                >
                  <Tag className="w-3 h-3" />
                  {getCategoryLabel(post.category)}
                </span>
              </div>
            </div>
          </div>

          {/* 统计 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {comments.length}
            </span>
          </div>
        </div>

        {/* 正文 */}
        <div className="py-6 text-gray-300 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {/* 标签 */}
        {post.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(() => {
              try {
                const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
                return (Array.isArray(tags) ? tags : []).map(
                  (tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700"
                    >
                      #{tag}
                    </span>
                  )
                );
              } catch {
                return null;
              }
            })()}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-800">
          <button
            onClick={handleLikePost}
            disabled={!isAuthenticated}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-medium ${
              post.isLiked
                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-400 border border-gray-700'
            } ${!isAuthenticated && 'opacity-50 cursor-not-allowed'}`}
          >
            <Heart
              className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
            />
            {post.isLiked ? '已点赞' : '点赞'}
          </button>

          {canDeletePost && (
            <button
              onClick={handleDeletePost}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-400 rounded-xl hover:bg-red-900/30 hover:text-red-400 transition-all border border-gray-700 hover:border-red-800/50 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
        </div>
      </motion.div>

      {/* 评论区 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-200 mb-6">
          评论 ({comments.length})
        </h2>

        {/* 发表评论 */}
        {isAuthenticated ? (
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.nickname?.[0] || '?'}
              </div>
              <div className="flex-1">
                {replyTo && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <CornerDownRight className="w-4 h-4" />
                    <span>回复评论</span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-amber-500 hover:underline"
                    >
                      取消回复
                    </button>
                  </div>
                )}
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={
                    replyTo ? '写下你的回复...' : '写下你的评论...'
                  }
                  className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors resize-none"
                  rows={3}
                />
                {commentError && (
                  <p className="mt-1 text-sm text-red-400">{commentError}</p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!commentContent.trim() || submittingComment}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {submittingComment ? '提交中...' : '发表评论'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gray-800/50 rounded-xl text-center text-gray-500">
            <Link
              to="/login"
              className="text-amber-500 hover:underline font-medium"
            >
              登录
            </Link>
            <span className="mx-1">后参与讨论</span>
          </div>
        )}

        {/* 评论列表 */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                variants={commentVariants}
                initial="hidden"
                animate="visible"
                className="p-4 sm:p-5 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-gray-600/30 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {comment.user.nickname?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* 评论者信息 */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-gray-200 text-sm">
                        {comment.user.nickname}
                      </span>
                      <BloodlineBadge
                        bloodline={comment.user.bloodline}
                        size="sm"
                        showTitle={false}
                      />
                      {comment.user.title && (
                        <span
                          className="px-1.5 py-0.5 rounded-full text-xs font-bold border"
                          style={{
                            color: comment.user.titleColor || '#f59e0b',
                            borderColor:
                              (comment.user.titleColor || '#f59e0b') + '40',
                            backgroundColor:
                              (comment.user.titleColor || '#f59e0b') + '15',
                          }}
                        >
                          {comment.user.title}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* 评论内容 */}
                    <p className="text-gray-300 text-sm leading-relaxed mt-1">
                      {comment.content}
                    </p>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-4 mt-2.5">
                      <button
                        onClick={() => handleLikeComment(comment)}
                        disabled={!isAuthenticated}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          !isAuthenticated
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 hover:text-red-400'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{comment.likes}</span>
                      </button>
                      {isAuthenticated && (
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-400 transition-colors"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          回复
                        </button>
                      )}
                    </div>

                    {/* 子回复 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3 pl-4 border-l border-gray-700/50">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {reply.user.nickname?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="font-medium text-gray-300 text-xs">
                                  {reply.user.nickname}
                                </span>
                                <BloodlineBadge
                                  bloodline={reply.user.bloodline}
                                  size="sm"
                                  showTitle={false}
                                />
                                {reply.user.title && (
                                  <span
                                    className="px-1 py-0.5 rounded-full text-xs font-bold border"
                                    style={{
                                      color:
                                        reply.user.titleColor || '#f59e0b',
                                      borderColor:
                                        (reply.user.titleColor ||
                                          '#f59e0b') + '40',
                                      backgroundColor:
                                        (reply.user.titleColor ||
                                          '#f59e0b') + '15',
                                    }}
                                  >
                                    {reply.user.title}
                                  </span>
                                )}
                                <span className="text-xs text-gray-600">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-400 text-xs leading-relaxed mt-0.5">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">暂无评论，来说点什么吧</p>
          </div>
        )}
      </div>
    </div>
  );
}