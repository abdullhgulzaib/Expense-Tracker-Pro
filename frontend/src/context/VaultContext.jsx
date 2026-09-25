import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useExpenses } from './ExpenseContext';
import { useSettings } from './SettingsContext';

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { dispatch: expenseDispatch } = useExpenses();
  const { settings } = useSettings();

  // Settings preferences
  const vaultAnimation = settings?.vaultAnimation || 'full'; // 'full' | 'reduced' | 'minimal'
  const autoLockMinutes = Number(settings?.autoLockTimeout ?? 15); // 5, 15, 30, or 0 (Never)

  // Vault lifecycle states:
  // 'LOCKED' | 'VERIFYING' | 'LOADING_DATA' | 'READY' | 'UNLOCKED' | 'AUTO_LOCKED' | 'ACCESS_DENIED'
  const [vaultState, setVaultState] = useState('LOCKED');
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isDissolving, setIsDissolving] = useState(false);
  const [unlockMode, setUnlockMode] = useState('full'); // 'full' (cinematic boot) vs 'quick' (inactivity unlock)

  // Real-time telemetry & animation state
  const [dialAngle, setDialAngle] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [activeStepText, setActiveStepText] = useState('Initializing secure workspace...');
  const [securityLogs, setSecurityLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const angleIntervalRef = useRef(null);
  const idleTimerRef = useRef(null);
  const isExecutingRef = useRef(false);

  // Helper to add log entries
  const addLog = useCallback((text, status = 'OK') => {
    setSecurityLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), text, status },
    ]);
  }, []);

  // Dial rotation animation engine
  const startDialRotation = useCallback((targetAngle, speedMs = 30) => {
    clearInterval(angleIntervalRef.current);
    angleIntervalRef.current = setInterval(() => {
      setDialAngle((prev) => {
        const next = prev + 8;
        if (next >= targetAngle) {
          clearInterval(angleIntervalRef.current);
          return targetAngle;
        }
        return next;
      });
    }, speedMs);
  }, []);

  // Master Unlock Function
  const unlockVault = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    // Reset error state
    setErrorMessage('');

    // Check token presence
    const token = localStorage.getItem('et_token');
    if (!token) {
      setVaultState('ACCESS_DENIED');
      setErrorMessage('No active session token found. Please sign in.');
      isExecutingRef.current = false;
      return;
    }

    // Step 1: VERIFYING
    setVaultState('VERIFYING');
    setProgressPct(15);
    setActiveStepText('Verifying session token...');
    setSecurityLogs([{ id: 1, text: 'Session token found', status: 'OK' }]);

    // Spin dial smoothly
    startDialRotation(unlockMode === 'quick' ? 90 : 180, 20);

    const stepDelay = unlockMode === 'quick' ? 150 : 350;
    await new Promise((r) => setTimeout(r, stepDelay));

    try {
      // Step 2: Validate JWT with backend (GET /auth/me)
      setActiveStepText('Authenticating session credentials...');
      const authRes = await api.get('/auth/me');

      if (!authRes?.data) {
        throw new Error('Failed to verify session credentials with API.');
      }

      addLog('Session authenticated (/auth/me)', 'OK');
      addLog('API connection established', 'OK');
      setProgressPct(45);

      // Step 3: LOADING_DATA (Fetch transactions & analytics in parallel with allSettled)
      setVaultState('LOADING_DATA');
      setActiveStepText('Synchronizing financial ledger...');
      startDialRotation(unlockMode === 'quick' ? 180 : 320, 25);

      const [expensesResult, summaryResult] = await Promise.allSettled([
        api.get('/expenses'),
        api.get('/analytics/summary'),
      ]);

      // Hydrate Expenses
      if (expensesResult.status === 'fulfilled' && Array.isArray(expensesResult.value?.data)) {
        expenseDispatch({ type: 'SET_EXPENSES', payload: expensesResult.value.data });
        addLog('Transactions synchronized', 'OK');
      } else {
        addLog('Transactions sync warning', 'WARN');
      }

      // Hydrate Summary / Analytics
      if (summaryResult.status === 'fulfilled' && summaryResult.value?.data) {
        expenseDispatch({ type: 'SET_SUMMARY', payload: summaryResult.value.data });
        addLog('Budget analytics prepared', 'OK');
      } else {
        addLog('Analytics cached data used', 'WARN');
      }

      setProgressPct(90);
      setActiveStepText('Preparing dashboard workspace...');
      startDialRotation(360, 20);
      await new Promise((r) => setTimeout(r, unlockMode === 'quick' ? 200 : 400));

      addLog('Dashboard initialization', 'OK');
      addLog('VAULT STATUS: SECURE', 'OK');
      setProgressPct(100);

      // Step 4: READY (Vault turns Emerald)
      setVaultState('READY');
      setActiveStepText('Access Granted.');
      setDialAngle(360);

      // Wait brief moment to display satisfying emerald lock-in
      const emeraldDisplayTime = unlockMode === 'quick' ? 450 : 850;
      await new Promise((r) => setTimeout(r, emeraldDisplayTime));

      // Step 5: Smooth Dissolve into Live Dashboard
      setIsDissolving(true);
      setTimeout(() => {
        setVaultState('UNLOCKED');
        setIsOverlayVisible(false);
        setIsDissolving(false);
        isExecutingRef.current = false;
        // Subsequent unlocks can be quick unless manually locked
        setUnlockMode('quick');
      }, 650);

    } catch (err) {
      console.error('Vault unlock error:', err);
      clearInterval(angleIntervalRef.current);
      setVaultState('ACCESS_DENIED');
      setErrorMessage(
        err?.response?.data?.error ||
        err?.message ||
        'Session verification failed. Please sign in again.'
      );
      isExecutingRef.current = false;
    }
  }, [addLog, expenseDispatch, startDialRotation, unlockMode]);

  // Lock Vault Action (for Topbar button or Auto-Lock)
  const lockVault = useCallback((reason = 'manual') => {
    clearInterval(angleIntervalRef.current);
    setDialAngle(0);
    setProgressPct(0);
    setIsDissolving(false);
    setIsOverlayVisible(true);
    setUnlockMode('quick'); // returning is quick
    setVaultState(reason === 'inactive' ? 'AUTO_LOCKED' : 'LOCKED');
  }, []);

  // Centralized Inactivity Auto-Lock Monitor
  useEffect(() => {
    // If not authenticated or vault is already locked or timeout is 0 (Never), do nothing
    if (!isAuthenticated || vaultState !== 'UNLOCKED' || autoLockMinutes <= 0) {
      clearTimeout(idleTimerRef.current);
      return;
    }

    const resetIdleTimer = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        lockVault('inactive');
      }, autoLockMinutes * 60 * 1000);
    };

    // Initial setup
    resetIdleTimer();

    // Throttled window event listener
    let throttleTimeout = null;
    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetIdleTimer();
          throttleTimeout = null;
        }, 1500); // Throttle activity resets to every 1.5s
      }
    };

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      clearTimeout(idleTimerRef.current);
      clearTimeout(throttleTimeout);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isAuthenticated, vaultState, autoLockMinutes, lockVault]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(angleIntervalRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  const value = {
    vaultState,
    isOverlayVisible,
    isDissolving,
    unlockMode,
    dialAngle,
    progressPct,
    activeStepText,
    securityLogs,
    errorMessage,
    vaultAnimation,
    autoLockMinutes,
    unlockVault,
    lockVault,
    logout,
    user,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}

export default VaultContext;
