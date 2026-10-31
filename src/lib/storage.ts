import type { UserProgress, LevelResult, PlayRecord, TodayStats, ThemeName } from '@/types';

const STORAGE_KEY = 'shiyun-progress';
const ONBOARDING_KEY = 'shiyun-onboarding-done';
const NOTIFIED_ACHIEVEMENTS_KEY = 'shiyun-notified-achievements';
const PENDING_NOTIFICATIONS_KEY = 'shiyun-pending-notifications';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress(): UserProgress {
  return {
    currentTheme: 'ink',
    unlockedLevel: 1,
    levelResults: {},
    playHistory: [],
    todayStats: {
      date: getTodayStr(),
      sessions: 0,
      totalTime: 0,
    },
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const data = JSON.parse(raw) as UserProgress;
    // 兼容旧数据：补充 playHistory 字段
    if (!data.playHistory) data.playHistory = [];
    if (data.todayStats.date !== getTodayStr()) {
      data.todayStats = { date: getTodayStr(), sessions: 0, totalTime: 0 };
    }
    return data;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function saveLevelResult(
  levelId: number,
  timeMs: number,
  stars: 1 | 2 | 3,
): UserProgress {
  const progress = loadProgress();

  const existing = progress.levelResults[levelId];
  const bestTime = existing ? Math.min(existing.bestTime, timeMs) : timeMs;
  const bestStars = existing ? Math.max(existing.stars, stars) as 1 | 2 | 3 : stars;
  const playCount = existing ? existing.playCount + 1 : 1;

  progress.levelResults[levelId] = {
    stars: bestStars,
    bestTime,
    completedAt: new Date().toISOString(),
    playCount,
  };

  // 记录每次通关尝试到 playHistory
  const record: PlayRecord = {
    levelId,
    stars,
    timeMs,
    playedAt: new Date().toISOString(),
  };
  progress.playHistory.push(record);
  // 保留最近 500 条记录，避免 localStorage 过大
  if (progress.playHistory.length > 500) {
    progress.playHistory = progress.playHistory.slice(-500);
  }

  if (levelId >= progress.unlockedLevel) {
    progress.unlockedLevel = levelId + 1;
  }

  const today = getTodayStr();
  if (progress.todayStats.date !== today) {
    progress.todayStats = { date: today, sessions: 0, totalTime: 0 };
  }
  progress.todayStats.sessions += 1;
  progress.todayStats.totalTime += timeMs;

  saveProgress(progress);
  return progress;
}

export function saveTheme(theme: ThemeName): void {
  const progress = loadProgress();
  progress.currentTheme = theme;
  saveProgress(progress);
}

export function getCompletedCount(progress: UserProgress): number {
  return Object.keys(progress.levelResults).length;
}

export function isOnboardingDone(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingDone(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

// ========== 成就通知系统 ==========

export function getNotifiedAchievements(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(NOTIFIED_ACHIEVEMENTS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function markAchievementNotified(id: string): void {
  if (typeof window === 'undefined') return;
  const notified = getNotifiedAchievements();
  notified.add(id);
  localStorage.setItem(NOTIFIED_ACHIEVEMENTS_KEY, JSON.stringify([...notified]));
}

export interface PendingNotification {
  id: string;
  name: string;
  icon: string;
  desc: string;
  timestamp: number;
}

export function getPendingNotifications(): PendingNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PENDING_NOTIFICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addPendingNotification(notification: PendingNotification): void {
  if (typeof window === 'undefined') return;
  const pending = getPendingNotifications();
  pending.push(notification);
  localStorage.setItem(PENDING_NOTIFICATIONS_KEY, JSON.stringify(pending));
}

export function clearPendingNotifications(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_NOTIFICATIONS_KEY);
}
