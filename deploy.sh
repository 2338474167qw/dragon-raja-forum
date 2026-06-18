#!/bin/bash
set -e

# ============================================
#  卡塞尔学院守夜人论坛 - 一键部署脚本
#  适用: Ubuntu 20.04+ / CentOS 7+
# ============================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "  ⚔  卡塞尔学院守夜人论坛 部署脚本  ⚔"
echo "  Cassell College Night Watch Forum"
echo -e "${NC}"

# ---------- 1. 检查 Node.js ----------
echo -e "${YELLOW}[1/6] 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null; then
    echo "安装 Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "  Node.js $(node -v) | npm $(npm -v)"

# ---------- 2. 安装依赖 ----------
echo -e "${YELLOW}[2/6] 安装项目依赖...${NC}"
npm install --production=false

# ---------- 3. 初始化数据库 ----------
echo -e "${YELLOW}[3/6] 初始化数据库...${NC}"
npx prisma generate
npx prisma db push

# 如果数据库为空，填充种子数据
if [ ! -f api/prisma/dev.db ] || [ $(stat -c%s api/prisma/dev.db 2>/dev/null || echo 0) -lt 10000 ]; then
    echo "  填充初始数据（管理员账号等）..."
    npx tsx api/prisma/seed.ts 2>/dev/null || echo "  种子数据已存在，跳过"
fi

# ---------- 4. 构建前端 ----------
echo -e "${YELLOW}[4/6] 构建前端...${NC}"
npm run build

# ---------- 5. 配置 PM2 ----------
echo -e "${YELLOW}[5/6] 配置 PM2 进程守护...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

pm2 delete dragon-raja-forum 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ---------- 6. 完成 ----------
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  前台地址: http://$(hostname -I | awk '{print $1}'):3001"
echo "  后台管理: http://$(hostname -I | awk '{print $1}'):3001/admin/login"
echo "  管理员账号: admin / admin123"
echo ""
echo "  常用命令:"
echo "    pm2 status             查看运行状态"
echo "    pm2 logs dragon-raja   查看日志"
echo "    pm2 restart dragon-raja 重启服务"
echo ""
echo -e "${YELLOW}  下一步: 配置 Nginx 反向代理 + 域名 + SSL 证书${NC}"
echo ""