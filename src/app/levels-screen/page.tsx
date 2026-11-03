'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { levels, getLevelsByTier } from '@/data/levels';
import { getPoemById } from '@/data/poems';
import { loadProgress, getCompletedCount } from '@/lib/storage';
import type { UserProgress, Level, LevelTier } from '@/types';

function StarIcons({ count }: { count: number }) {
  return (
    <div className="lv-card-stars">
      {[1, 2, 3].map(n => (
        <svg key={n} viewBox="0 0 24 24" className={n <= count ? 'lv-star-filled' : 'lv-star-empty'}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="lv-lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LevelCard({ level, progress, onClick }: { level: Level; progress: UserProgress; onClick: () => void }) {
  const poem = getPoemById(level.poemId);
  const result = progress.levelResults[level.id];
  const isUnlocked = level.id <= progress.unlockedLevel;
  const isCurrent = level.id === progress.unlockedLevel;
  const stars = result?.stars ?? 0;

  let className = 'lv-card';
  if (!isUnlocked) className += ' locked';
  else if (result) className += ' completed';
  if (isCurrent) className += ' current';

  return (
    <div className={className} onClick={isUnlocked ? onClick : undefined}>
      <div className="lv-card-num">{level.id}</div>
      <div className="lv-card-name">{poem?.title ?? ''}</div>
      {isUnlocked ? <StarIcons count={stars} /> : <LockIcon />}
    </div>
  );
}

export default function LevelsScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTier, setActiveTier] = useState<LevelTier>('beginner');

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null;

  const beginnerLevels = getLevelsByTier('beginner');
  const intermediateLevels = getLevelsByTier('intermediate');
  const advancedLevels = getLevelsByTier('advanced');
  const completed = getCompletedCount(progress);
  const progressPercent = Math.round((completed / levels.length) * 100);

  const tierConfig: { key: LevelTier; label: string; sublabel: string; levels: Level[] }[] = [
    { key: 'beginner', label: '初级', sublabel: '五言绝句', levels: beginnerLevels },
    { key: 'intermediate', label: '中级', sublabel: '七言绝句', levels: intermediateLevels },
    { key: 'advanced', label: '高级', sublabel: '律诗', levels: advancedLevels },
  ];

  const currentTier = tierConfig.find(t => t.key === activeTier)!;

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; }
        .lv-nav { height: 56px; padding: 0 16px; display: flex; align-items: center; gap: 12px; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); }
        .lv-nav-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); border-radius: var(--rounded-sm); cursor: pointer; }
        .lv-nav-title { font-size: 18px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 2px; }
        .lv-content { padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .lv-tier-tabs { display: flex; gap: 0; background: var(--color-surface); border-radius: var(--rounded-md); padding: 3px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .lv-tier-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 8px 6px; border-radius: calc(var(--rounded-md) - 2px); cursor: pointer; transition: all 0.2s; color: var(--color-on-surface-2); font-size: 13px; font-weight: 600; }
        .lv-tier-tab.active { background: var(--color-primary); color: #fff; box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent); }
        .lv-tier-tab-sub { font-size: 9px; font-weight: 400; opacity: 0.8; }
        .lv-tier-tab.active .lv-tier-tab-sub { opacity: 0.9; }
        .lv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .lv-card { border-radius: var(--rounded-md); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 10px 4px 8px; cursor: pointer; border: 1.5px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); background: var(--color-surface); transition: all 0.2s; position: relative; min-height: 72px; }
        .lv-card.completed { border-color: color-mix(in srgb, var(--color-success) 30%, transparent); }
        .lv-card.current { border-color: var(--color-primary); border-width: 2px; box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent); background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface)); }
        .lv-card.locked { opacity: 0.45; cursor: default; background: color-mix(in srgb, var(--color-on-surface) 4%, var(--color-surface)); }
        .lv-card-num { font-size: 20px; font-weight: 800; color: var(--color-on-surface); line-height: 1; }
        .lv-card.current .lv-card-num { color: var(--color-primary); }
        .lv-card.locked .lv-card-num { color: var(--color-on-surface-2); }
        .lv-card-name { font-size: 11px; color: var(--color-on-surface-2); text-align: center; line-height: 1.2; max-width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-all; }
        .lv-card-stars { display: flex; gap: 1px; margin-top: 2px; }
        .lv-card-stars svg { width: 12px; height: 12px; }
        .lv-star-filled { color: #D4A017; fill: #D4A017; }
        .lv-star-empty { color: color-mix(in srgb, var(--color-on-surface) 15%, transparent); }
        .lv-lock-icon { color: var(--color-on-surface-2); }
        .lv-progress { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--color-surface); border-radius: var(--rounded-md); border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .lv-progress-bar { flex: 1; height: 6px; background: color-mix(in srgb, var(--color-on-surface) 8%, transparent); border-radius: 3px; overflow: hidden; }
        .lv-progress-fill { height: 100%; background: var(--color-primary); border-radius: 3px; transition: width 0.3s; }
        .lv-progress-text { font-size: 12px; color: var(--color-on-surface-2); white-space: nowrap; }
        .lv-tab-bar { height: 72px; background: var(--color-surface); border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); display: flex; align-items: center; justify-content: space-around; padding-bottom: max(12px, env(safe-area-inset-bottom)); flex-shrink: 0; }
        .lv-tab { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--color-on-surface-2); font-size: 11px; cursor: pointer; }
        .lv-tab.active { color: var(--color-primary); }
        .lv-tab svg { width: 22px; height: 22px; }
      `}} />

      <nav className="lv-nav">
        <div className="lv-nav-back" onClick={() => router.push('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <span className="lv-nav-title">关卡地图</span>
      </nav>

      <div className="lv-content">
        <div className="lv-progress">
          <div className="lv-progress-text">总进度</div>
          <div className="lv-progress-bar">
            <div className="lv-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="lv-progress-text">{completed} / {levels.length}</div>
        </div>

        <div className="lv-tier-tabs">
          {tierConfig.map(t => (
            <div
              key={t.key}
              className={`lv-tier-tab${activeTier === t.key ? ' active' : ''}`}
              onClick={() => setActiveTier(t.key)}
            >
              {t.label}
              <span className="lv-tier-tab-sub">{t.sublabel}</span>
            </div>
          ))}
        </div>

        <div className="lv-grid">
          {currentTier.levels.map(level => (
            <LevelCard
              key={level.id}
              level={level}
              progress={progress}
              onClick={() => router.push(`/play-screen?level=${level.id}`)}
            />
          ))}
        </div>
      </div>

      <div className="lv-tab-bar">
        <div className="lv-tab" onClick={() => router.push('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          首页
        </div>
        <div className="lv-tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          关卡
        </div>
        <div className="lv-tab" onClick={() => router.push('/poems')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          图鉴
        </div>
        <div className="lv-tab" onClick={() => router.push('/me')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          我的
        </div>
      </div>
    </div>
  );
}
