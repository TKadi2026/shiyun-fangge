'use client';

interface StarRatingProps {
  stars: 1 | 2 | 3;
  size?: number;
  animated?: boolean;
}

export function StarRating({ stars, size = 24, animated = false }: StarRatingProps) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3].map((n) => {
        const filled = n <= stars;
        const delay = animated ? `${(n - 1) * 200}ms` : '0ms';
        return (
          <svg
            key={n}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={filled ? 'lv-star-filled' : 'lv-star-empty'}
            style={animated ? { animationDelay: delay, animationFillMode: 'forwards' } : undefined}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}
