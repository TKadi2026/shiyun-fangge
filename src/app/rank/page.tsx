'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface BoardRow {
  name: string;
  score?: number;
  total?: number;
  levels?: number;
  timeMs?: number;
  accuracy?: number;
  at?: number;
}

const TROPHY = ['🥇', '🥈', '🥉'];

function RankContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = Number(searchParams.get('level') || '0');

  const [tab, setTab] = useState<'total' | 'level'>(levelId > 0 ? 'level' : 'total');
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (which: 'total' | 'level', lv: number) => {
    setLoading(true);
    setError('');
    try {
      const url = which === 'total'
        ? '/api/rank/total'
        : `/api/rank/board?level=${lv}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '加载失败');
      setRows(data.board || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '网络错误');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab, levelId);
  }, [tab, levelId, load]);

  const fmtAcc = (a?: number) => (a == null ? '' : `${Math.round(a * 100)}%`);
  const fmtTime = (ms?: number) => {
    if (ms == null) return '';
    const s = ms / 1000;
    return s < 60 ? `${s.toFixed(1)}秒` : `${Math.floor(s / 60)}分${Math.round(s % 60)}秒`;
  };

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; max-width: 480px; margin: 0 auto; }
        .rk-nav { height: 48px; padding: 0 12px; display: flex; align-items: center; gap: 8px; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); flex-shrink: 0; }
        .rk-nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); cursor: pointer; }
        .rk-nav-title { font-size: 16px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 2px; flex: 1; text-align: center; }
        .rk-nav-sp { width: 32px; }
        .rk-tabs { display: flex; gap: 8px; padding: 12px 14px 8px; flex-shrink: 0; }
        .rk-tab { flex: 1; padding: 10px 0; text-align: center; border-radius: var(--rounded-md); font-size: 14px; font-weight: 600; color: var(--color-on-surface-2); background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); cursor: pointer; transition: all 0.15s; }
        .rk-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); box-shadow: 0 2px 10px color-mix(in srgb, var(--color-primary) 30%, transparent); }
        .rk-list { flex: 1; overflow-y: auto; padding: 6px 14px 12px; display: flex; flex-direction: column; gap: 8px; }
        .rk-row { display: flex; align-items: center; gap: 10px; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); border-radius: var(--rounded-md); padding: 12px 14px; }
        .rk-row.me { border-color: var(--color-primary); box-shadow: 0 2px 10px color-mix(in srgb, var(--color-primary) 20%, transparent); }
        .rk-rank { width: 36px; text-align: center; font-size: 15px; font-weight: 800; color: var(--color-on-surface-2); flex-shrink: 0; font-variant-numeric: tabular-nums; }
        .rk-rank.top { font-size: 18px; }
        .rk-main { flex: 1; min-width: 0; }
        .rk-name { font-size: 15px; font-weight: 700; color: var(--color-on-surface); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rk-sub { font-size: 11px; color: var(--color-on-surface-2); margin-top: 2px; }
        .rk-score { font-size: 17px; font-weight: 900; color: var(--color-primary); font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .rk-empty { text-align: center; color: var(--color-on-surface-2); font-size: 13px; padding: 48px 0; line-height: 2; }
        .rk-tip { font-size: 11px; color: var(--color-on-surface-2); text-align: center; padding: 4px 14px 10px; flex-shrink: 0; }
        .rk-loading { text-align: center; color: var(--color-on-surface-2); font-size: 13px; padding: 40px 0; }
        .rk-tab-bar { height: 72px; background: var(--color-surface); border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); display: flex; align-items: center; justify-content: space-around; padding-bottom: max(12px, env(safe-area-inset-bottom)); flex-shrink: 0; }
        .rk-tab-item { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 11px; color: var(--color-on-surface-2); cursor: pointer; padding: 6px 10px; -webkit-tap-highlight-color: transparent; }
        .rk-tab-item.active { color: var(--color-primary); font-weight: 700; }
        .rk-tab-item svg { width: 20px; height: 20px; }
      `}} />

      <nav className="rk-nav">
        <div className="rk-nav-back" onClick={() => router.push('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <span className="rk-nav-title">世界排行</span>
        <div className="rk-nav-sp" />
      </nav>

      <div className="rk-tabs">
        <div className={`rk-tab ${tab === 'total' ? 'active' : ''}`} onClick={() => setTab('total')}>总榜</div>
        <div
          className={`rk-tab ${tab === 'level' ? 'active' : ''}`}
          onClick={() => { if (levelId > 0) setTab('level'); else router.push('/levels-screen'); }}
        >
          {levelId > 0 ? `第 ${levelId} 关` : '选关卡'}
        </div>
      </div>

      <div className="rk-list">
        {loading && <div className="rk-loading">加载中…</div>}
        {!loading && error && <div className="rk-empty">{error}<br />请稍后重试</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="rk-empty">
            {tab === 'total' ? '总榜虚位以待' : `第 ${levelId} 关虚位以待`}
            <br />成为第一个上榜的人吧！
          </div>
        )}
        {!loading && !error && rows.map((r, i) => (
          <div className="rk-row" key={i}>
            <span className={`rk-rank ${i < 3 ? 'top' : ''}`}>{TROPHY[i] ?? i + 1}</span>
            <div className="rk-main">
              <div className="rk-name">{r.name}</div>
              <div className="rk-sub">
                {tab === 'total'
                  ? `通关 ${r.levels ?? 1} 关`
                  : `正确率 ${fmtAcc(r.accuracy)} · 用时 ${fmtTime(r.timeMs)}`}
              </div>
            </div>
            <span className="rk-score">{r.total ?? r.score ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="rk-tip">得分 = 正确率² × 速度 × 10000 · 每关取最好成绩</div>

      <div className="rk-tab-bar">
        <div className="rk-tab-item" onClick={() => router.push('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          首页
        </div>
        <div className="rk-tab-item" onClick={() => router.push('/levels-screen')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          关卡
        </div>
        <div className="rk-tab-item" onClick={() => router.push('/stats')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
          统计
        </div>
        <div className="rk-tab-item" onClick={() => router.push('/poems')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          图鉴
        </div>
        <div className="rk-tab-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
          排行
        </div>
      </div>
    </div>
  );
}

export default function RankScreen() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'serif' }}>加载中...</div>}>
      <RankContent />
    </Suspense>
  );
}
