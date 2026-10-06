import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Play,
  Users,
  Timer,
  MessageSquare,
  Trophy,
  HelpCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export function Home() {
  const { isConnected, latency } = useGame();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <main className="main-content">
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Real-Time Multiplayer Canvas</span>
        </div>

        <h1 className="hero-title-main">
          Draw. Guess. <span className="hero-gradient">Repeat.</span>
        </h1>

        <p className="hero-lead">
          Draw it. Your friends guess it. Race the authoritative clock.
          A modern, high-performance drawing arena built for real-time multiplayer excitement.
        </p>

        <div className="hero-actions">
          <Link to="/lobby?mode=create" className="btn btn-primary btn-lg">
            <Play size={18} />
            <span>Create Game</span>
          </Link>
          <Link to="/lobby?mode=join" className="btn btn-secondary btn-lg">
            <Users size={18} />
            <span>Join Game</span>
          </Link>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => setShowHowToPlay(true)}
          >
            <HelpCircle size={18} />
            <span>How to Play</span>
          </button>
        </div>

        {/* Server Status Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>
            {isConnected
              ? `Live Engine Connected (${latency !== null ? `${latency}ms` : 'Ready'})`
              : 'Connecting to Authoritative Server...'}
          </span>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <Users size={22} />
          </div>
          <h2 className="feature-title">Real-Time Multiplayer</h2>
          <p className="feature-desc">
            Connect instantly with up to 8 players per room. Authoritative server rooms guarantee zero desync and cheat protection.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: 'var(--accent-secondary-light)', color: 'var(--accent-secondary)' }}>
            <Timer size={22} />
          </div>
          <h2 className="feature-title">Timed Drawing Rounds</h2>
          <p className="feature-desc">
            Configurable 45 to 90-second rounds. Server-synchronized clocks keep all participants on the exact same second.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <MessageSquare size={22} />
          </div>
          <h2 className="feature-title">Instant Live Guessing</h2>
          <p className="feature-desc">
            Type guesses directly into the real-time chat stream. Correct guesses are highlighted instantly while keeping secret words hidden.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <Trophy size={22} />
          </div>
          <h2 className="feature-title">Speed-Weighted Scoring</h2>
          <p className="feature-desc">
            Fast answers earn maximum points. Drawers earn bonus score multipliers when other players guess their sketches correctly.
          </p>
        </div>
      </section>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="modal-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={22} color="var(--accent-primary)" />
                <h2>How to Play DOODLZ</h2>
              </div>
              <button
                className="tool-btn"
                onClick={() => setShowHowToPlay(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Create or Join a Room:</strong> Host a new room with custom round counts and timers, or paste a room code to join friends.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Take Turns Drawing:</strong> In each round, one player is chosen as the drawer. Only the drawer sees the secret word and gets drawing tools.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Race to Guess:</strong> Guessers type answers into the chat. Fast answers earn speed bonuses.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  4
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Climb the Leaderboard:</strong> After all rounds conclude, the final podium reveals 1st, 2nd, and 3rd place champions!
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowHowToPlay(false)}>
                <span>Got It! Let's Play</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
