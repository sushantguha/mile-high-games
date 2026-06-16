import type { GameArchetype, RoomState } from '../../shared/types.js';
import { getDefaultRules, getGameRules } from './games/gameRules.js';
import { getGamePresentation } from './games/gamePresentation.js';
import { finalizeLeaderboard, pickWinner, scoreGameRound } from './games/gameScoring.js';
import {
  getFibbageTruth,
  getHiddenTasks,
  getPromptForGame,
  getTriviaOptions,
} from './games/loadContent.js';
import { getGame } from './games/registry.js';

type RoomNotifier = (room: RoomState) => void;
let notifyRoomChange: RoomNotifier = () => {};

const roomTimers = new WeakMap<RoomState, ReturnType<typeof setTimeout>[]>();

export function setRoomNotifier(notifier: RoomNotifier): void {
  notifyRoomChange = notifier;
}

function emit(room: RoomState): void {
  notifyRoomChange(room);
}

function clearRoomTimers(room: RoomState): void {
  const timers = roomTimers.get(room);
  if (!timers) return;
  for (const t of timers) clearTimeout(t);
  roomTimers.delete(room);
}

function schedule(room: RoomState, fn: () => void, ms: number): void {
  const t = setTimeout(() => {
    fn();
    emit(room);
  }, ms);
  const timers = roomTimers.get(room) ?? [];
  timers.push(t);
  roomTimers.set(room, timers);
}

function rulesFor(room: RoomState) {
  const game = getGame(room.gameId!);
  return game ? getGameRules(game) : getDefaultRules();
}

/** Starts a visible countdown bar and schedules phase expiry. */
function startPhaseTimer(room: RoomState, durationMs: number, onExpire: () => void): void {
  clearRoomTimers(room);
  room.timerStartedAt = Date.now();
  room.timerEndsAt = room.timerStartedAt + durationMs;
  schedule(room, onExpire, durationMs);
}

function clearPhaseTimer(room: RoomState): void {
  clearRoomTimers(room);
  room.timerEndsAt = undefined;
  room.timerStartedAt = undefined;
}

const VOTE_ARCHETYPES: GameArchetype[] = [
  'write-vote',
  'fibbage',
  'draw-guess',
  'draw-bracket',
  'pitch',
  'finish-sentence',
  'text-transform',
  'word-chain',
  'debate',
  'bracket',
];

function promptIndex(room: RoomState): number {
  return (room.round - 1) * room.subRoundsPerRound + (room.subRound - 1);
}

function playingPlayers(room: RoomState) {
  const connected = room.players
    .filter((p) => p.connected)
    .sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
  const cap = room.maxPlayers || connected.length;
  return connected.slice(0, cap);
}

export function startGame(room: RoomState): void {
  const game = getGame(room.gameId!);
  if (!game || !game.enabled) return;
  const rules = getGameRules(game);
  clearRoomTimers(room);
  room.round = 1;
  room.subRound = 1;
  room.totalRounds = rules.totalRounds;
  room.subRoundsPerRound = rules.subRoundsPerRound;
  room.maxPlayers = Math.min(game.maxPlayers, 100);
  room.submissions = {};
  room.submissionTimes = {};
  room.votes = {};
  for (const p of room.players) p.score = 0;
  beginRound(room, game.archetype);
  emit(room);
}

