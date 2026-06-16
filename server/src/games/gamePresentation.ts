import type { GameMeta, GamePhase, RoomState } from '../../../shared/types.js';

export interface GamePresentation {
  hostEmoji: string;
  hostLabel: string;
  phaseTitle: string;
  playerHint: string;
  hostDecoration: string;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  lobby: 'Lobby',
  prompt: 'Get Ready',
  input: 'Answer Now',
  reveal: 'Reveal',
  vote: 'Vote',
  results: 'Round Results',
  ended: 'Game Over',
};

const GAME_OVERRIDES: Record<string, Partial<Record<GamePhase, { hostLabel?: string; playerHint?: string; hostDecoration?: string }>>> = {
  'lie-swatter': {
    prompt: { hostLabel: 'A fly buzzes in...', hostDecoration: '🪰', playerHint: 'Read the statement on your phone.' },
    input: { hostLabel: 'TRUTH or LIE?', hostDecoration: '🪰', playerHint: 'Tap TRUTH or LIE quickly — speed earns bonus points!' },
    results: { hostLabel: 'The fly gets squashed!', hostDecoration: '💥' },
  },
  'fibbage-4': {
    input: { hostLabel: 'Write a convincing lie!', hostDecoration: '🎭', playerHint: 'Fool everyone or find the truth. Lie For Me gives half points.' },
    vote: { hostLabel: 'Which is the truth?', playerHint: 'Pick the real answer among the lies.' },
  },
  'quiplash-3': {
    input: { hostLabel: 'Write something funny!', hostDecoration: '💬', playerHint: 'Be witty — players vote for the best quip.' },
  },
  'fakin-it': {
    input: { hostLabel: 'Do the task!', hostDecoration: '🎪', playerHint: 'Follow the secret task — or blend in if you are the Faker.' },
  },
  'trivia-murder-party-2': {
    input: { hostLabel: 'Answer or die!', hostDecoration: '💀', playerHint: 'Wrong answers may eliminate you. Ghosts can still win.' },
  },
  'drawful-animate': {
    input: { hostLabel: 'Draw!', hostDecoration: '✏️', playerHint: 'Draw the prompt on your phone.' },
  },
  'bomb-corp': {
    input: { hostLabel: 'Defuse the bomb!', hostDecoration: '💣', playerHint: 'Compare instructions with teammates — only one rule set is right.' },
  },
  'time-jinx': {
    input: { hostLabel: 'What year?', hostDecoration: '⏳', playerHint: 'Enter the year the event happened. Closest year wins (lowest total).' },
  },
  'tee-k-o-2': {
    input: { hostLabel: 'Design a shirt!', hostDecoration: '👕', playerHint: 'Draw your fighter shirt for the bracket.' },
  },
};

const EMOJI: Record<string, string> = {
  'lie-swatter': '🪰', 'fibbage-4': '🎭', 'quiplash-3': '💬', 'drawful-animate': '✏️',
  'dirty-drawful': '🔞', 'trivia-murder-party-2': '💀', 'fakin-it': '🎪', 'guesspionage': '🕵️',
  'bidiots': '🎨', 'bomb-corp': '💣', 'time-jinx': '⏳', 'tee-k-o-2': '👕', 'let-me-finish': '🎤',
};

export function getGamePresentation(game: GameMeta | null, phase: GamePhase, room: RoomState): GamePresentation {
  const id = game?.id ?? '';
  const emoji = EMOJI[id] ?? '🎲';
  const override = GAME_OVERRIDES[id]?.[phase] ?? {};
  const sub = room.subRoundsPerRound > 1
    ? ` · ${room.subRound}/${room.subRoundsPerRound}`
    : '';
  return {
    hostEmoji: emoji,
    hostLabel: override.hostLabel ?? `${PHASE_LABELS[phase]}${sub}`,
    phaseTitle: PHASE_LABELS[phase],
    playerHint: override.playerHint ?? room.subPrompt ?? '',
    hostDecoration: override.hostDecoration ?? emoji,
  };
}