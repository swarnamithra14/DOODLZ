import React, { useState, useEffect } from 'react';
import { Palette, Play, Server, Database, Radio, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { fetchHealthStatus } from '../services/api';

export function Home() {
  const { isConnected, socketId, latency, triggerPing } = useGame();
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [pingTesting, setPingTesting] = useState(false);

  const loadHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealthStatus();
      setHealthData(data);
    } catch (err) {
      console.warn('Failed to fetch backend health status:', err.message);
      setHealthData({ error: err.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, [isConnected]);

  const handleTestPing = async () => {
    setPingTesting(true);
    await triggerPing();
    setPingTesting(false);
  };

  return (
    <main className="main-content">
      <section className="hero-section">
        <div className="hero-tag">
          <Palette size={14} />
          <span>Real-Time Multiplayer Canvas</span>
        </div>
        <h1 className="hero-title">
          Draw. Guess. <span style={{ color: 'var(--accent-primary)' }}>Repeat.</span>
        </h1>
        <p className="hero-subtitle">
          DOODLZ is a real-time multiplayer drawing and guessing platform powered by an authoritative
          Node.js backend, Socket.IO rooms, and high-performance HTML5 canvas synchronization.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleTestPing} disabled={pingTesting}>
            <Radio size={18} />
            <span>{pingTesting ? 'Measuring Ping...' : 'Test Real-Time Socket Ping'}</span>
          </button>
          <button className="btn btn-secondary" onClick={loadHealth} disabled={loadingHealth}>
            <RefreshCw size={18} className={loadingHealth ? 'spin' : ''} />
            <span>Refresh Backend Status</span>
          </button>
        </div>
      </section>

      {/* Diagnostics / Foundation Dashboard */}
      <section className="grid-diagnostic">
        {/* Socket.IO Real-Time Engine Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Radio size={20} color="var(--accent-primary)" />
              <span>Real-Time Socket Engine</span>
            </div>
            {isConnected ? (
              <CheckCircle2 size={18} color="var(--success)" />
            ) : (
              <AlertCircle size={18} color="var(--danger)" />
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Bi-directional WebSocket connection with authoritative server rooms.
          </p>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
            <div><strong>Status:</strong> {isConnected ? 'Connected' : 'Connecting / Offline'}</div>
            <div><strong>Socket ID:</strong> {socketId || '—'}</div>
            <div><strong>Round-trip Latency:</strong> {latency !== null ? `${latency} ms` : 'Not tested yet'}</div>
          </div>
        </div>

        {/* Authoritative Node/Express Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Server size={20} color="var(--accent-secondary)" />
              <span>Authoritative Server</span>
            </div>
            {healthData?.status === 'ok' ? (
              <CheckCircle2 size={18} color="var(--success)" />
            ) : (
              <AlertCircle size={18} color="var(--warning)" />
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Server-side word management, room lifecycle, score computation, and timers.
          </p>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
            <div><strong>Service:</strong> {healthData?.service || 'Connecting...'}</div>
            <div><strong>Uptime:</strong> {healthData?.uptimeSeconds !== undefined ? `${healthData.uptimeSeconds}s` : '—'}</div>
            <div><strong>Active Rooms:</strong> {healthData?.stats?.activeRooms ?? 0}</div>
          </div>
        </div>

        {/* MySQL Database Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Database size={20} color="var(--accent-accent)" />
              <span>MySQL Persistence</span>
            </div>
            {healthData?.database?.connected ? (
              <CheckCircle2 size={18} color="var(--success)" />
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>Graceful Standby</span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Pooled connection via <code style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: 4 }}>mysql2</code> for persistent leaderboards and match records.
          </p>
          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
            <div><strong>Host:</strong> {healthData?.database?.host || 'localhost'}:{healthData?.database?.port || 3306}</div>
            <div><strong>Database:</strong> {healthData?.database?.database || 'doodlz'}</div>
            <div>
              <strong>Pool Status:</strong>{' '}
              {healthData?.database?.connected ? (
                <span style={{ color: 'var(--success)' }}>Connected</span>
              ) : (
                <span style={{ color: 'var(--warning)' }}>Waiting for local MySQL service</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
