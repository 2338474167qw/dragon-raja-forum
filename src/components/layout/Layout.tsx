import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Flame,
  Shield,
} from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { BLOODLINE_CONFIG } from '../../types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/forum', label: '论坛', icon: MessageSquare },
    { path: '/courses', label: '课程', icon: BookOpen },
    { path: '/profile', label: '个人', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const bloodlineConfig = user ? BLOODLINE_CONFIG[user.bloodline] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 font-noto">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-red-950/5 rounded-full blur-[100px]" />
      </div>

      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold font-cinzel bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                守夜人论坛
              </span>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-900/50 to-amber-900/50 text-amber-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 桌面端右侧：管理员 / 用户信息 */}
            <div className="hidden md:flex items-center gap-4">
              {isAdmin ? (
                /* 管理员：显示后台管理入口 */
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-900/60 to-amber-900/40 border border-amber-700/30 rounded-lg text-amber-400 hover:from-red-800/60 hover:to-amber-800/40 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">后台管理</span>
                </Link>
              ) : isAuthenticated && user ? (
                /* 非管理员：显示用户信息 */
                <div className="flex items-center gap-4">
                  {/* 血统等级徽章 */}
                  <div
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${bloodlineConfig?.color} text-white text-sm font-bold shadow-lg`}
                  >
                    {user.bloodline}级 · {bloodlineConfig?.title}
                  </div>
                  {/* 经验值 */}
                  <div className="text-sm text-gray-400">
                    <span className="text-amber-400 font-bold">{user.exp}</span> EXP
                  </div>
                  {/* 登出按钮 */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出</span>
                  </button>
                </div>
              ) : (
                /* 未登录 */
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition-all shadow-lg shadow-red-900/50"
                  >
                    血统觉醒
                  </Link>
                </div>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-amber-900/20 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        isActive
                          ? 'bg-gradient-to-r from-red-900/50 to-amber-900/50 text-amber-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {isAdmin ? (
                  /* 管理员：后台管理入口 */
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-900/60 to-amber-900/40 border border-amber-700/30 text-amber-400"
                  >
                    <Shield className="w-5 h-5" />
                    <span>后台管理</span>
                  </Link>
                ) : isAuthenticated && user ? (
                  /* 非管理员：用户信息 */
                  <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full bg-gradient-to-r ${bloodlineConfig?.color} text-white text-sm font-bold`}
                      >
                        {user.bloodline}级 · {bloodlineConfig?.title}
                      </span>
                      <span className="text-amber-400 font-bold">{user.exp} EXP</span>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>退出登录</span>
                    </button>
                  </div>
                ) : (
                  /* 未登录 */
                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-300 hover:text-white text-center rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      登录
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-gradient-to-r from-red-700 to-red-900 text-white text-center rounded-lg shadow-lg shadow-red-900/50"
                    >
                      血统觉醒
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 min-h-[calc(100vh-4rem-80px)]">
        {children}
      </main>

      {/* 底部版权 */}
      <footer className="relative z-10 border-t border-amber-900/20 bg-gray-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>卡塞尔学院守夜人论坛 · 为所有混血种而战</p>
          <p className="mt-1 text-gray-600 text-xs">Dragon Rises © 2024</p>
        </div>
      </footer>
    </div>
  );
}