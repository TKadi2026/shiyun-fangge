'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadProgress, getCompletedCount, getNotifiedAchievements, markAchievementNotified, getPendingNotifications, clearPendingNotifications } from '@/lib/storage';
import { getLevelById } from '@/data/levels';
import type { UserProgress, PendingNotification } from '@/types';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  hidden: boolean;
}

function getAllAchievements(progress: UserProgress): Achievement[] {
  const completed = getCompletedCount(progress);
  const threeStarCount = Object.values(progress.levelResults).filter(r => r.stars === 3).length;
  const beginnerDone = Array.from({ length: 50 }, (_, i) => i + 1).every(id => progress.levelResults[id]);
  const intermediateDone = Array.from({ length: 50 }, (_, i) => i + 51).every(id => progress.levelResults[id]);
  const advancedDone = Array.from({ length: 50 }, (_, i) => i + 101).every(id => progress.levelResults[id]);

  const sortedIds = Object.keys(progress.levelResults).map(Number).sort((a, b) => a - b);
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedIds.length; i++) {
    if (sortedIds[i] === sortedIds[i - 1] + 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  const bestTimes = Object.values(progress.levelResults).map(r => r.bestTime);
  const fastestTime = bestTimes.length > 0 ? Math.min(...bestTimes) : Infinity;
  const totalTime = bestTimes.reduce((sum, t) => sum + t, 0);

  const uniquePoemIds = new Set<string>();
  Object.keys(progress.levelResults).forEach(lid => {
    const level = getLevelById(Number(lid));
    if (level) uniquePoemIds.add(level.poemId);
  });
  const uniquePoemsCount = uniquePoemIds.size;

  let sequentialCount = 0;
  let mixedCount = 0;
  let memoryCount = 0;
  Object.keys(progress.levelResults).forEach(lid => {
    const level = getLevelById(Number(lid));
    if (level) {
      if (level.mode === 'sequential') sequentialCount++;
      else if (level.mode === 'mixed') mixedCount++;
      else if (level.mode === 'memory') memoryCount++;
    }
  });

  return [
    // 通关数量系列
    { id: 'first', name: '初出茅庐', desc: '完成第一关', icon: '🎯', hidden: false },
    { id: 'five', name: '小试牛刀', desc: '通关 5 关', icon: '⭐', hidden: false },
    { id: 'ten', name: '渐入佳境', desc: '通关 10 关', icon: '🌟', hidden: false },
    { id: 'twenty', name: '学有所成', desc: '通关 20 关', icon: '🏆', hidden: false },
    { id: 'thirty', name: '诗海遨游', desc: '通关 30 关', icon: '🎖️', hidden: false },
    { id: 'fifty', name: '诗词达人', desc: '通关 50 关', icon: '👑', hidden: false },
    { id: 'seventy', name: '学富五车', desc: '通关 60 关', icon: '📚', hidden: false },
    { id: 'all', name: '诗韵宗师', desc: '通关全部 150 关', icon: '💎', hidden: true },

    // 星级评价系列
    { id: 'three-star-1', name: '初见三星', desc: '获得首个三星评价', icon: '✨', hidden: false },
    { id: 'three-star-5', name: '速度之星', desc: '获得 5 个三星评价', icon: '⚡', hidden: false },
    { id: 'three-star-15', name: '星光璀璨', desc: '获得 15 个三星评价', icon: '🌠', hidden: false },
    { id: 'three-star-30', name: '闪电快手', desc: '获得 20 个三星评价', icon: '🔥', hidden: false },
    { id: 'perfect-ten', name: '十全十美', desc: '连续 10 关三星', icon: '💫', hidden: true },

    // 难度通关系列
    { id: 'beginner-master', name: '初级大师', desc: '通关全部初级关卡', icon: '📗', hidden: false },
    { id: 'intermediate-master', name: '中级大师', desc: '通关全部中级关卡', icon: '📘', hidden: false },
    { id: 'advanced-master', name: '高级大师', desc: '通关全部高级关卡', icon: '📕', hidden: false },

    // 速度与效率系列
    { id: 'speed-demon', name: '疾如闪电', desc: '单关 20 秒内通关', icon: '⏱️', hidden: false },
    { id: 'speed-master', name: '风驰电掣', desc: '单关 12 秒内通关', icon: '🚀', hidden: true },

    // 连续与坚持系列
    { id: 'streak-5', name: '连战连捷', desc: '连续通关 5 关', icon: '🔗', hidden: false },
    { id: 'streak-15', name: '势如破竹', desc: '连续通关 10 关', icon: '⚔️', hidden: false },
    { id: 'streak-30', name: '一往无前', desc: '连续通关 20 关', icon: '🏅', hidden: true },

    // 累计时长系列
    { id: 'time-10', name: '勤学苦练', desc: '累计训练超过 45 分钟', icon: '📖', hidden: false },
    { id: 'time-30', name: '持之以恒', desc: '累计训练超过 20 分钟', icon: '🎓', hidden: false },
    { id: 'time-60', name: '博览群书', desc: '累计训练超过 90 分钟', icon: '🏛️', hidden: true },

    // 诗词收集系列
    { id: 'poems-10', name: '诗词初探', desc: '通关 10 首不同的诗', icon: '📝', hidden: false },
    { id: 'poems-20', name: '诗词博览', desc: '通关 20 首不同的诗', icon: '📜', hidden: false },
    { id: 'poems-30', name: '诗词大家', desc: '通关 25 首不同的诗', icon: '🎭', hidden: true },

    // 模式达人系列
    { id: 'mode-sequential', name: '循序达人', desc: '完成 8 关循序模式', icon: '➡️', hidden: false },
    { id: 'mode-mixed', name: '混字达人', desc: '完成 8 关混字模式', icon: '🔀', hidden: false },
    { id: 'mode-memory', name: '记忆达人', desc: '完成 8 关记忆模式', icon: '🧠', hidden: true },

    // 特殊成就
    { id: 'first-combo', name: '初露锋芒', desc: '首次达成 3 连击', icon: '💥', hidden: false },
    { id: 'first-memory', name: '过目不忘', desc: '首次通关记忆模式', icon: '🎯', hidden: false },
  ];
}

function checkUnlocked(a: Achievement, progress: UserProgress): boolean {
  const completed = getCompletedCount(progress);
  const threeStarCount = Object.values(progress.levelResults).filter(r => r.stars === 3).length;
  const beginnerDone = Array.from({ length: 50 }, (_, i) => i + 1).every(id => progress.levelResults[id]);
  const intermediateDone = Array.from({ length: 50 }, (_, i) => i + 51).every(id => progress.levelResults[id]);
  const advancedDone = Array.from({ length: 50 }, (_, i) => i + 101).every(id => progress.levelResults[id]);

  const sortedIds = Object.keys(progress.levelResults).map(Number).sort((a, b) => a - b);
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedIds.length; i++) {
    if (sortedIds[i] === sortedIds[i - 1] + 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  const bestTimes = Object.values(progress.levelResults).map(r => r.bestTime);
  const fastestTime = bestTimes.length > 0 ? Math.min(...bestTimes) : Infinity;
  const totalTime = bestTimes.reduce((sum, t) => sum + t, 0);

  const uniquePoemIds = new Set<string>();
  Object.keys(progress.levelResults).forEach(lid => {
    const level = getLevelById(Number(lid));
    if (level) uniquePoemIds.add(level.poemId);
  });
  const uniquePoemsCount = uniquePoemIds.size;

  let sequentialCount = 0;
  let mixedCount = 0;
  let memoryCount = 0;
  Object.keys(progress.levelResults).forEach(lid => {
    const level = getLevelById(Number(lid));
    if (level) {
      if (level.mode === 'sequential') sequentialCount++;
      else if (level.mode === 'mixed') mixedCount++;
      else if (level.mode === 'memory') memoryCount++;
    }
  });

  const conditions: Record<string, boolean> = {
    'first': completed >= 1,
    'five': completed >= 5,
    'ten': completed >= 10,
    'twenty': completed >= 20,
    'thirty': completed >= 30,
    'fifty': completed >= 50,
    'seventy': completed >= 60,
    'all': completed >= 150,
    'three-star-1': threeStarCount >= 1,
    'three-star-5': threeStarCount >= 5,
    'three-star-15': threeStarCount >= 15,
    'three-star-30': threeStarCount >= 20,
    'perfect-ten': threeStarCount >= 10 && maxStreak >= 10,
    'beginner-master': beginnerDone,
    'intermediate-master': intermediateDone,
    'advanced-master': advancedDone,
    'speed-demon': fastestTime < 20000,
    'speed-master': fastestTime < 12000,
    'streak-5': maxStreak >= 5,
    'streak-15': maxStreak >= 10,
    'streak-30': maxStreak >= 20,
    'time-10': totalTime >= 2700000,
    'time-30': totalTime >= 1200000,
    'time-60': totalTime >= 5400000,
    'poems-10': uniquePoemsCount >= 10,
    'poems-20': uniquePoemsCount >= 20,
    'poems-30': uniquePoemsCount >= 25,
    'mode-sequential': sequentialCount >= 8,
    'mode-mixed': mixedCount >= 8,
    'mode-memory': memoryCount >= 8,
    'first-combo': completed >= 3,
    'first-memory': memoryCount >= 1,
  };

  return conditions[a.id] ?? false;
}

export function AchievementNotifier() {
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<PendingNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNext = useCallback(() => {
    setNotifications(prev => {
      if (prev.length === 0) {
        setCurrentNotification(null);
        setIsVisible(false);
        return prev;
      }
      const [next, ...rest] = prev;
      setCurrentNotification(next);
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => showNext(), 300);
      }, 3000);
      return rest;
    });
  }, []);

  useEffect(() => {
    const checkAchievements = () => {
      const progress = loadProgress();
      const achievements = getAllAchievements(progress);
      const notified = getNotifiedAchievements();
      const newNotifications: PendingNotification[] = [];

      achievements.forEach(a => {
        if (!notified.has(a.id) && checkUnlocked(a, progress)) {
          markAchievementNotified(a.id);
          newNotifications.push({
            id: a.id,
            name: a.name,
            icon: a.icon,
            desc: a.desc,
            timestamp: Date.now(),
          });
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(newNotifications);
        const [first, ...rest] = newNotifications;
        setCurrentNotification(first);
        setIsVisible(true);
        setNotifications(rest);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            if (rest.length > 0) {
              setNotifications(rest);
              showNext();
            }
          }, 300);
        }, 3000);
      }
    };

    checkAchievements();

    const handleStorage = () => {
      setTimeout(checkAchievements, 100);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, [showNext]);

  if (!currentNotification) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 99999,
      pointerEvents: 'none',
    }}>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes ach-slide-in {
          0% { transform: translateX(400px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes ach-slide-out {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(400px); opacity: 0; }
        }
        @keyframes ach-icon-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3) rotate(10deg); }
        }
        @keyframes ach-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .ach-toast {
          background: var(--color-surface);
          border: 2px solid var(--color-primary);
          border-radius: var(--rounded-lg);
          padding: 16px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 0 4px color-mix(in srgb, var(--color-primary) 15%, transparent);
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 280px;
          max-width: 360px;
          animation: ${isVisible ? 'ach-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ach-slide-out 0.3s ease-in forwards'};
        }
        .ach-toast-icon {
          font-size: 36px;
          animation: ach-icon-bounce 0.6s ease-out 0.3s;
        }
        .ach-toast-content {
          flex: 1;
        }
        .ach-toast-label {
          font-size: 11px;
          color: var(--color-primary);
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 4px;
          background: linear-gradient(90deg, var(--color-primary), #F7C948, var(--color-primary));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ach-shimmer 2s linear infinite;
        }
        .ach-toast-name {
          font-size: 16px;
          font-weight: 800;
          color: var(--color-on-surface);
          margin-bottom: 2px;
        }
        .ach-toast-desc {
          font-size: 12px;
          color: var(--color-on-surface-2);
        }
      `}} />
      <div className="ach-toast">
        <div className="ach-toast-icon">{currentNotification.icon}</div>
        <div className="ach-toast-content">
          <div className="ach-toast-label">🏆 成就解锁</div>
          <div className="ach-toast-name">{currentNotification.name}</div>
          <div className="ach-toast-desc">{currentNotification.desc}</div>
        </div>
      </div>
    </div>
  );
}
