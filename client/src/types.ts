export type GamePhase =
  | 'lobby'
  | 'prompt'
  | 'input'
  | 'reveal'
  | 'vote'
  | 'results'
  | 'ended';

export interface GameMeta {
  id: string;
  title: string;
  pack: string;
  minPlayers: number;
  maxPlayers: number;
  length: string;
  familyFriendly: boolean;
  audience: boolean;
  gameType: string;
  secondaryType: string;
  archetype: string;
  description: string;
  enabled: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}

export interface RoomState {
  code: string;
  hostId: string;
  hostName: string;
  hostToken?: string;
  maxPlayers?: number;
  players: Player[];
  gameId: string | null;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  subRound?: number;
  subRoundsPerRound?: number;
  prompt: string;
  subPrompt?: string;
  options?: string[];
  submissions: Record<string, unknown>;
  votes: Record<string, string>;
  scores: Record<string, number>;
  revealData?: RevealData;
  timerEndsAt?: number;
  timerStartedAt?: number;
  playerId?: string;
  isHostView?: boolean;
}

export interface RevealData {
  entries?: { id: string; playerName: string; content: unknown }[];
  pairs?: { a: string; b: string; contentA: unknown; contentB: unknown }[];
  tasks?: Record<string, string>;
  truth?: string;
  correctAnswer?: string;
  statement?: string;
  correctPlayers?: string[];
  leaderboard?: { name: string; score: number }[];
  winner?: string;
}