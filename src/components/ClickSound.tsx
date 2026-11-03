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

/** 消消乐式清脆双音：两个短促三角波音符快速上行，带一点高频“嗒”声 */
function playClick() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const master = ac.createGain();
  master.gain.value = 0.5;
  master.connect(ac.destination);

  // 高频轻「嗒」声（攻击瞬态，让声音更脆）
  const tick = ac.createOscillator();
  const tickGain = ac.createGain();
  tick.type = 'square';
  tick.frequency.setValueAtTime(2600 + Math.random() * 300, t);
  tickGain.gain.setValueAtTime(0.0001, t);
  tickGain.gain.exponentialRampToValueAtTime(0.12, t + 0.002);
  tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  tick.connect(tickGain).connect(master);
  tick.start(t);
  tick.stop(t + 0.03);

  // 第一音：短促上行
  const n1 = ac.createOscillator();
  const g1 = ac.createGain();
  n1.type = 'triangle';
  const f = 780 + Math.random() * 80;
  n1.frequency.setValueAtTime(f, t);
  n1.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.045);
  g1.gain.setValueAtTime(0.0001, t);
  g1.gain.exponentialRampToValueAtTime(0.35, t + 0.004);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  n1.connect(g1).connect(master);
  n1.start(t);
  n1.stop(t + 0.07);

  // 第二音：高八度轻点，晚 55ms 出现，形成“叮-叮”双音
  const n2 = ac.createOscillator();
  const g2 = ac.createGain();
  n2.type = 'triangle';
  const t2 = t + 0.055;
  n2.frequency.setValueAtTime(f * 2, t2);
  n2.frequency.exponentialRampToValueAtTime(f * 2.6, t2 + 0.03);
  g2.gain.setValueAtTime(0.0001, t2);
  g2.gain.exponentialRampToValueAtTime(0.22, t2 + 0.003);
  g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.05);
  n2.connect(g2).connect(master);
  n2.start(t2);
  n2.stop(t2 + 0.06);
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
