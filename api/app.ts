import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import coursesRoutes from './routes/courses.js';
import expRoutes from './routes/exp.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
dotenv.config({ path: path.join(__dirname, 'prisma', '.env') });

const app: express.Application = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/posts/:postId/comments', commentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/exp', expRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/health', (req: Request, res: Response) => { res.json({ success: true, message: '卡塞尔学院服务器运行正常' }); });

// 生产环境：提供构建后的前端静态文件
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  console.log('📦 提供前端静态文件服务:', distPath);
  app.use(express.static(distPath));

  // SPA 路由回退：所有非 API 请求都返回 index.html
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, error: 'API 接口不存在' });
    }
  });
}

// 404 处理
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', error);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: '接口不存在' });
});

export default app;