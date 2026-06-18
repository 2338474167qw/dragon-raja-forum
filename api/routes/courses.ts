import { Router, Request, Response } from 'express';
import prisma from '../prisma/client.js';
import { userAuth, optionalAuth } from '../middleware/auth.js';
import { calculateBloodline, EXP_REWARDS } from '../utils/helpers.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const where = category ? { category: String(category) } : {};
    const courses = await prisma.course.findMany({
      where, include: { chapters: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } }, _count: { select: { chapters: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ courses });
  } catch (error) { res.status(500).json({ error: '获取课程列表失败' }); }
});

router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: { chapters: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } } }
    });
    if (!course) { res.status(404).json({ error: '课程不存在' }); return; }
    let progress: any[] = [];
    if (req.userId) {
      const allLessons = course.chapters.flatMap(ch => ch.lessons);
      progress = await prisma.learningProgress.findMany({
        where: { userId: req.userId, lessonId: { in: allLessons.map(l => l.id) } },
        select: { lessonId: true, completed: true }
      });
    }
    res.json({ course, progress: req.userId ? progress : null });
  } catch (error) { res.status(500).json({ error: '获取课程详情失败' }); }
});

router.post('/:courseId/lessons/:lessonId/complete', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const existing = await prisma.learningProgress.findUnique({ where: { userId_lessonId: { userId: req.userId!, lessonId } } });
    let expGained = 0;
    if (!existing) {
      await prisma.learningProgress.create({ data: { userId: req.userId!, lessonId, completed: true, completedAt: new Date() } });
      expGained = EXP_REWARDS.COURSE_COMPLETE;
      const updatedUser = await prisma.user.update({ where: { id: req.userId }, data: { exp: { increment: expGained } } });
      const newB = calculateBloodline(updatedUser.exp);
      if (newB !== updatedUser.bloodline) await prisma.user.update({ where: { id: req.userId }, data: { bloodline: newB } });
    } else {
      await prisma.learningProgress.update({ where: { userId_lessonId: { userId: req.userId!, lessonId } }, data: { completed: true, completedAt: new Date() } });
    }
    res.json({ message: '学习进度已记录', expGained });
  } catch (error) { res.status(500).json({ error: '记录失败' }); }
});

export default router;