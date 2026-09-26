import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSplitVault } from '../../context/SplitVaultContext';

export default function JoinGroupModal({ isOpen, onClose }) {
  const { joinGroup } = useSplitVault();
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please enter the invite code.');
      return;
    }

    setError('');
    setSubmitting(true);
    const res = await joinGroup(inviteCode.trim().toUpperCase());
    setSubmitting(false);

    if (res.success) {
      setInviteCode('');
      onClose();
    } else {
      setError(res.error || 'Failed to join group.');
    }
  };

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="sv-modal-header">
          <h2 className="sv-modal-header__title">
            <Key size={20} color="#f59e0b" />
            <span>Join Group via Code</span>
          </h2>
          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="sv-modal-body">
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="sv-form-group">
              <label className="sv-form-label">Group Invite Code</label>
              <input
                type="text"
                className="sv-form-input"
                placeholder="e.g. FLAT608"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
                required
                autoFocus
              />
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
                Ask your roommate or group admin for their 6-character invite code.
              </span>
            </div>
          </div>

          <div className="sv-modal-footer">
            <button
              type="button"
              className="splitvault-btn splitvault-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="splitvault-btn splitvault-btn--primary"
              disabled={submitting}
            >
              <CheckCircle2 size={18} />
              {submitting ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
