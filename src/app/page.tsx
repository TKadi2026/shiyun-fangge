'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress, getCompletedCount, isOnboardingDone } from '@/lib/storage';
import { formatTime } from '@/lib/game-logic';
import { poems } from '@/data/poems';
import { levels } from '@/data/levels';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { OnboardingGuide } from '@/components/OnboardingGuide';
import type { UserProgress, Poem } from '@/types';

function getDailyRecommendation(progress: UserProgress): Poem {
  const completedPoemIds = new Set<string>();
  Object.keys(progress.levelResults).forEach(lid => {
    const level = levels.find(l => l.id === Number(lid));
    if (level) completedPoemIds.add(level.poemId);
  });

  const uncompleted = poems.filter(p => !completedPoemIds.has(p.id));
  if (uncompleted.length === 0) {
    return poems[new Date().getDate() % poems.length];
  }

  const dayIndex = new Date().getDate() % uncompleted.length;
  return uncompleted[dayIndex];
}

export default function HomeScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    if (!isOnboardingDone()) {
      setShowOnboarding(true);
    }
  }, []);

  const todaySessions = progress?.todayStats.sessions ?? 0;
  const todayTime = progress?.todayStats.totalTime ?? 0;
  const completed = progress ? getCompletedCount(progress) : 0;

  const dailyPoem = useMemo(() => progress ? getDailyRecommendation(progress) : poems[0], [progress]);

  if (showOnboarding) {
    return <OnboardingGuide onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; min-height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; }
        .hm-nav { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); position: relative; z-index: 10; }
        .hm-nav-title { font-size: 20px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 4px; }
        .hm-nav-icon { display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); }
        .hm-hero { position: relative; width: 100%; height: 200px; overflow: hidden; }
        .hm-hero img { width: 100%; height: 100%; object-fit: cover; }
        .hm-hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--color-surface-variant) 90%, transparent) 100%); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 24px; }
        .hm-brand { font-size: 32px; font-weight: 900; color: var(--color-on-surface); letter-spacing: 8px; text-shadow: 0 1px 3px color-mix(in srgb, var(--color-surface) 60%, transparent); }
        .hm-brand-sub { font-size: 13px; color: var(--color-on-surface-2); letter-spacing: 3px; margin-top: 6px; }
        .hm-content { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 14px; }
        .hm-summary { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 18px; display: flex; flex-direction: column; gap: 12px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .hm-summary-header { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: var(--color-on-surface); }
        .hm-summary-header svg { color: var(--color-primary); }
        .hm-summary-row { display: flex; gap: 12px; }
        .hm-stat { flex: 1; background: var(--color-surface-variant); border-radius: var(--rounded-md); padding: 12px 10px; text-align: center; }
        .hm-stat-val { font-size: 24px; font-weight: 800; color: var(--color-primary); }
        .hm-stat-label { font-size: 11px; color: var(--color-on-surface-2); margin-top: 4px; }
        .hm-daily { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 18px 16px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); position: relative; overflow: hidden; }
        .hm-daily-badge { position: absolute; top: 0; right: 0; background: var(--color-primary); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 0 var(--rounded-lg) 0 var(--rounded-md); letter-spacing: 1px; }
        .hm-daily-title { font-size: 14px; font-weight: 700; color: var(--color-on-surface); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .hm-daily-title svg { color: var(--color-primary); }
        .hm-daily-poem { font-size: 15px; color: var(--color-on-surface); line-height: 1.8; }
        .hm-daily-meta { font-size: 12px; color: var(--color-on-surface-2); margin-top: 8px; display: flex; align-items: center; justify-content: space-between; }
        .hm-daily-btn { padding: 4px 12px; border-radius: var(--rounded-sm); background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); font-size: 12px; font-weight: 600; border: none; cursor: pointer; }
        .hm-quote { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 16px 18px; border-left: 3px solid var(--color-primary); }
        .hm-quote-text { font-size: 14px; color: var(--color-on-surface); line-height: 1.8; font-style: italic; white-space: pre-line; }
        .hm-quote-author { font-size: 12px; color: var(--color-on-surface-2); margin-top: 6px; text-align: right; }
        .hm-cta { width: 100%; padding: 16px; border-radius: var(--rounded-lg); background: var(--color-primary); color: #fff; font-size: 17px; font-weight: 700; letter-spacing: 4px; border: none; cursor: pointer; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent); }
        .hm-tab-bar { height: 72px; background: var(--color-surface); border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); display: flex; align-items: center; justify-content: space-around; padding-bottom: max(12px, env(safe-area-inset-bottom)); flex-shrink: 0; }
        .hm-tab { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--color-on-surface-2); font-size: 11px; cursor: pointer; }
        .hm-tab.active { color: var(--color-primary); }
        .hm-tab svg { width: 22px; height: 22px; }
        .hm-seal { width: 40px; height: 40px; border: 2px solid var(--color-primary); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 14px; font-weight: 900; transform: rotate(-5deg); margin-top: 8px; }
      `}} />

      <nav className="hm-nav">
        <div className="hm-seal">韵</div>
        <span className="hm-nav-title">诗韵方格</span>
        <div className="hm-nav-icon">
          <ThemeSwitcher />
        </div>
      </nav>

      <div className="hm-hero">
        <img src="/images/img_20261022_143810_113246.jpg" alt="水墨山水" />
        <div className="hm-hero-overlay">
          <div className="hm-brand">诗韵方格</div>
          <div className="hm-brand-sub">苏尔特方格 × 唐诗三百首</div>
        </div>
      </div>

      <div className="hm-content">
        <div className="hm-summary">
          <div className="hm-summary-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
            今日训练摘要
          </div>
          <div className="hm-summary-row">
            <div className="hm-stat">
              <div className="hm-stat-val">{todaySessions}</div>
              <div className="hm-stat-label">训练次数</div>
            </div>
            <div className="hm-stat">
              <div className="hm-stat-val">{todayTime > 0 ? formatTime(todayTime).slice(0, 5) : '00:00'}</div>
              <div className="hm-stat-label">总用时</div>
            </div>
            <div className="hm-stat">
              <div className="hm-stat-val">{completed}</div>
              <div className="hm-stat-label">已通关</div>
            </div>
          </div>
        </div>

        <div className="hm-daily">
          <div className="hm-daily-badge">每日推荐</div>
          <div className="hm-daily-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            今日推荐诗篇
          </div>
          <div className="hm-daily-poem">{dailyPoem.punctuation}</div>
          <div className="hm-daily-meta">
            <span>[{dailyPoem.dynasty}] {dailyPoem.author}《{dailyPoem.title}》</span>
            <button className="hm-daily-btn" onClick={() => {
              const level = levels.find(l => l.poemId === dailyPoem.id);
              if (level) router.push(`/play-screen?level=${level.id}`);
            }}>
              去训练
            </button>
          </div>
        </div>

        <button className="hm-cta" onClick={() => router.push('/levels-screen')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          开始训练
        </button>
      </div>

      <div className="hm-tab-bar">
        <div className="hm-tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          首页
        </div>
        <div className="hm-tab" onClick={() => router.push('/levels-screen')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          关卡
        </div>
        <div className="hm-tab" onClick={() => router.push('/stats')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
          统计
        </div>
        <div className="hm-tab" onClick={() => router.push('/poems')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          图鉴
        </div>
        <div className="hm-tab" onClick={() => router.push('/rank')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
          排行
        </div>
      </div>
    </div>
  );
}
