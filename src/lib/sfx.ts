// 游戏音效：Web Audio 合成，无需音频文件
// correct = 点中目标字的清脆上行音；wrong = 点错的低沉软音；win = 过关琶音号角

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

interface NoteOpts {
  freq: number;
  start: number; // 相对偏移秒
  dur: number;
  vol: number;
  type?: OscillatorType;
  slideTo?: number; // 结尾滑到的频率
}

function note(ac: AudioContext, master: GainNode, o: NoteOpts) {
  const t = ac.currentTime + o.start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = o.type ?? 'triangle';
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + o.dur * 0.8);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(o.vol, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + o.dur);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + o.dur + 0.02);
}

/** 点中目标字：短促清脆上行音，连击越高音越高 */
export function playCorrect(combo = 1) {
  const ac = getCtx();
  if (!ac) return;
  const master = ac.createGain();
  master.gain.value = 0.5;
  master.connect(ac.destination);
  // 音高随连击微升，封顶 1.6 倍
  const boost = Math.min(1 + (combo - 1) * 0.04, 1.6);
  const base = 880 * boost * (1 + Math.random() * 0.02);
  note(ac, master, { freq: base, start: 0, dur: 0.09, vol: 0.3, slideTo: base * 1.4 });
  note(ac, master, { freq: base * 2, start: 0.045, dur: 0.08, vol: 0.15, slideTo: base * 2.4, type: 'sine' });
}

/** 点错：低沉柔和的下坠音，不刺耳 */
export function playWrong() {
  const ac = getCtx();
  if (!ac) return;
  const master = ac.createGain();
  master.gain.value = 0.4;
  master.connect(ac.destination);
  note(ac, master, { freq: 220, start: 0, dur: 0.14, vol: 0.25, type: 'sine', slideTo: 150 });
}

/** 过关：C-E-G-C 琶音 + 尾音长音，欢快号角 */
export function playWin() {
  const ac = getCtx();
  if (!ac) return;
  const master = ac.createGain();
  master.gain.value = 0.45;
  master.connect(ac.destination);
  const c5 = 523.25;
  note(ac, master, { freq: c5, start: 0, dur: 0.12, vol: 0.3 });
  note(ac, master, { freq: c5 * 1.26, start: 0.09, dur: 0.12, vol: 0.3 });   // E
  note(ac, master, { freq: c5 * 1.5, start: 0.18, dur: 0.12, vol: 0.3 });     // G
  note(ac, master, { freq: c5 * 2, start: 0.27, dur: 0.35, vol: 0.32 });      // 高C 长音
  note(ac, master, { freq: c5 * 2.5, start: 0.27, dur: 0.3, vol: 0.12, type: 'sine' }); // 高G 泛音点缀
}

/** 世界排行得分：正确率² × 速度系数 × 10000
 *  refSec = 该关三星用时（越少越快），速度系数 = min(refSec / timeSec, 2) */
export function calcRankScore(accuracy: number, timeMs: number, refSec: number): number {
  if (timeMs <= 0) return 0;
  const speed = Math.min(refSec / (timeMs / 1000), 2);
  return Math.round(Math.pow(Math.max(0, Math.min(1, accuracy)), 2) * speed * 10000);
}
