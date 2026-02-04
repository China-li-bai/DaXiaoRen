#!/bin/bash

# PartyKit 部署到 Cloudflare 脚本
# 使用方法: ./deploy-partykit.sh

set -e

echo "🚀 开始部署 PartyKit 到 Cloudflare..."

# 检查是否安装了 PartyKit CLI
if ! command -v partykit &> /dev/null; then
    echo "📦 安装 PartyKit CLI..."
    npm install -g partykit
fi

# 检查环境变量
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ 错误: CLOUDFLARE_API_TOKEN 环境变量未设置"
    echo "请先设置: export CLOUDFLARE_API_TOKEN=your-token"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "❌ 错误: CLOUDFLARE_ACCOUNT_ID 环境变量未设置"
    echo "请先设置: export CLOUDFLARE_ACCOUNT_ID=your-account-id"
    exit 1
fi

# 进入 partykit 目录
cd partykit

# 部署到 Cloudflare
echo "📤 正在部署到 Cloudflare..."
npx partykit deploy --prod

echo "✅ 部署成功！"
echo ""
echo "🌐 访问地址:"
npx partykit info
