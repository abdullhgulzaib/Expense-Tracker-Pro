import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';

const DEFAULT_CATEGORIES = ['Food', 'Housing', 'Utilities', 'Transport', 'Entertainment', 'Groceries', 'Other'];

export default function CreateSplitExpenseModal({ isOpen, onClose, preselectedGroupId = null }) {
  const { user } = useAuth();
  const { summary, createSplitExpense } = useSplitVault();

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [groupId, setGroupId] = useState(preselectedGroupId || '');
  const [splitType, setSplitType] = useState('Equal'); // 'Equal' | 'Custom' | 'Percentage'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default participants: current user + common roommates
  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');

  // Initialize participants
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setTitle('');
    setTotalAmount('');
    setNotes('');
    setGroupId(preselectedGroupId || (summary.groups.length > 0 ? summary.groups[0]._id : ''));

    // Populate initial members: current user + seed members
    const initial = [
      {
        userId: user?._id || 'user_me',
        name: `${user?.name || 'You'} (Payer)`,
        email: user?.email || '',
        isCurrentUser: true,
        selected: true,
        amount: 0,
        percentage: 50,
      },
      {
        userId: 'roommate_1',
        name: 'Ali Khan',
        email: 'ali@hostel.edu',
        isCurrentUser: false,
        selected: true,
        amount: 0,
        percentage: 50,
      },
      {
        userId: 'roommate_2',
        name: 'Bilal Ahmed',
        email: 'bilal@hostel.edu',
        isCurrentUser: false,
        selected: false,
        amount: 0,
        percentage: 0,
      },
    ];

    setParticipants(initial);
  }, [isOpen, user, summary.groups, preselectedGroupId]);

  // Recalculate split amounts whenever total, participants, or splitType changes
  useEffect(() => {
    const total = parseFloat(totalAmount) || 0;
    const selectedCount = participants.filter((p) => p.selected).length;

    if (splitType === 'Equal') {
      if (selectedCount === 0 || total === 0) {
        setParticipants((prev) => prev.map((p) => ({ ...p, amount: 0, percentage: 0 })));
        return;
      }
      const splitAmount = Math.round((total / selectedCount) * 100) / 100;
      const splitPct = Math.round((100 / selectedCount) * 10) / 10;

      setParticipants((prev) =>
        prev.map((p) =>
          p.selected
            ? { ...p, amount: splitAmount, percentage: splitPct }
            : { ...p, amount: 0, percentage: 0 }
        )
      );
    }
  }, [totalAmount, splitType]);

  if (!isOpen) return null;

  const handleToggleSelect = (index) => {
    const p = participants[index];
    if (p.isCurrentUser) return; // Current user always included as payer

    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  };

  const handleAmountChange = (index, value) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], amount: parseFloat(value) || 0 };
      return next;
    });
  };

  const handlePercentageChange = (index, value) => {
    const pct = parseFloat(value) || 0;
    const total = parseFloat(totalAmount) || 0;
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        percentage: pct,
        amount: Math.round(((total * pct) / 100) * 100) / 100,
      };
      return next;
    });
  };

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    const newId = `roommate_${Date.now()}`;
    setParticipants((prev) => [
      ...prev,
      {
        userId: newId,
        name: newParticipantName.trim(),
        email: '',
        isCurrentUser: false,
        selected: true,
        amount: 0,
        percentage: 0,
      },
    ]);
    setNewParticipantName('');
  };

  const handleRemoveParticipant = (index) => {
    if (participants[index].isCurrentUser) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const total = parseFloat(totalAmount);
    if (!title.trim()) {
      setError('Please enter an expense title.');
      return;
    }
    if (!total || total <= 0) {
      setError('Please enter a valid expense total amount.');
      return;
    }

    const activeParticipants = participants.filter((p) => p.selected);
    if (activeParticipants.length < 2) {
      setError('Shared expenses require at least 2 participants (you + at least 1 roommate).');
      return;
    }

    // Validate totals for Custom or Percentage
    const sumAmounts = activeParticipants.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    if (Math.abs(sumAmounts - total) > 2) {
      setError(`Split amounts (Rs ${sumAmounts.toFixed(0)}) must equal total amount (Rs ${total.toFixed(0)}).`);
      return;
    }

    setSubmitting(true);
    const res = await createSplitExpense({
      title: title.trim(),
      totalAmount: total,
      category,
      groupId: groupId || null,
      splitType,
      notes: notes.trim(),
      participants: activeParticipants.map((p) => ({
        userId: p.isCurrentUser ? user?._id : p.userId,
        name: p.name,
        email: p.email,
        amount: p.amount,
        percentage: p.percentage,
      })),
    });

    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to create split expense.');
    }
  };

  const selectedCount = participants.filter((p) => p.selected).length;

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <h2 className="sv-modal-header__title">
            <Users size={20} color="#6366f1" />
            <span>Create Shared Expense</span>
          </h2>
          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

            {/* Title & Total Amount */}
            <div className="sv-form-row">
              <div className="sv-form-group">
                <label className="sv-form-label">Expense Title</label>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="e.g. Monal Dinner, Flat Wifi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">Total Amount (PKR)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  className="sv-form-input"
                  placeholder="e.g. 3000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category & Group */}
            <div className="sv-form-row">
              <div className="sv-form-group">
                <label className="sv-form-label">Category</label>
                <select
                  className="sv-form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sv-form-group">
                <label className="sv-form-label">Select Group</label>
                <select
                  className="sv-form-select"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <option value="">No Group (Direct Split)</option>
                  {summary.groups.map((grp) => (
                    <option key={grp._id} value={grp._id}>
                      {grp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split Type Selector */}
            <div className="sv-form-group">
              <label className="sv-form-label">Splitting Method</label>
              <div className="sv-tabs-nav">
                <button
                  type="button"
                  className={`sv-tab-btn ${splitType === 'Equal' ? 'active' : ''}`}
                  onClick={() => setSplitType('Equal')}
                >
                  Equal Split (÷)
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${splitType === 'Custom' ? 'active' : ''}`}
                  onClick={() => setSplitType('Custom')}
                >
                  Custom Amount (Rs)
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${splitType === 'Percentage' ? 'active' : ''}`}
                  onClick={() => setSplitType('Percentage')}
                >
                  Percentage (%)
                </button>
              </div>
            </div>

            {/* Participants Checklist */}
            <div className="sv-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="sv-form-label">
                  Participants ({selectedCount} Selected)
                </label>
                <span style={{ fontSize: '0.78rem', color: '#10b981' }}>
                  Paid upfront by You
                </span>
              </div>

              <div className="sv-participants-list">
                {participants.map((p, idx) => (
                  <div key={p.userId} className="sv-participant-item">
                    <div className="sv-participant-info">
                      <input
                        type="checkbox"
                        checked={p.selected}
                        disabled={p.isCurrentUser}
                        onChange={() => handleToggleSelect(idx)}
                        style={{ width: '18px', height: '18px', cursor: p.isCurrentUser ? 'default' : 'pointer' }}
                      />
                      <div className="sv-participant-avatar">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="sv-participant-name">{p.name}</div>
                        {p.isCurrentUser && (
                          <span style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>
                            You will verify incoming proofs
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {splitType === 'Equal' && p.selected && (
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e5e7eb' }}>
                          Rs {Number(p.amount).toLocaleString()}
                        </span>
                      )}

                      {splitType === 'Custom' && p.selected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Rs</span>
                          <input
                            type="number"
                            className="sv-form-input sv-participant-input"
                            value={p.amount}
                            onChange={(e) => handleAmountChange(idx, e.target.value)}
                          />
                        </div>
                      )}

                      {splitType === 'Percentage' && p.selected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            className="sv-form-input sv-participant-input"
                            value={p.percentage}
                            onChange={(e) => handlePercentageChange(idx, e.target.value)}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>%</span>
                        </div>
                      )}

                      {!p.isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Roommate Quick Input */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="+ Add another roommate name..."
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                  style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                />
                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                  onClick={handleAddParticipant}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="sv-form-group">
              <label className="sv-form-label">Notes (Optional)</label>
              <textarea
                className="sv-form-textarea"
                rows="2"
                placeholder="Dinner outing notes, bill breakdown, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              {submitting ? 'Creating Split...' : 'Create & Split Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
