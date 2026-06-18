import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 创建默认管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@cassel.edu',
      password: adminPassword,
      nickname: '昂热',
      role: 'admin',
      bloodline: 'S',
      exp: 50000,
      title: '校长',
      titleColor: '#8B0000',
    },
  });
  console.log(`创建管理员: ${admin.username}`);

  // 创建用户个性化设置
  await prisma.userCustomization.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  // 创建初始徽章
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { id: 'badge-1' },
      update: {},
      create: {
        id: 'badge-1',
        name: '新生觉醒',
        description: '完成血统觉醒',
        icon: '🌟',
        condition: JSON.stringify({ type: 'register' }),
      },
    }),
    prisma.badge.upsert({
      where: { id: 'badge-2' },
      update: {},
      create: {
        id: 'badge-2',
        name: '言灵觉醒者',
        description: '完成所有言灵课程',
        icon: '🔥',
        condition: JSON.stringify({ type: 'course_complete', category: '言灵' }),
      },
    }),
  ]);
  console.log(`创建了 ${badges.length} 个徽章`);

  // 创建课程
  const courses = [
    {
      id: 'course-yanling',
      name: '言灵基础入门',
      category: '言灵',
      description: '学习言灵的基本概念和初级言灵的运用方法。言灵是龙族血统者独有的能力，通过特定的语言序列引发超自然现象。',
      chapters: [
        { title: '言灵概论', lessons: ['言灵的起源', '言灵的分类', '言灵与血统的关系'] },
        { title: '初级言灵', lessons: ['言灵·无尘之地', '言灵·蛇', '言灵·镜瞳'] },
      ],
    },
    {
      id: 'course-lianjinshu',
      name: '炼金术原理',
      category: '炼金术',
      description: '探索炼金术的奥秘，学习物质转化与元素操控的基础知识。炼金术是卡塞尔学院的核心课程之一。',
      chapters: [
        { title: '炼金术基础', lessons: ['元素周期表与炼金术', '贤者之石的传说', '现代炼金术应用'] },
        { title: '实战炼金', lessons: ['金属转化', '药剂调配', '炼金武器制作'] },
      ],
    },
    {
      id: 'course-ge',
      name: '格斗技巧训练',
      category: '格斗',
      description: '掌握与龙族战斗的核心技巧，包括近身格斗、武器使用和战术配合。',
      chapters: [
        { title: '基础格斗', lessons: ['体能训练', '格斗姿势', '攻防技巧'] },
        { title: '武器使用', lessons: ['刀剑基础', '枪械使用', '特殊武器'] },
      ],
    },
    {
      id: 'course-longlishi',
      name: '龙族历史研究',
      category: '历史',
      description: '深入了解龙族的历史、文化和社会结构，理解人类与龙族之间的千年恩怨。',
      chapters: [
        { title: '龙族起源', lessons: ['远古时代', '龙族的诞生', '第一次龙族战争'] },
        { title: '现代龙族', lessons: ['龙族社会结构', '混血种的出现', '卡塞尔学院的建立'] },
      ],
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { id: courseData.id },
      update: {
        name: courseData.name,
        description: courseData.description,
      },
      create: {
        id: courseData.id,
        name: courseData.name,
        category: courseData.category,
        description: courseData.description,
      },
    });

    for (let i = 0; i < courseData.chapters.length; i++) {
      const chapterData = courseData.chapters[i];
      const chapter = await prisma.chapter.upsert({
        where: { id: `${course.id}-chapter-${i}` },
        update: { title: chapterData.title, order: i },
        create: {
          id: `${course.id}-chapter-${i}`,
          courseId: course.id,
          title: chapterData.title,
          order: i,
        },
      });

      for (let j = 0; j < chapterData.lessons.length; j++) {
        const lessonTitle = chapterData.lessons[j];
        await prisma.lesson.upsert({
          where: { id: `${chapter.id}-lesson-${j}` },
          update: {
            title: lessonTitle,
            content: JSON.stringify({ type: 'text', content: `这是${lessonTitle}的课程内容，详细讲解相关知识点。` }),
            order: j,
          },
          create: {
            id: `${chapter.id}-lesson-${j}`,
            chapterId: chapter.id,
            title: lessonTitle,
            content: JSON.stringify({ type: 'text', content: `这是${lessonTitle}的课程内容，详细讲解相关知识点。` }),
            order: j,
          },
        });
      }
    }

    console.log(`创建课程: ${courseData.name}`);
  }

  console.log('数据初始化完成！');
  console.log('');
  console.log('默认管理员账号:');
  console.log('  用户名: admin');
  console.log('  密码: admin123');
  console.log('  访问地址: /admin/login');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
