import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Users, DollarSign, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';

const DEFAULT_CATEGORIES = ['Food', 'Housing', 'Utilities', 'Transport', 'Entertainment', 'Groceries', 'Other'];

export default function CreateSplitExpenseModal({ isOpen, onClose, preselectedGroupId = null }) {
  const { user } = useAuth();
  const { summary, activeGroupDetails, createSplitExpense } = useSplitVault();

  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [groupId, setGroupId] = useState(preselectedGroupId || '');
  const [splitType, setSplitType] = useState('Equal'); // 'Equal' | 'Custom' | 'Percentage'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [participants, setParticipants] = useState([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const prevIsOpenRef = useRef(false);


  // Helper to recalculate splits automatically across all selected members
  const recalculateSplits = useCallback((list, totalStr, type) => {
    const total = parseFloat(totalStr) || 0;
    const selectedCount = list.filter((p) => p.selected).length;

    if (type === 'Equal') {
      if (selectedCount === 0 || total <= 0) {
        return list.map((p) => ({ ...p, amount: 0, percentage: 0 }));
      }
      const splitAmount = Math.floor((total / selectedCount) * 100) / 100;
      const splitPct = Math.round((100 / selectedCount) * 10) / 10;

      // Reconcile rounding remainder to the first selected participant (Splitwise approach)
      const allocated = Math.round(splitAmount * selectedCount * 100) / 100;
      const remainder = Math.round((total - allocated) * 100) / 100;

      let remainderAssigned = false;
      return list.map((p) => {
        if (!p.selected) return { ...p, amount: 0, percentage: 0 };
        let amt = splitAmount;
        if (!remainderAssigned && remainder > 0) {
          amt = Math.round((amt + remainder) * 100) / 100;
          remainderAssigned = true;
        }
        return { ...p, amount: amt, percentage: splitPct };
      });
    }

    if (type === 'Percentage') {
      const splitPct = selectedCount > 0 ? Math.round((100 / selectedCount) * 10) / 10 : 0;
      return list.map((p) => {
        if (!p.selected) return { ...p, amount: 0, percentage: 0 };
        const pct = p.percentage || splitPct;
        const amt = Math.round(((total * pct) / 100) * 100) / 100;
        return { ...p, percentage: pct, amount: amt };
      });
    }

    return list;
  }, []);

  // Initialize or re-populate members only when the modal opens (prevent polling wipes)
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    if (!prevIsOpenRef.current) {
      prevIsOpenRef.current = true;
      setError('');
      setTitle('');
      setTotalAmount('');
      setNotes('');
      setSplitType('Equal');
      setCategory('Food');

      const targetGroupId = preselectedGroupId || (summary.groups.length > 0 ? summary.groups[0]._id : '');
      setGroupId(targetGroupId);

      // Find declared members of this group
      let groupObj = summary.groups.find((g) => g._id === targetGroupId);
      if (!groupObj && activeGroupDetails?.group?._id === targetGroupId) {
        groupObj = activeGroupDetails.group;
      }

      const initial = [
        {
          userId: user?._id || 'user_me',
          name: `${user?.name || 'You'} (Payer)`,
          email: user?.email || '',
          isCurrentUser: true,
          selected: true,
          amount: 0,
          percentage: 100,
        },
      ];

      if (groupObj && Array.isArray(groupObj.members)) {
        groupObj.members.forEach((m) => {
          const mUserId = m.user?._id || m.user || m._id;
          if (mUserId?.toString() !== user?._id?.toString() && m.name) {
            initial.push({
              userId: mUserId,
              name: m.name,
              email: m.email || '',
              isCurrentUser: false,
              selected: true,
              amount: 0,
              percentage: 0,
            });
          }
        });
      }

      setParticipants(recalculateSplits(initial, '', 'Equal'));
    }
  }, [isOpen, preselectedGroupId]);

  // When group selection changes in the dropdown, switch to that group's declared members
  const handleGroupChange = (newGroupId) => {
    setGroupId(newGroupId);

    let groupObj = summary.groups.find((g) => g._id === newGroupId);
    if (!groupObj && activeGroupDetails?.group?._id === newGroupId) {
      groupObj = activeGroupDetails.group;
    }

    const updated = [
      {
        userId: user?._id || 'user_me',
        name: `${user?.name || 'You'} (Payer)`,
        email: user?.email || '',
        isCurrentUser: true,
        selected: true,
        amount: 0,
        percentage: 100,
      },
    ];

    if (groupObj && Array.isArray(groupObj.members)) {
      groupObj.members.forEach((m) => {
        const mUserId = m.user?._id || m.user || m._id;
        if (mUserId?.toString() !== user?._id?.toString() && m.name) {
          updated.push({
            userId: mUserId,
            name: m.name,
            email: m.email || '',
            isCurrentUser: false,
            selected: true,
            amount: 0,
            percentage: 0,
          });
        }
      });
    }

    setParticipants(recalculateSplits(updated, totalAmount, splitType));
  };

  // When total amount changes, auto-update split amounts immediately
  const handleTotalAmountChange = (val) => {
    setTotalAmount(val);
    setParticipants((prev) => recalculateSplits(prev, val, splitType));
  };

  // When split type tab changes, auto-update immediately
  const handleSplitTypeChange = (type) => {
    setSplitType(type);
    setParticipants((prev) => recalculateSplits(prev, totalAmount, type));
  };

  // Toggle member participation: auto-updates split amounts immediately!
  const handleToggleSelect = (index) => {
    setParticipants((prev) => {
      const next = prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item));
      return recalculateSplits(next, totalAmount, splitType);
    });
  };

  // Add new roommate member: auto-divides amounts immediately!
  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    const name = newParticipantName.trim();

    setParticipants((prev) => {
      // Check if duplicate
      if (prev.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      const next = [
        ...prev,
        {
          userId: `roommate_${Date.now()}`,
          name,
          email: '',
          isCurrentUser: false,
          selected: true,
          amount: 0,
          percentage: 0,
        },
      ];
      return recalculateSplits(next, totalAmount, splitType);
    });

    setNewParticipantName('');
  };

  // Remove member: auto-updates split amounts immediately!
  const handleRemoveParticipant = (index) => {
    if (participants[index].isCurrentUser) return;
    setParticipants((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return recalculateSplits(next, totalAmount, splitType);
    });
  };

  // Manual amount change (for Custom Amount mode)
  const handleCustomAmountChange = (index, value) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], amount: parseFloat(value) || 0 };
      return next;
    });
  };

  // Manual percentage change (for Percentage mode)
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

  if (!isOpen) return null;

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
      setError('Shared expenses require at least 2 participants (e.g. you + at least 1 roommate, or 2 roommates). Please select or add roommates below.');
      return;
    }

    // Validate totals
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
        isCurrentUser: p.isCurrentUser,
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
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.25)',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
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
                  placeholder="e.g. F8 Outing, Flat Groceries, Wifi Bill"
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
                  placeholder="e.g. 1500"
                  value={totalAmount}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category & Group Selector */}
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
                  onChange={(e) => handleGroupChange(e.target.value)}
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

            {/* Splitting Method Tabs */}
            <div className="sv-form-group">
              <label className="sv-form-label">Splitting Method</label>
              <div className="sv-tabs-nav">
                <button
                  type="button"
                  className={`sv-tab-btn ${splitType === 'Equal' ? 'active' : ''}`}
                  onClick={() => handleSplitTypeChange('Equal')}
                >
                  Equal Split (÷)
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${splitType === 'Custom' ? 'active' : ''}`}
                  onClick={() => handleSplitTypeChange('Custom')}
                >
                  Custom Amount (Rs)
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${splitType === 'Percentage' ? 'active' : ''}`}
                  onClick={() => handleSplitTypeChange('Percentage')}
                >
                  Percentage (%)
                </button>
              </div>
            </div>

            {/* Participants Checklist */}
            <div className="sv-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="sv-form-label">
                  Participants ({selectedCount} Selected • Amounts Auto-Divided)
                </label>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                  Paid upfront by You
                </span>
              </div>

              <div className="sv-participants-list">
                {participants.map((p, idx) => (
                  <div key={p.userId || idx} className="sv-participant-item">
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
                          <span style={{ fontSize: '0.72rem', color: '#818cf8' }}>
                            You will verify incoming receipts
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {splitType === 'Equal' && p.selected && (
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#10b981' }}>
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
                            onChange={(e) => handleCustomAmountChange(idx, e.target.value)}
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
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Remove roommate"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Roommate with instant auto-divide */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  className="sv-form-input"
                  placeholder="+ Add roommate name (e.g. Usman, Daniyal)..."
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
                  <Plus size={16} /> Add Member
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="sv-form-group">
              <label className="sv-form-label">Notes (Optional)</label>
              <textarea
                className="sv-form-textarea"
                rows="2"
                placeholder="Dinner outing notes, item breakdown, etc."
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
