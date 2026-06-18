import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'cassel-college-secret-key-2024';

// 血统等级：无每日上限，阈值更高
export function calculateBloodline(exp: number): string {
  if (exp >= 50000) return 'S';
  if (exp >= 15000) return 'A';
  if (exp >= 5000) return 'B';
  if (exp >= 1000) return 'C';
  return 'D';
}

export function getBloodlineTitle(bloodline: string): string {
  const titles: Record<string, string> = {
    'S': '龙王',
    'A': '执行部专员',
    'B': '高级学员',
    'C': '正式学员',
    'D': '新生'
  };
  return titles[bloodline] || '新生';
}

// 获取下一级所需经验值
export function getNextLevelExp(exp: number) {
  const levels = [0, 1000, 5000, 15000, 50000];
  const idx = levels.findIndex((l, i) => exp >= l && (i === levels.length - 1 || exp < levels[i + 1]));
  const nextIdx = Math.min(idx + 1, levels.length - 1);
  const currentLevelExp = levels[idx];
  const nextLevelExp = levels[nextIdx];
  const levelRange = nextLevelExp - currentLevelExp;
  const expInLevel = exp - currentLevelExp;
  return {
    current: exp,
    next: nextLevelExp,
    needed: Math.max(0, nextLevelExp - exp),
    progress: levelRange > 0 ? (expInLevel / levelRange) * 100 : 100
  };
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch { return null; }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 从请求头获取用户信息
export function getUserFromRequest(req: Request): { userId: string; role: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const decoded = verifyToken(authHeader.substring(7));
  return decoded;
}

// 无每日上限的经验值奖励
export const EXP_REWARDS = {
  POST_CREATE: 20,
  COMMENT_CREATE: 10,
  RECEIVE_LIKE: 5,
  GIVE_LIKE: 2,
  COURSE_COMPLETE: 100,
  DAILY_SIGNIN: 15
};

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}