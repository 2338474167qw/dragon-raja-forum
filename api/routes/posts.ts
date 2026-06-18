import { Router, Request, Response } from 'express';
import prisma from '../prisma/client.js';
import { userAuth, optionalAuth, banCheck } from '../middleware/auth.js';
import { calculateBloodline, EXP_REWARDS, getTodayString } from '../utils/helpers.js';

const router = Router();

// 获取帖子列表
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, sort = 'latest', page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = category ? { category: String(category) } : {};
    const orderBy: any = sort === 'hot' ? [{ likes: 'desc' }, { views: 'desc' }] : { createdAt: 'desc' };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true } },
          _count: { select: { comments: true } }
        },
        orderBy, skip, take: Number(limit)
      }),
      prisma.post.count({ where })
    ]);

    res.json({ posts, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ error: '获取帖子列表失败' });
  }
});

// 获取帖子详情
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true, exp: true } },
        comments: {
          include: { user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!post) { res.status(404).json({ error: '帖子不存在' }); return; }
    let isLiked = false;
    if (req.userId) {
      const like = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId: req.userId, targetType: 'post', targetId: id } } });
      isLiked = !!like;
    }
    res.json({ post: { ...post, isLiked } });
  } catch (error) {
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

// 发布帖子
router.post('/', userAuth, banCheck, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, category, tags } = req.body;
    if (!content) { res.status(400).json({ error: '内容不能为空' }); return; }
    const post = await prisma.post.create({
      data: { userId: req.userId!, title: title || null, content, category: category || 'post', tags: tags ? JSON.stringify(tags) : null },
      include: { user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true } } }
    });

    // 无上限经验值
    const updatedUser = await prisma.user.update({ where: { id: req.userId }, data: { exp: { increment: EXP_REWARDS.POST_CREATE } } });
    const newBloodline = calculateBloodline(updatedUser.exp);
    if (newBloodline !== updatedUser.bloodline) {
      await prisma.user.update({ where: { id: req.userId }, data: { bloodline: newBloodline } });
    }

    res.status(201).json({ message: '发布成功', post, expGained: EXP_REWARDS.POST_CREATE });
  } catch (error) {
    res.status(500).json({ error: '发布失败' });
  }
});

// 点赞帖子
router.post('/:id/like', userAuth, banCheck, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) { res.status(404).json({ error: '帖子不存在' }); return; }

    const existing = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId: req.userId!, targetType: 'post', targetId: id } } });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.update({ where: { id }, data: { likes: { decrement: 1 } } });
      res.json({ message: '已取消点赞', liked: false });
    } else {
      await prisma.like.create({ data: { userId: req.userId!, targetType: 'post', targetId: id } });
      await prisma.post.update({ where: { id }, data: { likes: { increment: 1 } } });

      // 帖子作者获得被点赞经验
      await prisma.user.update({ where: { id: post.userId }, data: { exp: { increment: EXP_REWARDS.RECEIVE_LIKE } } });
      const author = await prisma.user.findUnique({ where: { id: post.userId } });
      if (author) {
        const newB = calculateBloodline(author.exp + EXP_REWARDS.RECEIVE_LIKE);
        if (newB !== author.bloodline) await prisma.user.update({ where: { id: post.userId }, data: { bloodline: newB } });
      }

      // 点赞者经验
      const updatedUser = await prisma.user.update({ where: { id: req.userId }, data: { exp: { increment: EXP_REWARDS.GIVE_LIKE } } });
      const newB2 = calculateBloodline(updatedUser.exp);
      if (newB2 !== updatedUser.bloodline) await prisma.user.update({ where: { id: req.userId }, data: { bloodline: newB2 } });

      res.json({ message: '点赞成功', liked: true, expGained: EXP_REWARDS.GIVE_LIKE });
    }
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 删除帖子
router.delete('/:id', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) { res.status(404).json({ error: '帖子不存在' }); return; }
    if (post.userId !== req.userId && req.userRole !== 'admin') { res.status(403).json({ error: '无权删除' }); return; }
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;