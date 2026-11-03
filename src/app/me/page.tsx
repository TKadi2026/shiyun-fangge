'use client';

import { Suspense } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadProgress, getCompletedCount } from '@/lib/storage';
import { getPoemById } from '@/data/poems';
import { getLevelById, allLevels } from '@/data/levels';
import { formatTime } from '@/lib/game-logic';
import { RankBoard } from '@/components/RankBoard';
import type { UserProgress, PlayRecord } from '@/types';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  hidden: boolean;
  unlocked: boolean;
}

function getAchievements(progress: UserProgress): Achievement[] {
  const completed = getCompletedCount(progress);
  const threeStarCount = Object.values(progress.levelResults).filter(r => r.stars === 3).length;
  const beginnerDone = Array.from({ length: 50 }, (_, i) => i + 1).every(id => progress.levelResults[id]);
  const intermediateDone = Array.from({ length: 50 }, (_, i) => i + 51).every(id => progress.levelResults[id]);
  const advancedDone = Array.from({ length: 50 }, (_, i) => i + 101).every(id => progress.levelResults[id]);

  const sortedIds = Object.keys(progress.levelResults).map(Number).sort((a, b) => a - b);
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedIds.length; i++) {
    if (sortedIds[i] === sortedIds[i - 1] + 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  const bestTimes = Object.values(progress.levelResults).map(r => r.bestTime);
  const fastestTime = bestTimes.length > 0 ? Math.min(...bestTimes) : Infinity;
  const totalTime = bestTimes.reduce((sum, t) => sum + t, 0);

  const uniquePoemIds = new Set<string>();
  Object.keys(progress.levelResults).forEach(lid => {
    const level = getLevelById(Number(lid));
    if (level) uniquePoemIds.add(level.poemId);
  });
  const uniquePoemsCount = uniquePoemIds.size;

  let sequentialCount = 0;
  let mixedCount = 0;
  let memoryCount = 0;
  Object.keys(progress.levelResults).forEach(lid => {
    const level = getLevelById(Number(lid));
    if (level) {
      if (level.mode === 'sequential') sequentialCount++;
      else if (level.mode === 'mixed') mixedCount++;
      else if (level.mode === 'memory') memoryCount++;
    }
  });

  const defs: { id: string; name: string; desc: string; icon: string; hidden: boolean; check: boolean }[] = [
    // 通关数量系列（降低门槛）
    { id: 'first', name: '初出茅庐', desc: '完成第一关', icon: '🎯', hidden: false, check: completed >= 1 },
    { id: 'five', name: '小试牛刀', desc: '通关 5 关', icon: '⭐', hidden: false, check: completed >= 5 },
    { id: 'ten', name: '渐入佳境', desc: '通关 10 关', icon: '🌟', hidden: false, check: completed >= 10 },
    { id: 'twenty', name: '学有所成', desc: '通关 20 关', icon: '🏆', hidden: false, check: completed >= 20 },
    { id: 'thirty', name: '诗海遨游', desc: '通关 30 关', icon: '🎖️', hidden: false, check: completed >= 30 },
    { id: 'fifty', name: '诗词达人', desc: '通关 50 关', icon: '👑', hidden: false, check: completed >= 50 },
    { id: 'seventy', name: '学富五车', desc: '通关 60 关', icon: '📚', hidden: false, check: completed >= 60 },
    { id: 'all', name: '诗韵宗师', desc: '通关全部 150 关', icon: '💎', hidden: true, check: completed >= 150 },

    // 星级评价系列（降低三星要求）
    { id: 'three-star-1', name: '初见三星', desc: '获得首个三星评价', icon: '✨', hidden: false, check: threeStarCount >= 1 },
    { id: 'three-star-5', name: '速度之星', desc: '获得 5 个三星评价', icon: '⚡', hidden: false, check: threeStarCount >= 5 },
    { id: 'three-star-15', name: '星光璀璨', desc: '获得 15 个三星评价', icon: '🌠', hidden: false, check: threeStarCount >= 15 },
    { id: 'three-star-30', name: '闪电快手', desc: '获得 20 个三星评价', icon: '🔥', hidden: false, check: threeStarCount >= 20 },
    { id: 'perfect-ten', name: '十全十美', desc: '连续 10 关三星', icon: '💫', hidden: true, check: threeStarCount >= 10 && maxStreak >= 10 },

    // 难度通关系列
    { id: 'beginner-master', name: '初级大师', desc: '通关全部初级关卡', icon: '📗', hidden: false, check: beginnerDone },
    { id: 'intermediate-master', name: '中级大师', desc: '通关全部中级关卡', icon: '📘', hidden: false, check: intermediateDone },
    { id: 'advanced-master', name: '高级大师', desc: '通关全部高级关卡', icon: '📕', hidden: false, check: advancedDone },

    // 速度与效率系列（放宽时间要求）
    { id: 'speed-demon', name: '疾如闪电', desc: '单关 20 秒内通关', icon: '⏱️', hidden: false, check: fastestTime < 20000 },
    { id: 'speed-master', name: '风驰电掣', desc: '单关 12 秒内通关', icon: '🚀', hidden: true, check: fastestTime < 12000 },

    // 连续与坚持系列（降低连续要求）
    { id: 'streak-5', name: '连战连捷', desc: '连续通关 5 关', icon: '🔗', hidden: false, check: maxStreak >= 5 },
    { id: 'streak-15', name: '势如破竹', desc: '连续通关 10 关', icon: '⚔️', hidden: false, check: maxStreak >= 10 },
    { id: 'streak-30', name: '一往无前', desc: '连续通关 20 关', icon: '🏅', hidden: true, check: maxStreak >= 20 },

    // 累计时长系列（降低时间要求）
    { id: 'time-10', name: '勤学苦练', desc: '累计训练超过 45 分钟', icon: '📖', hidden: false, check: totalTime >= 2700000 },
    { id: 'time-30', name: '持之以恒', desc: '累计训练超过 20 分钟', icon: '🎓', hidden: false, check: totalTime >= 1200000 },
    { id: 'time-60', name: '博览群书', desc: '累计训练超过 90 分钟', icon: '🏛️', hidden: true, check: totalTime >= 5400000 },

    // 诗词收集系列（降低数量要求）
    { id: 'poems-10', name: '诗词初探', desc: '通关 10 首不同的诗', icon: '📝', hidden: false, check: uniquePoemsCount >= 10 },
    { id: 'poems-20', name: '诗词博览', desc: '通关 20 首不同的诗', icon: '📜', hidden: false, check: uniquePoemsCount >= 20 },
    { id: 'poems-30', name: '诗词大家', desc: '通关 25 首不同的诗', icon: '🎭', hidden: true, check: uniquePoemsCount >= 25 },

    // 模式达人系列（降低要求）
    { id: 'mode-sequential', name: '循序达人', desc: '完成 8 关循序模式', icon: '➡️', hidden: false, check: sequentialCount >= 8 },
    { id: 'mode-mixed', name: '混字达人', desc: '完成 8 关混字模式', icon: '🔀', hidden: false, check: mixedCount >= 8 },
    { id: 'mode-memory', name: '记忆达人', desc: '完成 8 关记忆模式', icon: '🧠', hidden: true, check: memoryCount >= 8 },

    // 新增：特殊成就（容易获得但有意义）
    { id: 'first-combo', name: '初露锋芒', desc: '首次达成 3 连击', icon: '💥', hidden: false, check: progress.levelResults && Object.keys(progress.levelResults).length >= 3 },
    { id: 'first-memory', name: '过目不忘', desc: '首次通关记忆模式', icon: '🎯', hidden: false, check: memoryCount >= 1 },
  ];

  return defs.map(d => ({ id: d.id, name: d.name, desc: d.desc, icon: d.icon, hidden: d.hidden, unlocked: d.check }));
}

interface HistoryEntry {
  levelId: number;
  poemTitle: string;
  stars: number;
  time: number;
  date: string;
  timeStr: string;
  mode: string;
  tier: string;
  playCount: number;
}

function getHistoryData(progress: UserProgress): HistoryEntry[] {
  const modeLabels: Record<string, string> = { sequential: '循序', mixed: '混字', memory: '记忆' };
  const tierLabels: Record<string, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' };

  // 优先使用 playHistory（每次尝试记录），回退到 levelResults（仅最佳）
  if (progress.playHistory && progress.playHistory.length > 0) {
    return progress.playHistory
      .map((record: PlayRecord) => {
        const level = getLevelById(record.levelId);
        const poem = level ? getPoemById(level.poemId) : undefined;
        const lr = progress.levelResults[record.levelId];
        return {
          levelId: record.levelId,
          poemTitle: poem?.title ?? '未知',
          stars: record.stars,
          time: record.timeMs,
          date: record.playedAt.slice(0, 10),
          timeStr: record.playedAt.slice(11, 16),
          mode: level ? (modeLabels[level.mode] ?? '') : '',
          tier: level ? (tierLabels[level.tier] ?? '') : '',
          playCount: lr?.playCount ?? 1,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.timeStr.localeCompare(a.timeStr));
  }

  // 回退：从 levelResults 生成
  return Object.entries(progress.levelResults)
    .map(([id, result]) => {
      const level = getLevelById(Number(id));
      const poem = level ? getPoemById(level.poemId) : undefined;
      return {
        levelId: Number(id),
        poemTitle: poem?.title ?? '未知',
        stars: result.stars,
        time: result.bestTime,
        date: result.completedAt.slice(0, 10),
        timeStr: result.completedAt.slice(11, 16) || '',
        mode: level ? (modeLabels[level.mode] ?? '') : '',
        tier: level ? (tierLabels[level.tier] ?? '') : '',
        playCount: result.playCount ?? 1,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.levelId - a.levelId);
}

function MeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (['data', 'badges', 'rank'] as const).find(t => t === searchParams.get('tab')) ?? 'data';
  const [tab, setTab] = useState<'data' | 'badges' | 'rank'>(initialTab);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [historySort, setHistorySort] = useState<'date' | 'time' | 'stars'>('date');
  const [historyPage, setHistoryPage] = useState(0);
  const HISTORY_PAGE_SIZE = 10;

  useEffect(() => {
    setProgress(loadProgress());
    setPlayerName(localStorage.getItem('fg_rank_name') ?? '');
  }, []);

  const switchTab = (t: 'data' | 'badges' | 'rank') => {
    setTab(t);
    window.history.replaceState(null, '', `/me?tab=${t}`);
  };

  const saveName = () => {
    const name = playerName.trim().slice(0, 12);
    if (name) localStorage.setItem('fg_rank_name', name);
    else localStorage.removeItem('fg_rank_name');
    setPlayerName(name);
    setEditingName(false);
  };

  const achievements = useMemo(() => progress ? getAchievements(progress) : [], [progress]);
  const allHistory = useMemo(() => progress ? getHistoryData(progress) : [], [progress]);

  const filteredHistory = useMemo(() => {
    let list = allHistory;
    if (historyFilter !== 'all') {
      const tierMap: Record<string, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' };
      list = list.filter(h => h.tier === tierMap[historyFilter]);
    }
    if (historySort === 'time') {
      list = [...list].sort((a, b) => a.time - b.time);
    } else if (historySort === 'stars') {
      list = [...list].sort((a, b) => b.stars - a.stars || a.time - b.time);
    }
    return list;
  }, [allHistory, historyFilter, historySort]);

  const pagedHistory = filteredHistory.slice(historyPage * HISTORY_PAGE_SIZE, (historyPage + 1) * HISTORY_PAGE_SIZE);
  const totalPages = Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE);

  if (!progress) return null;

  const completed = getCompletedCount(progress);
  const totalStars = Object.values(progress.levelResults).reduce((sum, r) => sum + r.stars, 0);
  const threeStarCount = Object.values(progress.levelResults).filter(r => r.stars === 3).length;
  const visibleAchievements = achievements.filter(a => !a.hidden || a.unlocked);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const hiddenUnlocked = achievements.filter(a => a.hidden && a.unlocked).length;
  const totalPlays = allHistory.length;

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; }
        .st-nav { height: 56px; padding: 0 16px; display: flex; align-items: center; gap: 12px; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); }
        .st-nav-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); cursor: pointer; }
        .st-nav-title { font-size: 18px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 2px; }
        .st-content { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }
        .st-section { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 20px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .st-section-title { font-size: 15px; font-weight: 700; color: var(--color-on-surface); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .st-overview { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .st-stat-card { background: var(--color-surface-variant); border-radius: var(--rounded-md); padding: 16px 12px; text-align: center; }
        .st-stat-val { font-size: 28px; font-weight: 800; color: var(--color-primary); }
        .st-stat-label { font-size: 12px; color: var(--color-on-surface-2); margin-top: 4px; }
        .st-chart { width: 100%; height: 180px; position: relative; }
        .st-chart-bars { display: flex; align-items: flex-end; gap: 4px; height: 140px; padding: 0 4px; }
        .st-chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .st-chart-bar { width: 100%; border-radius: 4px 4px 0 0; background: var(--color-primary); min-height: 4px; transition: height 0.3s; opacity: 0.8; }
        .st-chart-bar-label { font-size: 9px; color: var(--color-on-surface-2); white-space: nowrap; }
        .st-chart-axis { display: flex; justify-content: space-between; padding: 4px 4px 0; border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 10%, transparent); }
        .st-chart-axis span { font-size: 9px; color: var(--color-on-surface-2); }
        .st-achievements { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .st-ach { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 4px; border-radius: var(--rounded-md); background: var(--color-surface-variant); transition: all 0.2s; }
        .st-ach.locked { opacity: 0.35; filter: grayscale(1); }
        .st-ach.hidden-locked { opacity: 0.2; filter: grayscale(1); }
        .st-ach-icon { font-size: 28px; }
        .st-ach-name { font-size: 11px; font-weight: 600; color: var(--color-on-surface); text-align: center; }
        .st-ach-desc { font-size: 10px; color: var(--color-on-surface-2); text-align: center; line-height: 1.3; }
        .st-hidden-badge { display: inline-flex; align-items: center; gap: 2px; font-size: 9px; color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 10%, transparent); padding: 1px 6px; border-radius: 4px; margin-top: 2px; }
        .st-history-list { display: flex; flex-direction: column; gap: 8px; }
        .st-history-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--color-surface-variant); border-radius: var(--rounded-md); }
        .st-history-num { font-size: 16px; font-weight: 800; color: var(--color-primary); min-width: 32px; text-align: center; }
        .st-history-info { flex: 1; min-width: 0; }
        .st-history-title { font-size: 14px; font-weight: 600; color: var(--color-on-surface); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .st-history-meta { font-size: 11px; color: var(--color-on-surface-2); margin-top: 2px; display: flex; gap: 8px; }
        .st-history-stars { display: flex; gap: 1px; align-items: center; }
        .st-history-stars svg { width: 14px; height: 14px; }
        .st-history-time { font-size: 13px; font-weight: 700; color: var(--color-on-surface); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .st-history-empty { text-align: center; padding: 30px; color: var(--color-on-surface-2); font-size: 14px; }
        .st-history-toolbar { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
        .st-filter-group { display: flex; gap: 6px; }
        .st-filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 12%, transparent); background: transparent; color: var(--color-on-surface-2); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .st-filter-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .st-sort-group { display: flex; align-items: center; gap: 6px; }
        .st-sort-label { font-size: 11px; color: var(--color-on-surface-2); }
        .st-sort-btn { padding: 4px 10px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 10%, transparent); background: transparent; color: var(--color-on-surface-2); font-size: 11px; cursor: pointer; transition: all 0.2s; }
        .st-sort-btn.active { background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); border-color: var(--color-primary); }
        .st-history-tag { background: color-mix(in srgb, var(--color-primary) 8%, transparent); color: var(--color-primary); padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; }
        .st-history-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .st-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 12px; padding-top: 12px; border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .st-page-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--color-on-surface) 12%, transparent); background: transparent; color: var(--color-on-surface); cursor: pointer; transition: all 0.2s; }
        .st-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .st-page-btn:not(:disabled):hover { background: color-mix(in srgb, var(--color-primary) 10%, transparent); border-color: var(--color-primary); color: var(--color-primary); }
        .st-page-info { font-size: 13px; color: var(--color-on-surface-2); font-variant-numeric: tabular-nums; }
        .st-tab-bar { height: 72px; background: var(--color-surface); border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); display: flex; align-items: center; justify-content: space-around; padding-bottom: max(12px, env(safe-area-inset-bottom)); flex-shrink: 0; }
        .st-tab { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--color-on-surface-2); font-size: 11px; cursor: pointer; }
        .st-tab.active { color: var(--color-primary); }
        .st-tab svg { width: 22px; height: 22px; }
        .me-profile { display: flex; align-items: center; gap: 14px; background: var(--color-surface); border-radius: var(--rounded-lg); padding: 16px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .me-avatar { width: 52px; height: 52px; border-radius: 50%; background: color-mix(in srgb, var(--color-primary) 12%, transparent); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .me-info { flex: 1; min-width: 0; }
        .me-name { font-size: 17px; font-weight: 800; color: var(--color-on-surface); display: flex; align-items: center; gap: 6px; }
        .me-name-edit { font-size: 11px; color: var(--color-primary); cursor: pointer; font-weight: 400; }
        .me-name-input { font-size: 15px; font-weight: 700; font-family: inherit; color: var(--color-on-surface); border: 1.5px solid var(--color-primary); border-radius: 8px; padding: 6px 10px; outline: none; width: 140px; background: var(--color-surface-variant); }
        .me-sub { font-size: 12px; color: var(--color-on-surface-2); margin-top: 3px; }
        .me-tabs { display: flex; gap: 8px; }
        .me-tab { flex: 1; padding: 10px 0; text-align: center; border-radius: var(--rounded-md); font-size: 14px; font-weight: 600; color: var(--color-on-surface-2); background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); cursor: pointer; transition: all 0.15s; }
        .me-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); box-shadow: 0 2px 10px color-mix(in srgb, var(--color-primary) 30%, transparent); }
      `}} />

      <nav className="st-nav">
        <div className="st-nav-back" onClick={() => router.push('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <span className="st-nav-title">我的</span>
      </nav>

      <div className="st-content">
        <div className="me-profile">
          <div className="me-avatar">🏔️</div>
          <div className="me-info">
            {editingName ? (
              <div className="me-name">
                <input
                  className="me-name-input"
                  autoFocus
                  maxLength={12}
                  value={playerName}
                  placeholder="输入昵称"
                  onChange={e => setPlayerName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
                />
              </div>
            ) : (
              <div className="me-name">
                {playerName || '未设置昵称'}
                <span className="me-name-edit" onClick={() => setEditingName(true)}>✏️ 编辑</span>
              </div>
            )}
            <div className="me-sub">已通关 {completed} 关 · 总星数 {totalStars} · 成就 {unlockedCount}/{achievements.length}</div>
          </div>
        </div>

        <div className="me-tabs">
          <div className={`me-tab ${tab === 'data' ? 'active' : ''}`} onClick={() => switchTab('data')}>数据统计</div>
          <div className={`me-tab ${tab === 'badges' ? 'active' : ''}`} onClick={() => switchTab('badges')}>成就徽章</div>
          <div className={`me-tab ${tab === 'rank' ? 'active' : ''}`} onClick={() => switchTab('rank')}>世界排名</div>
        </div>

        {tab === 'data' && (<>
        <div className="st-section">
          <div className="st-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
            数据概览
          </div>
          <div className="st-overview">
            <div className="st-stat-card">
              <div className="st-stat-val">{completed}</div>
              <div className="st-stat-label">已通关</div>
            </div>
            <div className="st-stat-card">
              <div className="st-stat-val">{totalStars}</div>
              <div className="st-stat-label">总星数</div>
            </div>
            <div className="st-stat-card">
              <div className="st-stat-val">{threeStarCount}</div>
              <div className="st-stat-label">三星通关</div>
            </div>
            <div className="st-stat-card">
              <div className="st-stat-val">{unlockedCount}/{achievements.length}</div>
              <div className="st-stat-label">成就解锁</div>
            </div>
          </div>
        </div>

        <div className="st-section">
          <div className="st-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            通关用时趋势
          </div>
          <div className="st-chart">
            {allHistory.length > 0 ? (
              <>
                <div className="st-chart-bars">
                  {allHistory.slice(0, 12).reverse().map((h, i) => {
                    const maxTime = Math.max(...allHistory.slice(0, 12).map(x => Math.round(x.time / 1000)));
                    const timeSec = Math.round(h.time / 1000);
                    const height = maxTime > 0 ? Math.max(8, (timeSec / maxTime) * 130) : 8;
                    return (
                      <div key={i} className="st-chart-bar-wrap">
                        <div className="st-chart-bar" style={{ height: `${height}px` }} />
                        <div className="st-chart-bar-label">{timeSec}s</div>
                      </div>
                    );
                  })}
                </div>
                <div className="st-chart-axis">
                  {allHistory.slice(0, 12).reverse().map((h, i) => (
                    <span key={i}>第{h.levelId}关</span>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-on-surface-2)', fontSize: '14px' }}>
                暂无训练数据，完成关卡后显示趋势图
              </div>
            )}
          </div>
        </div>
        </>)}

        {tab === 'badges' && (
        <div className="st-section">
          <div className="st-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            成就徽章 ({unlockedCount}/{achievements.length})
            {hiddenUnlocked > 0 && <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 400 }}>（含 {hiddenUnlocked} 个隐藏）</span>}
          </div>
          <div className="st-achievements">
            {visibleAchievements.map(a => (
              <div key={a.id} className={`st-ach${a.unlocked ? '' : a.hidden ? ' hidden-locked' : ' locked'}`}>
                <div className="st-ach-icon">{a.hidden && !a.unlocked ? '❓' : a.icon}</div>
                <div className="st-ach-name">{a.hidden && !a.unlocked ? '隐藏成就' : a.name}</div>
                <div className="st-ach-desc">{a.hidden && !a.unlocked ? '达成条件后解锁' : a.desc}</div>
                {a.hidden && a.unlocked && <div className="st-hidden-badge">🔓 隐藏</div>}
              </div>
            ))}
          </div>
        </div>
        )}

        {tab === 'rank' && (
        <div className="st-section">
          <div className="st-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
            世界排名
          </div>
          <RankBoard levelId={0} showTabs={false} />
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <span
              style={{ fontSize: 13, color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => router.push('/rank')}
            >
              查看单关排行 →
            </span>
          </div>
        </div>
        )}

        {tab === 'data' && (<>
        <div className="st-section">
          <div className="st-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            历史记录 ({totalPlays} 次)
          </div>

          {allHistory.length === 0 ? (
            <div className="st-history-empty">暂无通关记录，完成关卡后显示</div>
          ) : (
            <>
              <div className="st-history-toolbar">
                <div className="st-filter-group">
                  {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(f => {
                    const labels: Record<string, string> = { all: '全部', beginner: '初级', intermediate: '中级', advanced: '高级' };
                    return (
                      <button
                        key={f}
                        className={`st-filter-btn${historyFilter === f ? ' active' : ''}`}
                        onClick={() => { setHistoryFilter(f); setHistoryPage(0); }}
                      >
                        {labels[f]}
                      </button>
                    );
                  })}
                </div>
                <div className="st-sort-group">
                  <span className="st-sort-label">排序:</span>
                  {(['date', 'time', 'stars'] as const).map(s => {
                    const labels: Record<string, string> = { date: '日期', time: '用时', stars: '星级' };
                    return (
                      <button
                        key={s}
                        className={`st-sort-btn${historySort === s ? ' active' : ''}`}
                        onClick={() => { setHistorySort(s); setHistoryPage(0); }}
                      >
                        {labels[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="st-history-list">
                {pagedHistory.length === 0 ? (
                  <div className="st-history-empty">该分类下暂无记录</div>
                ) : (
                  pagedHistory.map((h, i) => (
                    <div key={i} className="st-history-item">
                      <div className="st-history-num">{h.levelId}</div>
                      <div className="st-history-info">
                        <div className="st-history-title">{h.poemTitle}</div>
                        <div className="st-history-meta">
                          <span className="st-history-tag">{h.tier}</span>
                          <span className="st-history-tag">{h.mode}</span>
                          <span>{h.date} {h.timeStr}</span>
                        </div>
                      </div>
                      <div className="st-history-right">
                        <div className="st-history-stars">
                          {[1, 2, 3].map(n => (
                            <svg key={n} viewBox="0 0 24 24" style={{ color: n <= h.stars ? '#D4A017' : 'color-mix(in srgb, var(--color-on-surface) 15%, transparent)', fill: n <= h.stars ? '#D4A017' : 'none' }} stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                        <div className="st-history-time">{formatTime(h.time)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="st-pagination">
                  <button
                    className="st-page-btn"
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <span className="st-page-info">{historyPage + 1} / {totalPages}</span>
                  <button
                    className="st-page-btn"
                    disabled={historyPage >= totalPages - 1}
                    onClick={() => setHistoryPage(p => Math.min(totalPages - 1, p + 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </>)}
      </div>

      <div className="st-tab-bar">
        <div className="st-tab" onClick={() => router.push('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          首页
        </div>
        <div className="st-tab" onClick={() => router.push('/levels-screen')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          关卡
        </div>
        <div className="st-tab" onClick={() => router.push('/poems')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          图鉴
        </div>
        <div className="st-tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          我的
        </div>
      </div>
    </div>
  );
}

export default function MeScreen() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'serif' }}>加载中...</div>}>
      <MeContent />
    </Suspense>
  );
}
