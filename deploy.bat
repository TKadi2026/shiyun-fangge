@echo off
chcp 65001 >nul
echo.
echo 🚀 开始部署诗韵方格到 Vercel...
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未找到 Node.js，请先安装
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未找到 Git，请先安装
    echo    下载地址: https://git-scm.com/downloads
    pause
    exit /b 1
)

REM 检查 pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 安装 pnpm...
    call npm install -g pnpm
)

REM 检查 Vercel CLI
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 安装 Vercel CLI...
    call npm install -g vercel
)

echo ✅ 环境检查通过
echo.

REM 配置 GitHub
set GITHUB_USER=TKadi2026
set REPO_NAME=shiyun-fangge
set REMOTE_URL=https://github.com/%GITHUB_USER%/%REPO_NAME%.git

echo 📡 配置 GitHub 远程仓库...
echo    仓库地址: %REMOTE_URL%
echo.

REM 检查并配置远程仓库
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  远程仓库已配置，将更新为: %REMOTE_URL%
    git remote set-url origin %REMOTE_URL%
) else (
    git remote add origin %REMOTE_URL%
)

echo 📤 推送代码到 GitHub...
echo    请确保你已在 GitHub 上创建了仓库: %REPO_NAME%
echo    如果还没有创建，请先访问: https://github.com/new
echo.
pause

git branch -M main
git push -u origin main

echo.
echo ✅ 代码已推送到 GitHub
echo.

echo 🔐 登录 Vercel...
echo    如果未登录，将在浏览器中打开登录页面
call vercel login

echo.
echo 🚀 开始部署到 Vercel...
echo.

call vercel --prod --yes

echo.
echo ==========================================
echo 🎉 部署完成！
echo ==========================================
echo.
echo 📋 下一步：
echo    1. 访问 Vercel 控制台查看部署状态
echo    2. 复制生成的公网 URL 分享给朋友
echo    3. 可选：绑定自定义域名
echo.
echo 🔗 相关链接：
echo    - Vercel 控制台: https://vercel.com/dashboard
echo    - GitHub 仓库: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.
pause
