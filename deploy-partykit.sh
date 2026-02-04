#!/bin/bash

# PartyKit 部署到 Cloudflare 脚本
# 使用方法: ./deploy-partykit.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 PartyKit 部署到 Cloudflare${NC}"
echo ""

# 检查环境变量
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ 错误: CLOUDFLARE_ACCOUNT_ID 环境变量未设置${NC}"
    echo ""
    echo "📝 请先设置环境变量:"
    echo ""
    echo "Windows (PowerShell):"
    echo '  $env:CLOUDFLARE_ACCOUNT_ID="your-account-id"'
    echo '  $env:CLOUDFLARE_API_TOKEN="your-api-token"'
    echo ""
    echo "Windows (Git Bash) / Linux / Mac:"
    echo '  export CLOUDFLARE_ACCOUNT_ID="your-account-id"'
    echo '  export CLOUDFLARE_API_TOKEN="your-api-token"'
    echo ""
    echo "📚 获取帮助: ${YELLOW}https://docs.partykit.io/guides/deploy-to-cloudflare/${NC}"
    exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ 错误: CLOUDFLARE_API_TOKEN 环境变量未设置${NC}"
    echo ""
    echo "📝 请先设置环境变量:"
    echo ""
    echo "Windows (PowerShell):"
    echo '  $env:CLOUDFLARE_ACCOUNT_ID="your-account-id"'
    echo '  $env:CLOUDFLARE_API_TOKEN="your-api-token"'
    echo ""
    echo "Windows (Git Bash) / Linux / Mac:"
    echo '  export CLOUDFLARE_ACCOUNT_ID="your-account-id"'
    echo '  export CLOUDFLARE_API_TOKEN="your-api-token"'
    echo ""
    echo "📚 获取帮助: ${YELLOW}https://docs.partykit.io/guides/deploy-to-cloudflare/${NC}"
    exit 1
fi

# 检查是否安装了 PartyKit CLI
if ! command -v partykit &> /dev/null; then
    echo -e "${YELLOW}📦 安装 PartyKit CLI...${NC}"
    npm install -g partykit
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ PartyKit CLI 安装失败！${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ PartyKit CLI 安装成功${NC}"
else
    echo -e "${GREEN}✅ PartyKit CLI 已安装${NC}"
fi

# 进入 partykit 目录
echo -e "${YELLOW}📁 进入 PartyKit 目录...${NC}"
cd partykit

# 检查配置文件
if [ ! -f "partykit.json" ]; then
    echo -e "${RED}❌ 错误: partykit.json 文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 找到配置文件: partykit.json${NC}"

# 部署到 Cloudflare
echo -e "${YELLOW}📤 正在部署到 Cloudflare...${NC}"
echo ""
echo "📋 部署信息:"
echo "   Account ID: ${CLOUDFLARE_ACCOUNT_ID:0:8}..."
echo "   配置文件: partykit.json"
echo ""

# 执行部署
npx partykit deploy --prod

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 部署失败！${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 部署成功！${NC}"
echo ""

# 获取部署信息
echo -e "${YELLOW}🌐 获取部署信息...${NC}"
echo ""
npx partykit info

echo ""
echo -e "${GREEN}📝 下一步操作:${NC}"
echo ""
echo "1. 更新前端连接地址:"
echo "   编辑 components/LeaderboardWidget.tsx"
echo "   将 PARTYKIT_HOST 替换为实际的 PartyKit URL"
echo ""
echo "2. 重新部署前端:"
echo "   npm run build"
echo "   ./deploy-update.sh"
echo ""
echo "3. 清除 Cloudflare 缓存:"
echo "   在 Cloudflare Dashboard 中清除 dadaxiaoren.com 的缓存"
echo ""
echo "📚 官方文档: ${YELLOW}https://docs.partykit.io/guides/deploy-to-cloudflare/${NC}"
echo ""
