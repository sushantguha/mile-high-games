import { useEffect, useRef } from 'react';
import type { RoomState } from '../types';
import { playHostSound } from '../utils/hostSounds';

/** Plays synthesized stingers on the host screen only. */
export function useHostSounds(room: RoomState | null) {
  const prev = useRef<{
    phase?: string;
    playerCount?: number;
    submissionCount?: number;
    gameId?: string | null;
  }>({});

  useEffect(() => {
    if (!room?.isHostView) return;

    const p = prev.current;
    const subs = Object.keys(room.submissions).length;
    const players = room.players.filter((x) => x.connected).length;

    if (room.gameId && room.gameId !== p.gameId && room.phase === 'lobby') {
      playHostSound('select');
    }

    if (room.phase !== p.phase) {
      switch (room.phase) {
        case 'prompt':
          playHostSound(p.phase === 'lobby' ? 'start' : 'prompt');
          break;
        case 'input':
          playHostSound('phase');
          break;
        case 'reveal':
          playHostSound('reveal');
          break;
        case 'vote':
          playHostSound('vote');
          break;
        case 'results':
          playHostSound('correct');
          break;
        case 'ended':
          playHostSound('winner');
          break;
        case 'lobby':
          if (p.phase === 'ended') playHostSound('phase');
          break;
      }
    }

    if (players > (p.playerCount ?? 0)) {
      playHostSound('join');
    }

    if (subs > (p.submissionCount ?? 0) && room.phase === 'input') {
      playHostSound('submit');
    }

    if (room.phase === 'lobby' && p.phase === 'lobby' && room.gameId && !p.gameId) {
      /* game just selected in lobby — handled above */
    }

    p.phase = room.phase;
    p.playerCount = players;
    p.submissionCount = subs;
    p.gameId = room.gameId;
  }, [room]);
}