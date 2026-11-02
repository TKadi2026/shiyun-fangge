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

/** 短促的“哒”点击音：高频三角波快速衰减 + 一点噪声瞬态 */
function playClick() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  const oscGain = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.045);
  oscGain.gain.setValueAtTime(0.12, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(oscGain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.07);

  // 瞬态噪声，让声音更“脆”
  const len = Math.floor(ac.sampleRate * 0.02);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const noise = ac.createBufferSource();
  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.06, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  noise.buffer = buffer;
  noise.connect(noiseGain).connect(ac.destination);
  noise.start(t);
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
