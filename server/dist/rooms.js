/** Letters only (no I/O to avoid confusion). */
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export function generateRoomCode() {
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return code;
}
export function generateHostToken() {
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
    }
    return token;
}
export function createRoom(hostId) {
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
export function addPlayer(room, id, name) {
    if (room.players.length >= room.maxPlayers)
        return null;
    if (room.players.some((p) => p.name.toLowerCase() === name.toLowerCase()))
        return null;
    const player = { id, name, score: 0, connected: true, joinedAt: Date.now() };
    room.players.push(player);
    return player;
}
export function reconnectPlayer(room, oldId, newId) {
    const player = room.players.find((p) => p.id === oldId);
    if (!player)
        return null;
    migratePlayerId(room, oldId, newId);
    player.id = newId;
    player.connected = true;
    return player;
}
export function reconnectPlayerByName(room, name, newId) {
    const player = room.players.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (!player)
        return null;
    const oldId = player.id;
    migratePlayerId(room, oldId, newId);
    player.id = newId;
    player.connected = true;
    return player;
}
export function migratePlayerId(room, oldId, newId) {
    if (oldId === newId)
        return;
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
    const rd = room.revealData;
    if (rd?.tasks && typeof rd.tasks === 'object') {
        const tasks = rd.tasks;
        if (tasks[oldId]) {
            tasks[newId] = tasks[oldId];
            delete tasks[oldId];
        }
    }
}
export function markPlayerDisconnected(room, playerId) {
    const player = room.players.find((p) => p.id === playerId);
    if (player)
        player.connected = false;
}
export function removePlayer(room, playerId) {
    room.players = room.players.filter((p) => p.id !== playerId);
    delete room.submissions[playerId];
    delete room.submissionTimes[playerId];
    delete room.votes[playerId];
    const rd = room.revealData;
    if (rd?.tasks && typeof rd.tasks === 'object') {
        delete rd.tasks[playerId];
    }
}
export function selectGame(room, gameId) {
    room.gameId = gameId;
}
export function resetForNewGame(room, totalRounds = 3) {
    room.phase = 'prompt';
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
export function publicRoomState(room, viewerId) {
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
function maskSubmissions(room, viewerId, isHost = false) {
    if (room.phase === 'reveal' || room.phase === 'results' || room.phase === 'ended') {
        return room.submissions;
    }
    if (room.phase === 'input') {
        if (isHost) {
            return Object.fromEntries(Object.keys(room.submissions).map((id) => [id, '__submitted__']));
        }
        if (!viewerId)
            return {};
        const mine = room.submissions[viewerId];
        return mine !== undefined ? { [viewerId]: mine } : {};
    }
    if (room.phase === 'vote' && viewerId) {
        const mine = room.submissions[viewerId];
        return mine ? { [viewerId]: mine } : {};
    }
    return {};
}
function maskVotes(room, viewerId) {
    if (room.phase !== 'vote')
        return room.votes;
    if (!viewerId)
        return {};
    const mine = room.votes[viewerId];
    return mine ? { [viewerId]: mine } : {};
}
function maskRevealData(room, viewerId, isHost = false) {
    if (!room.revealData || typeof room.revealData !== 'object')
        return room.revealData;
    const data = room.revealData;
    if (room.phase === 'input' && data.tasks && viewerId && !isHost) {
        const tasks = data.tasks;
        const mine = tasks[viewerId];
        return mine ? { tasks: { [viewerId]: mine } } : {};
    }
    return room.revealData;
}
