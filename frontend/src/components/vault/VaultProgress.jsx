import React from 'react';

/**
 * VaultProgress Component.
 * Pure CSS progress bar with percentage readout.
 */
function VaultProgress({
  progress = 0,
  label = 'SECURE VAULT INITIALIZATION',
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`vault-progress-wrapper ${className}`} style={{ userSelect: 'none' }}>
      <div className="vault-progress-rail">
        <div
          className="vault-progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.68rem',
          fontFamily: 'monospace',
          color: '#94a3b8',
          marginTop: '6px',
        }}
      >
        <span>{label}</span>
        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{Math.round(clamped)}%</span>
      </div>
    </div>
  );
}

export default VaultProgress;
