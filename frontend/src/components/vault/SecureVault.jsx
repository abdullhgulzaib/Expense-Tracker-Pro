import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../BrandLogo';
import VaultDial from './VaultDial';
import SecurityTerminal from './SecurityTerminal';
import VaultProgress from './VaultProgress';

/**
 * Master SecureVault Overlay Component.
 * 100% pure standard CSS. Fully responsive on desktop and mobile.
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
      {/* 1. Subtle Floating Currency Particles */}
      <div className="vault-currency-particles">
        <span className="vault-particle" style={{ left: '12%', bottom: '8%', fontSize: '1.4rem', animationDelay: '0.2s' }}>$</span>
        <span className="vault-particle" style={{ left: '28%', bottom: '12%', fontSize: '1.1rem', animationDelay: '1.8s' }}>€</span>
        <span className="vault-particle" style={{ right: '24%', bottom: '10%', fontSize: '1.5rem', animationDelay: '0.9s' }}>£</span>
        <span className="vault-particle" style={{ right: '10%', bottom: '15%', fontSize: '1.2rem', animationDelay: '2.4s' }}>Rs</span>
      </div>

      <div className="vault-content-card">
        
        {/* 2. Unified Brand Header */}
        <div className="vault-brand-wrapper">
          <BrandLogo size="md" subtitle="Your Financial Life, Secured." />
        </div>

        {/* STATE A: INITIAL LOCKED (Panel 1) */}
        {vaultState === 'LOCKED' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <VaultDial angle={0} state="LOCKED" showDegree={false} />

            <h2 className="vault-heading">
              Secure Vault
            </h2>
            <p className="vault-description">
              Verify identity to access your financial command center
            </p>

            <button
              type="button"
              onClick={unlockVault}
              className="vault-unlock-btn"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>Unlock Vault</span>
            </button>

            <div className="vault-secure-notice">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Protected financial session</span>
            </div>
          </div>
        )}

        {/* STATE B: VERIFYING / LOADING_DATA (Panels 2, 3, 11) */}
        {(vaultState === 'VERIFYING' || vaultState === 'LOADING_DATA') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {vaultAnimation === 'minimal' ? (
              <div
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  backgroundColor: '#091326',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Verifying Session
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                    {progressPct}%
                  </span>
                </div>
                <VaultProgress progress={progressPct} label="SECURITY PIPELINE" />
                <div style={{ marginTop: '14px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span> <span>Session token authenticated</span>
                  </div>
                  <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }}></span>
                    <span>{activeStepText}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <VaultDial angle={dialAngle} state="VERIFYING" showDegree={true} />

                <div className="vault-step-wrapper">
                  <p className="vault-step-text">
                    {activeStepText}
                  </p>
                </div>

                {vaultAnimation === 'full' && (
                  <SecurityTerminal logs={securityLogs} activeStep={activeStepText} />
                )}

                <div className="vault-progress-wrapper">
                  <VaultProgress progress={progressPct} label="SECURE VAULT INITIALIZATION" />
                </div>
              </>
            )}
          </div>
        )}

        {/* STATE C: READY / ACCESS GRANTED (Panel 4) */}
        {vaultState === 'READY' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <VaultDial angle={360} state="READY" showDegree={false} />

            <h2 className="vault-heading" style={{ color: '#ffffff' }}>
              Access Granted
            </h2>
            <p className="vault-description" style={{ color: '#cbd5e1' }}>
              Welcome back, <span style={{ color: '#10b981', fontWeight: 800 }}>{displayName}</span>
            </p>

            <p style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginTop: '12px' }}>
              ✓ Financial vault verified. Opening workspace...
            </p>
          </div>
        )}

        {/* STATE D: AUTO-LOCKED ON INACTIVITY (Panel 8) */}
        {vaultState === 'AUTO_LOCKED' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div className="vault-autolock-icon-box">
              <svg width="42" height="42" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="vault-heading">
              You've been inactive for a while
            </h2>
            <p className="vault-description">
              For your security, the vault has been locked and financial balances are concealed.
            </p>

            <button
              type="button"
              onClick={unlockVault}
              className="vault-unlock-btn"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>Unlock Vault</span>
            </button>

            <p style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', margin: '6px 0 0' }}>
              ⏱️ Auto-lock threshold: {autoLockMinutes} minutes
            </p>
          </div>
        )}

        {/* STATE E: ACCESS DENIED / FAILED AUTHENTICATION (Panel 10) */}
        {vaultState === 'ACCESS_DENIED' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '360px' }}>
            <div className="vault-denied-icon-box">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="vault-heading" style={{ color: '#f87171' }}>
              Access Denied
            </h2>
            <p className="vault-description" style={{ color: '#fca5a5' }}>
              {errorMessage || 'Your session could not be verified. Please log in again.'}
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={unlockVault}
                className="vault-unlock-btn"
                style={{ maxWidth: '100%', height: '44px' }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={handleReturnToLogin}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#091326',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
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
