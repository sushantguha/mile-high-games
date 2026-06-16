import { useMemo, useState } from 'react';
import { GAME_TILES } from '../data/gameCatalog';
import { GameTile } from '../components/GameTile';
import { prefetchGameMeta } from '../hooks/useGameMeta';
import { AnimatedEntrance } from '../components/AnimatedEntrance';

interface Props {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function GameSelect({ onSelect, selectedId }: Props) {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const types = useMemo(
    () => [...new Set(GAME_TILES.map((g) => g.gameType))].sort(),
    [],
  );

  const filtered = useMemo(() => GAME_TILES.filter((g) => {
    if (filter && !g.title.toLowerCase().includes(filter.toLowerCase())) return false;
    if (typeFilter && g.gameType !== typeFilter) return false;
    return true;
  }), [filter, typeFilter]);

  const handleSelect = (id: string) => {
    prefetchGameMeta(id);
    onSelect(id);
  };

  return (
    <div className="game-select-shelf">
      <AnimatedEntrance anim="slide-up">
        <h2 className="game-select-title display">Pick a Game!</h2>
        <p className="game-select-subtitle">Flip through the shelf — every game has its own vibe</p>
      </AnimatedEntrance>
      <input
        placeholder="🔍 Search games..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button
          type="button"
          className={`filter-chip ${!typeFilter ? 'active' : ''}`}
          onClick={() => setTypeFilter('')}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t}
            type="button"
            className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
            onClick={() => setTypeFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid-games">
        {filtered.map((g, i) => (
          <AnimatedEntrance key={g.id} anim="pop-in" delay={Math.min(i * 30, 300)}>
            <GameTile
              game={g}
              selected={selectedId === g.id}
              onClick={() => handleSelect(g.id)}
            />
          </AnimatedEntrance>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>
        {filtered.length} games ready to play
      </p>
    </div>
  );
}