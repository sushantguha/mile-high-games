import { useEffect, useState } from 'react';
import { getGameTile, type GameTile } from '../data/gameCatalog';
import type { GameMeta } from '../types';

const metaCache = new Map<string, GameMeta>();

async function fetchFromApi(id: string): Promise<GameMeta | null> {
  try {
    let res = await fetch(`/api/games/${id}`);
    if (!res.ok) res = await fetch(`http://localhost:3001/api/games/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as GameMeta;
  } catch {
    return null;
  }
}

/** Prefetch full metadata when a tile is tapped (before Start). */
export function prefetchGameMeta(id: string): void {
  if (metaCache.has(id)) return;
  fetchFromApi(id).then((meta) => {
    if (meta) metaCache.set(id, meta);
  });
}

function tileAsShell(tile: GameTile): GameMeta {
  return {
    id: tile.id,
    title: tile.title,
    pack: '',
    minPlayers: tile.minPlayers,
    maxPlayers: tile.maxPlayers,
    length: '',
    familyFriendly: true,
    audience: false,
    gameType: tile.gameType,
    secondaryType: '',
    archetype: '',
    description: '',
    enabled: true,
  };
}

export function useGameMeta(gameId: string | null) {
  const tile = gameId ? getGameTile(gameId) : undefined;
  const [game, setGame] = useState<GameMeta | null>(() =>
    gameId && metaCache.has(gameId) ? metaCache.get(gameId)! : null,
  );

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      return;
    }
    if (metaCache.has(gameId)) {
      setGame(metaCache.get(gameId)!);
      return;
    }
    let cancelled = false;
    fetchFromApi(gameId).then((meta) => {
      if (cancelled || !meta) return;
      metaCache.set(gameId, meta);
      setGame(meta);
    });
    return () => { cancelled = true; };
  }, [gameId]);

  const shell = tile ? tileAsShell(tile) : null;
  return {
    game: game ?? shell,
    ready: Boolean(game?.archetype),
    loading: Boolean(gameId && !game),
  };
}