'use client';

import { useState, useEffect } from 'react';
import type { ThemeName } from '@/types';
import { applyTheme, getStoredTheme } from '@/lib/theme';
import { saveTheme } from '@/lib/storage';

const themePreviews: { key: ThemeName; label: string; desc: string }[] = [
  { key: 'ink', label: '水墨', desc: '古风雅韵' },
  { key: 'modern', label: '简约', desc: '现代清新' },
  { key: 'cartoon', label: '方块', desc: '我的世界' },
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
      {/* 像素天空 */}
      <rect width="56" height="40" fill="#BFE3FF" />
      {/* 方块太阳 */}
      <rect x="45" y="3" width="7" height="7" fill="#FCEE4B" />
      <rect x="47" y="5" width="3" height="3" fill="#FFF9C4" />
      {/* 云（方块拼的） */}
      <rect x="6" y="5" width="10" height="3" fill="#FFFFFF" opacity="0.9" />
      <rect x="9" y="3" width="7" height="3" fill="#FFFFFF" opacity="0.9" />
      <rect x="30" y="8" width="8" height="3" fill="#FFFFFF" opacity="0.8" />
      {/* 草地块（带倒角的高亮） */}
      <rect x="10" y="17" width="12" height="12" fill="#8B5E3C" />
      <rect x="10" y="17" width="12" height="3" fill="#6ABE30" />
      <rect x="10" y="17" width="12" height="1" fill="#8CD44F" />
      <rect x="10" y="20" width="2" height="9" fill="#A07148" />
      <rect x="20" y="20" width="2" height="9" fill="#6E4527" />
      {/* 圆石 */}
      <rect x="26" y="21" width="9" height="8" fill="#8F8F8F" />
      <rect x="26" y="21" width="9" height="1.5" fill="#B5B5B5" />
      <rect x="26" y="27.5" width="9" height="1.5" fill="#6B6B6B" />
      <rect x="28" y="23" width="2" height="2" fill="#767676" />
      {/* 金锭块 */}
      <rect x="38" y="22" width="8" height="7" fill="#F7D54D" />
      <rect x="38" y="22" width="8" height="1.5" fill="#FCEE8A" />
      <rect x="38" y="27.5" width="8" height="1.5" fill="#C9A227" />
      {/* 地面：草地 + 泥土 */}
      <rect x="0" y="30" width="56" height="4" fill="#6ABE30" />
      <rect x="0" y="30" width="56" height="1" fill="#8CD44F" />
      <rect x="0" y="34" width="56" height="6" fill="#8B5E3C" />
      <rect x="4" y="35" width="3" height="2" fill="#6E4527" />
      <rect x="14" y="36" width="3" height="2" fill="#6E4527" />
      <rect x="26" y="35" width="3" height="2" fill="#6E4527" />
      <rect x="38" y="36" width="3" height="2" fill="#6E4527" />
      <rect x="48" y="35" width="3" height="2" fill="#6E4527" />
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
                borderRadius: t.key === 'cartoon' ? 2 : t.key === 'modern' ? 6 : 4,
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
