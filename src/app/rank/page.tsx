'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RankBoard } from '@/components/RankBoard';

function RankContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = Number(searchParams.get('level') || '0');

  return (
    <div className="pg-root">
      <style dangerouslySetInnerHTML={{__html:`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { display: flex; flex-direction: column; width: 100%; height: 100dvh; background: var(--color-surface-variant); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif; max-width: 480px; margin: 0 auto; }
        .rk-nav { height: 48px; padding: 0 12px; display: flex; align-items: center; gap: 8px; background: var(--color-surface); border-bottom: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent); flex-shrink: 0; }
        .rk-nav-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--color-on-surface); cursor: pointer; }
        .rk-nav-title { font-size: 16px; font-weight: 700; color: var(--color-on-surface); letter-spacing: 2px; flex: 1; text-align: center; }
        .rk-nav-sp { width: 32px; }
        .rk-content { flex: 1; overflow-y: auto; padding: 12px 14px; }
      `}} />

      <nav className="rk-nav">
        <div className="rk-nav-back" onClick={() => router.push('/me?tab=rank')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <span className="rk-nav-title">{levelId > 0 ? `第 ${levelId} 关排行` : '世界排行'}</span>
        <div className="rk-nav-sp" />
      </nav>

      <div className="rk-content">
        <RankBoard levelId={levelId} />
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
