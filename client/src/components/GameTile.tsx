import type { GameTile as GameTileData } from '../data/gameCatalog';
import { getGameTheme } from '../data/gameThemes';

interface Props {
  game: GameTileData;
  selected?: boolean;
  onClick: () => void;
}

export function GameTile({ game, selected, onClick }: Props) {
  const theme = getGameTheme(game.id);

  return (
    <button
      type="button"
      className={`game-tile ${selected ? 'selected' : ''}`}
      onClick={onClick}
      data-testid={`game-tile-${game.id}`}
      style={{
        ['--tile-accent' as string]: theme?.accent ?? 'var(--primary)',
        ['--tile-bg' as string]: theme?.background ?? 'var(--surface)',
      }}
    >
      <span className="game-tile-emoji" aria-hidden>{theme?.emoji ?? '🎮'}</span>
      <div className="game-tile-title">{game.title}</div>
      <div className="game-tile-meta">{game.minPlayers}–{game.maxPlayers} players</div>
      <div className="game-tile-footer">
        <span className="badge game-tile-type">{game.gameType}</span>
        {theme?.pack && <span className="game-tile-pack">{theme.pack.replace('Jackbox Party Pack ', 'Pack ')}</span>}
      </div>
    </button>
  );
}