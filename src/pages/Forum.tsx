import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Heart,
  Eye,
  Clock,
  Filter,
  Send,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { postsApi } from '../services/api';
import { useUserStore } from '../store/userStore';
import BloodlineBadge from '../components/common/BloodlineBadge';
import { Post, POST_CATEGORIES } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function Forum() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateExp } = useUserStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // 发帖表单状态
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('discussion');
  const [posting, setPosting] = useState(false);
  const [showExpToast, setShowExpToast] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postsApi.getList({ category, sort, page, limit: 10 });
      setPosts(res.posts);
      setPagination(res.pagination);
    } catch (err: unknown) {
      console.error('获取帖子失败:', err);
      setError('获取帖子列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [category, sort, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      const res = await postsApi.create({
        title: postTitle.trim() || undefined,
        content: postContent.trim(),
        category: postCategory,
      });
      if (res.expGained && user) {
        updateExp(user.exp + res.expGained);
        setShowExpToast(`+${res.expGained} EXP`);
        setTimeout(() => setShowExpToast(null), 3000);
      }
      setPostTitle('');
      setPostContent('');
      setPostCategory('discussion');
      setShowCreateForm(false);
      setPage(1);
      fetchPosts();
    } catch (err: unknown) {
      console.error('发帖失败:', err);
    } finally {
      setPosting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
    return new Date(dateString).toLocaleDateString('zh-CN');
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-cinzel bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
          守夜人论坛
        </h1>
        <p className="text-gray-500 mt-2">分享你的想法，与守夜人交流</p>
      </div>

      {/* 发帖表单 */}
      {isAuthenticated && (
        <div className="mb-8">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-700 to-red-900 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-800 transition-all shadow-lg shadow-red-900/30"
            >
              <Plus className="w-5 h-5" />
              发布帖子
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {user?.nickname?.[0] || '?'}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="标题（可选）"
                    className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
                  />
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="分享你的想法..."
                    rows={4}
                    className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-amber-600 appearance-none"
                    >
                      {POST_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setPostTitle('');
                          setPostContent('');
                          setPostCategory('discussion');
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors text-sm"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || posting}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        {posting ? '发布中...' : '发布'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

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

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-600 appearance-none"
          >
            <option value="">全部分类</option>
            {POST_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => {
              setSort('latest');
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sort === 'latest'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            最新
          </button>
          <button
            onClick={() => {
              setSort('hot');
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sort === 'hot'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            最热
          </button>
        </div>
      </div>

      {/* 错误状态 */}
      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/30 rounded-xl text-red-300 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchPosts}
            className="ml-auto text-sm text-red-400 hover:text-red-300 underline"
          >
            重试
          </button>
        </div>
      )}

      {/* 帖子列表 */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-900/50 rounded-2xl border border-amber-900/10 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-800 rounded w-24" />
                    <div className="h-4 bg-gray-800 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-800 rounded w-1/2" />
                  <div className="flex items-center gap-4">
                    <div className="h-3 bg-gray-800 rounded w-16" />
                    <div className="h-3 bg-gray-800 rounded w-12" />
                    <div className="h-3 bg-gray-800 rounded w-12" />
                    <div className="h-3 bg-gray-800 rounded w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={`${category}-${sort}-${page}`}
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              onClick={() => navigate(`/forum/${post.id}`)}
              className="block p-5 sm:p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 hover:border-amber-600/50 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* 头像 */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {post.user.nickname?.[0] || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 作者信息行 */}
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-medium text-gray-200 group-hover:text-amber-400 transition-colors text-sm">
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
                          borderColor: (post.user.titleColor || '#f59e0b') + '40',
                          backgroundColor:
                            (post.user.titleColor || '#f59e0b') + '15',
                        }}
                      >
                        {post.user.title}
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      <Clock className="w-3 h-3 inline mr-0.5" />
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>

                  {/* 标题 */}
                  {post.title && (
                    <h3 className="font-bold text-gray-200 group-hover:text-amber-400 transition-colors text-base mb-1 line-clamp-1">
                      {post.title}
                    </h3>
                  )}

                  {/* 内容 */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-3">
                    {post.content}
                  </p>

                  {/* 底部：分类标签 + 统计 */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${getCategoryColor(post.category)}`}
                    >
                      <Tag className="w-3 h-3" />
                      {getCategoryLabel(post.category)}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post._count?.comments || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">暂无帖子</p>
          <p className="text-gray-600 text-sm">
            {isAuthenticated
              ? '快来发布第一条帖子吧！'
              : '登录后即可参与讨论'}
          </p>
        </div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm"
          >
            上一页
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (p === 1 || p === pagination.totalPages) return true;
                if (Math.abs(p - page) <= 1) return true;
                return false;
              })
              .map((p, idx, arr) => {
                const showEllipsis =
                  idx > 0 && p - arr[idx - 1] > 1;
                return (
                  <div key={p} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-gray-600">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                );
              })}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}