import type { Level } from '@/types';

// 初级：五言绝句（20字）
const beginnerPoemIds = [
  'p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10',
  'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20', 'p01', 'p02', 'p03',
];

// 中级：七言绝句（28字）
const intermediatePoemIds = [
  'p11', 'p21', 'p22', 'p23', 'p24', 'p25', 'p26', 'p27', 'p28', 'p29',
  'p30', 'p31', 'p32', 'p34', 'p35', 'p36', 'p37', 'p38', 'p39', 'p40',
];

// 高级：五言律诗（40字）+ 七言律诗（56字）
const advancedLvshi40Ids = [
  'p12', 'p33', 'p41', 'p47', 'p49', 'p50', 'p52',
];

const advancedLvshi56Ids = [
  'p42', 'p43', 'p44', 'p45', 'p46', 'p48',
];

// 隐藏关卡用的特殊诗词（高难度）
const hiddenPoemIds = [
  'p02', 'p03', 'p09', 'p10', 'p12', 'p33', 'p41', 'p42', 'p43', 'p44',
];

function calcThresholds(charCount: number, tier: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): { two: number; three: number } {
  // 初级更简单：时间要求更宽松
  const multiplier = tier === 'beginner' ? 2.5 : tier === 'intermediate' ? 1.5 : 1.2;
  const base = charCount * multiplier;
  return {
    three: Math.round(base * 0.8),
    two: Math.round(base * 1.2),
  };
}

function buildLevels(): Level[] {
  const levels: Level[] = [];

  // ===== 初级 50 关 =====
  // 1-10: 循序模式（4x5网格，无干扰字，最简单）
  beginnerPoemIds.slice(0, 10).forEach((poemId, i) => {
    const charCount = 20;
    levels.push({
      id: i + 1,
      poemId,
      mode: 'sequential',
      gridSize: { cols: 4, rows: 5 },
      starThresholds: calcThresholds(charCount, 'beginner'),
      tier: 'beginner',
    });
  });
  // 11-20: 循序模式（5x5网格，5个干扰字）
  beginnerPoemIds.slice(10, 20).forEach((poemId, i) => {
    const charCount = 20;
    levels.push({
      id: 11 + i,
      poemId,
      mode: 'sequential',
      gridSize: { cols: 5, rows: 5 },
      starThresholds: calcThresholds(charCount, 'beginner'),
      tier: 'beginner',
    });
  });
  // 21-35: 混字模式（5x5网格，5个干扰字）
  beginnerPoemIds.slice(0, 15).forEach((poemId, i) => {
    const charCount = 20;
    levels.push({
      id: 21 + i,
      poemId,
      mode: 'mixed',
      gridSize: { cols: 5, rows: 5 },
      starThresholds: calcThresholds(charCount, 'beginner'),
      tier: 'beginner',
    });
  });
  // 36-50: 记忆模式（5x5网格，5个干扰字）
  beginnerPoemIds.slice(0, 15).forEach((poemId, i) => {
    const charCount = 20;
    levels.push({
      id: 36 + i,
      poemId,
      mode: 'memory',
      gridSize: { cols: 5, rows: 5 },
      starThresholds: calcThresholds(charCount, 'beginner'),
      tier: 'beginner',
    });
  });

  // ===== 中级 50 关 =====
  // 51-70: 循序模式（20首不同诗）
  intermediatePoemIds.forEach((poemId, i) => {
    const charCount = 28;
    levels.push({
      id: 51 + i,
      poemId,
      mode: 'sequential',
      gridSize: { cols: 6, rows: 5 },
      starThresholds: calcThresholds(charCount),
      tier: 'intermediate',
    });
  });
  // 71-90: 混字模式（复用前20首）
  intermediatePoemIds.forEach((poemId, i) => {
    const charCount = 28;
    levels.push({
      id: 71 + i,
      poemId,
      mode: 'mixed',
      gridSize: { cols: 6, rows: 5 },
      starThresholds: calcThresholds(charCount),
      tier: 'intermediate',
    });
  });
  // 91-100: 记忆模式（复用前10首）
  intermediatePoemIds.slice(0, 10).forEach((poemId, i) => {
    const charCount = 28;
    levels.push({
      id: 91 + i,
      poemId,
      mode: 'memory',
      gridSize: { cols: 6, rows: 5 },
      starThresholds: calcThresholds(charCount),
      tier: 'intermediate',
    });
  });

  // ===== 高级 50 关 =====
  // 101-115: 混字模式（五言律诗 40字 + 七言律诗 56字）
  const advancedMixedIds = [...advancedLvshi40Ids, ...advancedLvshi56Ids, ...advancedLvshi40Ids.slice(0, 1)];
  advancedMixedIds.slice(0, 15).forEach((poemId, i) => {
    const is40 = advancedLvshi40Ids.includes(poemId);
    const charCount = is40 ? 40 : 56;
    levels.push({
      id: 101 + i,
      poemId,
      mode: 'mixed',
      gridSize: is40 ? { cols: 8, rows: 5 } : { cols: 8, rows: 7 },
      starThresholds: calcThresholds(charCount),
      tier: 'advanced',
    });
  });
  // 116-135: 记忆模式（20首，循环使用）
  const advancedMemoryIds = [...advancedLvshi40Ids, ...advancedLvshi56Ids, ...advancedLvshi40Ids, ...advancedLvshi56Ids].slice(0, 20);
  advancedMemoryIds.forEach((poemId, i) => {
    const is40 = advancedLvshi40Ids.includes(poemId);
    const charCount = is40 ? 40 : 56;
    levels.push({
      id: 116 + i,
      poemId,
      mode: 'memory',
      gridSize: is40 ? { cols: 8, rows: 5 } : { cols: 8, rows: 7 },
      starThresholds: calcThresholds(charCount),
      tier: 'advanced',
    });
  });
  // 136-150: 循序模式（15首，循环使用）
  const advancedSeqIds = [...advancedLvshi40Ids, ...advancedLvshi56Ids, ...advancedLvshi40Ids.slice(0, 1)];
  advancedSeqIds.slice(0, 15).forEach((poemId, i) => {
    const is40 = advancedLvshi40Ids.includes(poemId);
    const charCount = is40 ? 40 : 56;
    levels.push({
      id: 136 + i,
      poemId,
      mode: 'sequential',
      gridSize: is40 ? { cols: 8, rows: 5 } : { cols: 8, rows: 7 },
      starThresholds: calcThresholds(charCount),
      tier: 'advanced',
    });
  });

  return levels;
}

