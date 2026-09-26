import { useState } from 'react';
import { User, Sliders, Bell, ShieldCheck, Eye, Save, Check } from 'lucide-react';
import Toast from '../components/Toast';
import { useSettings } from '../context/SettingsContext';

function Settings() {
  const { settings, updateSettings, isLoaded } = useSettings();
  const [toast, setToast] = useState('');

  if (!isLoaded) return <div className="page"><div className="panel empty-panel"><p>Loading settings...</p></div></div>;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newSettings = {
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    };
    updateSettings(newSettings);
  };

  const handleToggle = (name) => {
    const newSettings = {
      ...settings,
      [name]: !settings[name],
    };
    updateSettings(newSettings);
  };

  const handleSave = () => {
    updateSettings(settings);
    setToast('Settings saved successfully!');
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <p className="eyebrow">Account preferences</p>
          <h1>Settings</h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="panel__header">
            <div className="settings-panel-header-with-icon">
              <div className="settings-panel-icon">
                <User size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Profile Information</h3>
                <p className="panel__subtitle" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>Your personal identity across expenses</p>
              </div>
            </div>
          </div>

          <div className="settings-form">
            <label>
              <span>Full name</span>
              <input name="fullName" value={settings.fullName || ''} onChange={handleChange} placeholder="e.g. Alex Morgan" />
            </label>

            <label>
              <span>Email address</span>
              <input name="email" type="email" value={settings.email || ''} onChange={handleChange} placeholder="e.g. alex@example.com" />
            </label>
          </div>
        </section>

        <section className="panel settings-panel">
          <div className="panel__header">
            <div className="settings-panel-header-with-icon">
              <div className="settings-panel-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}>
                <Sliders size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>System Preferences</h3>
                <p className="panel__subtitle" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>Currency, timezone, and UI display density</p>
              </div>
            </div>
          </div>

          <div className="settings-form settings-form--two-col">
            <label>
              <span>Currency</span>
              <select name="currency" value={settings.currency} onChange={handleChange}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </label>

            <label>
              <span>Timezone</span>
              <select name="timezone" value={settings.timezone} onChange={handleChange}>
                <option value="UTC-05:00">UTC-05:00 (EST)</option>
                <option value="UTC-00:00">UTC+00:00 (GMT)</option>
                <option value="UTC+05:00">UTC+05:00 (PKT)</option>
                <option value="UTC+05:30">UTC+05:30 (IST)</option>
                <option value="UTC+08:00">UTC+08:00 (SGT)</option>
              </select>
            </label>

            <label>
              <span>Theme</span>
              <select name="theme" value={settings.theme} onChange={handleChange}>
                <option value="Dark">Dark Mode</option>
                <option value="Light">Light Mode</option>
              </select>
            </label>

            <div className="setting-control" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>Compact Mode</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tighter spacing for high data density</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.compactMode ? 'active' : ''}`}
                onClick={() => handleToggle('compactMode')}
                aria-label="Toggle compact mode"
              >
                <span className="toggle-btn__slider" />
              </button>
            </div>
          </div>
        </section>

        <section className="panel settings-panel settings-panel--wide">
          <div className="panel__header">
            <div className="settings-panel-header-with-icon">
              <div className="settings-panel-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                <Bell size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Notification Channels</h3>
                <p className="panel__subtitle" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>Control which alert triggers appear in your real-time notifications bell</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="settings-toggle-card">
              <div className="settings-toggle-info">
                <span className="settings-toggle-title">Monthly spending alerts</span>
                <span className="settings-toggle-desc">Receive real-time alerts when monthly totals reach 80% and 100% of limits.</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.monthlyAlerts ? 'active' : ''}`}
                onClick={() => handleToggle('monthlyAlerts')}
                aria-label="Toggle monthly spending alerts"
              >
                <span className="toggle-btn__slider" />
              </button>
            </div>

            <div className="settings-toggle-card">
              <div className="settings-toggle-info">
                <span className="settings-toggle-title">Weekly summary digests</span>
                <span className="settings-toggle-desc">Generate automatic weekly expenditure summaries and category breakdowns.</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.weeklySummary ? 'active' : ''}`}
                onClick={() => handleToggle('weeklySummary')}
                aria-label="Toggle weekly summary digests"
              >
                <span className="toggle-btn__slider" />
              </button>
            </div>

            <div className="settings-toggle-card">
              <div className="settings-toggle-info">
                <span className="settings-toggle-title">Budget threshold reminders</span>
                <span className="settings-toggle-desc">Notify instantly whenever a transaction approaches individual category caps.</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.budgetReminders ? 'active' : ''}`}
                onClick={() => handleToggle('budgetReminders')}
                aria-label="Toggle budget threshold reminders"
              >
                <span className="toggle-btn__slider" />
              </button>
            </div>
          </div>
        </section>

        <section className="panel settings-panel settings-panel--wide">
          <div className="panel__header">
            <div className="settings-panel-header-with-icon">
              <div className="settings-panel-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Security & Vault Protocols</h3>
                <p className="panel__subtitle" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>Configure biometric authentication, animations, and session auto-lock</p>
              </div>
            </div>
          </div>

          <div className="settings-form settings-form--two-col">
            <label>
              <span>Vault animation style</span>
              <select name="vaultAnimation" value={settings.vaultAnimation || 'full'} onChange={handleChange}>
                <option value="full">Full (Mechanical Dial & Live Terminal)</option>
                <option value="reduced">Reduced (Fast Dial Rotation)</option>
                <option value="minimal">Minimal (Progress Bar & Checklist)</option>
              </select>
            </label>

            <label>
              <span>Auto-lock inactivity period</span>
              <select name="autoLockTimeout" value={settings.autoLockTimeout ?? 15} onChange={handleChange}>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes (Recommended)</option>
                <option value="30">30 minutes</option>
                <option value="0">Never (Manual Lock Only)</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel settings-panel settings-panel--wide">
          <div className="panel__header">
            <div className="settings-panel-header-with-icon">
              <div className="settings-panel-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                <Eye size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Configuration Summary</h3>
                <p className="panel__subtitle" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>Active system parameters currently applied</p>
              </div>
            </div>
          </div>
          <div className="theme-preview">
            <p>
              <strong>Theme:</strong> {settings.theme}
            </p>
            <p>
              <strong>Currency:</strong> {settings.currency}
            </p>
            <p>
              <strong>Full name:</strong> {settings.fullName || 'Not specified'}
            </p>
            <p>
              <strong>Vault:</strong> {settings.vaultAnimation === 'minimal' ? 'Minimal' : settings.vaultAnimation === 'reduced' ? 'Reduced' : 'Full'} • Auto-lock: {settings.autoLockTimeout > 0 ? `${settings.autoLockTimeout}m` : 'Disabled'}
            </p>
            {settings.compactMode && (
              <p style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Compact mode is active
              </p>
            )}
          </div>
        </section>
      </div>

      <Toast message={toast} visible={Boolean(toast)} />
    </div>
  );
}

export default Settings;
