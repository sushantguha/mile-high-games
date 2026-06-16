import type { GameMeta, RoomState } from '../../../shared/types.js';
import { getFibbageTruth, getTriviaAnswer, getTrueOrLieAnswer } from './loadContent.js';
import type { GameRules } from './gameRules.js';
import { pickRandom } from './loadContent.js';

type AwardFn = (room: RoomState, playerId: string, points: number) => void;

function playingIds(room: RoomState): string[] {
  const connected = room.players
    .filter((p) => p.connected)
    .sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
  const cap = room.maxPlayers || connected.length;
  return connected.slice(0, cap).map((p) => p.id);
}

type TriviaPlayerResult = {
  id: string;
  name: string;
  answer: string;
  correct: boolean;
  eliminated?: boolean;
};

function buildTriviaPlayerResults(
  room: RoomState,
  correct: string,
  opts?: { markEliminated?: boolean },
): TriviaPlayerResult[] {
  return playingIds(room).map((pid) => {
    const player = room.players.find((p) => p.id === pid);
    const raw = room.submissions[pid];
    const answer = raw !== undefined ? String(raw) : '(no answer)';
    const isCorrect = raw === correct;
    return {
      id: pid,
      name: player?.name ?? 'Unknown',
      answer,
      correct: isCorrect,
      ...(opts?.markEliminated && !isCorrect ? { eliminated: true } : {}),
    };
  });
}

function setTriviaRevealData(
  room: RoomState,
  correct: string,
  playerResults: TriviaPlayerResult[],
  extra?: Record<string, unknown>,
): void {
  room.revealData = {
    ...(room.revealData as object || {}),
    correctAnswer: correct,
    correctPlayers: playerResults.filter((r) => r.correct).map((r) => r.name),
    playerResults,
    ...extra,
  };
}

function scoreTriviaBool(room: RoomState, rules: GameRules, award: AwardFn): void {
  const isTrue = getTrueOrLieAnswer(room.prompt);
  const correctAnswer = isTrue ? 'TRUE' : 'LIE';
  const mult = room.round === room.totalRounds ? (rules.finalRoundMultiplier ?? 1) : 1;
  const minP = (rules.correctPointsMin ?? 500) * mult;
  const maxP = (rules.correctPointsMax ?? 500) * mult;
  const wrongP = rules.incorrectPoints ?? 0;
  const inputStart = room.inputStartedAt ?? Date.now();
  const inputWindow = rules.inputTimeMs;
  const correctIds: string[] = [];

  for (const [pid, ans] of Object.entries(room.submissions)) {
    if (ans === correctAnswer) correctIds.push(pid);
    else if (wrongP) award(room, pid, wrongP);
  }

  for (const pid of correctIds) {
    const elapsed = (room.submissionTimes[pid] ?? Date.now()) - inputStart;
    const speedRatio = Math.max(0, 1 - elapsed / inputWindow);
    award(room, pid, Math.round(minP + (maxP - minP) * speedRatio));
  }

  if (rules.speedBonus && correctIds.length > 0) {
    const fastest = correctIds.sort(
      (a, b) => (room.submissionTimes[a] ?? Infinity) - (room.submissionTimes[b] ?? Infinity),
    )[0];
    award(room, fastest, rules.speedBonus);
  }

  const correctLabel = isTrue ? 'TRUTH' : 'LIE';
  const playerResults = buildTriviaPlayerResults(room, correctAnswer).map((r) => ({
    ...r,
    answer: r.answer === 'TRUE' ? 'TRUTH' : r.answer === 'LIE' ? 'LIE' : r.answer,
  }));
  setTriviaRevealData(room, correctLabel, playerResults, { statement: room.prompt });
}

function scoreFibbage(room: RoomState, game: GameMeta, award: AwardFn): void {
  const truth = (room.revealData as { truth?: string })?.truth ?? getFibbageTruth(room.prompt);
  const roundMult = room.round === 1 ? 1 : room.round === 2 ? 2 : 3;
  const truthPts = 1000 * roundMult;
  const foolPts = 500 * roundMult;
  const halfFool = Math.floor(foolPts / 2);

  for (const [voter, choice] of Object.entries(room.votes)) {
    if (choice === '__truth__') award(room, voter, truthPts);
    else if (choice && choice !== voter) {
      const sub = room.submissions[choice];
      const usedLieForMe = typeof sub === 'string' && sub.startsWith('[LIE_FOR_ME]');
      award(room, choice, usedLieForMe ? halfFool : foolPts);
    }
  }

  room.revealData = { ...(room.revealData as object), truth, roundMult, thumbsCup: false };
}

function scoreWriteVote(room: RoomState, game: GameMeta, award: AwardFn): void {
  const roundMult = room.round === room.totalRounds ? 2 : 1;
  const base = game.id === 'quiplash-3' ? 1000 : game.id === 'joke-boat' ? 800 : 500;
  const voteCounts: Record<string, number> = {};
  for (const [, choice] of Object.entries(room.votes)) {
    if (choice && choice !== '__truth__') voteCounts[choice] = (voteCounts[choice] ?? 0) + 1;
  }
  for (const [target, count] of Object.entries(voteCounts)) {
    award(room, target, base * count * roundMult);
  }
}

