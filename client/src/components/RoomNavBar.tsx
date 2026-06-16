import type { RoomState } from '../types';

interface Props {
  room: RoomState;
  onChangeGame: () => void;
  onEndGame: () => void;
  onLeaveRoom: () => void;
  onStopHosting: () => void;
}

export function RoomNavBar({ room, onChangeGame, onEndGame, onLeaveRoom, onStopHosting }: Props) {
  const isHost = room.isHostView;
  const inLobby = room.phase === 'lobby';
  const inGame = !inLobby && room.phase !== 'ended';
  const hasGame = Boolean(room.gameId);

  let label: string | null = null;
  let action: (() => void) | null = null;
  let testId: string | null = null;

  if (isHost && inLobby && hasGame) {
    label = '← Change game';
    action = onChangeGame;
    testId = 'change-game-btn';
  } else if (isHost && inGame) {
    label = '← End game';
    action = onEndGame;
    testId = 'end-game-btn';
  } else if (isHost && inLobby && !hasGame) {
    label = '← Stop hosting';
    action = onStopHosting;
    testId = 'stop-hosting-btn';
  } else if (!isHost) {
    label = '← Leave room';
    action = onLeaveRoom;
    testId = 'leave-room-btn';
  }

  if (!label || !action) return null;

  const handleClick = () => {
    if (isHost && inGame) {
      const ok = window.confirm(
        'End the current game and return to game selection? Scores will reset and players will wait for a new game.',
      );
      if (!ok) return;
    } else if (!isHost && inGame) {
      const ok = window.confirm('Leave this room? You can rejoin later with the same name and room code.');
      if (!ok) return;
    } else if (isHost && label === '← Stop hosting') {
      const ok = window.confirm('Stop hosting and close this room for all players?');
      if (!ok) return;
    }
    action();
  };

  return (
    <nav className="room-nav" aria-label="Room navigation">
      <button type="button" className="room-nav-btn" onClick={handleClick} data-testid={testId}>
        {label}
      </button>
    </nav>
  );
}