'use client';

import { useState, useCallback } from 'react';
import type { GridCell } from '@/types';

interface SchulteGridProps {
  cells: GridCell[];
  gridSize: { cols: number; rows: number };
  targetChar: string;
  onCorrect: (cellIndex: number) => void;
  onWrong: (cellIndex: number) => void;
  disabled: boolean;
}

export function SchulteGrid({
  cells,
  gridSize,
  targetChar,
  onCorrect,
  onWrong,
  disabled,
}: SchulteGridProps) {
  const [foundSet, setFoundSet] = useState<Set<number>>(new Set());
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  const handleClick = useCallback(
    (cellIdx: number) => {
      if (disabled) return;
      const cell = cells[cellIdx];
      if (!cell || cell.isDistractor || foundSet.has(cellIdx)) return;

      const isCorrect = cell.char === targetChar;
      if (isCorrect) {
        setFoundSet(prev => new Set(prev).add(cellIdx));
        onCorrect(cellIdx);
      } else {
        setShakeIdx(cellIdx);
        onWrong(cellIdx);
        setTimeout(() => setShakeIdx(null), 500);
      }
    },
    [cells, targetChar, disabled, foundSet, onCorrect, onWrong],
  );

  const cellFontSize = gridSize.cols <= 4 ? '26px' : gridSize.cols <= 5 ? '22px' : gridSize.cols <= 6 ? '18px' : '15px';
  const gridGap = gridSize.cols <= 4 ? '8px' : gridSize.cols <= 5 ? '6px' : gridSize.cols <= 6 ? '5px' : '4px';

  return (
    <div
      className="pl-grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
        gap: gridGap,
        maxWidth: gridSize.cols <= 4 ? 'min(360px, 92vw)' : gridSize.cols <= 5 ? 'min(343px, 90vw)' : gridSize.cols <= 6 ? 'min(400px, 92vw)' : 'min(480px, 95vw)',
      }}
    >
      {cells.map((cell, idx) => {
        const isFound = foundSet.has(idx);
        const isShaking = shakeIdx === idx;
        return (
          <div
            key={idx}
            className={`pl-cell${isFound ? ' found' : ''}${isShaking ? ' animate-shake' : ''}${cell.isDistractor ? ' distractor' : ''}`}
            style={{
              fontSize: cellFontSize,
              ...(isShaking ? { borderColor: 'var(--color-primary)', animation: 'shake 0.5s ease-in-out' } : {}),
            }}
            onClick={() => handleClick(idx)}
          >
            {cell.char}
          </div>
        );
      })}
    </div>
  );
}
