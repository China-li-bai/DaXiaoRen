#!/bin/bash

# VPS 部署脚本
# 使用方法: ./deploy-vps.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="dadaxiaoren.com"
WWW_DOMAIN="www.dadaxiaoren.com"
VPS_IP="192.227.177.133"
WEB_ROOT="/var/www/dadaxiaoren.com"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
REPO_URL="https://github.com/China-li-bai/DaXiaoRen.git"
BRANCH="main"

echo -e "${GREEN}🚀 开始 VPS 部署...${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo "使用: sudo bash deploy-vps.sh"
    exit 1
fi

# 1. 更新系统
echo -e "${YELLOW}📦 更新系统包...${NC}"
apt update && apt upgrade -y

# 2. 安装必要软件
echo -e "${YELLOW}📦 安装必要软件...${NC}"
apt install -y nginx git curl certbot python3-certbot-nginx nodejs npm

# 3. 创建网站目录
echo -e "${YELLOW}📁 创建网站目录...${NC}"
mkdir -p $WEB_ROOT
chown -R $USER:$USER $WEB_ROOT

# 4. 克隆仓库（如果不存在）
if [ ! -d "$WEB_ROOT/.git" ]; then
    echo -e "${YELLOW}📥 克隆仓库...${NC}"
    git clone $REPO_URL $WEB_ROOT
else
    echo -e "${YELLOW}📥 拉取最新代码...${NC}"
    cd $WEB_ROOT
    git pull origin $BRANCH
fi

# 5. 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
cd $WEB_ROOT
npm install
npm run build

# 6. 复制构建产物
echo -e "${YELLOW}📋 复制构建产物...${NC}"
cp -r dist/* $WEB_ROOT/

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

# 8. 启用配置
echo -e "${YELLOW}🔗 启用 Nginx 配置...${NC}"
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 9. 测试 Nginx 配置
echo -e "${YELLOW}🧪 测试 Nginx 配置...${NC}"
nginx -t

# 10. 重启 Nginx
echo -e "${YELLOW}🔄 重启 Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

# 11. 配置防火墙
echo -e "${YELLOW}🔥 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
fi

# 12. 获取 SSL 证书
echo -e "${YELLOW}🔒 获取 SSL 证书...${NC}"
certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 13. 设置自动续期
echo -e "${YELLOW}🔄 设置 SSL 自动续期...${NC}"
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -

# 14. 显示部署信息
echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "🌐 访问地址:"
echo "   http://$DOMAIN"
echo "   https://$DOMAIN"
echo ""
echo "📋 Nginx 配置文件:"
echo "   $NGINX_CONF"
echo ""
echo "📁 网站目录:"
echo "   $WEB_ROOT"
echo ""
echo "🔍 检查 Nginx 状态:"
echo "   systemctl status nginx"
echo ""
echo "🔍 查看 Nginx 日志:"
echo "   tail -f /var/log/nginx/access.log"
echo "   tail -f /var/log/nginx/error.log"
echo ""
echo "🔄 更新网站:"
echo "   cd $WEB_ROOT && git pull && npm run build && cp -r dist/* ."
echo ""
