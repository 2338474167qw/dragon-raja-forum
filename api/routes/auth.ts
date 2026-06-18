import { Router, Request, Response } from 'express';
import prisma from '../prisma/client.js';
import { generateToken, hashPassword, comparePassword } from '../utils/helpers.js';
import { userAuth } from '../middleware/auth.js';

const router = Router();

// 用户注册
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, nickname } = req.body;
    if (!username || !email || !password || !nickname) {
      res.status(400).json({ error: '请填写所有必填字段' }); return;
    }
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      res.status(400).json({ error: '学员编号或邮箱已被使用' }); return;
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, nickname, role: 'user', bloodline: 'D', exp: 0 }
    });
    await prisma.userCustomization.create({ data: { userId: user.id } });
    const token = generateToken(user.id, 'user');
    res.status(201).json({
      message: '血统觉醒成功！',
      user: { id: user.id, username: user.username, email: user.email, nickname: user.nickname, role: user.role, bloodline: user.bloodline, exp: user.exp, title: user.title, titleColor: user.titleColor },
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: '请输入学员编号和密码' }); return;
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) { res.status(401).json({ error: '学员编号或密码错误' }); return; }
    if (user.role !== 'user') { res.status(401).json({ error: '请使用用户入口登录' }); return; }
    if (user.isBanned) { res.status(403).json({ error: '账号已被封禁，请联系管理员' }); return; }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) { res.status(401).json({ error: '学员编号或密码错误' }); return; }
    const token = generateToken(user.id, 'user');
    res.json({
      message: '欢迎回来！',
      user: { id: user.id, username: user.username, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role, bloodline: user.bloodline, exp: user.exp, signature: user.signature, title: user.title, titleColor: user.titleColor, isBanned: user.isBanned, bannerImage: user.bannerImage, themeColor: user.themeColor },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 管理员登录
router.post('/admin/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: '请输入管理员账号和密码' }); return;
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) { res.status(401).json({ error: '管理员账号或密码错误' }); return; }
    if (user.role !== 'admin') { res.status(401).json({ error: '非管理员账号' }); return; }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) { res.status(401).json({ error: '管理员账号或密码错误' }); return; }
    const token = generateToken(user.id, 'admin');
    res.json({
      message: '管理员登录成功',
      user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role },
      token
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户
router.get('/me', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { customization: true, achievements: { include: { badge: true } } }
    });
    if (!user) { res.status(404).json({ error: '用户不存在' }); return; }
    res.json({ user: { id: user.id, username: user.username, email: user.email, nickname: user.nickname, avatar: user.avatar, role: user.role, bloodline: user.bloodline, exp: user.exp, signature: user.signature, title: user.title, titleColor: user.titleColor, isBanned: user.isBanned, bannerImage: user.bannerImage, themeColor: user.themeColor, customization: user.customization, achievements: user.achievements } });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新个人资料
router.put('/profile', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname, avatar, signature, background, avatarFrame, bannerImage, themeColor } = req.body;
    if (nickname || avatar || signature || bannerImage || themeColor) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { ...(nickname && { nickname }), ...(avatar && { avatar }), ...(signature !== undefined && { signature }), ...(bannerImage && { bannerImage }), ...(themeColor && { themeColor }) }
      });
    }
    if (background || avatarFrame) {
      await prisma.userCustomization.upsert({
        where: { userId: req.userId },
        update: { ...(background && { background }), ...(avatarFrame && { avatarFrame }) },
        create: { userId: req.userId, background: background || null, avatarFrame: avatarFrame || null }
      });
    }
    res.json({ message: '资料更新成功' });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

export default router;