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
  const roomRef = useRef<RoomState | null>(null);
  const rejoiningRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejoinReady, setRejoinReady] = useState(false);

  roomRef.current = room;

  const emit = useCallback(<T,>(event: string, data?: unknown): Promise<T> => {
    return new Promise((resolve) => {
      socketRef.current?.emit(event, data, resolve);
    });
  }, []);

  const attemptRejoin = useCallback(async () => {
    if (rejoiningRef.current) return;
    rejoiningRef.current = true;

    const saved = loadSession();
    if (!saved) {
      setRejoinReady(true);
      setReconnecting(false);
      rejoiningRef.current = false;
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
      setError(null);
      if (res.role === 'host' && res.hostToken) {
        saveSession({ role: 'host', code: res.code!, hostToken: res.hostToken });
      } else if (saved.playerName) {
        saveSession({ role: 'player', code: res.code!, playerName: saved.playerName });
      }
    } else {
      clearSession();
      setRoom(null);
      setError(res.error || 'Could not restore session');
    }

    setRejoinReady(true);
    setReconnecting(false);
    rejoiningRef.current = false;
  }, [emit]);

  const attemptRejoinRef = useRef(attemptRejoin);
  attemptRejoinRef.current = attemptRejoin;

  useEffect(() => {
    const socket = io(getServerUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (loadSession()) {
        setReconnecting(roomRef.current !== null);
        void attemptRejoinRef.current();
      } else {
        setRejoinReady(true);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
      if (roomRef.current) setReconnecting(true);
    });

    socket.on('room:update', (state: RoomState) => {
      setRoom(state);
      setReconnecting(false);
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
      setReconnecting(false);
      setError('Room closed — the host disconnected.');
    });

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!socket.connected || !loadSession()) return;
      if (roomRef.current) void attemptRejoinRef.current();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      socket.disconnect();
    };
  }, []);

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

  const submit = useCallback(async (value: unknown) => {
    const res = await emit<{ ok: boolean; error?: string }>('game:submit', { value });
    if (!res?.ok) {
      setError(res?.error || 'Could not submit answer — try again');
    }
    return res;
  }, [emit]);

  const vote = useCallback(async (targetId: string) => {
    const res = await emit<{ ok: boolean; error?: string }>('game:vote', { targetId });
    if (!res?.ok) {
      setError(res?.error || 'Could not cast vote — try again');
    }
    return res;
  }, [emit]);

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
    reconnecting,
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