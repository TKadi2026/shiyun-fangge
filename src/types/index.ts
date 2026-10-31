export type PoemCategory = 'wuyan-jueju' | 'qiyan-jueju' | 'wuyan-lvshi' | 'qiyan-lvshi';

export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  punctuation: string;
  translation: string;
  charCount: number;
  category: PoemCategory;
}

export type GameMode = 'sequential' | 'mixed' | 'memory';
export type LevelTier = 'beginner' | 'intermediate' | 'advanced';

export interface Level {
  id: number;
  poemId: string;
  mode: GameMode;
  gridSize: { cols: number; rows: number };
  starThresholds: { two: number; three: number };
  tier: LevelTier;
}

export type ThemeName = 'ink' | 'modern' | 'cartoon';

export interface LevelResult {
  stars: 1 | 2 | 3;
  bestTime: number;
  completedAt: string;
  playCount: number;
}

export interface PlayRecord {
  levelId: number;
  stars: 1 | 2 | 3;
  timeMs: number;
  playedAt: string;
}

export interface TodayStats {
  date: string;
  sessions: number;
  totalTime: number;
}

export interface UserProgress {
  currentTheme: ThemeName;
  unlockedLevel: number;
  levelResults: Record<number, LevelResult>;
  playHistory: PlayRecord[];
  todayStats: TodayStats;
}

export interface GridCell {
  char: string;
  originalIndex: number;
  isDistractor: boolean;
}

export interface PendingNotification {
  id: string;
  name: string;
  icon: string;
  desc: string;
  timestamp: number;
}
