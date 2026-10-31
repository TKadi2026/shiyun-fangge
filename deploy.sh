#!/bin/bash

# 诗韵方格 - 一键部署脚本
# GitHub: TKadi2026/shiyun-fangge

set -e

echo "🚀 开始部署诗韵方格到 Vercel..."
echo ""

# 检查是否已安装必要工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装"
        echo "   安装命令: $2"
        exit 1
    fi
}

check_tool "git" "https://git-scm.com/downloads"
check_tool "node" "https://nodejs.org/"
check_tool "pnpm" "npm install -g pnpm"

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

echo "✅ 环境检查通过"
echo ""

# 配置 GitHub 远程仓库
GITHUB_USER="TKadi2026"
REPO_NAME="shiyun-fangge"
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "📡 配置 GitHub 远程仓库..."
echo "   仓库地址: ${REMOTE_URL}"
echo ""

# 检查远程仓库是否已配置
if git remote get-url origin &> /dev/null; then
    echo "⚠️  远程仓库已配置，将更新为: ${REMOTE_URL}"
    git remote set-url origin ${REMOTE_URL}
else
    git remote add origin ${REMOTE_URL}
fi

# 推送到 GitHub
echo "📤 推送代码到 GitHub..."
echo "   请确保你已在 GitHub 上创建了仓库: ${REPO_NAME}"
echo "   如果还没有创建，请先访问: https://github.com/new"
echo ""
read -p "按 Enter 继续推送，或 Ctrl+C 取消..."

git branch -M main
git push -u origin main

echo ""
echo "✅ 代码已推送到 GitHub"
echo ""

# 登录 Vercel
echo "🔐 登录 Vercel..."
echo "   如果未登录，将在浏览器中打开登录页面"
vercel login

echo ""
echo "🚀 开始部署到 Vercel..."
echo ""

# 部署到生产环境
vercel --prod --yes

echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo ""
echo "📋 下一步："
echo "   1. 访问 Vercel 控制台查看部署状态"
echo "   2. 复制生成的公网 URL 分享给朋友"
echo "   3. 可选：绑定自定义域名"
echo ""
echo "🔗 相关链接："
echo "   - Vercel 控制台: https://vercel.com/dashboard"
echo "   - GitHub 仓库: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
