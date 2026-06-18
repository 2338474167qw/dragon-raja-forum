import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Edit3,
  LogOut,
  Calendar,
  FileText,
  Heart,
  Trophy,
  CheckCircle,
  Palette,
  Image,
  Save,
  X,
  Settings,
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { authApi, expApi, postsApi } from '../services/api';
import BloodlineBadge from '../components/common/BloodlineBadge';
import ExpProgressBar from '../components/common/ExpProgressBar';
import { BLOODLINE_CONFIG, Post, EXP_REWARDS } from '../types';

const THEME_COLORS = [
  { name: 'red', label: '赤红', className: 'bg-red-600' },
  { name: 'amber', label: '琥珀', className: 'bg-amber-500' },
  { name: 'blue', label: '深蓝', className: 'bg-blue-600' },
  { name: 'purple', label: '紫焰', className: 'bg-purple-600' },
  { name: 'green', label: '翠绿', className: 'bg-emerald-600' },
];

const BLOODLINE_LEVEL_THRESHOLDS = [
  { key: 'S', minExp: 50000 },
  { key: 'A', minExp: 15000 },
  { key: 'B', minExp: 5000 },
  { key: 'C', minExp: 1000 },
  { key: 'D', minExp: 0 },
];

function calcLevelProgress(exp: number) {
  const currentLevel = BLOODLINE_LEVEL_THRESHOLDS.find((l) => exp >= l.minExp) || BLOODLINE_LEVEL_THRESHOLDS[BLOODLINE_LEVEL_THRESHOLDS.length - 1];
  const idx = BLOODLINE_LEVEL_THRESHOLDS.indexOf(currentLevel);
  const nextLevel = BLOODLINE_LEVEL_THRESHOLDS[Math.max(0, idx - 1)];
  if (!nextLevel || currentLevel.key === nextLevel.key) {
    return { current: currentLevel.minExp, next: currentLevel.minExp + 1000, needed: 1000, progress: 100 };
  }
  const current = currentLevel.minExp;
  const next = nextLevel.minExp;
  const needed = next - exp;
  const progress = ((exp - current) / (next - current)) * 100;
  return { current, next, needed, progress: Math.min(100, Math.max(0, progress)) };
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, fetchUser, updateExp } = useUserStore();
  const [tasks, setTasks] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [signature, setSignature] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(user?.themeColor || 'red');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerImage || '');
  const [savingCustomization, setSavingCustomization] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setSelectedTheme(user.themeColor || 'red');
      setBannerUrl(user.bannerImage || '');
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [tasksRes, postsRes] = await Promise.all([
        expApi.getTasks(),
        postsApi.getList({ limit: 100 }),
      ]);
      setTasks(tasksRes.tasks);
      const myPosts = postsRes.posts.filter((p: Post) => p.userId === user?.id);
      setUserPosts(myPosts);
      setSignedIn(tasksRes.tasks.signin.completed);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  const handleSignin = async () => {
    try {
      const res = await expApi.signin();
      setSignedIn(true);
      if (user) {
        updateExp(user.exp + res.expGained);
      }
      alert(`签到成功！获得 ${res.expGained} 经验值`);
    } catch (error: any) {
      alert(error.message || '签到失败');
    }
  };

  const handleUpdateSignature = async () => {
    try {
      await authApi.updateProfile({ signature });
      await fetchUser();
      setEditing(false);
    } catch (error) {
      console.error('更新签名失败:', error);
    }
  };

  const handleSaveCustomization = async () => {
    try {
      setSavingCustomization(true);
      await authApi.updateProfile({
        bannerImage: bannerUrl || undefined,
        themeColor: selectedTheme,
      });
      await fetchUser();
      setShowCustomization(false);
    } catch (error: any) {
      alert(error.message || '保存失败');
    } finally {
      setSavingCustomization(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const bloodlineConfig = BLOODLINE_CONFIG[user.bloodline];
  const levelProgress = calcLevelProgress(user.exp);

  return (
    <div className="min-h-screen">
      {/* ========== Banner 区域 ========== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-48 md:h-64 overflow-hidden"
      >
        {/* Banner 背景 */}
        {user.bannerImage ? (
          <img
            src={user.bannerImage}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-red-950 via-gray-900 to-amber-950" />
        )}
        {/* Banner 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/40 to-transparent" />
      </motion.div>

      {/* ========== 头像 + 用户信息 ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10"
      >
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* 头像 */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-gray-950">
                {user.nickname[0]}
              </div>
              <div className="absolute -bottom-2 -right-2">
                <BloodlineBadge bloodline={user.bloodline} size="sm" showTitle={false} />
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                <h1 className="text-2xl font-bold text-gray-100">{user.nickname}</h1>
                {/* TITLE 徽章 - 突出展示 */}
                {user.title && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                    style={{
                      backgroundColor: user.titleColor || '#f59e0b',
                      color: '#fff',
                    }}
                  >
                    <Award className="w-3.5 h-3.5" />
                    {user.title}
                  </motion.span>
                )}
              </div>
              <p className="text-gray-500 mt-1">@{user.username}</p>

              {/* 血统等级 + EXP 进度条 */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <span className="text-gray-400 text-sm">血统等级：</span>
                  <BloodlineBadge bloodline={user.bloodline} />
                </div>
                <ExpProgressBar
                  current={levelProgress.current}
                  next={levelProgress.next}
                  progress={levelProgress.progress}
                />
                <p className="text-xs text-gray-500 mt-1">
                  距离下一级还需 {levelProgress.needed} EXP
                </p>
              </div>

              {/* 签名 */}
              <div className="mt-4">
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="写下你的签名..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-600"
                    />
                    <button
                      onClick={handleUpdateSignature}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setSignature(user.signature || '');
                      setEditing(true);
                    }}
                    className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    {user.signature || '点击编辑签名...'}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSignin}
                disabled={signedIn}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  signedIn
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                {signedIn ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    已签到
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    每日签到 +{EXP_REWARDS.DAILY_SIGNIN}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                个性化设置
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>

          {/* ========== 个性化设置面板 ========== */}
          {showCustomization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-gray-800"
            >
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                个性化设置
              </h3>

              {/* 主题颜色选择器 */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">主题颜色</label>
                <div className="flex gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedTheme(color.name)}
                      className={`w-10 h-10 rounded-full ${color.className} transition-all ${
                        selectedTheme === color.name
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Banner 图片 URL 输入 */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Banner 图片 URL
                </label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="输入图片 URL 地址..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-600"
                />
                {bannerUrl && (
                  <div className="mt-2 h-16 rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={bannerUrl}
                      alt="banner preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 保存 / 取消按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCustomization}
                  disabled={savingCustomization}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingCustomization ? '保存中...' : '保存设置'}
                </button>
                <button
                  onClick={() => setShowCustomization(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ========== 统计卡片 ========== */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-4 text-center"
          >
            <FileText className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-200">{userPosts.length}</p>
            <p className="text-gray-500 text-sm">发布帖子</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-4 text-center"
          >
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-200">{user.exp}</p>
            <p className="text-gray-500 text-sm">经验值</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-amber-900/20 p-4 text-center"
          >
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-200">{user.achievements?.length || 0}</p>
            <p className="text-gray-500 text-sm">成就徽章</p>
          </motion.div>
        </div>
      </div>

      {/* ========== 今日任务 ========== */}
      {tasks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6">
            <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              今日任务
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-xl ${
                  tasks.signin.completed
                    ? 'bg-green-900/30 border border-green-800'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">签到</span>
                  {tasks.signin.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className="text-amber-400 font-bold">+{EXP_REWARDS.DAILY_SIGNIN} EXP</p>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  tasks.post.completed
                    ? 'bg-green-900/30 border border-green-800'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">发帖</span>
                  {tasks.post.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className="text-amber-400 font-bold">
                  {tasks.post.expGained || 0}/{EXP_REWARDS.POST_CREATE} EXP
                </p>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  tasks.comment.completed
                    ? 'bg-green-900/30 border border-green-800'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">评论</span>
                  {tasks.comment.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className="text-amber-400 font-bold">
                  {tasks.comment.expGained || 0}/{EXP_REWARDS.COMMENT_CREATE} EXP
                </p>
              </div>
              <div
                className={`p-4 rounded-xl ${
                  tasks.like.completed
                    ? 'bg-green-900/30 border border-green-800'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">点赞</span>
                  {tasks.like.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
                <p className="text-amber-400 font-bold">
                  {tasks.like.expGained || 0}/{EXP_REWARDS.GIVE_LIKE} EXP
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========== 我的帖子 ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12"
      >
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6">
          <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            我的帖子
          </h2>
          {userPosts.length > 0 ? (
            <div className="space-y-3">
              {userPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="block p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <h3 className="font-medium text-gray-200">
                    {post.title || '无标题'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post._count?.comments || 0}</span>
                    <span>👁️ {post.views}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无帖子</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}