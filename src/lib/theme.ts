import type { ThemeName } from '@/types';

const THEME_ATTR = 'data-theme';

export function applyTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(THEME_ATTR, theme);
}

export function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'ink';
  try {
    const raw = localStorage.getItem('shiyun-progress');
    if (!raw) return 'ink';
    const data = JSON.parse(raw);
    return data.currentTheme || 'ink';
  } catch {
    return 'ink';
  }
}

export const themeLabels: Record<ThemeName, string> = {
  ink: '水墨古风',
  modern: '现代简约',
  cartoon: '卡通趣味',
};
