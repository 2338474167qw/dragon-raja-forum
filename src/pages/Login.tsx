import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, User, Lock, ArrowRight } from 'lucide-react';
import { useUserStore } from '../store/userStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <Flame className="w-16 h-16 text-red-600 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
            欢迎回来
          </h1>
          <p className="text-gray-500 mt-2">守夜人永远守护着黑夜</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">学员编号</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入学员编号"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-600"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-700 to-red-900 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50"
          >
            {loading ? '登录中...' : (
              <>
                登录
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="mt-6 text-center text-gray-500 text-sm">
            还没有账号？
            <Link to="/register" className="text-amber-500 hover:underline ml-1">
              立即觉醒血统
            </Link>
          </div>

          <div className="mt-3 text-center">
            <Link
              to="/admin/login"
              className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
            >
              管理员入口
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
