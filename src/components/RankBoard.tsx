'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

/** 世界排行榜单（总榜 + 单关榜）。levelId=0 时只显示总榜。 */
export function RankBoard({ levelId = 0, showTabs = true }: { levelId?: number; showTabs?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<'total' | 'level'>(levelId > 0 ? 'level' : 'total');
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (which: 'total' | 'level', lv: number) => {
    setLoading(true);
    setError('');
    try {
      const url = which === 'total' ? '/api/rank/total' : `/api/rank/board?level=${lv}`;
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
    <div>
      <style dangerouslySetInnerHTML={{__html:`
        .rb-tabs { display: flex; gap: 8px; padding: 0 0 10px; }
        .rb-tab { flex: 1; padding: 10px 0; text-align: center; border-radius: var(--rounded-md); font-size: 14px; font-weight: 600; color: var(--color-on-surface-2); background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); cursor: pointer; transition: all 0.15s; }
        .rb-tab.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); box-shadow: 0 2px 10px color-mix(in srgb, var(--color-primary) 30%, transparent); }
        .rb-list { display: flex; flex-direction: column; gap: 8px; }
        .rb-row { display: flex; align-items: center; gap: 10px; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); border-radius: var(--rounded-md); padding: 12px 14px; }
        .rb-rank { width: 36px; text-align: center; font-size: 15px; font-weight: 800; color: var(--color-on-surface-2); flex-shrink: 0; font-variant-numeric: tabular-nums; }
        .rb-rank.top { font-size: 18px; }
        .rb-main { flex: 1; min-width: 0; }
        .rb-name { font-size: 15px; font-weight: 700; color: var(--color-on-surface); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rb-sub { font-size: 11px; color: var(--color-on-surface-2); margin-top: 2px; }
        .rb-score { font-size: 17px; font-weight: 900; color: var(--color-primary); font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .rb-empty { text-align: center; color: var(--color-on-surface-2); font-size: 13px; padding: 48px 0; line-height: 2; }
        .rb-tip { font-size: 11px; color: var(--color-on-surface-2); text-align: center; padding: 10px 0 2px; }
        .rb-loading { text-align: center; color: var(--color-on-surface-2); font-size: 13px; padding: 40px 0; }
      `}} />

      {showTabs && (
        <div className="rb-tabs">
          <div className={`rb-tab ${tab === 'total' ? 'active' : ''}`} onClick={() => setTab('total')}>总榜</div>
          <div
            className={`rb-tab ${tab === 'level' ? 'active' : ''}`}
            onClick={() => { if (levelId > 0) setTab('level'); else router.push('/levels-screen'); }}
          >
            {levelId > 0 ? `第 ${levelId} 关` : '选关卡'}
          </div>
        </div>
      )}

      <div className="rb-list">
        {loading && <div className="rb-loading">加载中…</div>}
        {!loading && error && <div className="rb-empty">{error}<br />请稍后重试</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="rb-empty">
            {tab === 'total' ? '总榜虚位以待' : `第 ${levelId} 关虚位以待`}
            <br />成为第一个上榜的人吧！
          </div>
        )}
        {!loading && !error && rows.map((r, i) => (
          <div className="rb-row" key={i}>
            <span className={`rb-rank ${i < 3 ? 'top' : ''}`}>{TROPHY[i] ?? i + 1}</span>
            <div className="rb-main">
              <div className="rb-name">{r.name}</div>
              <div className="rb-sub">
                {tab === 'total'
                  ? `通关 ${r.levels ?? 1} 关`
                  : `正确率 ${fmtAcc(r.accuracy)} · 用时 ${fmtTime(r.timeMs)}`}
              </div>
            </div>
            <span className="rb-score">{r.total ?? r.score ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="rb-tip">得分 = 正确率² × 速度 × 10000 · 每关取最好成绩</div>
    </div>
  );
}
