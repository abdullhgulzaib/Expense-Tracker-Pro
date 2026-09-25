import { useState } from 'react';
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
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="panel__header">
            <h3>Profile</h3>
          </div>

          <div className="settings-form">
            <label>
              <span>Full name</span>
              <input name="fullName" value={settings.fullName} onChange={handleChange} />
            </label>

            <label>
              <span>Email address</span>
              <input name="email" type="email" value={settings.email} onChange={handleChange} />
            </label>
          </div>
        </section>

        <section className="panel settings-panel">
          <div className="panel__header">
            <h3>Preferences</h3>
          </div>

          <div className="settings-form settings-form--two-col">
            <label>
              <span>Currency</span>
              <select name="currency" value={settings.currency} onChange={handleChange}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="PKR">PKR</option>
              </select>
            </label>

            <label>
              <span>Timezone</span>
              <select name="timezone" value={settings.timezone} onChange={handleChange}>
                <option value="UTC-05:00">UTC-05:00</option>
                <option value="UTC-00:00">UTC+00:00</option>
                <option value="UTC+05:30">UTC+05:30</option>
                <option value="UTC+08:00">UTC+08:00</option>
              </select>
            </label>

            <label>
              <span>Theme</span>
              <select name="theme" value={settings.theme} onChange={handleChange}>
                <option value="Dark">Dark</option>
                <option value="Light">Light</option>
              </select>
            </label>

            <label className="setting-control">
              <span>Compact mode</span>
              <button
                type="button"
                className={`toggle-btn ${settings.compactMode ? 'active' : ''}`}
                onClick={() => handleChange({ target: { name: 'compactMode', type: 'checkbox', checked: !settings.compactMode } })}
              >
                <span className="toggle-btn__slider" />
              </button>
            </label>
          </div>
        </section>

        <section className="panel settings-panel settings-panel--wide">
          <div className="panel__header">
            <h3>Notifications</h3>
            <p className="panel__subtitle">Control which alerts and summary reminders appear in your notifications bell.</p>
          </div>

          <div className="toggle-list">
            <label className="toggle-row">
              <span>Monthly spending alerts</span>
              <input type="checkbox" name="monthlyAlerts" checked={settings.monthlyAlerts} onChange={handleChange} />
            </label>

            <label className="toggle-row">
              <span>Weekly summary emails</span>
              <input type="checkbox" name="weeklySummary" checked={settings.weeklySummary} onChange={handleChange} />
            </label>

            <label className="toggle-row">
              <span>Budget reminders</span>
              <input type="checkbox" name="budgetReminders" checked={settings.budgetReminders} onChange={handleChange} />
            </label>
          </div>
        </section>

        <section className="panel settings-panel settings-panel--wide">
          <div className="panel__header">
            <h3>Security & Vault</h3>
            <p className="panel__subtitle">Configure vault startup animations and automatic inactivity locking.</p>
          </div>

          <div className="settings-form">
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
            <h3>Preview</h3>
          </div>
          <div className="theme-preview">
            <p>
              <strong>Theme:</strong> {settings.theme}
            </p>
            <p>
              <strong>Currency:</strong> {settings.currency}
            </p>
            <p>
              <strong>Full name:</strong> {settings.fullName}
            </p>
            <p>
              <strong>Vault:</strong> {settings.vaultAnimation === 'minimal' ? 'Minimal' : settings.vaultAnimation === 'reduced' ? 'Reduced' : 'Full'} • Auto-lock: {settings.autoLockTimeout > 0 ? `${settings.autoLockTimeout}m` : 'Disabled'}
            </p>
            {settings.compactMode && <p style={{ color: 'var(--color-success)' }}>✓ Compact mode is active</p>}
          </div>
        </section>
      </div>

      <Toast message={toast} visible={Boolean(toast)} />
    </div>
  );
}

export default Settings;
