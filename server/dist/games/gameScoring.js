import { getFibbageTruth, getTriviaAnswer, getTrueOrLieAnswer } from './loadContent.js';
import { pickRandom } from './loadContent.js';
function playingIds(room) {
    const connected = room.players
        .filter((p) => p.connected)
        .sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0));
    const cap = room.maxPlayers || connected.length;
    return connected.slice(0, cap).map((p) => p.id);
}
function scoreTriviaBool(room, rules, award) {
    const isTrue = getTrueOrLieAnswer(room.prompt);
    const correctAnswer = isTrue ? 'TRUE' : 'LIE';
    const mult = room.round === room.totalRounds ? (rules.finalRoundMultiplier ?? 1) : 1;
    const minP = (rules.correctPointsMin ?? 500) * mult;
    const maxP = (rules.correctPointsMax ?? 500) * mult;
    const wrongP = rules.incorrectPoints ?? 0;
    const inputStart = room.inputStartedAt ?? Date.now();
    const inputWindow = rules.inputTimeMs;
    const correctIds = [];
    for (const [pid, ans] of Object.entries(room.submissions)) {
        if (ans === correctAnswer)
            correctIds.push(pid);
        else if (wrongP)
            award(room, pid, wrongP);
    }
    for (const pid of correctIds) {
        const elapsed = (room.submissionTimes[pid] ?? Date.now()) - inputStart;
        const speedRatio = Math.max(0, 1 - elapsed / inputWindow);
        award(room, pid, Math.round(minP + (maxP - minP) * speedRatio));
    }
    if (rules.speedBonus && correctIds.length > 0) {
        const fastest = correctIds.sort((a, b) => (room.submissionTimes[a] ?? Infinity) - (room.submissionTimes[b] ?? Infinity))[0];
        award(room, fastest, rules.speedBonus);
    }
    const correctLabel = isTrue ? 'TRUTH' : 'LIE';
    room.revealData = {
        ...(room.revealData || {}),
        correctAnswer: correctLabel,
        statement: room.prompt,
        correctPlayers: correctIds.map((id) => room.players.find((p) => p.id === id)?.name).filter(Boolean),
    };
}
function scoreFibbage(room, game, award) {
    const truth = room.revealData?.truth ?? getFibbageTruth(room.prompt);
    const roundMult = room.round === 1 ? 1 : room.round === 2 ? 2 : 3;
    const truthPts = 1000 * roundMult;
    const foolPts = 500 * roundMult;
    const halfFool = Math.floor(foolPts / 2);
    for (const [voter, choice] of Object.entries(room.votes)) {
        if (choice === '__truth__')
            award(room, voter, truthPts);
        else if (choice && choice !== voter) {
            const sub = room.submissions[choice];
            const usedLieForMe = typeof sub === 'string' && sub.startsWith('[LIE_FOR_ME]');
            award(room, choice, usedLieForMe ? halfFool : foolPts);
        }
    }
    room.revealData = { ...room.revealData, truth, roundMult, thumbsCup: false };
}
function scoreWriteVote(room, game, award) {
    const roundMult = room.round === room.totalRounds ? 2 : 1;
    const base = game.id === 'quiplash-3' ? 1000 : game.id === 'joke-boat' ? 800 : 500;
    const voteCounts = {};
    for (const [, choice] of Object.entries(room.votes)) {
        if (choice && choice !== '__truth__')
            voteCounts[choice] = (voteCounts[choice] ?? 0) + 1;
    }
    for (const [target, count] of Object.entries(voteCounts)) {
        award(room, target, base * count * roundMult);
    }
}
function scoreTrivia(room, game, award) {
    if (game.id === 'time-jinx') {
        const correctYear = Number(getTriviaAnswer(room.prompt)) || 2000;
        for (const [pid, ans] of Object.entries(room.submissions)) {
            const guess = Number(String(ans).replace(/\D/g, '')) || 0;
            const distance = Math.abs(guess - correctYear);
            award(room, pid, distance);
        }
        room.revealData = {
            ...(room.revealData || {}),
            correctAnswer: String(correctYear),
            scoringNote: 'Lower is better (years off)',
            invertedScoring: true,
        };
        return;
    }
    if (game.id === 'guesspionage') {
        const correct = getTriviaAnswer(room.prompt);
        for (const [pid, ans] of Object.entries(room.submissions)) {
            if (ans === correct)
                award(room, pid, 1000);
            else
                award(room, pid, 250);
        }
        return;
    }
    const correct = getTriviaAnswer(room.prompt);
    const pts = game.id === 'you-don-t-know-jack-full-stream' ? 2000 : 1000;
    for (const [pid, ans] of Object.entries(room.submissions)) {
        if (ans === correct)
            award(room, pid, pts);
    }
}
function scoreTeamwork(room, game, award) {
    const choices = playingIds(room).map((id) => room.submissions[id]).filter((c) => c !== undefined);
    const unique = new Set(choices);
    const pts = game.id === 'the-devils-and-the-details' ? 1200 : game.id === 'zeeple-dome' ? 1500 : 800;
    if (unique.size === 1 && choices.length > 1) {
        for (const pid of playingIds(room)) {
            if (room.submissions[pid] !== undefined)
                award(room, pid, pts);
        }
    }
    else if (game.id === 'bomb-corp') {
        for (const pid of playingIds(room)) {
            if (room.submissions[pid] !== undefined)
                award(room, pid, 500);
        }
    }
}
function scoreHiddenTask(room, award) {
    for (const pid of playingIds(room)) {
        if (room.submissions[pid] !== undefined)
            award(room, pid, pickRandom([300, 500, 700]));
    }
}
function scoreRankSort(room, game, award) {
    const pts = game.id === 'split-the-room' ? 750 : 500;
    for (const pid of playingIds(room)) {
        if (room.submissions[pid] !== undefined)
            award(room, pid, pts);
    }
}
function scoreDrawGuess(room, game, award) {
    scoreWriteVote(room, game, award);
    for (const [voter, choice] of Object.entries(room.votes)) {
        const drawer = choice;
        if (drawer && room.submissions[drawer])
            award(room, drawer, 250);
    }
}
export function scoreGameRound(room, game, rules, award) {
    const arch = game.archetype;
    if (arch === 'trivia-bool') {
        scoreTriviaBool(room, rules, award);
    }
    else if (arch === 'fibbage') {
        scoreFibbage(room, game, award);
    }
    else if (arch === 'trivia' || arch === 'survival-trivia') {
        scoreTrivia(room, game, award);
        if (arch === 'survival-trivia') {
            const correct = getTriviaAnswer(room.prompt);
            for (const [pid, ans] of Object.entries(room.submissions)) {
                if (ans !== correct) {
                    const data = (room.revealData || {});
                    data[pid] = 'eliminated';
                    room.revealData = data;
                }
            }
        }
    }
    else if (['write-vote', 'pitch', 'finish-sentence', 'text-transform', 'word-chain', 'bracket', 'debate'].includes(arch)) {
        scoreWriteVote(room, game, award);
    }
    else if (arch === 'draw-guess' || arch === 'draw-bracket') {
        scoreDrawGuess(room, game, award);
    }
    else if (arch === 'teamwork') {
        scoreTeamwork(room, game, award);
    }
    else if (arch === 'hidden-task') {
        scoreHiddenTask(room, award);
    }
    else if (arch === 'rank' || arch === 'sort') {
        scoreRankSort(room, game, award);
    }
    else if (arch === 'role-label') {
        for (const pid of playingIds(room)) {
            if (room.submissions[pid] !== undefined)
                award(room, pid, 600);
        }
    }
    else {
        for (const pid of playingIds(room)) {
            if (room.submissions[pid] !== undefined)
                award(room, pid, pickRandom([200, 400, 600]));
        }
    }
}
export function finalizeLeaderboard(room, game) {
    const inverted = room.revealData?.invertedScoring
        || game?.id === 'time-jinx';
    const sorted = room.players
        .map((p) => ({ name: p.name, score: p.score }))
        .sort((a, b) => (inverted ? a.score - b.score : b.score - a.score));
    room.revealData = {
        ...(room.revealData || {}),
        leaderboard: sorted,
        invertedScoring: inverted,
    };
}
export function pickWinner(room, game) {
    const lb = room.revealData?.leaderboard;
    return lb?.[0]?.name ?? room.players.sort((a, b) => b.score - a.score)[0]?.name;
}
