# 诗韵方格 - 项目交接文档

## 📋 项目概述

**项目名称**：诗韵方格（Shiyun Fangge）  
**项目类型**：移动端 Web 应用  
**核心功能**：苏尔特方格 × 唐诗三百首专注力训练游戏  

**GitHub 仓库**：https://github.com/TKadi2026/shiyun-fangge  
**部署平台**：Vercel（正在部署中）  
**仓库所有者**：TKadi2026

---

## 🎯 功能特性

### 游戏系统
- **150 个常规关卡** + 10 个隐藏关卡
- **3 种游戏模式**：
  - 循序模式：按诗句顺序依次点击
  - 混字模式：在干扰字中找出诗句
  - 记忆模式：先记忆后找字
- **3 个难度等级**：
  - 初级（1-50关）：五言绝句，20字，4x5 或 5x5 网格
  - 中级（51-100关）：七言绝句，28字，6x5 网格
  - 高级（101-150关）：律诗，40/56字，8x5 或 8x7 网格

### 主题系统
- 水墨古风（默认）：朱红配色，衬线字体
- 现代简约：蓝色配色，无衬线字体
- 卡通趣味：粉红配色，圆角设计

### 成就系统
- 32 个成就徽章（含隐藏成就）
- 全局通知弹窗（达成时右上角滑入动画）
- 分类：通关数量、星级评价、速度、连续通关、累计时长、诗词收集、模式达人

### 其他功能
- 60 首唐诗数据（全部唐代诗人）
- 新手引导（5 步流程）
- 训练统计（趋势图、历史记录、筛选排序）
- 诗词图鉴（筛选、赏析、回到顶部）
- Combo 连击特效（2/5/10 连击）
- 移动端优化（max-width 480px，safe-area 支持）

---

## 🛠 技术栈

```
框架：Next.js 16.1.1 (App Router)
语言：TypeScript 5
UI：React 19 + Tailwind CSS 4
组件库：shadcn/ui + Radix UI
图标：Lucide React
包管理器：pnpm 9.0.0（本地开发）/ npm（Vercel 部署）
端口：5001
```

---

## 📁 项目结构

```
project/
├── src/
│   ├── app/                          # Next.js App Router 页面
│   │   ├── page.tsx                  # 首页（每日推荐、主题切换）
│   │   ├── layout.tsx                # 根布局（AchievementNotifier 全局挂载）
│   │   ├── globals.css               # 全局样式（3套主题变量）
│   │   ├── levels-screen/page.tsx    # 关卡地图（Tab 切换）
│   │   ├── play-screen/page.tsx      # 训练页（游戏核心逻辑）
│   │   ├── result/page.tsx           # 结果页（星级评价）
│   │   ├── stats/page.tsx            # 统计页（趋势图、成就、历史记录）
│   │   ├── poems/page.tsx            # 诗词图鉴
│   │   └── api/watermark/route.ts    # 水印 API
│   │
│   ├── components/                   # React 组件
│   │   ├── SchulteGrid.tsx           # 方格组件（字符匹配逻辑）
│   │   ├── ThemeSwitcher.tsx         # 主题切换器（SVG 预览图）
│   │   ├── AchievementNotifier.tsx   # 成就通知弹窗
│   │   ├── OnboardingGuide.tsx       # 新手引导
│   │   ├── PoemProgress.tsx          # 诗句进度显示
│   │   ├── StarRating.tsx            # 星级评分组件
│   │   ├── Timer.tsx                 # 计时器组件
│   │   └── ThemeInit.tsx             # 主题初始化
│   │
│   ├── data/                         # 静态数据
│   │   ├── poems.ts                  # 60 首唐诗数据
│   │   └── levels.ts                 # 160 关卡配置（含隐藏）
│   │
│   ├── lib/                          # 工具函数
│   │   ├── game-logic.ts             # 游戏逻辑（方格生成、星级计算）
│   │   ├── storage.ts                # localStorage 存储工具
│   │   ├── theme.ts                  # 主题切换工具
│   │   └── external-origin.ts        # 外部链接处理
│   │
│   └── types/
│       └── index.ts                  # TypeScript 类型定义
│
├── public/
│   └── images/                       # 静态图片资源
│
├── scripts/                          # 构建脚本
│   ├── build.sh                      # 构建脚本
│   ├── dev.sh                        # 开发脚本
│   └── start.sh                      # 启动脚本
│
├── vercel.json                       # Vercel 部署配置
├── package.json                      # 依赖配置
├── tsconfig.json                     # TypeScript 配置
└── DEPLOY.md                         # 部署说明文档
```

