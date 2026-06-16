import { useEffect, useState } from 'react';

const COLORS = ['#f97316', '#84cc16', '#3b82f6', '#ec4899', '#eab308', '#06b6d4', '#a855f7'];

interface Props {
  active: boolean;
  count?: number;
}

export function ConfettiBurst({ active, count = 24 }: Props) {
  const [pieces, setPieces] = useState<{ id: number; left: number; color: string; delay: number; rot: number }[]>([]);

  useEffect(() => {
    if (!active) return;
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 400,
        rot: Math.random() * 360,
      })),
    );
    const t = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(t);
  }, [active, count]);

  if (!pieces.length) return null;

  return (
    <div className="confetti-layer" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            ['--rot' as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}