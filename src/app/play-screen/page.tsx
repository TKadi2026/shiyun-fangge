'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getLevelById } from '@/data/levels';
import { getPoemById, poems } from '@/data/poems';
import { generateGrid, getMemoryPreviewDuration } from '@/lib/game-logic';
import { SchulteGrid } from '@/components/SchulteGrid';
import { useTimer, TimerDisplay } from '@/components/Timer';
import { PoemProgress } from '@/components/PoemProgress';

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = Number(searchParams.get('level') || '1');
  const level = getLevelById(levelId);
  const poem = level ? getPoemById(level.poemId) : undefined;

  const [gameState, setGameState] = useState<'preview' | 'playing' | 'finished'>('playing');
  const [foundCount, setFoundCount] = useState(0);
  const [previewTimeLeft, setPreviewTimeLeft] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { elapsed, start, stop, reset } = useTimer({});

  const cells = useMemo(() => {
    if (!poem || !level) return [];
    return generateGrid(poem, level.gridSize, level.mode, poems);
  }, [poem, level]);

  const targetChar = poem ? (poem.content[foundCount] ?? '') : '';

  useEffect(() => {
    if (!level || !poem) return;
    if (level.mode === 'memory') {
      setGameState('preview');
      const duration = getMemoryPreviewDuration(poem.charCount, level.tier);
      setPreviewTimeLeft(duration);
      const interval = setInterval(() => {
        setPreviewTimeLeft(prev => {
          if (prev <= 100) {
            clearInterval(interval);
            setGameState('playing');
            start();
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setGameState('playing');
      start();
    }
  }, [level, poem, start]);

  const handleCorrect = useCallback(() => {
    if (!poem) return;
    const newCount = foundCount + 1;
    setFoundCount(newCount);

    setCombo(prev => prev + 1);
    setShowCombo(true);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setShowCombo(false), 1200);

    if (newCount >= poem.charCount) {
      const timeMs = stop();
      setGameState('finished');
      setTimeout(() => {
        router.push(`/result?level=${levelId}&time=${timeMs}`);
      }, 800);
    }
  }, [foundCount, poem, stop, levelId, router]);

  const handleWrong = useCallback(() => {
    setCombo(0);
  }, []);

  const handleRestart = useCallback(() => {
    setFoundCount(0);
    setCombo(0);
    setShowCombo(false);
    setGameState('playing');
    reset();
    start();
  }, [reset, start]);

  if (!level || !poem) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>关卡不存在</p>
        <button onClick={() => router.push('/levels-screen')}>返回关卡地图</button>
      </div>
    );
  }

  const modeLabels = { sequential: '循序点诗', mixed: '混字寻诗', memory: '忆诗找字' };
  const tierLabels = { beginner: '初级', intermediate: '中级', advanced: '高级' };

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; min-height: 100vh; min-height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; max-width: 480px; margin: 0 auto; }
        .pl-nav { height: 48px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); flex-shrink: 0; }
        .pl-nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); cursor: pointer; }
        .pl-nav-title { font-size: 14px; font-weight: 600; color: var(--color-on-surface); letter-spacing: 1px; flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pl-timer { display: flex; align-items: center; gap: 4px; font-size: 16px; font-weight: 700; color: var(--color-primary); font-variant-numeric: tabular-nums; flex-shrink: 0; }
        .pl-timer svg { width: 16px; height: 16px; }
        .pl-content { padding: 8px 12px; flex: 1; display: flex; flex-direction: column; gap: 10px; position: relative; min-height: 0; }
        .pl-progress { background: var(--color-surface); border-radius: var(--rounded-md); padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); flex-shrink: 0; }
        .pl-progress-label { font-size: 10px; color: var(--color-on-surface-2); margin-bottom: 6px; letter-spacing: 1px; }
        .pl-progress-poem { display: flex; flex-wrap: wrap; gap: 1px; line-height: 1.6; font-size: 15px; }
        .pl-char { display: inline-block; padding: 1px 2px; border-radius: 3px; color: var(--color-on-surface); transition: all 0.3s; }
        .pl-char.found { color: var(--color-success); font-weight: 700; background: color-mix(in srgb, var(--color-success) 10%, transparent); }
        .pl-char.current { color: var(--color-primary); font-weight: 700; animation: pl-pulse 1.2s ease-in-out infinite; }
        .pl-char.pending { color: color-mix(in srgb, var(--color-on-surface) 35%, transparent); }
        .pl-char.punct { color: var(--color-on-surface-2); padding: 1px; }
        @keyframes pl-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
        .pl-grid-wrap { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; padding: 4px 0; }
        .pl-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 100%; max-width: min(343px, 90vw); }
        .pl-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: var(--color-surface); border: 1.5px solid color-mix(in srgb, var(--color-on-surface) 10%, transparent); border-radius: var(--rounded-md); font-size: 20px; font-weight: 600; color: var(--color-on-surface); cursor: pointer; transition: all 0.15s; user-select: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .pl-cell:active { transform: scale(0.93); }
        .pl-cell.found { opacity: 0.2; transform: scale(0.88); border-color: color-mix(in srgb, var(--color-success) 20%, transparent); }
        .pl-cell.distractor { color: var(--color-on-surface); }
        .pl-info { background: var(--color-surface); border-radius: var(--rounded-md); padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; border: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent); flex-shrink: 0; }
        .pl-info-left { display: flex; flex-direction: column; gap: 1px; }
        .pl-info-level { font-size: 11px; color: var(--color-on-surface-2); }
        .pl-info-name { font-size: 14px; font-weight: 700; color: var(--color-on-surface); }
        .pl-info-mode { padding: 3px 8px; border-radius: var(--rounded-sm); background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); font-size: 11px; font-weight: 600; flex-shrink: 0; }
        .pl-bottom-bar { height: 44px; display: flex; align-items: center; justify-content: center; gap: 20px; padding: 0 12px; padding-bottom: env(safe-area-inset-bottom, 8px); flex-shrink: 0; }
        .pl-bottom-btn { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-on-surface-2); cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .pl-bottom-btn svg { width: 14px; height: 14px; }
        .pl-preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .pl-preview-box { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 24px 18px; max-width: 90vw; text-align: center; }
        .pl-preview-title { font-size: 18px; font-weight: 700; color: var(--color-on-surface); margin-bottom: 12px; }
        .pl-preview-poem { font-size: 18px; line-height: 2; color: var(--color-on-surface); }
        .pl-preview-countdown { margin-top: 16px; font-size: 13px; color: var(--color-on-surface-2); }
        .pl-combo { position: fixed; top: 60px; left: 50%; transform: translateX(-50%); z-index: 50; pointer-events: none; }
        .pl-combo-inner { display: flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 20px; font-weight: 900; font-size: 18px; color: #fff; animation: combo-pop 0.4s ease-out; }
        .pl-combo-inner.fire { background: linear-gradient(135deg, #FF6B35, #F7C948); box-shadow: 0 4px 20px rgba(255,107,53,0.5); }
        .pl-combo-inner.normal { background: linear-gradient(135deg, var(--color-primary), #F7C948); box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 40%, transparent); }
        .pl-combo-num { font-size: 24px; font-variant-numeric: tabular-nums; }
        .pl-combo-label { font-size: 12px; font-weight: 600; letter-spacing: 1px; opacity: 0.9; }
        @keyframes combo-pop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
      `}} />

      <nav className="pl-nav">
        <div className="pl-nav-back" onClick={() => router.push('/levels-screen')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <span className="pl-nav-title">第 {level.id} 关 · {poem.title}</span>
        <TimerDisplay elapsed={elapsed} />
      </nav>

      <div className="pl-content">
        <PoemProgress
          punctuation={poem.punctuation}
          content={poem.content}
          foundCount={foundCount}
        />

        <div className="pl-grid-wrap">
          <SchulteGrid
            cells={cells}
            gridSize={level.gridSize}
            targetChar={targetChar}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            disabled={gameState !== 'playing'}
          />
        </div>

        <div className="pl-info">
          <div className="pl-info-left">
            <span className="pl-info-level">第 {level.id} 关 · {tierLabels[level.tier]}</span>
            <span className="pl-info-name">{poem.title} · {poem.author}</span>
          </div>
          <span className="pl-info-mode">{modeLabels[level.mode]}</span>
        </div>
      </div>

      {showCombo && combo >= 2 && (
        <div className="pl-combo">
          <div className={`pl-combo-inner ${combo >= 5 ? 'fire' : 'normal'}`}>
            <span className="pl-combo-num">{combo}</span>
            <span className="pl-combo-label">
              {combo >= 10 ? '超神!' : combo >= 5 ? '连击!' : 'COMBO'}
            </span>
          </div>
        </div>
      )}

      <div className="pl-bottom-bar">
        <div className="pl-bottom-btn" onClick={handleRestart}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          重新开始
        </div>
        <div className="pl-bottom-btn" onClick={() => router.push('/levels-screen')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
          退出
        </div>
      </div>

      {gameState === 'preview' && (
        <div className="pl-preview-overlay">
          <div className="pl-preview-box">
            <div className="pl-preview-title">记住诗句</div>
            <div className="pl-preview-poem">{poem.punctuation}</div>
            <div className="pl-preview-countdown">{Math.ceil(previewTimeLeft / 1000)} 秒后开始</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayScreen() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'serif' }}>加载中...</div>}>
      <PlayContent />
    </Suspense>
  );
}