---

## 🔑 核心逻辑说明

### 1. 方格生成（game-logic.ts）

```typescript
generateGrid(poem, gridSize, mode, allPoems)
```

- **循序模式**：20 个诗句字 + 干扰字（从预设字符集）
- **混字模式**：20 个诗句字 + 其他诗词的字作为干扰
- **记忆模式**：同混字模式，但有预览阶段

**字符匹配规则**：相同汉字点任意一个都算正确（字符匹配而非索引匹配）

### 2. 星级计算

```typescript
calculateStars(timeMs, thresholds)
```

- 三星：用时 ≤ thresholds.three
- 二星：用时 ≤ thresholds.two
- 一星：其他情况

**初级关卡时间更宽松**：
- 三星：charCount × 2.5 × 0.8 秒
- 二星：charCount × 2.5 × 1.2 秒

### 3. 数据存储（storage.ts）

使用 localStorage 存储：
- `shiyun-progress`：用户进度（主题、关卡结果、历史记录）
- `shiyun-onboarding-done`：新手引导完成标记
- `shiyun-notified-achievements`：已通知的成就
- `shiyun-pending-notifications`：待通知的成就

**数据结构**：
```typescript
interface UserProgress {
  currentTheme: 'ink' | 'modern' | 'cartoon';
  unlockedLevel: number;
  levelResults: Record<number, LevelResult>;
  playHistory: PlayRecord[];  // 每次通关尝试记录
  todayStats: TodayStats;
}
```

### 4. 主题切换（theme.ts）

通过 `data-theme` 属性切换 CSS 变量：
- `:root` / `[data-theme="ink"]`：水墨古风
- `[data-theme="modern"]`：现代简约
- `[data-theme="cartoon"]`：卡通趣味

每个主题定义：
- 颜色变量（--color-surface, --color-primary 等）
- 圆角变量（--rounded-sm, --rounded-md, --rounded-lg）
- 字体（font-family）

---

## ✅ 已完成的工作

### 功能开发
- [x] 60 首唐诗数据（全部唐代诗人）
- [x] 150 关卡 + 10 隐藏关卡
- [x] 3 种游戏模式（循序/混字/记忆）
- [x] 3 套主题（水墨/现代/卡通）
- [x] 32 个成就徽章
- [x] 新手引导（5 步流程）
- [x] 训练统计（趋势图、历史记录）
- [x] 诗词图鉴（筛选、赏析）
- [x] Combo 连击特效
- [x] 移动端优化

### BUG 修复
- [x] result 页 hasNextLevel：90 → 150
- [x] AchievementNotifier 关卡范围：30/30/30 → 50/50/50
- [x] 初级关卡诗词字符数：移除 p13(22字)/p51(40字)/p53(40字)
- [x] 高级关卡律诗判断：拆分 40字/56字 诗词
- [x] 隐藏关卡字符数：为每关指定正确字符数
- [x] 数据模型：新增 playHistory + playCount
- [x] 统计页：增强历史记录功能（筛选/排序/分页）

### 难度调整
- [x] 初级关卡时间要求放宽（2.5 倍系数）
- [x] 记忆模式预览时间延长（初级 500ms/字）
- [x] 初级前 10 关：4x5 网格，无干扰字
- [x] 初级 11-50 关：5x5 网格，5 个干扰字
- [x] 方格尺寸增大（4列 26px，5列 22px）

### 成就系统优化
- [x] 降低通关数量门槛（70关→60关）
- [x] 降低三星评价要求（30个→20个）
- [x] 放宽速度成就时间（15秒→20秒）
- [x] 降低连续通关要求（15关→10关）
- [x] 降低累计时长要求（60分→45分）
- [x] 新增 2 个特殊成就（初露锋芒、过目不忘）

---

## 🚧 当前状态

### GitHub 仓库
- **状态**：✅ 已推送
- **地址**：https://github.com/TKadi2026/shiyun-fangge
- **分支**：main
- **提交数**：4 个 commit

### Vercel 部署
- **状态**：⚠️ 正在部署中
- **问题**：之前构建失败，已修复 package.json 中的 pnpm 限制
- **最新提交**：`fix: remove pnpm-only restriction for Vercel deployment`
- **预期结果**：Vercel 会自动重新部署，应该能成功

---

## 🔧 配置文件说明

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npx next build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

**说明**：
- 直接调用 `next build` 避免 pnpm 依赖
- 使用 npm 安装依赖（Vercel 默认）

