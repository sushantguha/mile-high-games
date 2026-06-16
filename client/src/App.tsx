import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { Home } from './pages/Home';
import { RoomPage } from './pages/Room';
function AppRoutes() {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!socket.rejoinReady || !socket.connected) return;
    if (socket.room && location.pathname !== '/room') {
      navigate('/room', { replace: true });
    } else if (!socket.room && location.pathname === '/room') {
      navigate('/', { replace: true });
    }
  }, [socket.rejoinReady, socket.connected, socket.room, location.pathname, navigate]);

  if (!socket.rejoinReady) {
    return (
      <div className="loading-splash">
        <div className="loading-logo">🎲</div>
        <p className="loading-text">Mile High Games</p>
        <p className="loading-sub">Warming up the party...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            connected={socket.connected}
            error={socket.error}
            onCreateRoom={socket.createRoom}
            onJoinRoom={socket.joinRoom}
          />
        }
      />
      <Route
        path="/room"
        element={
          <RoomPage
            room={socket.room}
            connected={socket.connected}
            reconnecting={socket.reconnecting}
            error={socket.error}
            onClearError={() => socket.setError(null)}
            onSelectGame={socket.selectGame}
            onStart={socket.startGame}
            onSubmit={socket.submit}
            onVote={socket.vote}
            onSkip={socket.skipPhase}
            onBackToLobby={socket.backToLobby}
            onLeaveRoom={socket.leaveRoom}
            onStopHosting={socket.stopHosting}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}