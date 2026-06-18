import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Crown,
  Sparkles,
  Swords,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { postsApi, expApi } from '../services/api';
import { useUserStore } from '../store/userStore';
import { Post, BLOODLINE_CONFIG, COURSE_CATEGORIES } from '../types';

const BLOODLINE_LEVELS = [
  { key: 'S', title: '龙王', minExp: 50000, color: 'from-amber-400 to-yellow-600', description: '传说级血统，掌控元素之力' },
  { key: 'A', title: '执行部专员', minExp: 15000, color: 'from-purple-500 to-violet-700', description: '精英中的精英，执行高危任务' },
  { key: 'B', title: '高级学员', minExp: 5000, color: 'from-blue-500 to-cyan-600', description: '熟练掌握言灵，独当一面' },
  { key: 'C', title: '正式学员', minExp: 1000, color: 'from-green-500 to-emerald-600', description: '完成基础训练，正式入学' },
  { key: 'D', title: '新生', minExp: 0, color: 'from-gray-400 to-gray-600', description: '刚刚觉醒血统的混血种' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Home() {
  const { isAuthenticated } = useUserStore();
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [ranking, setRanking] = useState<{ id: string; nickname: string; bloodline: string; exp: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, rankingRes] = await Promise.all([
          postsApi.getList({ sort: 'hot', limit: 5 }),
          expApi.getRanking(5),
        ]);
        setHotPosts(postsRes.posts || []);
        setRanking(rankingRes.ranking || []);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ========== Hero 区域 ========== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-red-950/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.15),transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* 火焰图标 */}
            <motion.div
              className="flex justify-center mb-6"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative">
                <Flame className="w-20 h-20 md:w-24 md:h-24 text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]" />
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
              </div>
            </motion.div>

            {/* 主标题 */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-cinzel mb-3">
              <span className="bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
                卡塞尔学院
              </span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-gray-400 font-cinzel mb-4 tracking-wider">
              守夜人论坛
            </p>

            {/* 标语 */}
            <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-base md:text-lg leading-relaxed">
              欢迎来到卡塞尔学院守夜人论坛，这里是所有混血种的家园。
            </p>

            {/* CTA 按钮 */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-red-700 to-red-900 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-800 transition-all shadow-lg shadow-red-900/50 hover:shadow-red-800/60"
                >
                  <Sparkles className="w-5 h-5" />
                  立即觉醒血统
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ========== 内容区域 ========== */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ===== 学院简介 ===== */}
        <motion.section variants={itemVariants} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold font-cinzel bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
              学院简介
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed space-y-4">
            <p>
              卡塞尔学院（Cassell College）是一所位于美国伊利诺伊州芝加哥远郊的私立大学，与芝加哥大学隔街相望。
              表面上是全美最顶尖的私立贵族大学之一，实际上是一所专门培养混血种（Hybrid）的精英学院。
            </p>
            <p>
              学院的使命是追踪并研究龙族文明，培养能够与龙族对抗的混血种战士。这里汇聚了来自世界各地的
              混血种精英，每一位学员都拥有龙族血统，能够使用言灵之力。
            </p>
            <p>
              守夜人论坛是卡塞尔学院的官方在线社区，供所有学员交流学习心得、分享战斗经验、
              探讨龙族文明的奥秘。在这里，你的每一次贡献都将获得经验值，提升你的血统等级。
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { icon: MessageSquare, label: '学术讨论', desc: '交流心得' },
                { icon: Swords, label: '战斗训练', desc: '实战演练' },
                { icon: BookOpen, label: '龙族研究', desc: '探索文明' },
                { icon: Crown, label: '血统晋升', desc: '提升等级' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-amber-700/30 transition-colors"
                >
                  <item.icon className="w-6 h-6 text-amber-500" />
                  <span className="text-sm font-medium text-gray-300">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===== 血统等级体系 ===== */}
        <motion.section variants={itemVariants} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-900/30 rounded-lg">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold font-cinzel bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              血统等级体系
            </h2>
          </div>
          <div className="space-y-4">
            {BLOODLINE_LEVELS.map((level) => (
              <div
                key={level.key}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-amber-700/20 transition-all"
              >
                {/* 等级徽章 */}
                <div
                  className={`shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl font-bold font-cinzel text-white shadow-lg`}
                >
                  {level.key}
                </div>
                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-200">{level.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{level.description}</p>
                </div>
                {/* EXP 范围 */}
                <div className="shrink-0 text-right">
                  <span className="text-xs text-gray-500">所需经验</span>
                  <p className="text-amber-400 font-bold text-lg">
                    {level.minExp.toLocaleString()} EXP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== 热门动态 + 血统排行榜（并排） ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 热门动态 */}
          <motion.section variants={itemVariants} className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold font-cinzel bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                  热门动态
                </h2>
              </div>
              <Link
                to="/forum"
                className="flex items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors text-sm"
              >
                查看更多 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : hotPosts.length > 0 ? (
              <div className="space-y-3">
                {hotPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/forum/${post.id}`}
                    className="block p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg ${
                          index === 0
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-gray-900'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
                            : index === 2
                            ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-200 truncate group-hover:text-amber-400 transition-colors">
                          {post.title || '无标题'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post._count?.comments || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {post.likes}
                          </span>
                          <span className="text-gray-600 truncate">
                            {post.user?.nickname}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">暂无帖子，快来发布第一个吧！</p>
            )}
          </motion.section>

          {/* 血统排行榜 */}
          <motion.section variants={itemVariants} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-900/30 rounded-lg">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold font-cinzel bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                血统排行榜
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse h-14 bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : ranking.length > 0 ? (
              <div className="space-y-3">
                {ranking.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <span
                      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-200">
                        {item.nickname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.bloodline}级 · {BLOODLINE_CONFIG[item.bloodline]?.title || '新生'}
                      </p>
                    </div>
                    <span className="text-amber-400 font-bold text-sm shrink-0">
                      {item.exp?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无数据</p>
            )}
          </motion.section>
        </div>

        {/* ===== 课程分类 ===== */}
        <motion.section variants={itemVariants} className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold font-cinzel bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                课程分类
              </h2>
            </div>
            <Link
              to="/courses"
              className="flex items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors text-sm"
            >
              全部课程 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COURSE_CATEGORIES.map((category) => (
              <Link
                key={category.value}
                to={`/courses?category=${category.value}`}
                className="group p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 border border-gray-700/30 hover:border-amber-700/30 transition-all text-center"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-bold text-gray-200 group-hover:text-amber-400 transition-colors">
                  {category.value}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{category.label}</p>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ===== 底部导航链接 ===== */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Link
            to="/forum"
            className="flex items-center justify-center gap-3 p-5 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 hover:border-amber-700/40 hover:bg-gray-900/80 transition-all group"
          >
            <MessageSquare className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <span className="font-bold text-gray-300 group-hover:text-amber-400 transition-colors">
              进入论坛
            </span>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/courses"
            className="flex items-center justify-center gap-3 p-5 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 hover:border-amber-700/40 hover:bg-gray-900/80 transition-all group"
          >
            <BookOpen className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            <span className="font-bold text-gray-300 group-hover:text-amber-400 transition-colors">
              学习课程
            </span>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/register"
            className="flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-red-900/50 to-amber-900/30 backdrop-blur-xl rounded-2xl border border-red-900/30 hover:border-red-700/50 hover:from-red-900/70 hover:to-amber-900/40 transition-all group"
          >
            <Sparkles className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            <span className="font-bold text-red-400 group-hover:text-red-300 transition-colors">
              觉醒血统
            </span>
            <ArrowRight className="w-4 h-4 text-red-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}