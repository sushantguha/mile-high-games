import type { GameMeta } from '../../../shared/types.js';
import { GENERATED_GAME_RULES } from './gameRules.generated.js';

export interface GameRules {
  totalRounds: number;
  subRoundsPerRound: number;
  inputTimeMs: number;
  promptTimeMs: number;
  revealTimeMs: number;
  resultsTimeMs: number;
  voteTimeMs: number;
  /** Speed bonus for fastest correct answer (e.g. Lie Swatter +75). */
  speedBonus?: number;
  /** Point multiplier for final round (e.g. Lie Swatter round 3 = 2x). */
  finalRoundMultiplier?: number;
  /** Min/max base points for correct trivia-bool answers. */
  correctPointsMin?: number;
  correctPointsMax?: number;
  incorrectPoints?: number;
}

const DEFAULT_RULES: GameRules = {
  totalRounds: 3,
  subRoundsPerRound: 1,
  inputTimeMs: 20000,
  promptTimeMs: 3000,
  revealTimeMs: 3000,
  resultsTimeMs: 4000,
  voteTimeMs: 30000,
};

/** Per-game overrides — aligned with gameplay fine details (wiki-sourced). */
const GAME_RULES: Record<string, Partial<GameRules>> = {
  ...GENERATED_GAME_RULES,
};

export function getDefaultRules(): GameRules {
  return { ...DEFAULT_RULES };
}

export function getGameRules(game: GameMeta): GameRules {
  const overrides = GAME_RULES[game.id] ?? {};
  const archetypeDefaults: Partial<GameRules> = {};
  if (game.archetype === 'trivia-bool') {
    archetypeDefaults.correctPointsMin = 500;
    archetypeDefaults.correctPointsMax = 500;
    archetypeDefaults.incorrectPoints = -200;
    archetypeDefaults.resultsTimeMs = 15000;
    archetypeDefaults.promptTimeMs = 5000;
  } else if (game.archetype === 'trivia' || game.archetype === 'survival-trivia') {
    archetypeDefaults.resultsTimeMs = 15000;
    archetypeDefaults.promptTimeMs = 5000;
  }
  return { ...DEFAULT_RULES, ...archetypeDefaults, ...overrides };
}