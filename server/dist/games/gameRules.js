import { GENERATED_GAME_RULES } from './gameRules.generated.js';
const DEFAULT_RULES = {
    totalRounds: 3,
    subRoundsPerRound: 1,
    inputTimeMs: 20000,
    promptTimeMs: 3000,
    revealTimeMs: 3000,
    resultsTimeMs: 4000,
    voteTimeMs: 30000,
};
/** Per-game overrides — aligned with gameplay fine details (wiki-sourced). */
const GAME_RULES = {
    ...GENERATED_GAME_RULES,
};
export function getDefaultRules() {
    return { ...DEFAULT_RULES };
}
export function getGameRules(game) {
    const overrides = GAME_RULES[game.id] ?? {};
    const archetypeDefaults = {};
    if (game.archetype === 'trivia-bool') {
        archetypeDefaults.correctPointsMin = 500;
        archetypeDefaults.correctPointsMax = 500;
        archetypeDefaults.incorrectPoints = -200;
    }
    return { ...DEFAULT_RULES, ...archetypeDefaults, ...overrides };
}
