import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

const getDefaultSettings = (user) => ({
  fullName: user?.name || '',
  email: user?.email || '',
  currency: 'USD',
  timezone: 'UTC-05:00',
  theme: 'Dark',
  compactMode: false,
  monthlyAlerts: true,
  weeklySummary: true,
  budgetReminders: true,
});

export function SettingsProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState(() => getDefaultSettings(user));
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize settings with the current authenticated user
  useEffect(() => {
    const storageKey = user?._id ? `appSettings_${user._id}` : 'appSettings_guest';
    const saved = localStorage.getItem(storageKey);
    const baseDefaults = getDefaultSettings(user);

    if (saved) {
      try {
        const parsedSettings = { ...baseDefaults, ...JSON.parse(saved) };
        // Always ensure name and email reflect the actual account unless explicitly customized
        if (!parsedSettings.fullName && user?.name) parsedSettings.fullName = user.name;
        if (!parsedSettings.email && user?.email) parsedSettings.email = user.email;

        setSettings(parsedSettings);
        applySettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse settings:', error);
        setSettings(baseDefaults);
        applySettings(baseDefaults);
      }
    } else {
      setSettings(baseDefaults);
      applySettings(baseDefaults);
    }
    setIsLoaded(true);
  }, [user?._id]);

  const applySettings = (newSettings) => {
    applyTheme(newSettings.theme);
    applyCompactMode(newSettings.compactMode);
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'Light') {
      root.setAttribute('data-theme', 'light');
      root.style.setProperty('--color-bg', '#f5f7fa');
      root.style.setProperty('--color-sidebar', '#ffffff');
      root.style.setProperty('--color-card', '#ffffff');
      root.style.setProperty('--text-primary', '#1a202c');
      root.style.setProperty('--text-muted', '#718096');
      root.style.setProperty('--color-border', 'rgba(0,0,0,0.12)');
      document.body.style.backgroundColor = '#f5f7fa';
    } else {
      root.setAttribute('data-theme', 'dark');
      root.style.setProperty('--color-bg', '#0b1120');
      root.style.setProperty('--color-sidebar', '#111827');
      root.style.setProperty('--color-card', '#1e293b');
      root.style.setProperty('--text-primary', '#e5e7eb');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--color-border', 'rgba(255,255,255,0.08)');
      document.body.style.backgroundColor = '#0b1120';
    }
  };

  const applyCompactMode = (isCompact) => {
    const root = document.documentElement;
    if (isCompact) {
      root.style.setProperty('--sidebar-width', '180px');
      document.body.style.fontSize = '14px';
    } else {
      root.style.setProperty('--sidebar-width', '236px');
      document.body.style.fontSize = '16px';
    }
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    const storageKey = user?._id ? `appSettings_${user._id}` : 'appSettings_guest';
    localStorage.setItem(storageKey, JSON.stringify(newSettings));
    applySettings(newSettings);

    // Sync profile name and email to AuthContext & backend
    if (updateUser && (newSettings.fullName || newSettings.email)) {
      const userUpdates = {};
      if (newSettings.fullName && newSettings.fullName.trim()) {
        userUpdates.name = newSettings.fullName.trim();
      }
      if (newSettings.email && newSettings.email.trim()) {
        userUpdates.email = newSettings.email.trim();
      }
      if (Object.keys(userUpdates).length > 0) {
        updateUser(userUpdates);
      }
    }
  };

  const getCurrencySymbol = () => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', PKR: 'PKR ' };
    return symbols[settings.currency] || '$';
  };

  const formatCurrency = (amount) => {
    const formattedAmount = Number(amount || 0).toFixed(2);
    return settings.currency === 'PKR'
      ? `${formattedAmount} PKR`
      : `${getCurrencySymbol()}${formattedAmount}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getCurrencySymbol, formatCurrency, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}

export default SettingsContext;
