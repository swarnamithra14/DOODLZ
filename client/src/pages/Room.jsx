import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Crown,
  Play,
  Share2,
  Users,
  LogOut,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';

// Avatar background colors
const AVATAR_COLORS = [
  '#6366F1', '#EC4899', '#06B6D4', '#10B981',
  '#F59E0B', '#8B5CF6', '#3B82F6', '#EF4444'
];

export function Room() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get('host') === 'true';
  const navigate = useNavigate();
  const { playerName } = useGame();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Default connected player roster (ready for socket state in Phase 5)
  const [players, setPlayers] = useState([
    {
      id: 'p1',
      name: playerName || (isHost ? 'HostPlayer' : 'GuestPlayer'),
      isHost: isHost,
      color: AVATAR_COLORS[0],
    },
    {
      id: 'p2',
      name: isHost ? 'Alex' : 'RoomHost',
      isHost: !isHost,
      color: AVATAR_COLORS[1],
    },
  ]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/room/${roomId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartGame = () => {
    navigate(`/game/${roomId}`);
  };

  const handleLeaveRoom = () => {
    navigate('/lobby');
  };

  return (
    <main className="main-content">
      <div className="room-container">
        {/* Room Header Card */}
        <div className="room-header-card">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Game Room
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
              <div className="room-code-badge">
                <span className="room-code-text">{roomId}</span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleCopyCode}
                  title="Copy Room Code"
                  style={{ padding: '0.35rem 0.6rem' }}
                >
                  {copiedCode ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCopyLink}
                title="Copy Invite Link"
              >
                {copiedLink ? <Check size={14} color="var(--success)" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-danger btn-sm" onClick={handleLeaveRoom}>
              <LogOut size={14} />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Players Section */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Users size={18} color="var(--accent-primary)" />
              <span>Connected Players ({players.length}/8)</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Min 2 players required to begin
            </span>
          </div>

          <div className="players-grid">
            {players.map((p, idx) => (
              <div key={p.id} className={`player-card ${p.isHost ? 'is-host' : ''}`}>
                {p.isHost && (
                  <span className="host-badge-pill">
                    <Crown size={10} /> Host
                  </span>
                )}
                <div className="avatar-circle" style={{ background: p.color || AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="player-name">{p.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginTop: '2px' }}>
                  ● Ready
                </span>
              </div>
            ))}
          </div>

          {/* Room Match Settings Summary */}
          <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--bg-tertiary)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={15} color="var(--accent-primary)" />
              <span><strong>Rounds:</strong> 3 Rounds</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} color="var(--accent-primary)" />
              <span><strong>Duration:</strong> 60s per turn</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} color="var(--accent-primary)" />
              <span><strong>Difficulty:</strong> Medium</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
          {isHost ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                You are the room host. When all players are ready, launch the game!
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleStartGame}
                disabled={players.length < 2}
                style={{ minWidth: '220px' }}
              >
                <Play size={18} />
                <span>Start Game</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                <span className="status-dot connected" style={{ animation: 'pulse-danger 1s infinite alternate' }} />
                <span>Waiting for the host to start the game...</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                The drawing canvas and secret word rotation will begin automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Room;
