'use client';

interface PoemProgressProps {
  punctuation: string;
  content: string;
  foundCount: number;
}

export function PoemProgress({ punctuation, content, foundCount }: PoemProgressProps) {
  const punctChars = new Set(['，', '。', '？', '！', '、', '；', '：', '…', '—']);
  const chars = punctuation.split('');
  let contentIdx = 0;

  return (
    <div className="pl-progress">
      <div className="pl-progress-label">按诗句顺序依次点击</div>
      <div className="pl-progress-poem">
        {chars.map((ch, i) => {
          if (punctChars.has(ch)) {
            return (
              <span key={i} className="pl-char punct">{ch}</span>
            );
          }
          const currentContentIdx = contentIdx;
          contentIdx++;
          const isFound = currentContentIdx < foundCount;
          const isCurrent = currentContentIdx === foundCount;
          const className = isFound ? 'pl-char found' : isCurrent ? 'pl-char current' : 'pl-char pending';
          return (
            <span key={i} className={className}>{ch}</span>
          );
        })}
      </div>
    </div>
  );
}