### package.json（已修复）
```json
{
  "scripts": {
    "build": "bash ./scripts/build.sh",
    "dev": "bash ./scripts/dev.sh",
    // ... 其他脚本
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "pnpm": ">=9.0.0"
  }
}
```

**已移除**：`"preinstall": "npx only-allow pnpm"`（会阻止 npm 安装）

---

## 📊 关卡配置详情

### 初级（1-50关）
| 关卡 | 模式 | 网格 | 干扰字 | 诗词 |
|------|------|------|--------|------|
| 1-10 | 循序 | 4x5 | 0 | 五言绝句（20字） |
| 11-20 | 循序 | 5x5 | 5 | 五言绝句（20字） |
| 21-35 | 混字 | 5x5 | 5 | 五言绝句（20字） |
| 36-50 | 记忆 | 5x5 | 5 | 五言绝句（20字） |

### 中级（51-100关）
| 关卡 | 模式 | 网格 | 干扰字 | 诗词 |
|------|------|------|--------|------|
| 51-70 | 循序 | 6x5 | 8 | 七言绝句（28字） |
| 71-90 | 混字 | 6x5 | 8 | 七言绝句（28字） |
| 91-100 | 记忆 | 6x5 | 8 | 七言绝句（28字） |

### 高级（101-150关）
| 关卡 | 模式 | 网格 | 干扰字 | 诗词 |
|------|------|------|--------|------|
| 101-115 | 混字 | 8x5/8x7 | 12-16 | 律诗（40/56字） |
| 116-135 | 记忆 | 8x5/8x7 | 12-16 | 律诗（40/56字） |
| 136-150 | 循序 | 8x5/8x7 | 12-16 | 律诗（40/56字） |

### 隐藏关卡（1001-1010）
| 关卡 | 解锁条件 | 特点 |
|------|----------|------|
| 1001-1003 | 通关 30 关 | 极限挑战（超短时限） |
| 1004-1005 | 通关 50 关 | 极限挑战（超短时限） |
| 1006-1008 | 15 个三星 | 记忆大师（超短预览） |
| 1009-1010 | 30 个三星 | 记忆大师（超短预览） |

---

## 🎨 主题配色方案

### 水墨古风（ink）
```css
--color-surface-variant: #F5F0E8;
--color-surface: #FDF8F0;
--color-on-surface: #2C2C2C;
--color-primary: #C0392B;  /* 朱红 */
--color-success: #2E7D32;
--rounded-sm: 2px;
--rounded-md: 4px;
--rounded-lg: 8px;
font-family: 'Noto Serif SC', serif;
```

### 现代简约（modern）
```css
--color-surface-variant: #F8FAFC;
--color-surface: #FFFFFF;
--color-on-surface: #0F172A;
--color-primary: #2563EB;  /* 蓝色 */
--color-success: #16A34A;
--rounded-sm: 8px;
--rounded-md: 12px;
--rounded-lg: 16px;
font-family: -apple-system, sans-serif;
```

### 卡通趣味（cartoon）
```css
--color-surface-variant: #FFF8E1;
--color-surface: #FFFFFF;
--color-on-surface: #333333;
--color-primary: #FF6B6B;  /* 粉红 */
--color-success: #4ECDC4;
--rounded-sm: 12px;
--rounded-md: 18px;
--rounded-lg: 24px;
font-family: 'Comic Sans MS', cursive;
```

---

## 🔐 安全提醒

**GitHub Token 已暴露在历史对话中，请立即删除并重新生成。**

**操作步骤**：
1. 访问 https://github.com/settings/tokens
2. 找到并删除已暴露的 Token
3. 重新生成一个新的 Token

---

## 📝 后续工作建议

### 如果 Vercel 部署成功
- ✅ 测试所有功能是否正常
- ✅ 分享部署 URL 给用户
- ✅ 可选：绑定自定义域名

### 如果 Vercel 部署失败
- 查看 Vercel 构建日志
- 根据错误信息修复代码
- 重新推送到 GitHub

### 功能增强建议
- 接入数据库（Supabase/Firebase）实现跨设备数据同步
- 添加用户登录系统
- 添加排行榜功能
- 添加更多诗词数据
- 添加音效反馈

---

## 📞 联系方式

**GitHub 用户**：TKadi2026  
**仓库地址**：https://github.com/TKadi2026/shiyun-fangge

---

## 📅 文档生成时间

2026-11-01

---

**文档用途**：供 Kimi 或其他 AI 助手理解项目状态，继续开发或解决问题。
