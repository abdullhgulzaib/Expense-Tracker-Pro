import React from 'react';

/**
 * VaultProgress Component.
 * Displays the sleek neon cyan-to-emerald progress bar with percentage readout.
 */
function VaultProgress({
  progress = 0,
  label = 'SECURE VAULT INITIALIZATION',
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full space-y-1.5 select-none ${className}`}>
      <div className="vault-progress-rail">
        <div
          className="vault-progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] md:text-[11px] font-mono text-slate-400">
        <span>{label}</span>
        <span className="text-cyan-400 font-bold">{Math.round(clamped)}%</span>
      </div>
    </div>
  );
}

export default VaultProgress;
