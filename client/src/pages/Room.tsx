import { lazy, Suspense, useEffect } from 'react';
import { useHostSounds } from '../hooks/useHostSounds';
import { AnimatedEntrance } from '../components/AnimatedEntrance';

import { useNavigate } from 'react-router-dom';
import type { GameMeta, RoomState } from '../types';
import { HostDisplay } from '../components/HostDisplay';
import { RoomNavBar } from '../components/RoomNavBar';
import { GameSelect } from './GameSelect';
import { RoomCodeBanner } from '../components/RoomCodeBanner';
import { PhaseTimer } from '../components/PhaseTimer';
import { getTimerLabel, phaseHasTimer } from '../utils/timerLabel';
import { GameThemeShell } from '../components/GameThemeShell';
import { useGameMeta } from '../hooks/useGameMeta';
import { getGameTheme } from '../data/gameThemes';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { TriviaRoundResults } from '../components/TriviaRoundResults';

const GameInput = lazy(() =>
  import('../components/GameInput').then((m) => ({ default: m.GameInput })),
);
const GameVote = lazy(() =>
  import('../components/GameVote').then((m) => ({ default: m.GameVote })),
);

interface Props {
  room: RoomState | null;
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  onClearError: () => void;
  onSelectGame: (id: string) => void;
  onStart: () => void;
  onSubmit: (value: unknown) => Promise<{ ok: boolean; error?: string } | undefined>;
  onVote: (targetId: string) => Promise<{ ok: boolean; error?: string } | undefined>;
  onSkip: () => void;
  onBackToLobby: () => void;
  onLeaveRoom: () => void;
  onStopHosting: () => void;
}

function PhaseFallback() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 24 }}>
      <p style={{ color: 'var(--muted)' }}>Loading...</p>
    </div>
  );
}

