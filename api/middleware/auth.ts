import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import { getUserFromRequest } from '../utils/helpers.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// 普通用户认证
export function userAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: '未授权，请先登录' });
  req.userId = user.userId;
  req.userRole = user.role;
  next();
}

// 管理员认证
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: '未授权' });
  if (user.role !== 'admin') return res.status(403).json({ error: '无权访问，仅限管理员' });
  req.userId = user.userId;
  req.userRole = user.role;
  next();
}

// 封禁检查
export async function banCheck(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user) return next();
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (dbUser?.isBanned) return res.status(403).json({ error: '您的账号已被封禁，无法执行此操作' });
  next();
}

// 可选认证
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (user) {
    req.userId = user.userId;
    req.userRole = user.role;
  }
  next();
}