import { useEffect, useRef, useState } from 'react';
import { playHostSound } from '../utils/hostSounds';

interface Props {
  endsAt?: number;
  startedAt?: number;
  label?: string;
  hostOnlySound?: boolean;
}

export function PhaseTimer({ endsAt, startedAt, label, hostOnlySound }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [fraction, setFraction] = useState(1);
  const urgentPlayed = useRef(false);

  useEffect(() => {
    if (!endsAt) {
      setRemaining(null);
      setFraction(1);
      urgentPlayed.current = false;
      return;
    }

    const tick = () => {
      const now = Date.now();
      const left = Math.max(0, endsAt - now);
      const secs = Math.ceil(left / 1000);
      setRemaining(secs);

      if (startedAt && endsAt > startedAt) {
        const total = endsAt - startedAt;
        const frac = Math.max(0, Math.min(1, left / total));
        setFraction(frac);
        if (hostOnlySound && frac < 0.25 && secs > 0 && !urgentPlayed.current) {
          playHostSound('timer-urgent');
          urgentPlayed.current = true;
        }
      } else {
        setFraction(left > 0 ? 1 : 0);
      }
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [endsAt, startedAt, hostOnlySound]);

  if (remaining === null) return null;

  const urgent = fraction < 0.25;
  const warning = fraction < 0.5 && !urgent;

  return (
    <div className="phase-timer" data-testid="phase-timer" aria-live="polite">
      <div className="phase-timer-track">
        <div
          className={`phase-timer-fill${urgent ? ' urgent' : warning ? ' warning' : ''}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <div className="phase-timer-meta">
        <span className="phase-timer-label">{label ?? 'Time left'}</span>
        <span className={`phase-timer-count${urgent ? ' urgent' : ''}`}>{remaining}s</span>
      </div>
    </div>
  );
}