
import type { GameMeta, RoomState } from '../types';
import { getGameTheme } from '../data/gameThemes';
import { PhaseTimer } from './PhaseTimer';
import { RoomCodeBanner } from './RoomCodeBanner';
import { getTimerLabel, phaseHasTimer } from '../utils/timerLabel';
import { AnimatedEntrance } from './AnimatedEntrance';
import { ConfettiBurst } from './ConfettiBurst';

interface Props {
  room: RoomState;
  game: GameMeta | null;
  onStart: () => void;
  onSkip: () => void;
  onBackToLobby: () => void;
}

export function HostDisplay({ room, game, onStart, onSkip, onBackToLobby }: Props) {
  const isHost = room.isHostView;
  const connectedPlayers = room.players.filter((p) => p.connected);
  const theme = getGameTheme(game?.id ?? null);
  const presentation = (room.revealData as {
    presentation?: { hostLabel?: string; hostDecoration?: string; phaseTitle?: string };
  })?.presentation;

  if (room.phase === 'lobby') {
    return (
      <div style={{ textAlign: 'center' }}>
        <RoomCodeBanner code={room.code} playerCount={connectedPlayers.length} />

        <div className="player-list" style={{ margin: '0 0 20px' }}>
          {connectedPlayers.length === 0 ? (
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>No players yet — share the code above!</span>
          ) : (
            connectedPlayers.map((p, i) => (
              <AnimatedEntrance key={p.id} anim="pop-in" delay={i * 60}>
                <span className="player-chip">{p.name}</span>
              </AnimatedEntrance>
            ))
          )}
        </div>

        {game && (
          <AnimatedEntrance anim="slide-up">
            <div className="card card-glow" style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selected game</p>
              <div style={{ fontSize: '2.5rem', margin: '8px 0' }}>{theme?.emoji}</div>
              <h2 className="display" style={{ fontSize: '1.75rem' }}>{game.title}</h2>
              {game.description ? (
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>{game.description}</p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{game.gameType} · {game.minPlayers}–{game.maxPlayers} players</p>
              )}
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Needs {game.minPlayers}–{game.maxPlayers} players
              </p>
              {isHost && (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 16, fontSize: 17 }}
                    onClick={onStart}
                    disabled={connectedPlayers.length < game.minPlayers}
                    data-testid="start-game-btn"
                  >
                    {connectedPlayers.length < game.minPlayers
                      ? `Need ${game.minPlayers} players (${connectedPlayers.length} joined)`
                      : '🚀 Start Game!'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ width: '100%', marginTop: 8, fontSize: 14 }}
                    onClick={onBackToLobby}
                  >
                    ← Choose a different game
                  </button>
                </>
              )}
            </div>
          </AnimatedEntrance>
        )}
      </div>
    );
  }

  if (room.phase === 'ended') {
    const lb = (room.revealData as { leaderboard?: { name: string; score: number }[] })?.leaderboard || [];
    const winner = (room.revealData as { winner?: string })?.winner;
    return (
      <div style={{ textAlign: 'center' }}>
        <ConfettiBurst active count={40} />
        <RoomCodeBanner code={room.code} playerCount={connectedPlayers.length} compact />
        <AnimatedEntrance anim="bounce-in">
          <h2 className="winner-banner display">Game Over!</h2>
        </AnimatedEntrance>
        {winner && (
          <AnimatedEntrance anim="pop-in" delay={200}>
            <p style={{ fontSize: 20, marginBottom: 20, fontWeight: 700 }}>
              🏆 Winner: <span style={{ color: 'var(--warning)' }}>{winner}</span>
            </p>
          </AnimatedEntrance>
        )}
        <div className="card card-glow">
          {lb.map((row, i) => (
            <div key={row.name} className="leaderboard-row">
              <span>{i === 0 ? '👑 ' : `#${i + 1} `}{row.name}</span>
              <span>{row.score}</span>
            </div>
          ))}
        </div>
        {isHost && (
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={onBackToLobby}>
            Back to Lobby
          </button>
        )}
      </div>
    );
  }

  const subCount = Object.keys(room.submissions).length;

  return (
    <div data-testid="host-game-phase" data-phase={room.phase}>
      <RoomCodeBanner code={room.code} playerCount={connectedPlayers.length} compact />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
        <span className="badge">
          Round {room.round}/{room.totalRounds}
          {(room.subRoundsPerRound ?? 1) > 1 && ` · ${room.subRound}/${room.subRoundsPerRound}`}
        </span>
        {game && <span className="badge">{game.title}</span>}
        {isHost && room.phase !== 'results' && (
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '6px 12px', minHeight: 32 }}
            onClick={onSkip}
            data-testid="skip-phase-btn"
          >
            Skip →
          </button>
        )}
      </div>

      {(presentation?.hostDecoration || theme?.emoji) && (
        <div className="host-decoration" data-testid="host-decoration">
          {presentation?.hostDecoration ?? theme?.emoji}
        </div>
      )}
      <p className="phase-label" data-testid="phase-label">
        {presentation?.hostLabel ?? phaseLabel(room.phase)}
      </p>
      {phaseHasTimer(room.phase) && (
        <PhaseTimer
          endsAt={room.timerEndsAt}
          startedAt={room.timerStartedAt}
          label={getTimerLabel(room.phase)}
          hostOnlySound
        />
      )}

      {room.prompt && (
        <div className="prompt-card" style={{ marginBottom: 12 }}>
          <div className="prompt-display">{room.prompt}</div>
        </div>
      )}
      {room.subPrompt && room.phase !== 'results' && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 16, fontWeight: 600 }}>{room.subPrompt}</p>
      )}

      {room.phase === 'reveal' && <RevealOnHost room={room} />}
      {room.phase === 'results' && <ResultsOnHost room={room} />}
      {room.phase === 'input' && (
        <AnimatedEntrance anim="pop-in">
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>Players are answering on their phones...</p>
          <div className="submission-tracker">
            {connectedPlayers.map((p) => (
              <span
                key={p.id}
                className={`submission-chip ${room.submissions[p.id] !== undefined ? 'done' : ''}`}
                title={p.name}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10, fontWeight: 600 }}>
            {subCount}/{connectedPlayers.length} submitted
          </p>
        </div>
        </AnimatedEntrance>
      )}
      {room.phase === 'vote' && (
        <AnimatedEntrance anim="pop-in">
        <div className="card card-glow" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>🗳️ Players are voting on their phones...</p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8, fontWeight: 600 }}>
            {Object.keys(room.votes).length}/{connectedPlayers.length} voted
          </p>
        </div>
        </AnimatedEntrance>
      )}

      <div className="card score-ticker" style={{ marginTop: 16 }}>
        <p className="score-ticker-label">Scores</p>
        {connectedPlayers
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((p) => (
            <div key={p.id} className="leaderboard-row">
              <span>{p.name}</span>
              <span>{p.score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    prompt: 'Get Ready',
    input: 'Answer Now',
    reveal: 'Reveal',
    vote: 'Vote',
    results: 'Round Results',
  };
  return labels[phase] || phase;
}

function RevealOnHost({ room }: { room: RoomState }) {
  const entries = (room.revealData as { entries?: { id: string; playerName: string; content: unknown }[] })?.entries || [];
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {entries.map((e, i) => (
        <AnimatedEntrance key={e.id} anim="slide-up" delay={i * 80}>
          <div className="card reveal-entry card-glow" style={{ fontSize: 14 }}>
            {typeof e.content === 'string' && e.content.startsWith('data:image') ? (
              <img src={e.content} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />
            ) : (
              <p style={{ fontWeight: 600 }}>{String(e.content)}</p>
            )}
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontWeight: 700 }}>— {e.playerName}</p>
          </div>
        </AnimatedEntrance>
      ))}
    </div>
  );
}

function ResultsOnHost({ room }: { room: RoomState }) {
  const rd = room.revealData;
  const lb = rd?.leaderboard;
  if (!lb) return <p style={{ textAlign: 'center' }}>Scoring...</p>;
  return (
    <AnimatedEntrance anim="bounce-in">
      <div>
        {rd?.correctAnswer && (
          <p style={{ textAlign: 'center', marginBottom: 8, fontSize: 16 }}>
            Answer: <strong style={{ color: 'var(--success)' }}>{rd.correctAnswer}</strong>
          </p>
        )}
        <p style={{ textAlign: 'center', color: 'var(--success)', marginBottom: 12, fontWeight: 800, fontSize: 18 }}>Round complete!</p>
      </div>
    </AnimatedEntrance>
  );
}