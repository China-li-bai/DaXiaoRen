#!/bin/bash

# 后续部署快速脚本
# 使用方法: ./deploy-update.sh

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

echo -e "${GREEN}🚀 开始部署到 VPS...${NC}"
echo ""

# 1. 本地构建
echo -e "${YELLOW}📦 本地构建项目...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功${NC}"
echo ""

# 2. 上传文件到 VPS
echo -e "${YELLOW}📤 上传文件到 VPS...${NC}"
scp -o StrictHostKeyChecking=no -r dist/* root@${VPS_IP}:${WEB_ROOT}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 上传失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 上传成功${NC}"
echo ""

# 3. 重载 Nginx
echo -e "${YELLOW}🔄 重载 Nginx...${NC}"
ssh -o StrictHostKeyChecking=no root@${VPS_IP} "systemctl reload nginx"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx 重载失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Nginx 重载成功${NC}"
echo ""

# 4. 验证部署
echo -e "${YELLOW}🔍 验证部署...${NC}"

# 检查网站是否可访问
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN})

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
    echo ""
    echo "🌐 访问地址:"
    echo "   http://${DOMAIN}"
    echo "   http://www.${DOMAIN}"
    echo ""
    echo "📊 部署信息:"
    echo "   VPS IP: ${VPS_IP}"
    echo "   网站目录: ${WEB_ROOT}"
    echo "   部署时间: $(date)"
else
    echo -e "${RED}❌ 部署验证失败！HTTP 状态码: ${HTTP_STATUS}${NC}"
    exit 1
fi
