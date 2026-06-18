import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  RefreshCw,
  Users,
  FileText,
  TrendingUp,
  Ban,
  Trash2,
  Award,
  UserCog,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { adminApi } from '../services/api';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar?: string;
  bloodline: string;
  exp: number;
  role: string;
  title?: string;
  titleColor?: string;
  isBanned: boolean;
  createdAt: string;
}

interface AdminPost {
  id: string;
  title?: string;
  content: string;
  category: string;
  likes: number;
  views: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    bloodline: string;
  };
}

interface AdminStats {
  totalUsers: number;
  bannedUsers: number;
  adminUsers: number;
  bloodlineDistribution: {
    S: number;
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

const TITLE_COLORS = [
  { value: 'red', label: '赤', bg: 'bg-red-600', text: 'text-red-500' },
  { value: 'amber', label: '金', bg: 'bg-amber-500', text: 'text-amber-500' },
  { value: 'blue', label: '蓝', bg: 'bg-blue-500', text: 'text-blue-500' },
  { value: 'purple', label: '紫', bg: 'bg-purple-500', text: 'text-purple-500' },
  { value: 'green', label: '绿', bg: 'bg-green-500', text: 'text-green-500' },
  { value: 'cyan', label: '青', bg: 'bg-cyan-500', text: 'text-cyan-500' },
];

const BLOODLINE_ORDER = ['D', 'C', 'B', 'A', 'S'];
const BLOODLINE_TITLES: Record<string, string> = {
  'S': '龙王',
  'A': '执行部专员',
  'B': '高级学员',
  'C': '正式学员',
  'D': '新生',
};

function getBloodlineColor(bloodline: string): string {
  const colors: Record<string, string> = {
    'S': 'from-amber-400 to-yellow-600',
    'A': 'from-purple-500 to-violet-700',
    'B': 'from-blue-500 to-cyan-600',
    'C': 'from-green-500 to-emerald-600',
    'D': 'from-gray-400 to-gray-600',
  };
  return colors[bloodline] || colors['D'];
}

function getTitleColorClass(color?: string): string {
  const map: Record<string, string> = {
    red: 'bg-red-900/40 text-red-400 border-red-700',
    amber: 'bg-amber-900/40 text-amber-400 border-amber-700',
    blue: 'bg-blue-900/40 text-blue-400 border-blue-700',
    purple: 'bg-purple-900/40 text-purple-400 border-purple-700',
    green: 'bg-green-900/40 text-green-400 border-green-700',
    cyan: 'bg-cyan-900/40 text-cyan-400 border-cyan-700',
  };
  return map[color || ''] || 'bg-gray-800/50 text-gray-400 border-gray-700';
}

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin } = useUserStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts'>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Title modal
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [titleText, setTitleText] = useState('');
  const [titleColor, setTitleColor] = useState('amber');

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'post'; id: string; name: string } | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Fetch data
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, postsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getPosts(),
      ]);
      setUsers(usersRes.users || []);
      setStats(usersRes.stats || null);
      setPosts(postsRes.posts || []);
    } catch (err: any) {
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // --- User actions ---

  const handleGrantTitle = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.grantTitle(selectedUser.id, {
        title: titleText,
        titleColor: titleColor,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, title: titleText || undefined, titleColor: titleColor || undefined } : u
        )
      );
      setTitleModalOpen(false);
      setSelectedUser(null);
      setTitleText('');
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const openTitleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setTitleText(user.title || '');
    setTitleColor(user.titleColor || 'amber');
    setTitleModalOpen(true);
  };

  const handleToggleBan = async (user: AdminUser) => {
    const newBanned = !user.isBanned;
    try {
      await adminApi.toggleBan(user.id, { isBanned: newBanned });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: newBanned } : u))
      );
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await adminApi.setRole(user.id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'user') return;
    try {
      await adminApi.deleteUser(deleteConfirm.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleDeletePost = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'post') return;
    try {
      await adminApi.deletePost(deleteConfirm.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const maxBloodlineCount = stats
    ? Math.max(...BLOODLINE_ORDER.map((l) => stats.bloodlineDistribution[l as keyof typeof stats.bloodlineDistribution] || 0), 1)
    : 1;

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      {/* 顶部导航 */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-amber-900/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  卡塞尔学院管理后台
                </h1>
                <p className="text-xs text-gray-500">Cassel College Admin Panel</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              刷新数据
            </button>
          </div>
        </div>
      </header>

      {/* 标签导航 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          {[
            { key: 'overview' as const, label: '数据概览', icon: TrendingUp },
            { key: 'users' as const, label: '用户管理', icon: Users },
            { key: 'posts' as const, label: '帖子管理', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* ===== 数据概览 ===== */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/20 rounded-lg">
                        <Users className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">注册用户</p>
                        <p className="text-2xl font-bold text-gray-100">{stats?.totalUsers ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-600/20 rounded-lg">
                        <Ban className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">封禁用户</p>
                        <p className="text-2xl font-bold text-gray-100">{stats?.bannedUsers ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-600/20 rounded-lg">
                        <Shield className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">管理员</p>
                        <p className="text-2xl font-bold text-gray-100">{stats?.adminUsers ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-600/20 rounded-lg">
                        <FileText className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">帖子总数</p>
                        <p className="text-2xl font-bold text-gray-100">{posts.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 血统分布 */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-6">
                  <h3 className="text-lg font-bold text-gray-200 mb-6">血统等级分布</h3>
                  <div className="space-y-4">
                    {BLOODLINE_ORDER.map((level) => {
                      const count = stats?.bloodlineDistribution[level as keyof typeof stats.bloodlineDistribution] || 0;
                      const barWidth = maxBloodlineCount > 0 ? (count / maxBloodlineCount) * 100 : 0;
                      return (
                        <div key={level} className="flex items-center gap-4">
                          <div className="w-16 text-center">
                            <span
                              className={`inline-block w-10 h-10 rounded-full bg-gradient-to-r ${getBloodlineColor(level)} text-white font-bold text-lg leading-10`}
                            >
                              {level}
                            </span>
                          </div>
                          <p className="w-20 text-sm text-gray-400">{BLOODLINE_TITLES[level]}</p>
                          <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full bg-gradient-to-r ${getBloodlineColor(level)}`}
                            />
                          </div>
                          <span className="w-12 text-right text-amber-400 font-bold text-sm">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== 用户管理 ===== */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-gray-200">用户列表 ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">用户</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">邮箱</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">血统</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">EXP</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">头衔</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">角色</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">状态</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">注册时间</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-sm font-bold">
                                {user.nickname?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-200">{user.nickname}</p>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-sm max-w-[160px] truncate">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getBloodlineColor(user.bloodline)} text-white`}
                            >
                              {user.bloodline}级
                            </span>
                          </td>
                          <td className="px-4 py-3 text-amber-400 font-bold">{user.exp}</td>
                          <td className="px-4 py-3">
                            {user.title ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTitleColorClass(user.titleColor)}`}
                              >
                                {user.title}
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-amber-900/30 text-amber-400 border border-amber-700'
                                  : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                              }`}
                            >
                              {user.role === 'admin' ? '管理员' : '用户'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                user.isBanned
                                  ? 'bg-red-900/30 text-red-400 border border-red-700'
                                  : 'bg-green-900/30 text-green-400 border border-green-700'
                              }`}
                            >
                              {user.isBanned ? '已封禁' : '正常'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => openTitleModal(user)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-900/30 text-purple-400 border border-purple-700 rounded hover:bg-purple-900/50 transition-colors"
                              >
                                <Award className="w-3 h-3" />
                                授予头衔
                              </button>
                              <button
                                onClick={() => handleToggleBan(user)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                                  user.isBanned
                                    ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-900/50'
                                    : 'bg-red-900/30 text-red-400 border-red-700 hover:bg-red-900/50'
                                }`}
                              >
                                <Ban className="w-3 h-3" />
                                {user.isBanned ? '解封' : '封禁'}
                              </button>
                              <button
                                onClick={() => handleToggleRole(user)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                                  user.role === 'admin'
                                    ? 'bg-gray-700/30 text-gray-400 border-gray-600 hover:bg-gray-700/50'
                                    : 'bg-amber-900/30 text-amber-400 border-amber-700 hover:bg-amber-900/50'
                                }`}
                              >
                                <UserCog className="w-3 h-3" />
                                {user.role === 'admin' ? '取消管理员' : '设为管理员'}
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: 'user',
                                    id: user.id,
                                    name: user.nickname || user.username,
                                  })
                                }
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-900/30 text-red-400 border border-red-700 rounded hover:bg-red-900/50 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                删除用户
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                            暂无用户数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ===== 帖子管理 ===== */}
            {activeTab === 'posts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-lg font-bold text-gray-200">帖子列表 ({posts.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">标题</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">作者</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">分类</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">点赞</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">浏览</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">发布时间</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-400">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-200 truncate max-w-xs">
                              {post.title || '无标题'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 text-sm">{post.user.nickname}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs bg-gradient-to-r ${getBloodlineColor(post.user.bloodline)} text-white`}
                              >
                                {post.user.bloodline}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              {post.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-sm">{post.likes}</td>
                          <td className="px-4 py-3 text-gray-400 text-sm">{post.views}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  type: 'post',
                                  id: post.id,
                                  name: post.title || '无标题',
                                })
                              }
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-900/30 text-red-400 border border-red-700 rounded hover:bg-red-900/50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                      {posts.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                            暂无帖子数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* ===== 授予头衔弹窗 ===== */}
      <AnimatePresence>
        {titleModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setTitleModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-amber-900/30 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-200">授予头衔</h3>
                <button
                  onClick={() => setTitleModalOpen(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                为用户 <span className="text-amber-400 font-medium">{selectedUser.nickname}</span> 设置头衔
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">头衔名称</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    placeholder="例如：学生会主席"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">头衔颜色</label>
                  <div className="grid grid-cols-6 gap-2">
                    {TITLE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setTitleColor(color.value)}
                        className={`h-10 rounded-lg flex items-center justify-center transition-all ${
                          titleColor === color.value
                            ? `ring-2 ring-white ${color.bg}`
                            : `${color.bg} opacity-60 hover:opacity-100`
                        }`}
                      >
                        {titleColor === color.value && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {TITLE_COLORS.map((color) => (
                      <span key={color.value} className="text-xs text-gray-500">
                        {color.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setTitleModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleGrantTitle}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold rounded-lg hover:from-amber-600 hover:to-amber-800 transition-all"
                  >
                    确认授予
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 删除确认弹窗 ===== */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-red-900/30 rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-200">确认删除</h3>
                  <p className="text-sm text-gray-400">
                    确定要删除{deleteConfirm.type === 'user' ? '用户' : '帖子'} "{deleteConfirm.name}" 吗？
                  </p>
                </div>
              </div>
              <p className="text-sm text-red-400 mb-4">此操作不可撤销。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={deleteConfirm.type === 'user' ? handleDeleteUser : handleDeletePost}
                  className="flex-1 px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部 */}
      <footer className="border-t border-amber-900/20 bg-gray-950/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          卡塞尔学院管理后台 · Dragon Rises © 2024
        </div>
      </footer>
    </div>
  );
}