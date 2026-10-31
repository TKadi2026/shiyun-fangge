'use client';

import { useState, useEffect } from 'react';
import type { ThemeName } from '@/types';
import { applyTheme, getStoredTheme } from '@/lib/theme';
import { saveTheme } from '@/lib/storage';

const themePreviews: { key: ThemeName; label: string; desc: string }[] = [
  { key: 'ink', label: '水墨', desc: '古风雅韵' },
  { key: 'modern', label: '简约', desc: '现代清新' },
  { key: 'cartoon', label: '卡通', desc: '趣味活泼' },
];

function InkPreview() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 56 40" fill="none">
      {/* 宣纸底色 */}
      <rect width="56" height="40" rx="4" fill="#F5F0E8" />
      {/* 远山 */}
      <path d="M0 28 Q8 18 16 24 Q24 14 32 22 Q40 12 48 20 Q52 16 56 18 L56 40 L0 40Z" fill="#2C2C2C" opacity="0.06" />
      <path d="M0 32 Q10 22 20 28 Q30 20 40 26 Q48 18 56 24 L56 40 L0 40Z" fill="#2C2C2C" opacity="0.12" />
      {/* 竹简/卷轴 */}
      <rect x="4" y="5" width="16" height="22" rx="1" fill="#2C2C2C" opacity="0.1" stroke="#2C2C2C" strokeWidth="0.5" />
      <line x1="7" y1="9" x2="17" y2="9" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.2" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.2" />
      <line x1="7" y1="15" x2="14" y2="15" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.2" />
      <line x1="7" y1="18" x2="16" y2="18" stroke="#2C2C2C" strokeWidth="0.5" opacity="0.2" />
      {/* 印章 */}
      <rect x="38" y="28" width="12" height="8" rx="1" fill="#C0392B" opacity="0.85" />
      <text x="44" y="34" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="serif">韵</text>
      {/* 梅花点缀 */}
      <circle cx="28" cy="8" r="2" fill="#C0392B" opacity="0.5" />
      <circle cx="32" cy="6" r="1.5" fill="#C0392B" opacity="0.35" />
      <circle cx="25" cy="5" r="1" fill="#C0392B" opacity="0.4" />
      {/* 墨点 */}
      <circle cx="46" cy="10" r="2.5" fill="#2C2C2C" opacity="0.08" />
      <circle cx="50" cy="14" r="1.5" fill="#2C2C2C" opacity="0.06" />
    </svg>
  );
}

function ModernPreview() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 56 40" fill="none">
      {/* 纯白底 */}
      <rect width="56" height="40" rx="4" fill="#FFFFFF" />
      {/* 顶部状态栏 */}
      <rect x="0" y="0" width="56" height="6" rx="4" fill="#F1F5F9" />
      <circle cx="8" cy="3" r="1.5" fill="#2563EB" opacity="0.6" />
      <rect x="14" y="2" width="12" height="2" rx="1" fill="#CBD5E1" />
      {/* 卡片布局 */}
      <rect x="4" y="9" width="22" height="12" rx="3" fill="#F1F5F9" />
      <rect x="30" y="9" width="22" height="12" rx="3" fill="#EFF6FF" />
      <rect x="6" y="11" width="10" height="2" rx="1" fill="#94A3B8" />
      <rect x="6" y="15" width="16" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="6" y="18" width="12" height="1.5" rx="0.75" fill="#CBD5E1" />
      {/* 蓝色强调 */}
      <circle cx="41" cy="13" r="4" fill="#2563EB" opacity="0.15" />
      <circle cx="41" cy="13" r="2" fill="#2563EB" />
      {/* 底部按钮组 */}
      <rect x="4" y="25" width="48" height="4" rx="2" fill="#F1F5F9" />
      <rect x="4" y="25" width="16" height="4" rx="2" fill="#2563EB" />
      <rect x="6" y="26.5" width="8" height="1" rx="0.5" fill="#fff" />
      {/* 底部导航 */}
      <rect x="4" y="32" width="10" height="5" rx="2" fill="#F1F5F9" />
      <rect x="17" y="32" width="10" height="5" rx="2" fill="#F1F5F9" />
      <rect x="30" y="32" width="10" height="5" rx="2" fill="#EFF6FF" />
      <rect x="43" y="32" width="10" height="5" rx="2" fill="#F1F5F9" />
      <circle cx="9" cy="34" r="1" fill="#94A3B8" />
      <circle cx="22" cy="34" r="1" fill="#94A3B8" />
      <circle cx="35" cy="34" r="1" fill="#2563EB" />
      <circle cx="48" cy="34" r="1" fill="#94A3B8" />
    </svg>
  );
}