function scoreTrivia(room: RoomState, game: GameMeta, award: AwardFn): void {
  if (game.id === 'time-jinx') {
    const correctYear = Number(getTriviaAnswer(room.prompt)) || 2000;
    for (const [pid, ans] of Object.entries(room.submissions)) {
      const guess = Number(String(ans).replace(/\D/g, '')) || 0;
      const distance = Math.abs(guess - correctYear);
      award(room, pid, distance);
    }
    room.revealData = {
      ...(room.revealData as object || {}),
      correctAnswer: String(correctYear),
      scoringNote: 'Lower is better (years off)',
      invertedScoring: true,
    };
    return;
  }

  if (game.id === 'guesspionage') {
    const correct = getTriviaAnswer(room.prompt);
    for (const [pid, ans] of Object.entries(room.submissions)) {
      if (ans === correct) award(room, pid, 1000);
      else award(room, pid, 250);
    }
    setTriviaRevealData(room, correct, buildTriviaPlayerResults(room, correct));
    return;
  }

  const correct = getTriviaAnswer(room.prompt);
  const pts = game.id === 'you-don-t-know-jack-full-stream' ? 2000 : 1000;
  for (const [pid, ans] of Object.entries(room.submissions)) {
    if (ans === correct) award(room, pid, pts);
  }
  setTriviaRevealData(room, correct, buildTriviaPlayerResults(room, correct));
}

function scoreTeamwork(room: RoomState, game: GameMeta, award: AwardFn): void {
  const choices = playingIds(room).map((id) => room.submissions[id]).filter((c) => c !== undefined);
  const unique = new Set(choices);
  const pts = game.id === 'the-devils-and-the-details' ? 1200 : game.id === 'zeeple-dome' ? 1500 : 800;
  if (unique.size === 1 && choices.length > 1) {
    for (const pid of playingIds(room)) {
      if (room.submissions[pid] !== undefined) award(room, pid, pts);
    }
  } else if (game.id === 'bomb-corp') {
    for (const pid of playingIds(room)) {
      if (room.submissions[pid] !== undefined) award(room, pid, 500);
    }
  }
}

function scoreHiddenTask(room: RoomState, award: AwardFn): void {
  for (const pid of playingIds(room)) {
    if (room.submissions[pid] !== undefined) award(room, pid, pickRandom([300, 500, 700]));
  }
}

function scoreRankSort(room: RoomState, game: GameMeta, award: AwardFn): void {
  const pts = game.id === 'split-the-room' ? 750 : 500;
  for (const pid of playingIds(room)) {
    if (room.submissions[pid] !== undefined) award(room, pid, pts);
  }
}

function scoreDrawGuess(room: RoomState, game: GameMeta, award: AwardFn): void {
  scoreWriteVote(room, game, award);
  for (const [voter, choice] of Object.entries(room.votes)) {
    const drawer = choice;
    if (drawer && room.submissions[drawer]) award(room, drawer, 250);
  }
}

export function scoreGameRound(
  room: RoomState,
  game: GameMeta,
  rules: GameRules,
  award: AwardFn,
): void {
  const arch = game.archetype;

  if (arch === 'trivia-bool') {
    scoreTriviaBool(room, rules, award);
  } else if (arch === 'fibbage') {
    scoreFibbage(room, game, award);
  } else if (arch === 'trivia' || arch === 'survival-trivia') {
    scoreTrivia(room, game, award);
    if (arch === 'survival-trivia') {
      const correct = getTriviaAnswer(room.prompt);
      const playerResults = buildTriviaPlayerResults(room, correct, { markEliminated: true });
      setTriviaRevealData(room, correct, playerResults);
    }
  } else if (['write-vote', 'pitch', 'finish-sentence', 'text-transform', 'word-chain', 'bracket', 'debate'].includes(arch)) {
    scoreWriteVote(room, game, award);
  } else if (arch === 'draw-guess' || arch === 'draw-bracket') {
    scoreDrawGuess(room, game, award);
  } else if (arch === 'teamwork') {
    scoreTeamwork(room, game, award);
  } else if (arch === 'hidden-task') {
    scoreHiddenTask(room, award);
  } else if (arch === 'rank' || arch === 'sort') {
    scoreRankSort(room, game, award);
  } else if (arch === 'role-label') {
    for (const pid of playingIds(room)) {
      if (room.submissions[pid] !== undefined) award(room, pid, 600);
    }
  } else {
    for (const pid of playingIds(room)) {
      if (room.submissions[pid] !== undefined) award(room, pid, pickRandom([200, 400, 600]));
    }
  }
}

export function finalizeLeaderboard(room: RoomState, game?: GameMeta | null): void {
  const inverted = (room.revealData as { invertedScoring?: boolean })?.invertedScoring
    || game?.id === 'time-jinx';
  const sorted = room.players
    .map((p) => ({ name: p.name, score: p.score }))
    .sort((a, b) => (inverted ? a.score - b.score : b.score - a.score));
  room.revealData = {
    ...(room.revealData as object || {}),
    leaderboard: sorted,
    invertedScoring: inverted,
  };
}

export function pickWinner(room: RoomState, game?: GameMeta | null): string | undefined {
  const lb = (room.revealData as { leaderboard?: { name: string; score: number }[] })?.leaderboard;
  return lb?.[0]?.name ?? room.players.sort((a, b) => b.score - a.score)[0]?.name;
}