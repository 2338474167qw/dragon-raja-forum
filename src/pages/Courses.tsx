import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Check, Lock, Play, Sparkles, ArrowLeft } from 'lucide-react';
import { coursesApi } from '../services/api';
import { useUserStore } from '../store/userStore';
import { Course, EXP_REWARDS } from '../types';

const COURSE_ICONS: Record<string, string> = {
  '言灵': '🔥',
  '炼金术': '⚗️',
  '格斗': '⚔️',
  '历史': '📚',
};

export default function Courses() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user, updateExp } = useUserStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<{ lessonId: string; completed: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);
  const [showExpToast, setShowExpToast] = useState(false);
  const [lastExpGained, setLastExpGained] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (id) {
      fetchCourseDetail(id);
    } else {
      setSelectedCourse(null);
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await coursesApi.getList({});
      setCourses(res.courses);
    } catch (error) {
      console.error('获取课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async (courseId: string) => {
    try {
      const res = await coursesApi.getById(courseId);
      setSelectedCourse(res.course);
      setProgress(res.progress || []);
    } catch (error) {
      console.error('获取课程详情失败:', error);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!isAuthenticated || !selectedCourse) return;
    try {
      setCompletingLesson(lessonId);
      const res = await coursesApi.completeLesson(selectedCourse.id, lessonId);
      if (res.expGained && user) {
        updateExp(user.exp + res.expGained);
        setLastExpGained(res.expGained);
        setShowExpToast(true);
        setTimeout(() => setShowExpToast(false), 2500);
      }
      // 刷新进度
      const detailRes = await coursesApi.getById(selectedCourse.id);
      setProgress(detailRes.progress || []);
    } catch (error: any) {
      alert(error.message || '完成课时失败');
    } finally {
      setCompletingLesson(null);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lessonId === lessonId && p.completed);
  };

  const getCompletedCount = (): { completed: number; total: number } => {
    const totalLessons = selectedCourse?.chapters?.reduce(
      (sum, ch) => sum + (ch.lessons?.length || 0),
      0
    ) || 0;
    const completed = progress.filter((p) => p.completed).length;
    return { completed, total: totalLessons };
  };

  // ========== 课程列表页 ==========
  if (!id) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            课程中心
          </h1>
          <p className="text-gray-500 mt-2">学习龙族知识，提升血统等级</p>
        </motion.div>

        {/* 课程列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-48 bg-gray-900/50 rounded-2xl border border-amber-900/10"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无课程</p>
            <p className="text-gray-600 text-sm mt-1">课程正在准备中，请稍后再来</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/courses/${course.id}`}
                  className="block p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 hover:border-amber-600/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl shrink-0">
                      {COURSE_ICONS[course.category] || '📖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-200 group-hover:text-amber-400 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                        {course.description || '暂无课程简介'}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {course.chapters?.length || 0} 章节
                        </span>
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ========== 课程详情页 ==========
  if (!selectedCourse) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-64 mx-auto" />
          <div className="h-4 bg-gray-800 rounded w-96 mx-auto" />
        </div>
      </div>
    );
  }

  const { completed, total } = getCompletedCount();
  const courseIcon = COURSE_ICONS[selectedCourse.category] || '📖';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* EXP 获得提示 Toast */}
      <AnimatePresence>
        {showExpToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-xl shadow-2xl"
          >
            <Sparkles className="w-5 h-5" />
            +{lastExpGained} EXP
          </motion.div>
        )}
      </AnimatePresence>

      {/* 返回按钮 */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回课程列表
      </Link>

      {/* 课程信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 p-8 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="text-5xl shrink-0">{courseIcon}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-100">{selectedCourse.name}</h1>
            <p className="text-gray-500 mt-2">{selectedCourse.description || '暂无课程简介'}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {selectedCourse.chapters?.length || 0} 章节
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                已完成 {completed}/{total} 课时
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 章节列表 */}
      {selectedCourse.chapters && selectedCourse.chapters.length > 0 ? (
        <div className="space-y-6">
          {selectedCourse.chapters.map((chapter, chapterIndex) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: chapterIndex * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-amber-900/20 overflow-hidden"
            >
              <div className="p-4 bg-gray-800/50 border-b border-gray-800">
                <h3 className="font-bold text-gray-200">
                  第{chapter.order + 1}章：{chapter.title}
                </h3>
              </div>
              {chapter.lessons && chapter.lessons.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {chapter.lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    const isCompleting = completingLesson === lesson.id;
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              completed
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {completed ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={
                              completed ? 'text-green-400' : 'text-gray-300'
                            }
                          >
                            {lesson.title}
                          </span>
                        </div>

                        {isAuthenticated ? (
                          <button
                            onClick={() => handleCompleteLesson(lesson.id)}
                            disabled={completed || isCompleting}
                            className={`px-4 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                              completed
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-amber-600 text-white hover:bg-amber-500'
                            }`}
                          >
                            {isCompleting ? (
                              '学习中...'
                            ) : completed ? (
                              '已完成'
                            ) : (
                              <>
                                完成学习
                                <span className="text-amber-200 text-xs">
                                  +{EXP_REWARDS.COURSE_COMPLETE}
                                </span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            登录后学习
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  暂无课时内容
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无章节内容</p>
        </motion.div>
      )}
    </div>
  );
}