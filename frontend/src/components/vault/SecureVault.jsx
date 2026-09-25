import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../BrandLogo';
import VaultDial from './VaultDial';
import SecurityTerminal from './SecurityTerminal';
import VaultProgress from './VaultProgress';

/**
 * Master SecureVault Overlay Component.
 * Implements the 12-panel Secure Vault entry storyboard:
 * - Locked Screen (Panel 1)
 * - Rotating Mechanical Dial (Panel 2)
 * - Security Checks & Live Terminal (Panel 3)
 * - Emerald Access Granted (Panel 4)
 * - Auto-Lock Screen on Inactivity (Panel 8)
 * - Access Denied on Invalid Session (Panel 10)
 * - Reduced/Minimal Motion Mode (Panel 11)
 */
function SecureVault() {
  const {
    vaultState,
    isOverlayVisible,
    isDissolving,
    dialAngle,
    progressPct,
    activeStepText,
    securityLogs,
    errorMessage,
    vaultAnimation,
    autoLockMinutes,
    unlockVault,
    lockVault,
  } = useVault();

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated and overlay is not needed, don't show
  if (!isOverlayVisible && !isAuthenticated) {
    return null;
  }

  // When overlay is completely dismissed, don't render DOM nodes
  if (!isOverlayVisible) {
    return null;
  }

  const handleReturnToLogin = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name?.trim() || 'Abdullah Gulzaib';

  return (
    <div
      className={`vault-overlay ${isDissolving ? 'dissolve' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Secure Financial Vault"
    >
      {/* 1. Subtle Floating Currency Particles (Layer #6 in design) */}
      <div className="vault-currency-particles">
        <span className="vault-particle" style={{ left: '12%', bottom: '8%', fontSize: '1.5rem', animationDelay: '0.2s' }}>$</span>
        <span className="vault-particle" style={{ left: '28%', bottom: '12%', fontSize: '1.2rem', animationDelay: '1.8s' }}>€</span>
        <span className="vault-particle" style={{ right: '24%', bottom: '10%', fontSize: '1.6rem', animationDelay: '0.9s' }}>£</span>
        <span className="vault-particle" style={{ right: '10%', bottom: '15%', fontSize: '1.25rem', animationDelay: '2.4s' }}>Rs</span>
      </div>

      <div className="vault-content-card">
        
        {/* 2. Unified Brand Logo & Header */}
        <div className="mb-4">
          <BrandLogo size="md" subtitle="Your Financial Life, Secured." />
        </div>

        {/* STATE A: INITIAL LOCKED (Panel 1) */}
        {vaultState === 'LOCKED' && (
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            <VaultDial angle={0} state="LOCKED" showDegree={false} />

            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Secure Vault
              </h2>
              <p className="text-xs text-slate-400">
                Verify identity to access your financial command center
              </p>
            </div>

            <div className="w-full flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={unlockVault}
                className="vault-unlock-btn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span>Unlock Vault</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Protected financial session</span>
              </div>
            </div>
          </div>
        )}

        {/* STATE B: VERIFYING / LOADING_DATA (Panels 2, 3, 11) */}
        {(vaultState === 'VERIFYING' || vaultState === 'LOADING_DATA') && (
          <div className="flex flex-col items-center text-center space-y-4 w-full">
            {/* If Minimal Motion is selected, show streamlined layout (Panel 11) */}
            {vaultAnimation === 'minimal' ? (
              <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Verifying Session</span>
                  <span className="text-cyan-400 font-mono text-xs">{progressPct}%</span>
                </div>
                <VaultProgress progress={progressPct} label="SECURITY PIPELINE" />
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span>✓</span> <span>Session token authenticated</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
                    <span>●</span> <span>{activeStepText}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <VaultDial angle={dialAngle} state="VERIFYING" showDegree={true} />

                <div className="h-6 flex items-center justify-center">
                  <p className="text-xs md:text-sm font-medium text-cyan-300 font-mono tracking-wide animate-pulse">
                    {activeStepText}
                  </p>
                </div>

                {/* Show Live Terminal in Full Animation mode */}
                {vaultAnimation === 'full' && (
                  <div className="w-full max-w-md">
                    <SecurityTerminal logs={securityLogs} activeStep={activeStepText} />
                  </div>
                )}

                <div className="w-full max-w-md pt-2">
                  <VaultProgress progress={progressPct} label="SECURE VAULT INITIALIZATION" />
                </div>
              </>
            )}
          </div>
        )}

        {/* STATE C: READY / ACCESS GRANTED (Panel 4) */}
        {vaultState === 'READY' && (
          <div className="flex flex-col items-center text-center space-y-4 w-full animate-scale-in">
            <VaultDial angle={360} state="READY" showDegree={false} />

            <div className="space-y-1.5">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                Access Granted
              </h2>
              <p className="text-xs md:text-sm text-slate-300">
                Welcome back, <span className="text-emerald-400 font-bold">{displayName}</span>
              </p>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              ✓ Financial vault verified. Opening workspace...
            </p>
          </div>
        )}

        {/* STATE D: AUTO-LOCKED ON INACTIVITY (Panel 8) */}
        {vaultState === 'AUTO_LOCKED' && (
          <div className="flex flex-col items-center text-center space-y-5 w-full">
            <div className="w-36 h-36 rounded-full bg-slate-900/90 border-2 border-slate-700/80 flex items-center justify-center shadow-2xl relative">
              <div className="absolute inset-1 rounded-full border border-slate-800 border-dashed" />
              <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                You've been inactive for a while
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                For your security, the vault has been locked and financial balances are concealed.
              </p>
            </div>

            <div className="w-full flex flex-col items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={unlockVault}
                className="vault-unlock-btn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span>Unlock Vault</span>
              </button>
              <p className="text-[11px] text-slate-500 font-mono">
                ⏱️ Auto-lock threshold: {autoLockMinutes} minutes
              </p>
            </div>
          </div>
        )}

        {/* STATE E: ACCESS DENIED / FAILED AUTHENTICATION (Panel 10) */}
        {vaultState === 'ACCESS_DENIED' && (
          <div className="flex flex-col items-center text-center space-y-4 w-full max-w-sm">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/20">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-rose-400">Access Denied</h2>
              <p className="text-xs text-slate-400">
                {errorMessage || 'Your session could not be verified. Please log in again.'}
              </p>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={unlockVault}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={handleReturnToLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs hover:bg-slate-850 transition-all"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SecureVault;
