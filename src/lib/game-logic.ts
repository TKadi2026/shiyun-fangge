import type { GridCell, GameMode, Poem } from '@/types';

const DISTRACTOR_CHARS = '天地人和大小上下中左右东西南北风雨雪花鸟虫鱼马牛羊鸡犬龙虎金木水火土日月星云江河湖海山林田';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDistractors(count: number, excludeChars: Set<string>): string[] {
  const available = DISTRACTOR_CHARS.split('').filter(c => !excludeChars.has(c));
  const shuffled = shuffle(available);
  return shuffled.slice(0, count);
}

export function generateGrid(
  poem: Poem,
  gridSize: { cols: number; rows: number },
  mode: GameMode,
  allPoems?: Poem[],
): GridCell[] {
  const totalCells = gridSize.cols * gridSize.rows;
  const chars = poem.content.split('');
  const charSet = new Set(chars);
  const needed = totalCells - chars.length;

  let distractors: string[] = [];

  if (mode === 'mixed' && allPoems) {
    const otherPoems = allPoems.filter(p => p.id !== poem.id);
    const otherChars = otherPoems.flatMap(p => p.content.split(''));
    const filtered = otherChars.filter(c => !charSet.has(c));
    const shuffled = shuffle(filtered);
    distractors = shuffled.slice(0, needed);
    if (distractors.length < needed) {
      distractors = [...distractors, ...getDistractors(needed - distractors.length, new Set([...charSet, ...distractors]))];
    }
  } else {
    distractors = getDistractors(needed, charSet);
  }

  const cells: GridCell[] = [
    ...chars.map((char, i) => ({ char, originalIndex: i, isDistractor: false })),
    ...distractors.map(char => ({ char, originalIndex: -1, isDistractor: true })),
  ];

  return shuffle(cells);
}

export function calculateStars(
  timeMs: number,
  thresholds: { two: number; three: number },
): 1 | 2 | 3 {
  const timeSec = timeMs / 1000;
  if (timeSec <= thresholds.three) return 3;
  if (timeSec <= thresholds.two) return 2;
  return 1;
}

export function getMemoryPreviewDuration(charCount: number, tier?: 'beginner' | 'intermediate' | 'advanced'): number {
  // 初级给更多预览时间
  const baseMultiplier = tier === 'beginner' ? 500 : tier === 'intermediate' ? 350 : 300;
  return Math.max(3000, charCount * baseMultiplier);
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const deci = Math.floor((ms % 1000) / 100);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${deci}`;
}