function beginRound(room: RoomState, archetype: GameArchetype): void {
  const rules = rulesFor(room);
  room.phase = 'prompt';
  room.submissions = {};
  room.submissionTimes = {};
  room.votes = {};
  room.revealData = undefined;
  room.timerEndsAt = undefined;
  room.timerStartedAt = undefined;
  room.inputStartedAt = undefined;
  room.prompt = getPromptForGame(archetype, promptIndex(room) + 1, room.gameId ?? undefined);

  if (archetype === 'trivia' || archetype === 'survival-trivia') {
    room.subPrompt = 'Pick the correct answer';
    room.options = getTriviaOptions(room.prompt);
  } else if (archetype === 'trivia-bool') {
    const factLabel = room.subRoundsPerRound > 1
      ? `Fact ${room.subRound} of ${room.subRoundsPerRound} — `
      : '';
    room.subPrompt = `${factLabel}Is this statement TRUE or a LIE?`;
    room.options = ['TRUE', 'LIE'];
  } else if (archetype === 'rank' || archetype === 'sort') {
    room.subPrompt = archetype === 'sort' ? 'Drag to sort (type order as comma-separated)' : 'Rank items (comma-separated, best first)';
    const items = room.prompt.split('—')[1]?.trim() || 'A, B, C, D';
    room.options = items.split(',').map((s) => s.trim());
  } else if (archetype === 'teamwork') {
    room.subPrompt = 'Coordinate with your team — pick your choice';
    room.options = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan'];
  } else if (archetype === 'hidden-task') {
    room.subPrompt = 'You have a secret task — complete it without being caught!';
    room.revealData = { tasks: assignSecretTasks(room) };
  } else if (archetype === 'fibbage') {
    room.subPrompt = 'Write a convincing lie for the blank!';
    room.revealData = { truth: getFibbageTruth(room.prompt) };
  } else if (archetype === 'role-label') {
    room.subPrompt = 'Assign labels to players';
    room.options = room.players.map((p) => p.name);
  } else if (archetype === 'debate') {
    room.subPrompt = 'Pick a side: FOR or AGAINST';
    room.options = ['FOR', 'AGAINST'];
  } else {
    room.subPrompt = undefined;
    room.options = undefined;
  }

  const gameMeta = getGame(room.gameId!);
  if (gameMeta) {
    const pres = getGamePresentation(gameMeta, 'prompt', room);
    room.revealData = { ...(room.revealData as object || {}), presentation: pres };
  }

  startPhaseTimer(room, rules.promptTimeMs, () => {
    if (room.phase !== 'prompt') return;
    transitionToInput(room);
  });
}

function transitionToInput(room: RoomState): void {
  const rules = rulesFor(room);
  const gameMeta = getGame(room.gameId!);
  room.phase = 'input';
  room.inputStartedAt = Date.now();
  if (gameMeta) {
    const pres = getGamePresentation(gameMeta, 'input', room);
    room.revealData = { ...(room.revealData as object || {}), presentation: pres };
  }
  startPhaseTimer(room, rules.inputTimeMs, () => {
    if (room.phase !== 'input') return;
    advanceAfterInput(room);
  });
}

function assignSecretTasks(room: RoomState): Record<string, string> {
  const tasks = getHiddenTasks(room.players.length);
  const result: Record<string, string> = {};
  room.players.forEach((p, i) => {
    result[p.id] = tasks[i];
  });
  return result;
}

export function handleSubmit(room: RoomState, playerId: string, value: unknown): boolean {
  if (room.phase !== 'input') return false;
  room.submissions[playerId] = value;
  room.submissionTimes[playerId] = Date.now();

  const allSubmitted = playingPlayers(room).every((p) => room.submissions[p.id] !== undefined);
  if (allSubmitted) {
    advanceAfterInput(room);
  }
  return true;
}

export function handleVote(room: RoomState, playerId: string, targetId: string): boolean {
  if (room.phase !== 'vote') return false;
  room.votes[playerId] = targetId;

  const voters = playingPlayers(room);
  if (Object.keys(room.votes).length >= voters.length) {
    finishVotePhase(room);
  }
  return true;
}

function advanceAfterInput(room: RoomState): void {
  const game = getGame(room.gameId!);
  if (!game) return;
  clearPhaseTimer(room);
  const archetype = game.archetype;
  const rules = getGameRules(game);

  if (VOTE_ARCHETYPES.includes(archetype)) {
    prepareVoting(room, archetype, rules.revealTimeMs, rules.voteTimeMs);
  } else {
    scoreRound(room);
    room.phase = 'results';
    startResultsPhase(room);
  }
}