function CartoonPreview() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 56 40" fill="none">
      {/* 暖黄底 */}
      <rect width="56" height="40" rx="6" fill="#FFF8E1" />
      {/* 彩色波点背景 */}
      <circle cx="8" cy="6" r="3" fill="#FF6B6B" opacity="0.12" />
      <circle cx="20" cy="4" r="2" fill="#4ECDC4" opacity="0.15" />
      <circle cx="44" cy="5" r="2.5" fill="#FFE66D" opacity="0.2" />
      <circle cx="50" cy="12" r="2" fill="#FF6B6B" opacity="0.1" />
      <circle cx="6" cy="34" r="2" fill="#4ECDC4" opacity="0.12" />
      <circle cx="48" cy="36" r="3" fill="#FFE66D" opacity="0.15" />
      {/* 可爱笑脸 */}
      <circle cx="14" cy="14" r="8" fill="#FF6B6B" opacity="0.85" />
      <circle cx="11.5" cy="12.5" r="2" fill="#fff" />
      <circle cx="16.5" cy="12.5" r="2" fill="#fff" />
      <circle cx="11.5" cy="12.5" r="1" fill="#333" />
      <circle cx="16.5" cy="12.5" r="1" fill="#333" />
      <path d="M10 16 Q14 20 18 16" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* 腮红 */}
      <circle cx="8" cy="15" r="1.5" fill="#FF9999" opacity="0.5" />
      <circle cx="20" cy="15" r="1.5" fill="#FF9999" opacity="0.5" />
      {/* 星星 */}
      <polygon points="36,6 37.5,10 42,10 38.5,13 39.5,17 36,14.5 32.5,17 33.5,13 30,10 34.5,10" fill="#FFE66D" />
      {/* 云朵 */}
      <ellipse cx="44" cy="22" rx="8" ry="5" fill="#4ECDC4" opacity="0.3" />
      <ellipse cx="40" cy="22" rx="5" ry="4" fill="#4ECDC4" opacity="0.4" />
      <ellipse cx="48" cy="22" rx="5" ry="4" fill="#4ECDC4" opacity="0.4" />
      {/* 彩色方块按钮 */}
      <rect x="4" y="26" width="10" height="10" rx="4" fill="#FF6B6B" opacity="0.7" />
      <rect x="16" y="28" width="8" height="8" rx="3" fill="#4ECDC4" opacity="0.7" />
      <rect x="26" y="26" width="10" height="10" rx="4" fill="#FFE66D" opacity="0.8" />
      <rect x="38" y="28" width="8" height="8" rx="3" fill="#FF6B6B" opacity="0.5" />
      {/* 小装饰 */}
      <text x="9" y="33" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">A</text>
      <text x="31" y="33" textAnchor="middle" fill="#333" fontSize="5" fontWeight="bold">B</text>
    </svg>
  );
}

const previewMap: Record<ThemeName, () => React.ReactNode> = {
  ink: InkPreview,
  modern: ModernPreview,
  cartoon: CartoonPreview,
};

export function ThemeSwitcher() {
  const [current, setCurrent] = useState<ThemeName>('ink');

  useEffect(() => {
    setCurrent(getStoredTheme());
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {themePreviews.map((t) => {
        const isActive = current === t.key;
        const Preview = previewMap[t.key];
        return (
          <button
            key={t.key}
            onClick={() => {
              setCurrent(t.key);
              applyTheme(t.key);
              saveTheme(t.key);
            }}
            title={t.label}
            aria-label={`${t.label} - ${t.desc}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              style={{
                width: 48,
                height: 34,
                borderRadius: t.key === 'cartoon' ? 10 : t.key === 'modern' ? 6 : 4,
                border: isActive ? '2.5px solid var(--color-primary)' : '1.5px solid color-mix(in srgb, var(--color-on-surface) 15%, transparent)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: isActive
                  ? `0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent), 0 4px 12px color-mix(in srgb, var(--color-primary) 25%, transparent)`
                  : '0 1px 3px rgba(0,0,0,0.08)',
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Preview />
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
              letterSpacing: 0.5,
              transition: 'all 0.2s',
            }}>
              {t.label}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 400,
              color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-2)',
              opacity: 0.7,
              transition: 'all 0.2s',
            }}>
              {t.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
