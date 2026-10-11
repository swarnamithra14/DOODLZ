import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { getFirebaseStatus, testFirebaseConnection } from '../services/firebase.js';

export default function BackendStatusModal({ isOpen, onClose }) {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const status = getFirebaseStatus();

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testFirebaseConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 24, 36, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="doodle-card animate-pop"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          padding: '2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={24} color={status.configured ? '#10B981' : '#F59E0B'} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>
              Backend Status
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: '0.35rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Current State Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: status.configured ? '#ECFDF5' : '#FFFBEB',
            border: status.configured ? '2px solid #10B981' : '2px solid #F59E0B',
            marginBottom: '1.25rem'
          }}
        >
          {status.configured ? (
            <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={24} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: status.configured ? '#065F46' : '#B45309' }}>
              {status.configured ? 'Firebase Live & Configured' : 'Local Offline Mode (Default)'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', marginTop: '0.2rem' }}>
              {status.configured
                ? `Connected to Firebase project: ${status.projectId}`
                : 'Doodlz is running with the local in-memory game engine. Multiplayer across separate devices will become active once your Firebase keys are added.'}
            </p>
          </div>
        </div>

        {/* Test Connection Button & Result */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleTestPing}
            disabled={isTesting}
            style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={18} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Testing connection...' : 'Run Connection Test Ping'}</span>
          </button>

          {testResult && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: testResult.success ? '#ECFDF5' : '#FEF2F2',
                border: testResult.success ? '1.5px solid #10B981' : '1.5px solid #EF4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: testResult.success ? '#065F46' : '#991B1B'
              }}
            >
              {testResult.message}
            </div>
          )}
        </div>

        {/* How to Connect Instructions */}
        {!status.configured && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-alt)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border-subtle)',
              fontSize: '0.85rem'
            }}
          >
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.4rem' }}>
              To connect your real Firebase project:
            </h4>
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--color-text-muted)' }}>
              <li>Create a project in the Firebase Console.</li>
              <li>Enable Firestore Database & Anonymous Auth.</li>
              <li>Create a <code>.env.local</code> file in <code>D:\DOODLZ</code> and paste your keys.</li>
            </ol>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-light)' }}>
              See <code>FIREBASE_SETUP.md</code> in the project directory for full instructions.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ padding: '0.55rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
