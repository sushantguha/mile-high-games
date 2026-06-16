import type { GameArchetype, GameMeta } from '../../../shared/types.js';
import rawGames from '../../../shared/games.json' with { type: 'json' };

/** Audio games disabled until real sound assets are added (see content/images/WHERE_TO_SOURCE.txt). */
const DISABLED_GAME_IDS = new Set(['earwax', 'hear-say', 'dodo-re-mi']);

const ARCHETYPE_MAP: Record<string, GameArchetype> = {
  'lie-swatter': 'trivia-bool',
  'word-spud': 'word-chain',
  bidiots: 'draw-guess',
  'bomb-corp': 'teamwork',
  earwax: 'audio-pick',
  'fakin-it': 'hidden-task',
  guesspionage: 'trivia',
  bracketeering: 'bracket',
  'civic-doodle': 'draw-guess',
  'monster-seeking-monster': 'hidden-task',
  'survive-the-internet': 'text-transform',
  'mad-verse-city': 'write-vote',
  'patently-stupid': 'draw-guess',
  'split-the-room': 'rank',
  'you-don-t-know-jack-full-stream': 'trivia',
  'zeeple-dome': 'teamwork',
  dictionarium: 'write-vote',
  'joke-boat': 'write-vote',
  'push-the-button': 'hidden-task',
  'role-models': 'role-label',
  'trivia-murder-party-2': 'survival-trivia',
  'blather-round': 'word-chain',
  'champ-d-up': 'draw-guess',
  'quiplash-3': 'write-vote',
  'talking-points': 'debate',
  'the-devils-and-the-details': 'teamwork',
  'drawful-animate': 'draw-guess',
  'job-job': 'write-vote',
  'the-poll-mine': 'rank',
  'the-wheel-of-enormous-proportions': 'trivia',
  'weapons-drawn': 'draw-guess',
  'fibbage-4': 'fibbage',
  junktopia: 'pitch',
  nonsensory: 'write-vote',
  quixort: 'sort',
  roomerang: 'pitch',
  'dodo-re-mi': 'audio-pick',
  'fixy-text': 'text-transform',
  hypnotorious: 'hidden-task',
  'tee-k-o-2': 'draw-bracket',
  'time-jinx': 'trivia',
  doominate: 'write-vote',
  'hear-say': 'audio-pick',
  'cookie-haus': 'draw-guess',
  suspectives: 'hidden-task',
  'legends-of-trivia': 'trivia',
  'fakin-it-all-night-long': 'hidden-task',
  'dirty-drawful': 'draw-guess',
  'let-me-finish': 'finish-sentence',
};

const DESCRIPTIONS: Record<string, string> = {
  'lie-swatter': 'Swat the lies, avoid the truths!',
  'word-spud': 'Chain words with secret rules.',
  bidiots: 'Draw art, bid prices, profit!',
  'fibbage-4': 'Bluff the real answer.',
  'quiplash-3': 'Write funny answers, vote for the best.',
  'drawful-animate': 'Draw, guess, then animate!',
  'trivia-murder-party-2': 'Trivia or die — ghosts can still win!',
  'tee-k-o-2': 'Draw shirts, battle in a bracket.',
};

type RawGame = (typeof rawGames)[number];

function toGameMeta(g: RawGame): GameMeta {
  const disabled = DISABLED_GAME_IDS.has(g.id);
  return {
    id: g.id,
    title: g['Game Title'],
    pack: g['Game Pack'],
    minPlayers: g['Min. Players'],
    maxPlayers: g['Max. Players'],
    length: g.Length,
    familyFriendly: g['Family Friendly?'] === 'Yes',
    audience: g.Audience === 'Yes',
    gameType: g['Game Type'],
    secondaryType: g['Secondary Type'] || '',
    archetype: ARCHETYPE_MAP[g.id] || 'write-vote',
    description: disabled
      ? 'Temporarily disabled — needs real audio assets.'
      : DESCRIPTIONS[g.id] || `Play ${g['Game Title']} with friends!`,
    enabled: !disabled,
  };
}

export function getAllGames(includeDisabled = false): GameMeta[] {
  const all = (rawGames as RawGame[]).map(toGameMeta);
  return includeDisabled ? all : all.filter((g) => g.enabled);
}

export function getGame(id: string): GameMeta | undefined {
  return getAllGames(true).find((g) => g.id === id);
}