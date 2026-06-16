import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { normalizeRoomCode } from '../utils/joinLink';
import { AnimatedEntrance } from '../components/AnimatedEntrance';

interface Props {
  onCreateRoom: () => Promise<{ ok: boolean }>;
  onJoinRoom: (code: string, name: string) => Promise<{ ok: boolean }>;
  connected: boolean;
  error: string | null;
}

export function Home({ onCreateRoom, onJoinRoom, connected, error }: Props) {
  const [searchParams] = useSearchParams();
  const inviteFromUrl = normalizeRoomCode(searchParams.get('code') ?? '');
  const hasInviteLink = inviteFromUrl.length === 4;

  const [name, setName] = useState('');
  const [code, setCode] = useState(inviteFromUrl);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasInviteLink) nameRef.current?.focus();
  }, [hasInviteLink]);

  const handleHost = async () => {
    setLoading(true);
    const res = await onCreateRoom();
    setLoading(false);
    if (res.ok) navigate('/room');
  };

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    const res = await onJoinRoom(code.trim().toUpperCase(), name.trim());
    setLoading(false);
    if (res.ok) navigate('/room');
  };

  const joinCard = (
    <AnimatedEntrance anim="slide-up" delay={200}>
      <div className="home-card">
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {hasInviteLink ? `Join room ${code}` : 'Join as player'}
        </label>
        {hasInviteLink && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            Enter your name — room code is already filled in.
          </p>
        )}
        <input
          ref={nameRef}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          autoComplete="off"
          style={{ marginBottom: 10 }}
        />
        {!hasInviteLink && (
          <input
            placeholder="Room code (e.g. ABCD)"
            value={code}
            onChange={(e) => setCode(normalizeRoomCode(e.target.value))}
            maxLength={4}
            style={{ textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700, fontSize: 20 }}
          />
        )}
        {hasInviteLink && (
          <div className="room-code" style={{ fontSize: '2.5rem', margin: '8px 0' }}>{code}</div>
        )}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleJoin}
          disabled={loading || !name.trim() || code.length < 4 || !connected}
          data-testid="join-room-btn"
        >
          📱 Join Room
        </button>
      </div>
    </AnimatedEntrance>
  );

  return (
    <div className="page home-hero" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
      <div className="home-floaters" aria-hidden>
        <span>🎉</span><span>🎮</span><span>🎭</span><span>🎤</span><span>🎨</span><span>🏆</span>
      </div>
      <AnimatedEntrance anim="bounce-in">
        <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
          <div className="home-logo">🎲</div>
          <h1 className="home-title display">Mile High Games</h1>
          <p className="home-subtitle">Party games for road trips &amp; hangouts</p>
          <p
            data-testid={connected ? 'socket-connected' : 'socket-connecting'}
            style={{ fontSize: 13, color: connected ? 'var(--success)' : 'var(--danger)', marginTop: 12, fontWeight: 700 }}
          >
            {connected ? '● Connected — ready to play!' : '○ Connecting to server...'}
          </p>
        </div>
      </AnimatedEntrance>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {hasInviteLink ? (
          joinCard
        ) : (
          <>
            <AnimatedEntrance anim="pop-in" delay={100}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: 12, fontSize: 17 }}
                onClick={handleHost}
                disabled={loading || !connected}
                data-testid="host-game-btn"
              >
                📺 Host Game (TV Screen)
              </button>
            </AnimatedEntrance>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginBottom: 20 }}>
              The host runs the shared screen — share the room code with friends.
            </p>
            {joinCard}
          </>
        )}

        {error && (
          <p className="anim-shake" style={{ color: 'var(--danger)', textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: 600 }}>{error}</p>
        )}

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
          {hasInviteLink
            ? 'Make sure you are on the same WiFi / hotspot as the host.'
            : <>One device hosts. Everyone else joins with the room code.<br />All devices must share the same network.</>}
        </p>
      </div>
    </div>
  );
}