import React, { useEffect, useMemo, useState } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    background: '#0f1220',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 16,
    width: 'min(720px, 95vw)',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: 22,
    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
    color: '#fff',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  closeBtn: {
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 24,
    cursor: 'pointer',
    lineHeight: 1,
  },
  primaryBtn: {
    border: 'none',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 800,
    width: '100%',
  },
  secondaryBtn: {
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: 999,
    cursor: 'pointer',
    fontWeight: 800,
    width: '100%',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
  },
  input: {
    width: '100%',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '12px 14px',
    outline: 'none',
  },
  log: {
    marginTop: 18,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
  },
  logLine: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 8,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};

export default function LinkedDevicePopup({ open, onClose }) {
  const [deviceId, setDeviceId] = useState('D1');
  const [action, setAction] = useState('sync');
  const [targetScore, setTargetScore] = useState('');
  const [status, setStatus] = useState('idle');
  const [logLines, setLogLines] = useState([]);

  const canSend = useMemo(() => {
    if (status === 'connecting' || status === 'sending') return false;
    if (!deviceId.trim()) return false;
    if (action === 'setScore' && !targetScore.trim()) return false;
    return true;
  }, [deviceId, status, action, targetScore]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setLogLines([]);
    setDeviceId('D1');
    setAction('sync');
    setTargetScore('');
  }, [open]);

  const addLog = (line) => {
    setLogLines((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
  };

  const simulateDelay = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleConnectAndSync = async () => {
    try {
      setStatus('connecting');
      addLog(`Connecting to device ${deviceId}...`);
      await simulateDelay(600);

      addLog('Sending handshake...');
      await simulateDelay(500);

      setStatus('sending');
      addLog(`Request: action=${action}`);
      if (action === 'setScore') addLog(`Payload: targetScore=${targetScore}`);

      await simulateDelay(700);

      addLog('Device acknowledged. Communication channel established.');
      if (action === 'sync') addLog('Syncing tournament state / match timer...');
      if (action === 'setScore') addLog('Updating score on the console/device...');
      await simulateDelay(500);

      addLog('Done.');
      setStatus('idle');
    } catch (e) {
      setStatus('idle');
      addLog(`Error: ${e?.message || String(e)}`);
    }
  };

  const handleSend = async () => {
    if (!canSend) return;
    await handleConnectAndSync();
  };

  if (!open) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.02em', marginBottom: 4 }}>
              Linked Device Console
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              Pop-up window to communicate with the gaming console/device.
            </div>
          </div>
          <button type="button" style={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <div style={styles.label}>Device ID</div>
            <input
              style={styles.input}
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="e.g. D1"
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>Action</div>
            <select
              style={styles.input}
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="sync">Sync state</option>
              <option value="setScore">Set score</option>
            </select>
          </div>
        </div>

        {action === 'setScore' && (
          <div style={{ ...styles.field, marginTop: 14 }}>
            <div style={styles.label}>Target score</div>
            <input
              style={styles.input}
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="e.g. 5"
              inputMode="numeric"
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18 }}>
          <button type="button" style={styles.secondaryBtn} onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            style={styles.primaryBtn}
            onClick={handleSend}
            disabled={!canSend}
            aria-disabled={!canSend}
          >
            {status === 'connecting' ? 'Connecting...' : status === 'sending' ? 'Sending...' : 'Connect & Communicate'}
          </button>
        </div>

        <div style={styles.log}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Communication log</div>
          {logLines.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
              Click <b>Connect &amp; Communicate</b> to simulate device communication.
            </div>
          ) : (
            logLines.map((l, idx) => (
              <div key={`${idx}-${l}`} style={styles.logLine}>
                {l}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

