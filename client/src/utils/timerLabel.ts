import type { GamePhase } from '../types';

export function getTimerLabel(phase: GamePhase): string {
  switch (phase) {
    case 'prompt':
      return 'Get ready';
    case 'input':
      return 'Answer now';
    case 'reveal':
      return 'Revealing answers';
    case 'vote':
      return 'Voting';
    case 'results':
      return 'Results';
    default:
      return 'Time left';
  }
}

export function phaseHasTimer(phase: GamePhase): boolean {
  return phase === 'prompt' || phase === 'input' || phase === 'reveal' || phase === 'vote' || phase === 'results';
}