// 隐藏关卡（特殊挑战，需要特定条件解锁）
function buildHiddenLevels(): Level[] {
  const hidden: Level[] = [];

  // H1-H5: 极限挑战（超短时限，20字诗词）
  const hiddenBeginnerIds = ['p02', 'p03', 'p09', 'p10', 'p01'];
  hiddenBeginnerIds.forEach((poemId, i) => {
    const charCount = 20;
    hidden.push({
      id: 1001 + i,
      poemId,
      mode: 'mixed',
      gridSize: { cols: 6, rows: 5 },
      starThresholds: { two: Math.round(charCount * 0.8), three: Math.round(charCount * 0.5) },
      tier: 'beginner',
    });
  });

  // H6-H10: 记忆大师（律诗记忆模式，超短预览时间）
  const hiddenAdvancedIds = [
    { id: 'p12', charCount: 40 },
    { id: 'p33', charCount: 40 },
    { id: 'p41', charCount: 40 },
    { id: 'p42', charCount: 56 },
    { id: 'p43', charCount: 56 },
  ];
  hiddenAdvancedIds.forEach((item, i) => {
    hidden.push({
      id: 1006 + i,
      poemId: item.id,
      mode: 'memory',
      gridSize: item.charCount === 40 ? { cols: 8, rows: 5 } : { cols: 8, rows: 7 },
      starThresholds: { two: Math.round(item.charCount * 0.9), three: Math.round(item.charCount * 0.6) },
      tier: 'advanced',
    });
  });

  return hidden;
}

export const levels: Level[] = buildLevels();
export const hiddenLevels: Level[] = buildHiddenLevels();
export const allLevels: Level[] = [...levels, ...hiddenLevels];

export function getLevelById(id: number): Level | undefined {
  return allLevels.find(l => l.id === id);
}

export function getLevelsByTier(tier: Level['tier']): Level[] {
  return levels.filter(l => l.tier === tier);
}

export function isHiddenLevel(id: number): boolean {
  return id >= 1001;
}

// 隐藏关卡解锁条件
export function getUnlockedHiddenLevels(progress: { levelResults: Record<number, unknown> }): number[] {
  const completed = Object.keys(progress.levelResults).length;
  const threeStarCount = Object.values(progress.levelResults).filter((r: unknown) => (r as { stars: number }).stars === 3).length;
  const unlocked: number[] = [];

  // H1-H3: 通关 30 关解锁
  if (completed >= 30) {
    unlocked.push(1001, 1002, 1003);
  }
  // H4-H5: 通关 50 关解锁
  if (completed >= 50) {
    unlocked.push(1004, 1005);
  }
  // H6-H8: 获得 15 个三星解锁
  if (threeStarCount >= 15) {
    unlocked.push(1006, 1007, 1008);
  }
  // H9-H10: 获得 30 个三星解锁
  if (threeStarCount >= 30) {
    unlocked.push(1009, 1010);
  }

  return unlocked;
}
