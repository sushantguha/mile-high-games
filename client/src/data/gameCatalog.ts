import rawGames from '../../../shared/games.json';

/** Matches server DISABLED_GAME_IDS — audio games need real assets. */
const DISABLED_IDS = new Set(['earwax', 'hear-say', 'dodo-re-mi']);

export interface GameTile {
  id: string;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  gameType: string;
}

type RawGame = (typeof rawGames)[number];

export const GAME_TILES: GameTile[] = (rawGames as RawGame[])
  .filter((g) => !DISABLED_IDS.has(g.id))
  .map((g) => ({
    id: g.id,
    title: g['Game Title'],
    minPlayers: g['Min. Players'],
    maxPlayers: g['Max. Players'],
    gameType: g['Game Type'],
  }));

export function getGameTile(id: string): GameTile | undefined {
  return GAME_TILES.find((t) => t.id === id);
}