# 诗韵方格 - 部署指南

## 📦 快速部署

### 方式一：一键部署脚本（推荐）

#### Linux / Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Windows
```cmd
deploy.bat
```

脚本会自动完成：
- ✅ 环境检查（Git、Node.js、pnpm）
- ✅ 安装 Vercel CLI
- ✅ 推送到 GitHub（TKadi2026/shiyun-fangge）
- ✅ 部署到 Vercel

---

### 方式二：手动部署

#### 步骤 1：创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名：`shiyun-fangge`
3. 描述：`苏尔特方格 × 唐诗三百首专注力训练应用`
4. 选择 **Public**
5. **不要**勾选初始化选项
6. 点击 "Create repository"

#### 步骤 2：推送到 GitHub
```bash
git remote add origin https://github.com/TKadi2026/shiyun-fangge.git
git branch -M main
git push -u origin main
```

#### 步骤 3：部署到 Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

### 方式三：网页部署（最简单）

1. **创建 GitHub 仓库**（同上步骤 1）

2. **上传代码**
   - 在 GitHub 仓库页面点击 "uploading an existing file"
   - 将项目根目录的所有文件拖入上传框
   - 点击 "Commit changes"

3. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 用 GitHub 账号登录
   - 点击 "Add New Project"
   - 选择 `shiyun-fangge` 仓库
   - 点击 "Deploy"

---

## ✅ 部署验证

部署完成后，访问生成的 URL，测试：
- [ ] 首页正常加载
- [ ] 主题切换（水墨/现代/卡通）
- [ ] 关卡地图显示
- [ ] 游戏训练功能
- [ ] 统计页面

---

## 🔧 常见问题

### Q: 推送 GitHub 时提示认证失败？
A: 需要配置 GitHub 认证：
- 使用 GitHub Desktop（最简单）
- 配置 SSH Key
- 使用 Personal Access Token

### Q: Vercel 部署失败？
A: 检查：
- Node.js 版本 >= 18：`node -v`
- pnpm 已安装：`pnpm -v`

### Q: 如何绑定自定义域名？
A: 在 Vercel 控制台 → 项目设置 → Domains → 添加域名

---

## 📊 项目信息

- **技术栈**：Next.js 16 + React 19 + TypeScript 5
- **包管理器**：pnpm
- **部署平台**：Vercel（免费）
- **GitHub**：TKadi2026/shiyun-fangge

---

## 🎮 功能特色

- 150 关卡 + 10 隐藏关卡
- 3 种游戏模式（循序/混字/记忆）
- 3 套主题（水墨/现代/卡通）
- 32 个成就徽章
- 60 首唐诗数据
- 移动端优化

祝你部署顺利！🎉
