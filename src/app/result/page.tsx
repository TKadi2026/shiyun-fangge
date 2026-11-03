'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getLevelById } from '@/data/levels';
import { getPoemById } from '@/data/poems';
import { calculateStars, formatTime } from '@/lib/game-logic';
import { saveLevelResult } from '@/lib/storage';
import { StarRating } from '@/components/StarRating';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = Number(searchParams.get('level') || '1');
  const timeMs = Number(searchParams.get('time') || '0');
  const wrong = Number(searchParams.get('wrong') || '0');

  const level = getLevelById(levelId);
  const poem = level ? getPoemById(level.poemId) : undefined;

  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [saved, setSaved] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [rankInfo, setRankInfo] = useState<{ rank: number; score: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fg_rank_name');
    if (stored) setPlayerName(stored);
  }, []);

  const accuracy = poem && poem.charCount > 0 ? poem.charCount / (poem.charCount + wrong) : 1;

  const handleSubmit = async () => {
    const name = playerName.trim();
    if (!name || submitState === 'submitting' || submitState === 'done') return;
    setSubmitState('submitting');
    try {
      const res = await fetch('/api/rank/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, level: levelId, timeMs, wrong }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');
      localStorage.setItem('fg_rank_name', name);
      setRankInfo({ rank: data.rank, score: data.score });
      setSubmitState('done');
    } catch {
      setSubmitState('error');
    }
  };

  useEffect(() => {
    if (!level) return;
    const s = calculateStars(timeMs, level.starThresholds);
    setStars(s);
    if (!saved) {
      saveLevelResult(levelId, timeMs, s);
      setSaved(true);
    }
  }, [level, levelId, timeMs, saved]);

  if (!level || !poem) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'serif' }}>
        <p>数据加载失败</p>
        <button onClick={() => router.push('/')} style={{ marginTop: '16px', padding: '8px 20px', cursor: 'pointer' }}>返回首页</button>
      </div>
    );
  }

  const hasNextLevel = levelId < 150;
  const tierLabels: Record<string, string> = { beginner: '初级', intermediate: '中级', advanced: '高级' };

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; min-height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; max-width: 480px; margin: 0 auto; }
        .rs-content { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 20px 14px; gap: 20px; overflow-y: auto; padding-bottom: max(20px, env(safe-area-inset-bottom)); }
        .rs-header { text-align: center; }
        .rs-header-title { font-size: 14px; color: var(--color-on-surface-2); letter-spacing: 2px; }
        .rs-header-name { font-size: 24px; font-weight: 800; color: var(--color-on-surface); margin-top: 4px; letter-spacing: 4px; }
        .rs-time-box { text-align: center; }
        .rs-time-label { font-size: 12px; color: var(--color-on-surface-2); letter-spacing: 1px; }
        .rs-time-val { font-size: 48px; font-weight: 900; color: var(--color-primary); font-variant-numeric: tabular-nums; margin-top: 4px; }
        .rs-acc { display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 20px; background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); font-size: 13px; font-weight: 700; }
        .rs-stars { display: flex; gap: 8px; justify-content: center; }
        .rs-poem-card { width: 100%; max-width: 400px; background: var(--color-surface); border-radius: var(--rounded-lg); padding: 24px 20px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); }
        .rs-poem-title { font-size: 18px; font-weight: 700; color: var(--color-on-surface); text-align: center; }
        .rs-poem-meta { font-size: 13px; color: var(--color-on-surface-2); text-align: center; margin-top: 4px; }
        .rs-poem-text { font-size: 16px; color: var(--color-on-surface); line-height: 2; text-align: center; margin-top: 16px; white-space: pre-line; }
        .rs-poem-trans { font-size: 13px; color: var(--color-on-surface-2); line-height: 1.8; margin-top: 16px; padding-top: 16px; border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); }
        .rs-actions { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px; }
        .rs-rank-card { width: 100%; max-width: 400px; background: var(--color-surface); border-radius: var(--rounded-lg); padding: 16px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); display: flex; flex-direction: column; gap: 10px; }
        .rs-rank-title { font-size: 13px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 1px; }
        .rs-rank-row { display: flex; gap: 8px; }
        .rs-name-input { flex: 1; min-width: 0; padding: 12px 14px; border-radius: var(--rounded-md); border: 1.5px solid color-mix(in srgb, var(--color-on-surface) 12%, transparent); background: var(--color-surface-variant); font-size: 15px; font-family: inherit; color: var(--color-on-surface); outline: none; }
        .rs-name-input:focus { border-color: var(--color-primary); }
        .rs-submit-btn { padding: 12px 18px; border-radius: var(--rounded-md); border: none; background: var(--color-primary); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
        .rs-submit-btn:disabled { opacity: 0.5; }
        .rs-rank-result { font-size: 14px; color: var(--color-primary); font-weight: 700; text-align: center; }
        .rs-rank-link { font-size: 13px; color: var(--color-on-surface-2); text-align: center; cursor: pointer; text-decoration: underline; }
        .rs-btn { width: 100%; padding: 16px; border-radius: var(--rounded-lg); font-size: 16px; font-weight: 700; letter-spacing: 2px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .rs-btn-primary { background: var(--color-primary); color: #fff; box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 30%, transparent); }
        .rs-btn-secondary { background: var(--color-surface); color: var(--color-on-surface); border: 1.5px solid color-mix(in srgb, var(--color-on-surface) 12%, transparent); }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      <div className="rs-content">
        <div className="rs-header">
          <div className="rs-header-title">第 {level.id} 关 · {tierLabels[level.tier]}</div>
          <div className="rs-header-name">{poem.title}</div>
        </div>

        <div className="rs-time-box animate-bounce-in">
          <div className="rs-time-label">完成用时</div>
          <div className="rs-time-val">{formatTime(timeMs)}</div>
          <div className="rs-acc">正确率 {Math.round(accuracy * 100)}%</div>
        </div>

        <div className="rs-stars">
          <StarRating stars={stars} size={36} animated />
        </div>

        <div className="rs-rank-card animate-slide-up">
          <div className="rs-rank-title">🏆 上传世界排行</div>
          {submitState === 'done' && rankInfo ? (
            <>
              <div className="rs-rank-result">得分 {rankInfo.score} · 本关第 {rankInfo.rank} 名</div>
              <div className="rs-rank-link" onClick={() => router.push(`/rank?level=${levelId}`)}>
                查看世界排行 →
              </div>
            </>
          ) : (
            <>
              <div className="rs-rank-row">
                <input
                  className="rs-name-input"
                  placeholder="输入昵称（12 字内）"
                  maxLength={12}
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                />
                <button
                  className="rs-submit-btn"
                  disabled={!playerName.trim() || submitState === 'submitting'}
                  onClick={handleSubmit}
                >
                  {submitState === 'submitting' ? '上传中…' : '上传成绩'}
                </button>
              </div>
              {submitState === 'error' && <div className="rs-rank-link">上传失败，请重试</div>}
            </>
          )}
        </div>

        <div className="rs-poem-card animate-slide-up">
          <div className="rs-poem-title">{poem.title}</div>
          <div className="rs-poem-meta">[{poem.dynasty}] {poem.author}</div>
          <div className="rs-poem-text">{poem.punctuation}</div>
          <div className="rs-poem-trans">{poem.translation}</div>
        </div>

        <div className="rs-actions">
          {hasNextLevel && (
            <button
              className="rs-btn rs-btn-primary"
              onClick={() => router.push(`/play-screen?level=${levelId + 1}`)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              下一关
            </button>
          )}
          <button
            className="rs-btn rs-btn-secondary"
            onClick={() => router.push(`/play-screen?level=${levelId}`)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            再来一局
          </button>
          <button
            className="rs-btn rs-btn-secondary"
            onClick={() => router.push('/levels-screen')}
          >
            返回关卡地图
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultScreen() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'serif' }}>加载中...</div>}>
      <ResultContent />
    </Suspense>
  );
}
