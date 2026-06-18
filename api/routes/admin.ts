import { Router, Request, Response } from 'express';
import prisma from '../prisma/client.js';
import { adminAuth } from '../middleware/auth.js';

const router = Router();

// 获取所有用户
router.get('/users', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, nickname: true, avatar: true, role: true, title: true, titleColor: true, bloodline: true, exp: true, isBanned: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    const stats = {
      totalUsers: users.length,
      bannedUsers: users.filter(u => u.isBanned).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      bloodlineDistribution: { S: users.filter(u => u.bloodline === 'S').length, A: users.filter(u => u.bloodline === 'A').length, B: users.filter(u => u.bloodline === 'B').length, C: users.filter(u => u.bloodline === 'C').length, D: users.filter(u => u.bloodline === 'D').length }
    };
    res.json({ users, stats });
  } catch (error) {
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取所有帖子
router.get('/posts', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: { select: { id: true, username: true, nickname: true, bloodline: true } }, _count: { select: { comments: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: '获取帖子列表失败' });
  }
});

// 授予头衔
router.put('/users/:id/title', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, titleColor } = req.body;
    await prisma.user.update({ where: { id: req.params.id }, data: { title: title || null, titleColor: titleColor || null } });
    res.json({ message: '头衔已更新' });
  } catch (error) {
    res.status(500).json({ error: '更新头衔失败' });
  }
});

// 封禁/解封用户
router.put('/users/:id/ban', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { isBanned } = req.body;
    await prisma.user.update({ where: { id: req.params.id }, data: { isBanned } });
    res.json({ message: isBanned ? '用户已封禁' : '用户已解封' });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 设置管理员
router.put('/users/:id/role', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json({ message: '角色已更新' });
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 删除用户
router.delete('/users/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: '用户已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

// 删除帖子
router.delete('/posts/:id', adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: '帖子已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;