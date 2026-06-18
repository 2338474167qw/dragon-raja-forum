// 开发环境用相对路径走 Vite proxy，生产环境通过环境变量指定后端地址
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// 获取存储的 token
function getToken(): string | null {
  return localStorage.getItem('token');
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

// 认证 API
export const authApi = {
  register: (data: { username: string; email: string; password: string; nickname: string }) =>
    request<{ message: string; user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) =>
    request<{ message: string; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminLogin: (data: { username: string; password: string }) =>
    request<{ message: string; user: any; token: string }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ user: any }>('/auth/me'),

  updateProfile: (data: { nickname?: string; avatar?: string; signature?: string; background?: string; avatarFrame?: string; bannerImage?: string; themeColor?: string }) =>
    request<{ message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 帖子 API
export const postsApi = {
  getList: (params?: { category?: string; sort?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    return request<{ posts: any[]; pagination: any }>(`/posts?${searchParams}`);
  },

  getById: (id: string) => request<{ post: any }>(`/posts/${id}`),

  create: (data: { title?: string; content: string; category: string; tags?: string[] }) =>
    request<{ message: string; post: any; expGained: number }>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  like: (id: string) =>
    request<{ message: string; liked: boolean; likeExpGained?: number }>(`/posts/${id}/like`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    }),
};

// 评论 API
export const commentsApi = {
  getList: (postId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    return request<{ comments: any[]; pagination: any }>(`/posts/${postId}/comments?${searchParams}`);
  },

  create: (postId: string, data: { content: string; parentId?: string }) =>
    request<{ message: string; comment: any; expGained: number }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  like: (postId: string, commentId: string) =>
    request<{ message: string; liked: boolean; likeExpGained?: number }>(
      `/posts/${postId}/comments/${commentId}/like`,
      { method: 'POST' }
    ),

  delete: (postId: string, commentId: string) =>
    request<{ message: string }>(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),
};

// 课程 API
export const coursesApi = {
  getList: (params?: { category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    return request<{ courses: any[] }>(`/courses?${searchParams}`);
  },

  getById: (id: string) => request<{ course: any; progress: any[] | null }>(`/courses/${id}`),

  completeLesson: (courseId: string, lessonId: string) =>
    request<{ message: string; expGained: number }>(
      `/courses/${courseId}/lessons/${lessonId}/complete`,
      { method: 'POST' }
    ),
};

// 经验值 API
export const expApi = {
  getRanking: (limit?: number) => {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.set('limit', String(limit));
    return request<{ ranking: any[] }>(`/exp/ranking?${searchParams}`);
  },

  signin: () => request<{ message: string; expGained: number; currentExp: number }>('/exp/signin', { method: 'POST' }),

  getTasks: () => request<{ tasks: any }>('/exp/tasks'),

  getExpInfo: () => request<{ exp: number; bloodline: string; bloodlineTitle: string; levelProgress: any }>('/exp/exp-info'),
};

// 管理员 API
export const adminApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    return request<{ users: any[]; stats: any }>(`/admin/users?${searchParams}`);
  },

  getPosts: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    return request<{ posts: any[] }>(`/admin/posts?${searchParams}`);
  },

  grantTitle: (userId: string, data: { title: string; titleColor: string }) =>
    request<{ message: string; user: any }>(`/admin/users/${userId}/title`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleBan: (userId: string, data: { isBanned: boolean }) =>
    request<{ message: string; user: any }>(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  setRole: (userId: string, data: { role: string }) =>
    request<{ message: string; user: any }>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    request<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  deletePost: (postId: string) =>
    request<{ message: string }>(`/admin/posts/${postId}`, {
      method: 'DELETE',
    }),
};