/**
 * End-to-end smoke test for every enabled game.
 * Simulates host + 3 players over Socket.io (same protocol as the React client).
 */
import { io } from 'socket.io-client';

import fs from 'fs';
const SERVER = process.env.SERVER_URL || 'http://localhost:3001';
const LOG = process.env.LOG_FILE || 'test-log.txt';
function log(msg) {
  console.log(msg);
  if (LOG) fs.appendFileSync(LOG, msg + '\n');
}
const PLAYER_COUNT = 3;
const PHASE_TIMEOUT_MS = 12000;

const VOTE_ARCHETYPES = new Set([
  'write-vote', 'fibbage', 'draw-guess', 'draw-bracket', 'pitch',
  'finish-sentence', 'text-transform', 'word-chain', 'debate', 'bracket',
]);

const OPTION_ARCHETYPES = new Set([
  'trivia', 'survival-trivia', 'trivia-bool', 'teamwork', 'debate', 'role-label',
]);

function connect(id) {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER, { transports: ['websocket'], forceNew: true });
    const t = setTimeout(() => reject(new Error(`${id}: connect timeout`)), 5000);
    socket.on('connect', () => { clearTimeout(t); resolve(socket); });
    socket.on('connect_error', (e) => { clearTimeout(t); reject(e); });
  });
}

function emit(socket, event, data, needsAck = false) {
  if (needsAck) {
    return new Promise((resolve) => socket.emit(event, data, resolve));
  }
  socket.emit(event, data);
  return Promise.resolve({ ok: true });
}

function waitForPhase(getRoom, phase, timeout = PHASE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const room = getRoom();
      if (room?.phase === phase) return resolve(room);
      if (Date.now() - start > timeout) {
        return reject(new Error(`Timeout waiting for phase "${phase}", got "${room?.phase}"`));
      }
      setTimeout(check, 100);
    };
    check();
  });
}

function submissionFor(archetype, room, playerIndex) {
  if (OPTION_ARCHETYPES.has(archetype)) {
    const opts = room.options || [];
    return opts[playerIndex % opts.length] || opts[0] || 'Yes';
  }
  if (archetype === 'rank' || archetype === 'sort') {
    const items = room.options?.join(', ') || 'A, B, C';
    return items;
  }
  if (archetype === 'draw-guess' || archetype === 'draw-bracket') {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  }
  return `Test answer from player ${playerIndex + 1}`;
}

async function playOneRound(host, players, game) {
  const archetype = game.archetype;
  const getHostRoom = () => host._room;

  await emit(host, 'game:select', { gameId: game.id });
  await new Promise((r) => setTimeout(r, 200));
  if (getHostRoom()?.gameId !== game.id) throw new Error('Game not selected');

  await emit(host, 'game:start');
  await waitForPhase(getHostRoom, 'prompt', 5000);
  host.emit('game:skip');
  await waitForPhase(getHostRoom, 'input', 5000);

  const room = getHostRoom();
  for (let i = 0; i < players.length; i++) {
    if (players[i]._room?.phase !== 'input') {
      await waitForPhase(() => players[i]._room, 'input');
    }
    const val = submissionFor(archetype, players[i]._room || room, i);
    players[i].emit('game:submit', { value: val });
  }

  if (VOTE_ARCHETYPES.has(archetype)) {
    await waitForPhase(getHostRoom, 'vote', PHASE_TIMEOUT_MS);
    const voteRoom = getHostRoom();
    const entries = voteRoom?.revealData?.entries || [];
    const targetId = entries[0]?.id || voteRoom?.revealData?.pairs?.[0]?.a;
    if (!targetId) throw new Error('No vote targets in revealData');
    for (const p of players) {
      p.emit('game:vote', { targetId });
    }
  }

  await waitForPhase(getHostRoom, 'results', PHASE_TIMEOUT_MS);
  const hadPrompt = Boolean(getHostRoom()?.prompt);
  await emit(host, 'room:back-to-lobby');
  await waitForPhase(getHostRoom, 'lobby', 5000);
  return hadPrompt;
}

async function ensureRoom(host, players, created) {
  for (const s of [host, ...players]) {
    if (!s._listening) {
      s._room = null;
      s.on('room:update', (state) => { s._room = state; });
      s._listening = true;
    }
  }

  if (!created.value) {
    const res = await emit(host, 'room:create', {}, true);
    if (!res.ok) throw new Error('Failed to create room');
    await waitForPhase(() => host._room, 'lobby', 3000);
    const code = host._room.code;
    for (let i = 0; i < players.length; i++) {
      const joinRes = await emit(players[i], 'room:join', { code, playerName: `P${i + 1}` }, true);
      if (!joinRes.ok) throw new Error(`Player ${i + 1} failed to join: ${joinRes.error}`);
    }
    created.value = true;
    return;
  }

}

async function testGame(game, host, players, created) {
  await ensureRoom(host, players, created);

  const hadPrompt = await playOneRound(host, players, game);
  if (!hadPrompt) throw new Error('Round never showed a prompt');

  return { ok: true };
}

async function main() {
  log('Starting game tests...');
  const gamesRes = await fetch(`${SERVER}/api/games`);
  let games = await gamesRes.json();
  const limit = Number(process.argv[2] || process.env.GAME_LIMIT || 0);
  if (limit > 0) games = games.slice(0, limit);
  log(`Testing ${games.length} games`);

  log('Connecting host...');
  const host = await connect('host');
  log('Host connected');
  const players = [];
  for (let i = 0; i < PLAYER_COUNT; i++) {
    log(`Connecting player ${i + 1}...`);
    players.push(await connect(`player${i + 1}`));
    log(`Player ${i + 1} connected`);
  }

  const results = [];
  let failed = 0;
  const created = { value: false };

  for (const game of games) {
    log(`--- ${game.title} ---`);
    try {
      const result = await testGame(game, host, players, created);
      results.push({ id: game.id, title: game.title, archetype: game.archetype, ...result });
      log(`PASS  ${game.title} (${game.archetype})`);
    } catch (err) {
      failed++;
      results.push({ id: game.id, title: game.title, archetype: game.archetype, ok: false, error: err.message });
      log(`FAIL  ${game.title} (${game.archetype}): ${err.message}`);
      try {
        await emit(host, 'room:back-to-lobby');
        await waitForPhase(() => host._room, 'lobby', 3000);
      } catch { /* ignore recovery errors */ }
    }
  }

  host.disconnect();
  for (const p of players) p.disconnect();

  log(`\n${results.filter((r) => r.ok).length}/${games.length} passed, ${failed} failed`);
  if (failed > 0) {
    log('\nFailures:');
    for (const r of results.filter((r) => !r.ok)) {
      log(`  - ${r.title}: ${r.error}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});