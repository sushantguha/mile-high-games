import multipleChoice from '../../../content/trivia/multiple-choice.json' with { type: 'json' };
import trueOrLie from '../../../content/trivia/true-or-lie.json' with { type: 'json' };
import drawingPrompts from '../../../content/drawing/prompts.json' with { type: 'json' };
import writeVotePrompts from '../../../content/write-vote/prompts.json' with { type: 'json' };
import type { GameArchetype } from '../../../shared/types.js';

export interface TriviaQuestion {
  question: string;
  answer: string;
  distractors: string[];
}

export interface TrueOrLieStatement {
  text: string;
  isTrue: boolean;
}

export interface FibbagePrompt {
  prompt: string;
  truth: string;
}

const MC_QUESTIONS = multipleChoice.questions as TriviaQuestion[];
const BOOL_STATEMENTS = trueOrLie.statements as TrueOrLieStatement[];
const DRAW_GUESS = drawingPrompts.drawGuess as string[];
const SHIRT_DESIGNS = drawingPrompts.shirtDesigns as string[];
const WV = writeVotePrompts as Record<string, string[] | FibbagePrompt[]>;

/** Deterministic per-game offset so different games don't share the same prompt sequence. */
function gameOffset(gameId: string | undefined, size: number): number {
  if (!gameId || size <= 0) return 0;
  let h = 0;
  for (let i = 0; i < gameId.length; i++) {
    h = (Math.imul(31, h) + gameId.charCodeAt(i)) >>> 0;
  }
  return h % size;
}

function poolIndex(baseIdx: number, gameId: string | undefined, size: number): number {
  return (baseIdx + gameOffset(gameId, size)) % size;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPromptForGame(archetype: GameArchetype, round: number, gameId?: string): string {
  const poolSize = getPoolSize(archetype);
  const idx = (round - 1) % poolSize;
  return getPromptByIndex(archetype, idx, gameId);
}

function getPoolSize(archetype: GameArchetype): number {
  switch (archetype) {
    case 'trivia':
    case 'survival-trivia':
      return MC_QUESTIONS.length;
    case 'trivia-bool':
      return BOOL_STATEMENTS.length;
    case 'draw-guess':
      return DRAW_GUESS.length;
    case 'draw-bracket':
      return SHIRT_DESIGNS.length;
    case 'fibbage':
      return (WV.fibbage as FibbagePrompt[]).length;
    case 'word-chain':
      return (WV.wordChain as string[]).length;
    case 'teamwork':
      return (WV.teamwork as string[]).length;
    case 'hidden-task':
      return (WV.hiddenTask as string[]).length;
    case 'bracket':
      return (WV.bracket as string[]).length;
    case 'rank':
      return (WV.rank as string[]).length;
    case 'sort':
      return (WV.sort as string[]).length;
    case 'debate':
      return (WV.debate as string[]).length;
    case 'role-label':
      return (WV.roleLabel as string[]).length;
    case 'finish-sentence':
      return (WV.finishSentence as string[]).length;
    case 'text-transform':
      return (WV.textTransform as string[]).length;
    case 'pitch':
      return (WV.pitch as string[]).length;
    default:
      return (WV.quiplash as string[]).length;
  }
}

function getPromptByIndex(archetype: GameArchetype, idx: number, gameId?: string): string {
  switch (archetype) {
    case 'trivia':
    case 'survival-trivia':
      return MC_QUESTIONS[poolIndex(idx, gameId, MC_QUESTIONS.length)].question;
    case 'trivia-bool':
      return BOOL_STATEMENTS[poolIndex(idx, gameId, BOOL_STATEMENTS.length)].text;
    case 'draw-guess':
      return DRAW_GUESS[poolIndex(idx, gameId, DRAW_GUESS.length)];
    case 'draw-bracket':
      return SHIRT_DESIGNS[poolIndex(idx, gameId, SHIRT_DESIGNS.length)];
    case 'fibbage':
      return (WV.fibbage as FibbagePrompt[])[poolIndex(idx, gameId, (WV.fibbage as FibbagePrompt[]).length)].prompt;
    case 'word-chain':
      return (WV.wordChain as string[])[poolIndex(idx, gameId, (WV.wordChain as string[]).length)];
    case 'teamwork':
      return (WV.teamwork as string[])[poolIndex(idx, gameId, (WV.teamwork as string[]).length)];
    case 'hidden-task':
      return (WV.hiddenTask as string[])[poolIndex(idx, gameId, (WV.hiddenTask as string[]).length)];
    case 'bracket':
      return (WV.bracket as string[])[poolIndex(idx, gameId, (WV.bracket as string[]).length)];
    case 'rank':
      return (WV.rank as string[])[poolIndex(idx, gameId, (WV.rank as string[]).length)];
    case 'sort':
      return (WV.sort as string[])[poolIndex(idx, gameId, (WV.sort as string[]).length)];
    case 'debate':
      return (WV.debate as string[])[poolIndex(idx, gameId, (WV.debate as string[]).length)];
    case 'role-label':
      return (WV.roleLabel as string[])[poolIndex(idx, gameId, (WV.roleLabel as string[]).length)];
    case 'finish-sentence':
      return (WV.finishSentence as string[])[poolIndex(idx, gameId, (WV.finishSentence as string[]).length)];
    case 'text-transform':
      return (WV.textTransform as string[])[poolIndex(idx, gameId, (WV.textTransform as string[]).length)];
    case 'pitch':
      return (WV.pitch as string[])[poolIndex(idx, gameId, (WV.pitch as string[]).length)];
    default:
      return (WV.quiplash as string[])[poolIndex(idx, gameId, (WV.quiplash as string[]).length)];
  }
}

export function getTriviaQuestion(prompt: string): TriviaQuestion | undefined {
  return MC_QUESTIONS.find((q) => q.question === prompt);
}

export function getTriviaAnswer(prompt: string): string {
  return getTriviaQuestion(prompt)?.answer ?? 'Yes';
}

export function getTriviaOptions(prompt: string): string[] {
  const q = getTriviaQuestion(prompt);
  if (!q) return ['Yes', 'No', 'Maybe', 'Probably'];
  const options = [q.answer, ...q.distractors];
  return options.sort(() => Math.random() - 0.5);
}

export function getTrueOrLieAnswer(prompt: string): boolean {
  const stmt = BOOL_STATEMENTS.find((s) => s.text === prompt);
  return stmt?.isTrue ?? true;
}

export function getFibbageTruth(prompt: string): string {
  const entry = (WV.fibbage as FibbagePrompt[]).find((f) => f.prompt === prompt);
  return entry?.truth ?? 'something weird';
}

export function getHiddenTasks(count: number): string[] {
  const tasks = WV.hiddenTask as string[];
  return Array.from({ length: count }, (_, i) => tasks[i % tasks.length]);
}