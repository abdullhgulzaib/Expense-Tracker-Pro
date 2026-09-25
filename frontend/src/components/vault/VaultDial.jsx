import React from 'react';

/**
 * Precision Mechanical SVG Vault Dial.
 * Features:
 * - 36 perimeter hash tick marks (stator)
 * - Concentric geared rings
 * - Smoothly rotating mechanical rotor with notches
 * - Center padlock hub that transforms into an emerald checkmark
 * - Live degree readout badge
 */
function VaultDial({
  angle = 0,
  state = 'LOCKED', // 'LOCKED' | 'VERIFYING' | 'READY' | 'ACCESS_DENIED' | 'AUTO_LOCKED'
  showDegree = true,
  className = '',
}) {
  const isEmerald = state === 'READY' || state === 'UNLOCKED';
  const isRed = state === 'ACCESS_DENIED';
  const isRotating = state === 'VERIFYING';

  // Primary colors based on vault state
  const strokeAccent = isEmerald ? '#10b981' : isRed ? '#ef4444' : '#38bdf8';
  const fillCore = isEmerald ? '#042f2e' : isRed ? '#450a0a' : '#071226';
  const glowStyle = isEmerald
    ? { animation: 'vaultPulseEmerald 2.5s infinite ease-in-out' }
    : isRotating
    ? { filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.6))' }
    : { animation: 'vaultPulseCyan 3s infinite ease-in-out' };

  return (
    <div className={`vault-dial-wrapper ${className}`} style={glowStyle}>
      <svg className="w-full h-full select-none" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="dialRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isEmerald ? '#10b981' : isRed ? '#ef4444' : '#38bdf8'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isEmerald ? '#059669' : isRed ? '#991b1b' : '#1d4ed8'} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* 1. Outer Heavy Dial Frame */}
        <circle cx="100" cy="100" r="94" fill="none" stroke="#0e1e38" strokeWidth="6" />
        <circle cx="100" cy="100" r="94" fill="none" stroke="url(#dialRimGrad)" strokeWidth="1.5" />

        {/* 2. Precision Mechanical Ticks (Stator) */}
        <g stroke={isEmerald ? 'rgba(16,185,129,0.5)' : 'rgba(56,189,248,0.35)'} strokeWidth="1.5">
          {/* 12 Cardinal and Sub-cardinal Tick Marks */}
          <line x1="100" y1="10" x2="100" y2="18" strokeWidth="2.5" stroke={strokeAccent} />
          <line x1="100" y1="182" x2="100" y2="190" strokeWidth="2.5" stroke={strokeAccent} />
          <line x1="10" y1="100" x2="18" y2="100" strokeWidth="2.5" stroke={strokeAccent} />
          <line x1="182" y1="100" x2="190" y2="100" strokeWidth="2.5" stroke={strokeAccent} />

          <line x1="36" y1="36" x2="42" y2="42" strokeWidth="2" />
          <line x1="164" y1="36" x2="158" y2="42" strokeWidth="2" />
          <line x1="36" y1="164" x2="42" y2="158" strokeWidth="2" />
          <line x1="164" y1="164" x2="158" y2="158" strokeWidth="2" />

          {/* Dotted guideline track */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 4" />
        </g>

        {/* 3. Mechanical Rotor (Rotates with dynamic angle) */}
        <g
          className="vault-dial-rotor"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Main geared disk */}
          <circle
            cx="100"
            cy="100"
            r="68"
            fill={fillCore}
            stroke={strokeAccent}
            strokeWidth="2.5"
          />

          {/* 4 Rotating Perimeter Bolt Notches */}
          <circle cx="100" cy="38" r="3.5" fill={strokeAccent} />
          <circle cx="162" cy="100" r="3.5" fill={strokeAccent} />
          <circle cx="100" cy="162" r="3.5" fill={strokeAccent} />
          <circle cx="38" cy="100" r="3.5" fill={strokeAccent} />

          {/* Geared Crosshair Spokes */}
          <line x1="100" y1="44" x2="100" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <line x1="100" y1="140" x2="100" y2="156" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <line x1="44" y1="100" x2="60" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <line x1="140" y1="100" x2="156" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        </g>

        {/* 4. Center Core Lock Hub */}
        <circle cx="100" cy="100" r="42" fill="#0b172d" stroke={strokeAccent} strokeWidth="2" />
        <circle cx="100" cy="100" r="34" fill="#040914" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>

      {/* Center Lock / Checkmark Emblem */}
      <div className="vault-dial-hub">
        {isEmerald ? (
          <svg className="w-10 h-10 text-emerald-400 filter drop-shadow(0 0 10px rgba(16,185,129,0.9)) animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        ) : isRed ? (
          <svg className="w-8 h-8 text-rose-500 filter drop-shadow(0 0 8px rgba(244,63,94,0.7))" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-cyan-400 filter drop-shadow(0 0 8px rgba(56,189,248,0.7))" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )}
      </div>

      {/* Real Degree Telemetry Readout Badge (Panel 2 from design) */}
      {showDegree && (state === 'VERIFYING' || angle > 0) && (
        <div className="vault-degree-badge">
          <p className="text-[9px] uppercase tracking-wider text-slate-400">Rotating vault...</p>
          <p className="text-xs font-bold font-mono text-cyan-400">{Math.round(angle % 360)}°</p>
        </div>
      )}
    </div>
  );
}

export default VaultDial;
