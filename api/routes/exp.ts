import { Router, Request, Response } from 'express';
import prisma from '../prisma/client.js';
import { userAuth } from '../middleware/auth.js';
import { EXP_REWARDS, getTodayString, getNextLevelExp, getBloodlineTitle } from '../utils/helpers.js';

const router = Router();

router.get('/ranking', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, exp: true, title: true, titleColor: true },
      orderBy: { exp: 'desc' },
      take: Number(limit)
    });
    res.json({ ranking: users.map((u, i) => ({ rank: i + 1, ...u, bloodlineTitle: getBloodlineTitle(u.bloodline), levelProgress: getNextLevelExp(u.exp) })) });
  } catch (error) { res.status(500).json({ error: '获取排行榜失败' }); }
});

router.post('/signin', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const today = getTodayString();
    const existing = await prisma.dailyTask.findUnique({ where: { userId_taskType_date: { userId: req.userId!, taskType: 'DAILY_SIGNIN', date: today } } });
    if (existing) { res.status(400).json({ error: '今日已签到' }); return; }
    await prisma.dailyTask.create({ data: { userId: req.userId!, taskType: 'DAILY_SIGNIN', expReward: EXP_REWARDS.DAILY_SIGNIN, date: today, completed: true } });
    const updatedUser = await prisma.user.update({ where: { id: req.userId }, data: { exp: { increment: EXP_REWARDS.DAILY_SIGNIN } } });
    res.json({ message: '签到成功', expGained: EXP_REWARDS.DAILY_SIGNIN, currentExp: updatedUser.exp });
  } catch (error) { res.status(500).json({ error: '签到失败' }); }
});

router.get('/tasks', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const today = getTodayString();
    const tasks = await prisma.dailyTask.findMany({ where: { userId: req.userId, date: today } });
    const taskStatus = {
      signin: { completed: tasks.some(t => t.taskType === 'DAILY_SIGNIN'), expReward: EXP_REWARDS.DAILY_SIGNIN },
      post: { completed: false, expReward: EXP_REWARDS.POST_CREATE },
      comment: { completed: false, expReward: EXP_REWARDS.COMMENT_CREATE },
      like: { completed: false, expReward: EXP_REWARDS.GIVE_LIKE }
    };
    res.json({ tasks: taskStatus });
  } catch (error) { res.status(500).json({ error: '获取任务失败' }); }
});

router.get('/exp-info', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { exp: true, bloodline: true } });
    if (!user) { res.status(404).json({ error: '用户不存在' }); return; }
    res.json({ exp: user.exp, bloodline: user.bloodline, bloodlineTitle: getBloodlineTitle(user.bloodline), levelProgress: getNextLevelExp(user.exp) });
  } catch (error) { res.status(500).json({ error: '获取失败' }); }
});

export default router;