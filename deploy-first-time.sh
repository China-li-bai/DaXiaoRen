#!/bin/bash

# 第一次部署自动化脚本
# 使用方法: ./deploy-first-time.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
VPS_IP="192.227.177.133"
WEB_ROOT="/var/www/dadaxiaoren.com"
DOMAIN="dadaxiaoren.com"
WWW_DOMAIN="www.dadaxiaoren.com"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
REPO_URL="https://github.com/China-li-bai/DaXiaoRen.git"
BRANCH="dev"

echo -e "${GREEN}🚀 开始第一次部署到 VPS...${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo "使用: sudo bash deploy-first-time.sh"
    exit 1
fi

# 1. 更新系统
echo -e "${YELLOW}📦 更新系统包...${NC}"
apt update && apt upgrade -y

# 2. 安装必要软件
echo -e "${YELLOW}📦 安装必要软件...${NC}"
apt install -y nginx git curl certbot python3-certbot-nginx

# 安装 Node.js 20.x
echo -e "${YELLOW}📦 安装 Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js 版本: ${NODE_VERSION}${NC}"

# 3. 配置防火墙
echo -e "${YELLOW}🔥 配置防火墙...${NC}"
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
echo -e "${GREEN}✅ 防火墙配置完成${NC}"

# 4. 创建网站目录
echo -e "${YELLOW}📁 创建网站目录...${NC}"
mkdir -p $WEB_ROOT
chown -R $USER:$USER $WEB_ROOT
echo -e "${GREEN}✅ 网站目录创建完成${NC}"

# 5. 克隆代码仓库
echo -e "${YELLOW}📥 克隆代码仓库...${NC}"
if [ ! -d "$WEB_ROOT/.git" ]; then
    git clone $REPO_URL $WEB_ROOT
    cd $WEB_ROOT
    git checkout $BRANCH
else
    echo -e "${YELLOW}📥 仓库已存在，拉取最新代码...${NC}"
    cd $WEB_ROOT
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
fi

# 6. 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
cd $WEB_ROOT
npm install
npm run build
cp -r dist/* .
echo -e "${GREEN}✅ 项目构建完成${NC}"

# 7. 创建 Nginx 配置
echo -e "${YELLOW}⚙️  配置 Nginx...${NC}"
cat > $NGINX_CONF <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    root $WEB_ROOT;
    index index.html;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
EOF

echo -e "${GREEN}✅ Nginx 配置创建完成${NC}"

# 8. 启用 Nginx 配置
echo -e "${YELLOW}🔗 启用 Nginx 配置...${NC}"
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
echo -e "${YELLOW}🧪 测试 Nginx 配置...${NC}"
nginx -t

# 重启 Nginx
echo -e "${YELLOW}🔄 重启 Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx 配置完成${NC}"

# 9. 显示部署信息
echo ""
echo -e "${GREEN}✅ 第一次部署完成！${NC}"
echo ""
echo "📋 部署信息:"
echo "   VPS IP: $VPS_IP"
echo "   域名: $DOMAIN"
echo "   网站目录: $WEB_ROOT"
echo "   Nginx 配置: $NGINX_CONF"
echo "   Node.js 版本: $NODE_VERSION"
echo "   部署时间: $(date)"
echo ""
echo "🌐 访问地址:"
echo "   http://$DOMAIN"
echo "   http://$WWW_DOMAIN"
echo "   http://$VPS_IP"
echo ""
echo "📝 下一步:"
echo "   1. 配置 DNS 记录"
echo "   2. 在域名注册商添加 A 记录:"
echo "      $DOMAIN → $VPS_IP"
echo "      $WWW_DOMAIN → $VPS_IP"
echo "   3. 在 Cloudflare 中配置:"
echo "      - 添加站点 $DOMAIN"
echo "      - 更新域名服务器"
echo "      - 将 SSL 模式设置为 Flexible"
echo ""
echo "📚 相关文档:"
echo "   - FIRST_DEPLOYMENT.md (详细部署指南)"
echo "   - deploy-update.sh (后续部署脚本)"
echo ""
