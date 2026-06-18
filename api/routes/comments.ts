import { Router, Request, Response } from 'express';
import prisma from '../prisma/client.js';
import { userAuth, banCheck } from '../middleware/auth.js';
import { calculateBloodline, EXP_REWARDS } from '../utils/helpers.js';

const router = Router({ mergeParams: true });

// 获取评论
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true } },
        replies: { include: { user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: '获取评论失败' });
  }
});

// 发表评论
router.post('/', userAuth, banCheck, async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    if (!content?.trim()) { res.status(400).json({ error: '内容不能为空' }); return; }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) { res.status(404).json({ error: '帖子不存在' }); return; }

    const comment = await prisma.comment.create({
      data: { postId, userId: req.userId!, parentId: parentId || null, content: content.trim() },
      include: { user: { select: { id: true, username: true, nickname: true, avatar: true, bloodline: true, title: true, titleColor: true } } }
    });

    const updatedUser = await prisma.user.update({ where: { id: req.userId }, data: { exp: { increment: EXP_REWARDS.COMMENT_CREATE } } });
    const newB = calculateBloodline(updatedUser.exp);
    if (newB !== updatedUser.bloodline) await prisma.user.update({ where: { id: req.userId }, data: { bloodline: newB } });

    res.status(201).json({ message: '评论成功', comment, expGained: EXP_REWARDS.COMMENT_CREATE });
  } catch (error) {
    res.status(500).json({ error: '评论失败' });
  }
});

// 点赞评论
router.post('/:commentId/like', userAuth, banCheck, async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) { res.status(404).json({ error: '评论不存在' }); return; }

    const existing = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId: req.userId!, targetType: 'comment', targetId: commentId } } });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.comment.update({ where: { id: commentId }, data: { likes: { decrement: 1 } } });
      res.json({ message: '已取消点赞', liked: false });
    } else {
      await prisma.like.create({ data: { userId: req.userId!, targetType: 'comment', targetId: commentId } });
      await prisma.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } });

      await prisma.user.update({ where: { id: comment.userId }, data: { exp: { increment: EXP_REWARDS.RECEIVE_LIKE } } });
      const updatedUser = await prisma.user.update({ where: { id: req.userId }, data: { exp: { increment: EXP_REWARDS.GIVE_LIKE } } });
      const newB = calculateBloodline(updatedUser.exp);
      if (newB !== updatedUser.bloodline) await prisma.user.update({ where: { id: req.userId }, data: { bloodline: newB } });

      res.json({ message: '点赞成功', liked: true, expGained: EXP_REWARDS.GIVE_LIKE });
    }
  } catch (error) {
    res.status(500).json({ error: '操作失败' });
  }
});

// 删除评论
router.delete('/:commentId', userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) { res.status(404).json({ error: '评论不存在' }); return; }
    if (comment.userId !== req.userId && req.userRole !== 'admin') { res.status(403).json({ error: '无权删除' }); return; }
    await prisma.comment.delete({ where: { id: req.params.commentId } });
    res.json({ message: '已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;