function prepareVoting(room: RoomState, archetype: GameArchetype, revealMs: number, voteMs: number): void {
  room.phase = 'reveal';
  const entries = Object.entries(room.submissions).map(([pid, val]) => ({
    id: pid,
    playerName: room.players.find((p) => p.id === pid)?.name || 'Unknown',
    content: val,
  }));

  if (archetype === 'fibbage') {
    const truth = (room.revealData as { truth: string })?.truth || 'truth';
    entries.push({ id: '__truth__', playerName: 'The Truth', content: truth });
  }

  entries.sort(() => Math.random() - 0.5);
  room.revealData = { entries, pairs: pairForVoting(entries) };

  const gameMeta = getGame(room.gameId!);
  if (gameMeta) {
    const pres = getGamePresentation(gameMeta, 'reveal', room);
    room.revealData = { ...(room.revealData as object || {}), presentation: pres };
  }

  startPhaseTimer(room, revealMs, () => {
    if (room.phase !== 'reveal') return;
    transitionToVote(room, voteMs);
  });
}

function transitionToVote(room: RoomState, voteMs: number): void {
  room.phase = 'vote';
  const gameMeta = getGame(room.gameId!);
  if (gameMeta) {
    const pres = getGamePresentation(gameMeta, 'vote', room);
    room.revealData = { ...(room.revealData as object || {}), presentation: pres };
  }
  startPhaseTimer(room, voteMs, () => {
    if (room.phase !== 'vote') return;
    finishVotePhase(room);
  });
}

function finishVotePhase(room: RoomState): void {
  clearPhaseTimer(room);
  scoreRound(room);
  room.phase = 'results';
  startResultsPhase(room);
}

function startResultsPhase(room: RoomState): void {
  const rules = rulesFor(room);
  const gameMeta = getGame(room.gameId!);
  if (gameMeta) {
    const pres = getGamePresentation(gameMeta, 'results', room);
    room.revealData = { ...(room.revealData as object || {}), presentation: pres };
  }
  startPhaseTimer(room, rules.resultsTimeMs, () => {
    if (room.phase !== 'results') return;
    nextRoundOrEnd(room);
  });
}

function pairForVoting(entries: { id: string; content: unknown }[]) {
  const pairs: { a: string; b: string; contentA: unknown; contentB: unknown }[] = [];
  for (let i = 0; i < entries.length - 1; i += 2) {
    pairs.push({
      a: entries[i].id,
      b: entries[i + 1].id,
      contentA: entries[i].content,
      contentB: entries[i + 1].content,
    });
  }
  return pairs;
}

function scoreRound(room: RoomState): void {
  const game = getGame(room.gameId!);
  if (!game) return;
  const rules = getGameRules(game);
  scoreGameRound(room, game, rules, award);
  finalizeLeaderboard(room, game);
  const pres = getGamePresentation(game, 'results', room);
  room.revealData = { ...(room.revealData as object || {}), presentation: pres };
}

function award(room: RoomState, playerId: string, points: number): void {
  const p = room.players.find((pl) => pl.id === playerId);
  if (p) p.score += points;
}

function nextRoundOrEnd(room: RoomState): void {
  clearPhaseTimer(room);
  const game = getGame(room.gameId!);
  if (!game) return;

  if (room.subRound < room.subRoundsPerRound) {
    room.subRound += 1;
    beginRound(room, game.archetype);
    return;
  }

  if (room.round >= room.totalRounds) {
    room.phase = 'ended';
    finalizeLeaderboard(room, game);
    room.revealData = {
      ...(room.revealData as object || {}),
      winner: pickWinner(room, game),
    };
    return;
  }

  room.round += 1;
  room.subRound = 1;
  beginRound(room, game.archetype);
}

export function forceAdvance(room: RoomState): void {
  const rules = rulesFor(room);
  clearRoomTimers(room);
  room.timerEndsAt = undefined;
  room.timerStartedAt = undefined;

  if (room.phase === 'prompt') {
    transitionToInput(room);
  } else if (room.phase === 'input') {
    advanceAfterInput(room);
  } else if (room.phase === 'reveal') {
    transitionToVote(room, rules.voteTimeMs);
  } else if (room.phase === 'vote') {
    finishVotePhase(room);
  } else if (room.phase === 'results') {
    nextRoundOrEnd(room);
  }
  emit(room);
}

export function clearGameTimers(room: RoomState): void {
  clearRoomTimers(room);
}