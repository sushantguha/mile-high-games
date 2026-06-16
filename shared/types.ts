export type GamePhase =
  | 'lobby'
  | 'prompt'
  | 'input'
  | 'reveal'
  | 'vote'
  | 'results'
  | 'ended';

export type GameArchetype =
  | 'write-vote'
  | 'fibbage'
  | 'draw-guess'
  | 'trivia'
  | 'trivia-bool'
  | 'hidden-task'
  | 'teamwork'
  | 'audio-pick'
  | 'bracket'
  | 'word-chain'
  | 'rank'
  | 'sort'
  | 'debate'
  | 'role-label'
  | 'survival-trivia'
  | 'draw-bracket'
  | 'finish-sentence'
  | 'text-transform'
  | 'pitch';

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
  archetype: GameArchetype;
  description: string;
  enabled: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  joinedAt?: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  hostName: string;
  hostToken: string;
  maxPlayers: number;
  players: Player[];
  gameId: string | null;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  subRound: number;
  subRoundsPerRound: number;
  prompt: string;
  subPrompt?: string;
  options?: string[];
  submissions: Record<string, unknown>;
  submissionTimes: Record<string, number>;
  votes: Record<string, string>;
  scores: Record<string, number>;
  revealData?: unknown;
  timerEndsAt?: number;
  timerStartedAt?: number;
  inputStartedAt?: number;
  audienceVotes?: Record<string, string>;
}

export interface ClientAction {
  type: 'submit' | 'vote' | 'ready' | 'kick' | 'start' | 'next';
  payload?: unknown;
}