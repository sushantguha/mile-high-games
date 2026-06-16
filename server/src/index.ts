import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import type { RoomState } from '../../shared/types.js';
import { getAllGames } from './games/registry.js';
import {
  addPlayer,
  createRoom,
  markPlayerDisconnected,
  migratePlayerId,
  publicRoomState,
  reconnectPlayerByName,
  removePlayer,
  selectGame,
} from './rooms.js';
import { clearGameTimers, forceAdvance, handleSubmit, handleVote, setRoomNotifier, startGame } from './gameEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(cors());
app.use(express.json());

const games = getAllGames();
app.get('/api/games', (_req, res) => res.json(games));
app.get('/api/games/:id', (req, res) => {
  const game = games.find((g) => g.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Client not built. Run npm run build in client/' });
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const rooms = new Map<string, RoomState>();

setRoomNotifier((room) => {
  if (rooms.has(room.code)) emitRoom(room);
});

function emitRoom(room: RoomState) {
  io.to(room.hostId).emit('room:update', publicRoomState(room, room.hostId));
  for (const p of room.players) {
    if (p.connected) io.to(p.id).emit('room:update', publicRoomState(room, p.id));
  }
}

function closeRoom(code: string) {
  const room = rooms.get(code);
  if (!room) return;
  for (const p of room.players) {
    io.to(p.id).emit('room:closed', { reason: 'Host disconnected' });
  }
  rooms.delete(code);
}

function applyGameToRoom(room: RoomState, gameId: string) {
  const game = games.find((g) => g.id === gameId);
  if (!game?.enabled) return;
  selectGame(room, gameId);
  room.maxPlayers = Math.min(game.maxPlayers, 100);
}

io.on('connection', (socket) => {
  let currentRoom: string | null = null;
  let playerId = socket.id;

  socket.on('room:create', (_data: unknown, cb) => {
    const room = createRoom(socket.id);
    rooms.set(room.code, room);
    currentRoom = room.code;
    socket.join(room.code);
    cb?.({ ok: true, code: room.code, hostToken: room.hostToken, playerId: socket.id });
    emitRoom(room);
  });

  socket.on('room:rejoin', (
    { code, role, playerName, hostToken }: {
      code: string;
      role: 'host' | 'player';
      playerName?: string;
      hostToken?: string;
    },
    cb,
  ) => {
    const normalized = code.trim().toUpperCase();
    const room = rooms.get(normalized);
    if (!room) return cb?.({ ok: false, error: 'Room not found' });

    if (role === 'host') {
      if (!hostToken || hostToken !== room.hostToken) {
        return cb?.({ ok: false, error: 'Invalid host session' });
      }
      const oldHostId = room.hostId;
      room.hostId = socket.id;
      if (oldHostId !== socket.id) migratePlayerId(room, oldHostId, socket.id);
      currentRoom = room.code;
      playerId = socket.id;
      socket.join(room.code);
      cb?.({ ok: true, code: room.code, role: 'host', hostToken: room.hostToken });
      emitRoom(room);
      return;
    }

    if (!playerName?.trim()) {
      return cb?.({ ok: false, error: 'Name required' });
    }

    const existing = room.players.find(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase(),
    );

    if (existing) {
      const oldId = existing.id;
      reconnectPlayerByName(room, playerName.trim(), socket.id);
      if (oldId !== socket.id) socket.leave(room.code);
      currentRoom = room.code;
      playerId = socket.id;
      socket.join(room.code);
      cb?.({ ok: true, code: room.code, role: 'player', playerId: socket.id });
      emitRoom(room);
      return;
    }

    if (room.phase !== 'lobby' && room.phase !== 'ended') {
      const player = addPlayer(room, socket.id, playerName.trim());
      if (!player) return cb?.({ ok: false, error: 'Could not join (room full)' });
    } else {
      const player = addPlayer(room, socket.id, playerName.trim());
      if (!player) return cb?.({ ok: false, error: 'Could not join (room full or name taken)' });
    }

    currentRoom = room.code;
    playerId = socket.id;
    socket.join(room.code);
    cb?.({ ok: true, code: room.code, role: 'player', playerId: socket.id });
    emitRoom(room);
  });

  socket.on('room:join', ({ code, playerName }: { code: string; playerName: string }, cb) => {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(normalized)) {
      return cb?.({ ok: false, error: 'Room code must be 4 letters' });
    }
    const room = rooms.get(normalized);
    if (!room) return cb?.({ ok: false, error: 'Room not found' });

    const existing = room.players.find(
      (p) => p.name.toLowerCase() === (playerName || '').trim().toLowerCase(),
    );

    if (existing) {
      reconnectPlayerByName(room, playerName.trim(), socket.id);
      currentRoom = room.code;
      playerId = socket.id;
      socket.join(room.code);
      cb?.({ ok: true, code: room.code, playerId: socket.id, reconnected: true });
      emitRoom(room);
      return;
    }

    const player = addPlayer(room, socket.id, playerName || 'Player');
    if (!player) return cb?.({ ok: false, error: 'Could not join (room full or name taken)' });

    currentRoom = room.code;
    socket.join(room.code);
    cb?.({ ok: true, code: room.code, playerId: socket.id });
    emitRoom(room);
  });

  socket.on('game:select', ({ gameId }: { gameId: string }) => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room || room.hostId !== socket.id) return;
    applyGameToRoom(room, gameId);
    emitRoom(room);
  });

  socket.on('game:start', () => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room || room.hostId !== socket.id || !room.gameId) return;
    const game = games.find((g) => g.id === room.gameId);
    if (!game?.enabled) return;
    startGame(room);
    emitRoom(room);
  });

  socket.on('game:submit', ({ value }: { value: unknown }, cb) => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room) return cb?.({ ok: false, error: 'Not in a room — refresh or rejoin' });
    if (room.hostId === playerId) return cb?.({ ok: false, error: 'Host cannot submit answers' });
    if (!room.players.some((p) => p.id === playerId)) {
      return cb?.({ ok: false, error: 'Session expired — refresh the page' });
    }
    if (room.phase !== 'input') {
      return cb?.({ ok: false, error: 'Not accepting answers right now' });
    }
    if (!handleSubmit(room, playerId, value)) {
      return cb?.({ ok: false, error: 'Could not submit answer' });
    }
    emitRoom(room);
    cb?.({ ok: true });
  });

  socket.on('game:vote', ({ targetId }: { targetId: string }, cb) => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room) return cb?.({ ok: false, error: 'Not in a room — refresh or rejoin' });
    if (room.hostId === playerId) return cb?.({ ok: false, error: 'Host cannot vote' });
    if (!room.players.some((p) => p.id === playerId)) {
      return cb?.({ ok: false, error: 'Session expired — refresh the page' });
    }
    if (room.phase !== 'vote') {
      return cb?.({ ok: false, error: 'Not accepting votes right now' });
    }
    if (!handleVote(room, playerId, targetId)) {
      return cb?.({ ok: false, error: 'Could not cast vote' });
    }
    emitRoom(room);
    cb?.({ ok: true });
  });

  socket.on('game:skip', () => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room || room.hostId !== socket.id) return;
    forceAdvance(room);
    emitRoom(room);
  });

  socket.on('room:back-to-lobby', () => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room || room.hostId !== socket.id) return;
    clearGameTimers(room);
    room.phase = 'lobby';
    room.gameId = null;
    room.round = 0;
    room.subRound = 0;
    room.prompt = '';
    room.subPrompt = undefined;
    room.options = undefined;
    room.submissions = {};
    room.submissionTimes = {};
    room.votes = {};
    room.revealData = undefined;
    room.timerEndsAt = undefined;
    room.timerStartedAt = undefined;
    room.inputStartedAt = undefined;
    room.audienceVotes = {};
    for (const p of room.players) p.score = 0;
    emitRoom(room);
  });

  socket.on('room:leave', (_data: unknown, cb) => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room) return cb?.({ ok: false, error: 'Not in a room' });
    if (room.hostId === playerId) {
      return cb?.({ ok: false, error: 'Host cannot leave — use Stop hosting or Change game' });
    }
    removePlayer(room, playerId);
    socket.leave(room.code);
    currentRoom = null;
    cb?.({ ok: true });
    emitRoom(room);
  });

  socket.on('room:end-hosting', (_data: unknown, cb) => {
    const room = currentRoom ? rooms.get(currentRoom) : null;
    if (!room || room.hostId !== socket.id) {
      return cb?.({ ok: false, error: 'Not the host' });
    }
    const code = room.code;
    clearGameTimers(room);
    closeRoom(code);
    socket.leave(code);
    currentRoom = null;
    cb?.({ ok: true });
  });

  socket.on('disconnect', () => {
    if (!currentRoom) return;
    const room = rooms.get(currentRoom);
    if (!room) return;

    if (room.hostId === playerId) {
      return;
    }

    markPlayerDisconnected(room, playerId);
    emitRoom(room);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Mile High Games server running on http://0.0.0.0:${PORT}`);
  console.log(`Loaded ${games.length} games`);
});