function ConnectionBanner({
  connected,
  reconnecting,
  error,
  onClearError,
}: {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  onClearError: () => void;
}) {
  if (!reconnecting && connected && !error) return null;

  const message = error
    ?? (reconnecting || !connected ? 'Connection lost — reconnecting…' : null);
  if (!message) return null;

  return (
    <div
      className="card"
      style={{
        marginBottom: 12,
        padding: '10px 14px',
        background: error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
        border: `1px solid ${error ? 'var(--danger)' : 'rgba(234, 179, 8, 0.5)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
      data-testid={error ? 'room-error-banner' : 'room-reconnect-banner'}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text)' }}>
        {message}
      </p>
      {error && (
        <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={onClearError}>
          Dismiss
        </button>
      )}
    </div>
  );
}

export function RoomPage({
  room,
  connected,
  reconnecting,
  error,
  onClearError,
  onSelectGame,
  onStart,
  onSubmit,
  onVote,
  onSkip,
  onBackToLobby,
  onLeaveRoom,
  onStopHosting,
}: Props) {
  const navigate = useNavigate();
  const { game, ready } = useGameMeta(room?.gameId ?? null);

  useEffect(() => {
    if (!room) navigate('/');
  }, [room, navigate]);

  if (!room) return null;

  const isHost = room.isHostView;
  const showGameSelect = isHost && room.phase === 'lobby' && !room.gameId;
  const connectedPlayers = room.players.filter((p) => p.connected);

  useHostSounds(room);

  return (
    <GameThemeShell gameId={room.gameId}>
    <div className={`${isHost && room.phase === 'lobby' ? 'page-wide game-picker-page' : 'page'}`} data-testid="room-page">
      <RoomNavBar
        room={room}
        onChangeGame={onBackToLobby}
        onEndGame={onBackToLobby}
        onLeaveRoom={onLeaveRoom}
        onStopHosting={onStopHosting}
      />
      <ConnectionBanner
        connected={connected}
        reconnecting={reconnecting}
        error={error}
        onClearError={onClearError}
      />
      {showGameSelect ? (
        <>
          <RoomCodeBanner code={room.code} playerCount={connectedPlayers.length} />
          <GameSelect onSelect={onSelectGame} selectedId={room.gameId} />
        </>
      ) : isHost ? (
        <HostDisplay
          room={room}
          game={game}
          onStart={onStart}
          onSkip={onSkip}
          onBackToLobby={onBackToLobby}
        />
      ) : (
        <PlayerView
          room={room}
          game={game}
          ready={ready}
          onSubmit={onSubmit}
          onVote={onVote}
        />
      )}
    </div>
    </GameThemeShell>
  );
}

function PlayerView({
  room,
  game,
  ready,
  onSubmit,
  onVote,
}: {
  room: RoomState;
  game: GameMeta | null;
  ready: boolean;
  onSubmit: (v: unknown) => Promise<{ ok: boolean; error?: string } | undefined>;
  onVote: (targetId: string) => Promise<{ ok: boolean; error?: string } | undefined>;
}) {
  if (room.phase === 'lobby') {
    const theme = getGameTheme(room.gameId);
    return (
      <AnimatedEntrance anim="bounce-in">
        <div className="player-lobby-wait" style={{ textAlign: 'center', paddingTop: 40 }}>
          <p className="phase-label">You're in!</p>
          <div className="room-code" style={{ fontSize: '2.5rem' }}>{room.code}</div>
          {theme && game ? (
            <AnimatedEntrance anim="pop-in" delay={100}>
              <div className="card card-glow player-lobby-game-preview">
                <p className="phase-label">Host picked</p>
                <div className="host-decoration" style={{ margin: '4px 0' }}>{theme.emoji}</div>
                <h2 className="display" style={{ fontSize: '1.5rem' }}>{game.title}</h2>
                <p className="waiting-pulse">Get ready — starting soon!</p>
              </div>
            </AnimatedEntrance>
          ) : (
            <p className="waiting-pulse" style={{ marginTop: 16 }}>Waiting for host to pick a game...</p>
          )}
          <div className="player-list" style={{ justifyContent: 'center', marginTop: 20 }}>
            {room.players.filter((p) => p.connected).map((p, i) => (
              <AnimatedEntrance key={p.id} anim="pop-in" delay={i * 50}>
                <span className="player-chip">{p.name}</span>
              </AnimatedEntrance>
            ))}
          </div>
        </div>
      </AnimatedEntrance>
    );
  }

  if (room.phase === 'ended') {
    const lb = room.revealData?.leaderboard || [];
    return (
      <div style={{ textAlign: 'center' }}>
        <ConfettiBurst active count={32} />
        <AnimatedEntrance anim="bounce-in">
          <h2 className="winner-banner display">Game Over!</h2>
        </AnimatedEntrance>
        <div className="card card-glow" style={{ marginTop: 16 }}>
          {lb.map((r, i) => (
            <div key={r.name} className="leaderboard-row">
              <span>{i === 0 ? '👑 ' : `#${i + 1} `}{r.name}</span>
              <span>{r.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!game) return <PhaseFallback />;

  const title = game.title;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="badge">
          Round {room.round}/{room.totalRounds}
          {(room.subRoundsPerRound ?? 1) > 1 && ` · ${room.subRound}/${room.subRoundsPerRound}`}
        </span>
        <span className="badge">{title}</span>
      </div>
      {phaseHasTimer(room.phase) && (
        <PhaseTimer
          endsAt={room.timerEndsAt}
          startedAt={room.timerStartedAt}
          label={getTimerLabel(room.phase)}
        />
      )}

      {room.phase === 'prompt' && (
        <div className="prompt-card" style={{ textAlign: 'center', padding: 32 }}>
          <p className="phase-label">Get ready...</p>
          <div className="prompt-display">{room.prompt}</div>
        </div>
      )}

      {room.phase === 'input' && (
        <AnimatedEntrance anim="slide-up">
        <div>
          <div className="prompt-display" style={{ fontSize: '1.1rem', padding: '12px 0' }}>{room.prompt}</div>
          {room.subPrompt && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{room.subPrompt}</p>}
          {ready ? (
            <Suspense fallback={<PhaseFallback />}>
              <GameInput room={room} game={game} onSubmit={onSubmit} />
            </Suspense>
          ) : (
            <PhaseFallback />
          )}
        </div>
        </AnimatedEntrance>
      )}

      {room.phase === 'reveal' && (
        <div className="card look-at-host">
          <span className="look-at-host-icon">📺</span>
          <p>Look at the host screen!</p>
        </div>
      )}

      {room.phase === 'vote' && (
        <AnimatedEntrance anim="slide-up">
        <div>
          <p className="phase-label" style={{ marginBottom: 12 }}>Cast your vote!</p>
          <Suspense fallback={<PhaseFallback />}>
            <GameVote room={room} onVote={onVote} />
          </Suspense>
        </div>
        </AnimatedEntrance>
      )}

      {room.phase === 'results' && (
        <AnimatedEntrance anim="pop-in">
        <div>
          {room.revealData?.correctAnswer || room.revealData?.playerResults?.length ? (
            <TriviaRoundResults revealData={room.revealData} compact />
          ) : (
            <div className="card card-glow" style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ color: 'var(--success)', fontWeight: 700 }}>Round {room.round} results on host screen!</p>
            </div>
          )}
        </div>
        </AnimatedEntrance>
      )}
    </div>
  );
}