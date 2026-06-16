import multipleChoice from '../../../content/trivia/multiple-choice.json' with { type: 'json' };
import trueOrLie from '../../../content/trivia/true-or-lie.json' with { type: 'json' };
import drawingPrompts from '../../../content/drawing/prompts.json' with { type: 'json' };
import writeVotePrompts from '../../../content/write-vote/prompts.json' with { type: 'json' };
const MC_QUESTIONS = multipleChoice.questions;
const BOOL_STATEMENTS = trueOrLie.statements;
const DRAW_GUESS = drawingPrompts.drawGuess;
const SHIRT_DESIGNS = drawingPrompts.shirtDesigns;
const WV = writeVotePrompts;
/** Deterministic per-game offset so different games don't share the same prompt sequence. */
function gameOffset(gameId, size) {
    if (!gameId || size <= 0)
        return 0;
    let h = 0;
    for (let i = 0; i < gameId.length; i++) {
        h = (Math.imul(31, h) + gameId.charCodeAt(i)) >>> 0;
    }
    return h % size;
}
function poolIndex(baseIdx, gameId, size) {
    return (baseIdx + gameOffset(gameId, size)) % size;
}
export function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export function getPromptForGame(archetype, round, gameId) {
    const poolSize = getPoolSize(archetype);
    const idx = (round - 1) % poolSize;
    return getPromptByIndex(archetype, idx, gameId);
}
function getPoolSize(archetype) {
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
            return WV.fibbage.length;
        case 'word-chain':
            return WV.wordChain.length;
        case 'teamwork':
            return WV.teamwork.length;
        case 'hidden-task':
            return WV.hiddenTask.length;
        case 'bracket':
            return WV.bracket.length;
        case 'rank':
            return WV.rank.length;
        case 'sort':
            return WV.sort.length;
        case 'debate':
            return WV.debate.length;
        case 'role-label':
            return WV.roleLabel.length;
        case 'finish-sentence':
            return WV.finishSentence.length;
        case 'text-transform':
            return WV.textTransform.length;
        case 'pitch':
            return WV.pitch.length;
        default:
            return WV.quiplash.length;
    }
}
function getPromptByIndex(archetype, idx, gameId) {
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
            return WV.fibbage[poolIndex(idx, gameId, WV.fibbage.length)].prompt;
        case 'word-chain':
            return WV.wordChain[poolIndex(idx, gameId, WV.wordChain.length)];
        case 'teamwork':
            return WV.teamwork[poolIndex(idx, gameId, WV.teamwork.length)];
        case 'hidden-task':
            return WV.hiddenTask[poolIndex(idx, gameId, WV.hiddenTask.length)];
        case 'bracket':
            return WV.bracket[poolIndex(idx, gameId, WV.bracket.length)];
        case 'rank':
            return WV.rank[poolIndex(idx, gameId, WV.rank.length)];
        case 'sort':
            return WV.sort[poolIndex(idx, gameId, WV.sort.length)];
        case 'debate':
            return WV.debate[poolIndex(idx, gameId, WV.debate.length)];
        case 'role-label':
            return WV.roleLabel[poolIndex(idx, gameId, WV.roleLabel.length)];
        case 'finish-sentence':
            return WV.finishSentence[poolIndex(idx, gameId, WV.finishSentence.length)];
        case 'text-transform':
            return WV.textTransform[poolIndex(idx, gameId, WV.textTransform.length)];
        case 'pitch':
            return WV.pitch[poolIndex(idx, gameId, WV.pitch.length)];
        default:
            return WV.quiplash[poolIndex(idx, gameId, WV.quiplash.length)];
    }
}
export function getTriviaQuestion(prompt) {
    return MC_QUESTIONS.find((q) => q.question === prompt);
}
export function getTriviaAnswer(prompt) {
    return getTriviaQuestion(prompt)?.answer ?? 'Yes';
}
export function getTriviaOptions(prompt) {
    const q = getTriviaQuestion(prompt);
    if (!q)
        return ['Yes', 'No', 'Maybe', 'Probably'];
    const options = [q.answer, ...q.distractors];
    return options.sort(() => Math.random() - 0.5);
}
export function getTrueOrLieAnswer(prompt) {
    const stmt = BOOL_STATEMENTS.find((s) => s.text === prompt);
    return stmt?.isTrue ?? true;
}
export function getFibbageTruth(prompt) {
    const entry = WV.fibbage.find((f) => f.prompt === prompt);
    return entry?.truth ?? 'something weird';
}
export function getHiddenTasks(count) {
    const tasks = WV.hiddenTask;
    return Array.from({ length: count }, (_, i) => tasks[i % tasks.length]);
}
