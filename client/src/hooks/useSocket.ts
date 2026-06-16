import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { RoomState } from '../types';
import { clearSession, loadSession, saveSession } from '../utils/session';

function getServerUrl(): string {
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;
  const { protocol, hostname } = window.location;
  if (import.meta.env.DEV) return `${protocol}//${hostname}:3001`;
  return window.location.origin;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejoinReady, setRejoinReady] = useState(false);
  const rejoinAttempted = useRef(false);

  const emit = useCallback(<T,>(event: string, data?: unknown): Promise<T> => {
    return new Promise((resolve) => {
      socketRef.current?.emit(event, data, resolve);
    });
  }, []);

  const attemptRejoin = useCallback(async () => {
    const saved = loadSession();
    if (!saved) {
      setRejoinReady(true);
      return;
    }
    const res = await emit<{
      ok: boolean;
      code?: string;
      role?: 'host' | 'player';
      hostToken?: string;
      error?: string;
    }>('room:rejoin', {
      code: saved.code,
      role: saved.role,
      playerName: saved.playerName,
      hostToken: saved.hostToken,
    });
    if (res.ok) {
      if (res.role === 'host' && res.hostToken) {
        saveSession({ role: 'host', code: res.code!, hostToken: res.hostToken });
      } else if (saved.playerName) {
        saveSession({ role: 'player', code: res.code!, playerName: saved.playerName });
      }
    } else {
      clearSession();
      setError(res.error || 'Could not restore session');
    }
    setRejoinReady(true);
  }, [emit]);

  useEffect(() => {
    const socket = io(getServerUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (!rejoinAttempted.current) {
        rejoinAttempted.current = true;
        attemptRejoin();
      }
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('room:update', (state: RoomState) => {
      setRoom(state);
      if (state.isHostView && state.hostToken) {
        saveSession({ role: 'host', code: state.code, hostToken: state.hostToken });
      } else if (state.playerId) {
        const me = state.players.find((p) => p.id === state.playerId);
        if (me) saveSession({ role: 'player', code: state.code, playerName: me.name });
      }
    });
    socket.on('room:closed', () => {
      setRoom(null);
      clearSession();
      setError('Room closed — the host disconnected.');
    });

    return () => {
      socket.disconnect();
    };
  }, [attemptRejoin]);

  const createRoom = useCallback(async () => {
    setError(null);
    const res = await emit<{ ok: boolean; code?: string; hostToken?: string; error?: string }>('room:create', {});
    if (!res.ok) setError(res.error || 'Failed to create room');
    else if (res.code && res.hostToken) {
      saveSession({ role: 'host', code: res.code, hostToken: res.hostToken });
    }
    return res;
  }, [emit]);

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    setError(null);
    const res = await emit<{ ok: boolean; code?: string; error?: string }>('room:join', { code, playerName });
    if (!res.ok) setError(res.error || 'Failed to join');
    else saveSession({ role: 'player', code, playerName });
    return res;
  }, [emit]);

  const selectGame = useCallback((gameId: string) => {
    socketRef.current?.emit('game:select', { gameId });
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('game:start');
  }, []);

  const submit = useCallback((value: unknown) => {
    socketRef.current?.emit('game:submit', { value });
  }, []);

  const vote = useCallback((targetId: string) => {
    socketRef.current?.emit('game:vote', { targetId });
  }, []);

  const skipPhase = useCallback(() => {
    socketRef.current?.emit('game:skip');
  }, []);

  const backToLobby = useCallback(() => {
    socketRef.current?.emit('room:back-to-lobby');
  }, []);

  const leaveRoom = useCallback(async () => {
    setError(null);
    const res = await emit<{ ok: boolean; error?: string }>('room:leave', {});
    clearSession();
    setRoom(null);
    if (!res.ok) setError(res.error || 'Could not leave room');
    return res;
  }, [emit]);

  const stopHosting = useCallback(async () => {
    setError(null);
    const res = await emit<{ ok: boolean; error?: string }>('room:end-hosting', {});
    clearSession();
    setRoom(null);
    if (!res.ok) setError(res.error || 'Could not end hosting');
    return res;
  }, [emit]);

  return {
    connected,
    room,
    error,
    setError,
    rejoinReady,
    createRoom,
    joinRoom,
    selectGame,
    startGame,
    submit,
    vote,
    skipPhase,
    backToLobby,
    leaveRoom,
    stopHosting,
  };
}