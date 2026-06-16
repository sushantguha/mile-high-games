import type { RoomState } from '../types';

interface Props {
  room: RoomState;
  onVote: (targetId: string) => void;
}

export function GameVote({ room, onVote }: Props) {
  const voted = room.votes[room.playerId || ''] !== undefined;
  const pairs = (room.revealData as { pairs?: { a: string; b: string; contentA: unknown; contentB: unknown }[] })?.pairs || [];

  if (voted) {
    return (
      <div className="card submitted-card">
        <div className="submitted-check">🗳️</div>
        <p style={{ color: 'var(--success)', fontWeight: 700 }}>Vote recorded! Waiting for results...</p>
      </div>
    );
  }

  if (pairs.length === 0) {
    const entries = (room.revealData as { entries?: { id: string; playerName: string; content: unknown }[] })?.entries || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map((e) => (
          <button key={e.id} className="btn btn-secondary vote-entry" data-testid={`vote-${e.id}`} onClick={() => onVote(e.id)}>
            {typeof e.content === 'string' && e.content.startsWith('data:image') ? (
              <img src={e.content} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />
            ) : (
              <span>{String(e.content)}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 4 }}>— {e.playerName}</span>
          </button>
        ))}
      </div>
    );
  }

  const pair = pairs[0];
  const renderContent = (c: unknown) => {
    if (typeof c === 'string' && c.startsWith('data:image')) {
      return <img src={c} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />;
    }
    return String(c);
  };

  return (
    <div>
      <p style={{ textAlign: 'center', marginBottom: 12, color: 'var(--muted)' }}>Pick the better one!</p>
      <div className="vote-pair">
        <button className="vote-option" data-testid="vote-pair-a" onClick={() => onVote(pair.a)}>
          {renderContent(pair.contentA)}
        </button>
        <span className="vote-vs" aria-hidden>VS</span>
        <button className="vote-option" data-testid="vote-pair-b" onClick={() => onVote(pair.b)}>
          {renderContent(pair.contentB)}
        </button>
      </div>
    </div>
  );
}