'use client';

import { useEffect } from 'react';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** 消消乐式「啵」声：柔和正弦泡音，音高随机微浮动，避免机械感 */
function playClick() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  const base = 520 + Math.random() * 140;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(base * 0.5, t + 0.08);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

const CLICKABLE = 'button, [role="button"], .pl-cell, .lv-card, .pm-card, .hm-cta, .hm-tab, .lv-tab, .st-tab, .pm-tab, .pm-filter, .lv-tier-tab';

export function ClickSound() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(CLICKABLE);
      if (!el) return;
      if (el instanceof HTMLButtonElement && el.disabled) return;
      if (el.closest('[data-silent]')) return;
      playClick();
    };
    document.addEventListener('click', handler, { passive: true });
    return () => document.removeEventListener('click', handler);
  }, []);

  return null;
}
