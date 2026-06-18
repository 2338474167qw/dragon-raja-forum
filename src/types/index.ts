// 用户类型
export interface User {
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
  bannerImage?: string;
  themeColor?: string;
  signature?: string;
  customization?: UserCustomization;
  achievements?: Achievement[];
}

export interface UserCustomization {
  id: string;
  userId: string;
  background?: string;
  avatarFrame?: string;
  theme: string;
}

// 帖子类型
export interface Post {
  id: string;
  userId: string;
  title?: string;
  content: string;
  category: string;
  tags?: string;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
    bloodline: string;
    title?: string;
    titleColor?: string;
  };
  _count?: {
    comments: number;
  };
  isLiked?: boolean;
}

// 评论类型
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar?: string;
    bloodline: string;
    title?: string;
    titleColor?: string;
  };
  replies?: Comment[];
}

// 课程类型
export interface Course {
  id: string;
  name: string;
  category: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  chapters: Chapter[];
  _count?: {
    chapters: number;
  };
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  order: number;
}

// 徽章类型
export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  condition: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
  badge: Badge;
}

// 管理员用户类型
export interface AdminUser extends User {
  managedBy?: string;
  lastLoginAt?: string;
  loginCount?: number;
}

// 经验值信息
export interface ExpInfo {
  exp: number;
  bloodline: string;
  bloodlineTitle: string;
  levelProgress: {
    current: number;
    next: number;
    needed: number;
    progress: number;
  };
}

// API 响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 血统等级配置
export const BLOODLINE_CONFIG: Record<string, { title: string; color: string; minExp: number }> = {
  'S': { title: '龙王', color: 'from-amber-400 to-yellow-600', minExp: 50000 },
  'A': { title: '执行部专员', color: 'from-purple-500 to-violet-700', minExp: 15000 },
  'B': { title: '高级学员', color: 'from-blue-500 to-cyan-600', minExp: 5000 },
  'C': { title: '正式学员', color: 'from-green-500 to-emerald-600', minExp: 1000 },
  'D': { title: '新生', color: 'from-gray-400 to-gray-600', minExp: 0 }
};

// 经验值奖励常量
export const EXP_REWARDS = {
  POST_CREATE: 20,
  COMMENT_CREATE: 10,
  RECEIVE_LIKE: 5,
  GIVE_LIKE: 2,
  COURSE_COMPLETE: 100,
  DAILY_SIGNIN: 15,
} as const;

// 帖子分类
export const POST_CATEGORIES = [
  { value: 'discussion', label: '学术讨论' },
  { value: 'experience', label: '学习心得' },
  { value: 'question', label: '问题求助' },
  { value: 'news', label: '学院新闻' },
  { value: 'casual', label: '闲聊灌水' }
];

// 课程分类
export const COURSE_CATEGORIES = [
  { value: '言灵', label: '言灵课程', icon: '🔥' },
  { value: '炼金术', label: '炼金术课程', icon: '⚗️' },
  { value: '格斗', label: '格斗课程', icon: '⚔️' },
  { value: '历史', label: '历史课程', icon: '📚' }
];