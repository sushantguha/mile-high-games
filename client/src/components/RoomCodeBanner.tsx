import { useEffect, useRef, useState } from 'react';
import { buildJoinUrl } from '../utils/joinLink';
import { AnimatedEntrance } from './AnimatedEntrance';

interface Props {
  code: string;
  playerCount: number;
  compact?: boolean;
}

export function RoomCodeBanner({ code, playerCount, compact }: Props) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(playerCount);

  useEffect(() => {
    if (playerCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 600);
      prevCount.current = playerCount;
      return () => clearTimeout(t);
    }
    prevCount.current = playerCount;
  }, [playerCount]);

  const copyText = async (text: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard may be unavailable */
    }
  };

  if (compact) {
    return (
      <div className="room-code-banner compact">
        <div>
          <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            Room code
          </span>
          <div data-testid="room-code" className="room-code" style={{ fontSize: '1.6rem', letterSpacing: '0.12em', animation: 'none' }}>
            {code}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{playerCount} player{playerCount !== 1 ? 's' : ''}</span>
          <button type="button" className="btn btn-ghost" style={{ display: 'block', fontSize: 11, padding: '4px 0', minHeight: 0 }} onClick={() => copyText(code, 'code')}>
            {copied === 'code' ? '✓ Copied!' : 'Copy code'}
          </button>
        </div>
      </div>
    );
  }

  const joinUrl = buildJoinUrl(code);

  return (
    <AnimatedEntrance anim="bounce-in">
      <div className="room-code-banner">
        <p className="phase-label" style={{ marginBottom: 4 }}>Share this code!</p>
        <button
          type="button"
          onClick={() => copyText(code, 'code')}
          style={{ background: 'none', border: 'none', padding: 0, width: '100%' }}
          title="Tap to copy code"
        >
          <div className="room-code" data-testid="room-code">{code}</div>
        </button>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, fontWeight: 600 }}>
          {copied === 'code' ? '✓ Code copied!' : 'Tap the code to copy'}
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 10, fontSize: 13 }}
          onClick={() => copyText(joinUrl, 'link')}
        >
          {copied === 'link' ? '✓ Join link copied!' : '🔗 Copy join link'}
        </button>
        <p className={`player-count-line${bump ? ' bump' : ''}`} style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, fontWeight: 600 }}>
          <span className="player-count-num">{playerCount}</span> player{playerCount !== 1 ? 's' : ''} joined
          {playerCount === 0 && ' — waiting for friends...'}
        </p>
      </div>
    </AnimatedEntrance>
  );
}