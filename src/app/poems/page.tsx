'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/storage';
import { poems, getPoemById } from '@/data/poems';
import { levels } from '@/data/levels';
import type { UserProgress, Poem } from '@/types';

type FilterType = 'all' | 'completed';

export default function PoemsScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedPoem, setExpandedPoem] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const scrollToTop = () => {
    // 尝试滚动 content 容器
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    // 同时尝试滚动 window（兼容不同滚动容器）
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completedPoemIds = useMemo(() => {
    if (!progress) return new Set<string>();
    const ids = new Set<string>();
    Object.keys(progress.levelResults).forEach(lid => {
      const level = levels.find(l => l.id === Number(lid));
      if (level) ids.add(level.poemId);
    });
    return ids;
  }, [progress]);

  const filteredPoems = useMemo(() => {
    let list = poems;
    if (filter === 'completed') {
      list = list.filter(p => completedPoemIds.has(p.id));
    }
    return list;
  }, [filter, completedPoemIds]);

  if (!progress) return null;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'completed', label: '已通关' },
  ];

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; }
        .pm-nav { height: 56px; padding: 0 16px; display: flex; align-items: center; gap: 12px; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); }
        .pm-nav-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); cursor: pointer; }
        .pm-nav-title { font-size: 18px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 2px; }
        .pm-content { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
        .pm-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .pm-filter { padding: 6px 16px; border-radius: var(--rounded-sm); font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid color-mix(in srgb, var(--color-on-surface) 10%, transparent); background: transparent; color: var(--color-on-surface-2); transition: all 0.2s; }
        .pm-filter.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .pm-list { display: flex; flex-direction: column; gap: 12px; }
        .pm-card { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 18px 16px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); cursor: pointer; transition: all 0.2s; }
        .pm-card:active { transform: scale(0.98); }
        .pm-card-header { display: flex; align-items: center; justify-content: space-between; }
        .pm-card-title { font-size: 17px; font-weight: 700; color: var(--color-on-surface); }
        .pm-card-meta { font-size: 12px; color: var(--color-on-surface-2); margin-top: 2px; }
        .pm-card-badge { padding: 3px 10px; border-radius: var(--rounded-sm); font-size: 11px; font-weight: 600; }
        .pm-card-badge.done { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
        .pm-card-badge.undone { background: color-mix(in srgb, var(--color-on-surface) 6%, transparent); color: var(--color-on-surface-2); }
        .pm-card-expand { margin-top: 14px; padding-top: 14px; border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); animation: pm-slide 0.3s ease-out; }
        @keyframes pm-slide { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 500px; } }
        .pm-poem-text { font-size: 15px; color: var(--color-on-surface); line-height: 2; text-align: center; white-space: pre-line; }
        .pm-poem-trans { font-size: 13px; color: var(--color-on-surface-2); line-height: 1.8; margin-top: 14px; padding-top: 14px; border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .pm-empty { text-align: center; padding: 40px 20px; color: var(--color-on-surface-2); font-size: 14px; }
        .pm-count { font-size: 12px; color: var(--color-on-surface-2); text-align: right; }
        .pm-top-btn { position: fixed; bottom: 90px; right: calc(50% - 220px); width: 44px; height: 44px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent); cursor: pointer; z-index: 100; border: none; transition: all 0.2s; }
        .pm-top-btn:active { transform: scale(0.9); }
        @media (max-width: 480px) {
          .pm-top-btn { right: 20px; }
        }
        .pm-tab-bar { height: 72px; background: var(--color-surface); border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); display: flex; align-items: center; justify-content: space-around; padding-bottom: max(12px, env(safe-area-inset-bottom)); flex-shrink: 0; }
        .pm-tab { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--color-on-surface-2); font-size: 11px; cursor: pointer; }
        .pm-tab.active { color: var(--color-primary); }
        .pm-tab svg { width: 22px; height: 22px; }
      `}} />

      <nav className="pm-nav">
        <div className="pm-nav-back" onClick={() => router.push('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <span className="pm-nav-title">诗词图鉴</span>
      </nav>

      <div className="pm-content" ref={contentRef}>
        <div className="pm-filters">
          {filters.map(f => (
            <div
              key={f.key}
              className={`pm-filter${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </div>
          ))}
        </div>

        <div className="pm-count">共 {filteredPoems.length} 首</div>

        <div className="pm-list">
          {filteredPoems.length === 0 ? (
            <div className="pm-empty">暂无诗词</div>
          ) : (
            filteredPoems.map(poem => {
              const isCompleted = completedPoemIds.has(poem.id);
              const isExpanded = expandedPoem === poem.id;
              return (
                <div
                  key={poem.id}
                  className="pm-card"
                  onClick={() => setExpandedPoem(isExpanded ? null : poem.id)}
                >
                  <div className="pm-card-header">
                    <div>
                      <div className="pm-card-title">{poem.title}</div>
                      <div className="pm-card-meta">[{poem.dynasty}] {poem.author}</div>
                    </div>
                    <span className={`pm-card-badge ${isCompleted ? 'done' : 'undone'}`}>
                      {isCompleted ? '已通关' : '未通关'}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="pm-card-expand">
                      <div className="pm-poem-text">{poem.punctuation}</div>
                      <div className="pm-poem-trans">{poem.translation}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <button className="pm-top-btn" onClick={scrollToTop} aria-label="回到顶部">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      <div className="pm-tab-bar">
        <div className="pm-tab" onClick={() => router.push('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          首页
        </div>
        <div className="pm-tab" onClick={() => router.push('/levels-screen')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          关卡
        </div>
        <div className="pm-tab" onClick={() => router.push('/stats')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
          统计
        </div>
        <div className="pm-tab active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          图鉴
        </div>
      </div>
    </div>
  );
}
