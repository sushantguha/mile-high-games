import type { GamePhase, Player, RoomState } from '../../shared/types.js';

/** Letters only (no I/O to avoid confusion). */
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function generateHostToken(): string {
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return token;
}

export function createRoom(hostId: string): RoomState {
  return {
    code: generateRoomCode(),
    hostId,
    hostName: 'Game Host',
    hostToken: generateHostToken(),
    maxPlayers: 10,
    players: [],
    gameId: null,
    phase: 'lobby',
    round: 0,
    totalRounds: 3,
    subRound: 0,
    subRoundsPerRound: 1,
    prompt: '',
    submissions: {},
    submissionTimes: {},
    votes: {},
    scores: {},
  };
}

export function addPlayer(room: RoomState, id: string, name: string): Player | null {
  if (room.players.length >= room.maxPlayers) return null;
  if (room.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return null;
  const player: Player = { id, name, score: 0, connected: true, joinedAt: Date.now() };
  room.players.push(player);
  return player;
}

export function reconnectPlayer(room: RoomState, oldId: string, newId: string): Player | null {
  const player = room.players.find((p) => p.id === oldId);
  if (!player) return null;
  migratePlayerId(room, oldId, newId);
  player.id = newId;
  player.connected = true;
  return player;
}

export function reconnectPlayerByName(room: RoomState, name: string, newId: string): Player | null {
  const player = room.players.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!player) return null;
  const oldId = player.id;
  migratePlayerId(room, oldId, newId);
  player.id = newId;
  player.connected = true;
  return player;
}

export function migratePlayerId(room: RoomState, oldId: string, newId: string): void {
  if (oldId === newId) return;
  if (room.submissions[oldId] !== undefined) {
    room.submissions[newId] = room.submissions[oldId];
    delete room.submissions[oldId];
  }
  if (room.submissionTimes[oldId] !== undefined) {
    room.submissionTimes[newId] = room.submissionTimes[oldId];
    delete room.submissionTimes[oldId];
  }
  if (room.votes[oldId] !== undefined) {
    room.votes[newId] = room.votes[oldId];
    delete room.votes[oldId];
  }
  const rd = room.revealData as Record<string, unknown> | undefined;
  if (rd?.tasks && typeof rd.tasks === 'object') {
    const tasks = rd.tasks as Record<string, string>;
    if (tasks[oldId]) {
      tasks[newId] = tasks[oldId];
      delete tasks[oldId];
    }
  }
}

export function markPlayerDisconnected(room: RoomState, playerId: string): void {
  const player = room.players.find((p) => p.id === playerId);
  if (player) player.connected = false;
}

export function removePlayer(room: RoomState, playerId: string): void {
  room.players = room.players.filter((p) => p.id !== playerId);
  delete room.submissions[playerId];
  delete room.submissionTimes[playerId];
  delete room.votes[playerId];
  const rd = room.revealData as Record<string, unknown> | undefined;
  if (rd?.tasks && typeof rd.tasks === 'object') {
    delete (rd.tasks as Record<string, string>)[playerId];
  }
}

export function selectGame(room: RoomState, gameId: string): void {
  room.gameId = gameId;
}

export function resetForNewGame(room: RoomState, totalRounds = 3): void {
  room.phase = 'prompt' as GamePhase;
  room.round = 1;
  room.totalRounds = totalRounds;
  room.subRound = 1;
  room.prompt = '';
  room.subPrompt = undefined;
  room.options = undefined;
  room.submissions = {};
  room.submissionTimes = {};
  room.votes = {};
  room.revealData = undefined;
  room.timerEndsAt = undefined;
  room.audienceVotes = {};
  for (const p of room.players) {
    p.score = 0;
  }
}

export function publicRoomState(room: RoomState, viewerId?: string) {
  const isHost = viewerId === room.hostId;
  return {
    ...room,
    hostToken: isHost ? room.hostToken : undefined,
    submissions: maskSubmissions(room, viewerId, isHost),
    votes: maskVotes(room, viewerId),
    revealData: maskRevealData(room, viewerId, isHost),
    isHostView: isHost,
    playerId: viewerId,
  };
}

function maskSubmissions(room: RoomState, viewerId?: string, isHost = false) {
  if (room.phase === 'reveal' || room.phase === 'results' || room.phase === 'ended') {
    return room.submissions;
  }
  if (room.phase === 'input') {
    if (isHost) {
      return Object.fromEntries(
        Object.keys(room.submissions).map((id) => [id, '__submitted__']),
      );
    }
    if (!viewerId) return {};
    const mine = room.submissions[viewerId];
    return mine !== undefined ? { [viewerId]: mine } : {};
  }
  if (room.phase === 'vote' && viewerId) {
    const mine = room.submissions[viewerId];
    return mine ? { [viewerId]: mine } : {};
  }
  return {};
}

function maskVotes(room: RoomState, viewerId?: string) {
  if (room.phase !== 'vote') return room.votes;
  if (!viewerId) return {};
  const mine = room.votes[viewerId];
  return mine ? { [viewerId]: mine } : {};
}

function maskRevealData(room: RoomState, viewerId?: string, isHost = false) {
  if (!room.revealData || typeof room.revealData !== 'object') return room.revealData;
  const data = room.revealData as Record<string, unknown>;
  if (room.phase === 'input' && data.tasks && viewerId && !isHost) {
    const tasks = data.tasks as Record<string, string>;
    const mine = tasks[viewerId];
    return mine ? { tasks: { [viewerId]: mine } } : {};
  }
  // Reveal/vote: answers are anonymous so players judge on merit, not who wrote them.
  if ((room.phase === 'reveal' || room.phase === 'vote') && Array.isArray(data.entries)) {
    const entries = (data.entries as { id: string; playerName?: string; content: unknown }[]).map(
      (e) => ({
        id: e.id,
        content: e.content,
        ...(e.playerName === 'The Truth' ? { playerName: 'The Truth' } : {}),
      }),
    );
    return { ...data, entries };
  }
  return room.revealData;
}