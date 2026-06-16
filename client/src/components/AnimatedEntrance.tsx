import { type ReactNode } from 'react';

type Anim = 'fly-in' | 'bounce-in' | 'slide-up' | 'pop-in' | 'squish-in' | 'shake';

interface Props {
  children: ReactNode;
  anim?: Anim;
  delay?: number;
  className?: string;
}

export function AnimatedEntrance({ children, anim = 'slide-up', delay = 0, className = '' }: Props) {
  return (
    <div
      className={`anim-${anim} ${className}`.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}