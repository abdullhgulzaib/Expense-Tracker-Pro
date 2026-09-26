import React, { useState } from 'react';
import { X, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSplitVault } from '../../context/SplitVaultContext';

const GROUP_CATEGORIES = ['Hostel', 'Friends', 'Classmates', 'Flatmates', 'Trip', 'Other'];

export default function NewGroupModal({ isOpen, onClose }) {
  const { createGroup } = useSplitVault();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hostel');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    setSubmitting(true);
    const res = await createGroup({
      name: name.trim(),
      description: description.trim(),
      category,
    });
    setSubmitting(false);

    if (res.success) {
      setName('');
      setDescription('');
      onClose();
    } else {
      setError(res.error || 'Failed to create group.');
    }
  };

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <h2 className="sv-modal-header__title">
            <Users size={20} color="#6366f1" />
            <span>Create New SplitVault Group</span>
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
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="sv-form-group">
              <label className="sv-form-label">Group Name</label>
              <input
                type="text"
                className="sv-form-input"
                placeholder="e.g. Flat 304, Trip to Hunza, Semester 6"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="sv-form-group">
              <label className="sv-form-label">Category</label>
              <select
                className="sv-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {GROUP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sv-form-group">
              <label className="sv-form-label">Description (Optional)</label>
              <textarea
                className="sv-form-textarea"
                rows="2"
                placeholder="Brief description of the expenses shared in this group"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              {submitting ? 'Creating Group...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
