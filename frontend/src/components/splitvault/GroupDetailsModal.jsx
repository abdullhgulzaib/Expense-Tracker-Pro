import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Receipt,
  Trash2,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';

export default function GroupDetailsModal({
  isOpen,
  onClose,
  groupId,
  onOpenAddExpense,
  onOpenVerification,
  onOpenProofSubmit,
}) {
  const { user } = useAuth();
  const {
    fetchGroupDetails,
    activeGroupDetails,
    groupLoading,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
  } = useSplitVault();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'members' | 'invite'
  const [copied, setCopied] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      fetchGroupDetails(groupId);
      setShowDeleteConfirm(false);
      setMemberError('');
      setNewMemberName('');
      setNewMemberEmail('');
    }
  }, [isOpen, groupId, fetchGroupDetails]);

  if (!isOpen) return null;

  const group = activeGroupDetails?.group;
  const expenses = activeGroupDetails?.expenses || [];
  const stats = activeGroupDetails?.stats || {
    totalAmount: 0,
    remainingAmount: 0,
    settledCount: 0,
    totalCount: 0,
    settledPct: 0,
  };

  const isCreator = group?.createdBy?.toString() === user?._id?.toString();
  const inviteCode = group?.inviteCode || 'FLAT101';

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) {
      setMemberError('Please enter roommate\'s registered email address.');
      return;
    }
    setMemberError('');
    setIsAddingMember(true);
    const res = await addMemberToGroup(groupId, {
      email: newMemberEmail.trim(),
    });
    setIsAddingMember(false);
    if (res.success) {
      setNewMemberEmail('');
      setNewMemberName('');
    } else {
      setMemberError(res.error || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) return;
    await removeMemberFromGroup(groupId, memberId);
  };

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    const res = await deleteGroup(groupId);
    setIsDeleting(false);
    if (res.success) {
      onClose();
    }
  };

  // SVG circular ring calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const settledPct = stats.totalCount > 0 ? stats.settledPct : 0;
  const strokeDashoffset = circumference - (settledPct / 100) * circumference;

  return (
    <div className="sv-modal-backdrop" onClick={onClose}>
      <div className="sv-modal-dialog sv-modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sv-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="sv-modal-header__title">{group?.name || 'Group Details'}</h2>
                <span className="splitvault-pill splitvault-pill--live">
                  {group?.category || 'Hostel'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                {group?.description || 'Shared roommate expenses vault'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isCreator && (
              <button
                type="button"
                className="splitvault-btn splitvault-btn--danger-outline splitvault-btn--sm"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete this group"
              >
                <Trash2 size={14} /> Delete Group
              </button>
            )}
            <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div
            style={{
              padding: '14px 20px',
              background: 'rgba(239, 68, 68, 0.12)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.88rem' }}>
              <ShieldAlert size={18} />
              <span>Are you sure you want to delete <strong>{group?.name}</strong> and all its shared expenses?</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="splitvault-btn splitvault-btn--danger splitvault-btn--sm"
                onClick={handleDeleteGroup}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        <div className="sv-modal-body">
          {groupLoading && !group ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              Loading group records...
            </div>
          ) : (
            <>
              {/* Circular Progress & Balance Ring */}
              <div className="sv-progress-ring-card">
                <div className="sv-progress-ring-wrapper">
                  <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="9"
                    />
                    <circle
                      cx="55"
                      cy="55"
                      r={radius}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="9"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div className="sv-progress-ring-text">
                    <div className="sv-progress-ring-pct" style={{ textShadow: '0 0 12px rgba(16, 185, 129, 0.5)' }}>
                      {settledPct}%
                    </div>
                    <div className="sv-progress-ring-sub">Settled</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Remaining Outstanding
                    </span>
                    <div
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: '#f59e0b',
                        textShadow: '0 0 14px rgba(245, 158, 11, 0.45)',
                      }}
                    >
                      Rs {Number(stats.remainingAmount).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Total Group Spend: <strong style={{ color: '#fff' }}>Rs {Number(stats.totalAmount).toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: stats.totalCount > 0 ? '#10b981' : '#94a3b8' }}>
                    {stats.totalCount > 0
                      ? `✓ ${stats.settledCount} of ${stats.totalCount} splits completely settled`
                      : '0 expenses recorded yet'}
                  </div>
                </div>

                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--primary"
                  onClick={() => {
                    onClose();
                    onOpenAddExpense(groupId);
                  }}
                >
                  <Plus size={16} /> Add Expense
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="sv-tabs-nav" style={{ maxWidth: '420px', margin: '0 auto' }}>
                <button
                  type="button"
                  className={`sv-tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('expenses')}
                >
                  Expenses ({expenses.length})
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                >
                  Members ({group?.members?.length || 1})
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${activeTab === 'invite' ? 'active' : ''}`}
                  onClick={() => setActiveTab('invite')}
                >
                  Invite Code
                </button>
              </div>

              {/* TAB 1: Expenses List */}
              {activeTab === 'expenses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>
                        No shared expenses recorded for this group yet.
                      </p>
                      <button
                        type="button"
                        className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                        onClick={() => {
                          onClose();
                          onOpenAddExpense(groupId);
                        }}
                      >
                        <Plus size={14} /> Add First Expense
                      </button>
                    </div>
                  ) : (
                    expenses.map((exp) => {
                      const isExpensePayer = exp.paidBy?.toString() === user?._id?.toString();
                      return (
                        <div key={exp._id} className="splitvault-expense-item">
                          <div className="splitvault-expense-item__header">
                            <div className="splitvault-expense-item__title-box">
                              <div className="splitvault-expense-item__category-icon">
                                <Receipt size={18} />
                              </div>
                              <div>
                                <h4 className="splitvault-expense-item__title">{exp.title}</h4>
                                <div className="splitvault-expense-item__meta">
                                  <span>Paid by {isExpensePayer ? 'You' : exp.paidByName}</span>
                                  <span>•</span>
                                  <span>{new Date(exp.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="splitvault-expense-item__amount-box">
                              <span className="splitvault-expense-item__amount">
                                Rs {Number(exp.totalAmount).toLocaleString()}
                              </span>
                              <span
                                className={`sv-status-pill ${
                                  exp.isFullySettled ? 'sv-status-pill--verified' : 'sv-status-pill--review'
                                }`}
                              >
                                {exp.isFullySettled ? '✓ Fully Settled' : 'Pending Splits'}
                              </span>
                            </div>
                          </div>

                          <div className="splitvault-expense-item__splits">
                            {exp.splits.map((s, idx) => {
                              const isMySplit = s.user?.toString() === user?._id?.toString();
                              const canVerify = isExpensePayer && s.status === 'UnderReview';
                              const canSubmit = isMySplit && !isExpensePayer && (s.status === 'Unpaid' || s.status === 'Rejected');

                              return (
                                <div key={idx} className="splitvault-split-row">
                                  <div className="splitvault-split-user">
                                    <div className="sv-participant-avatar" style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}>
                                      {s.name?.charAt(0) || 'M'}
                                    </div>
                                    <span>{s.name}</span>
                                  </div>

                                  <div className="splitvault-split-status">
                                    <span style={{ fontWeight: 700, color: '#e5e7eb' }}>
                                      Rs {Number(s.amount).toLocaleString()}
                                    </span>

                                    {s.status === 'Verified' && (
                                      <span className="sv-status-pill sv-status-pill--verified">
                                        ✓ Settled
                                      </span>
                                    )}

                                    {s.status === 'UnderReview' && (
                                      <span className="sv-status-pill sv-status-pill--review">
                                        Proof Under Review
                                      </span>
                                    )}

                                    {s.status === 'Unpaid' && (
                                      <span className="sv-status-pill sv-status-pill--unpaid">
                                        Unpaid
                                      </span>
                                    )}

                                    {s.status === 'Rejected' && (
                                      <span className="sv-status-pill sv-status-pill--rejected">
                                        Rejected
                                      </span>
                                    )}

                                    {canVerify && (
                                      <button
                                        type="button"
                                        className="splitvault-btn splitvault-btn--emerald splitvault-btn--sm"
                                        onClick={() => {
                                          onClose();
                                          onOpenVerification(exp, s);
                                        }}
                                      >
                                        Verify Proof
                                      </button>
                                    )}

                                    {canSubmit && (
                                      <button
                                        type="button"
                                        className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                                        onClick={() => {
                                          onClose();
                                          onOpenProofSubmit(exp, s);
                                        }}
                                      >
                                        Upload Proof
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: Members List */}
              {activeTab === 'members' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Add Member Box - Precaution Enforced: Registered Email Only */}
                  <form
                    onSubmit={handleAddMember}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      border: '1px solid var(--sv-card-border)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="email"
                        className="sv-form-input"
                        placeholder="Enter roommate's registered email (e.g. roommate@gmail.com)"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        style={{ flex: 1, minWidth: '220px' }}
                        required
                      />
                      <button
                        type="submit"
                        className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                        disabled={isAddingMember}
                      >
                        <UserPlus size={16} />
                        {isAddingMember ? 'Linking...' : 'Link Roommate'}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                      🔒 Precaution: Your roommate must already have an Expense Tracker Pro account with this email to link them.
                    </span>
                  </form>

                  {memberError && (
                    <div style={{ color: '#f87171', fontSize: '0.82rem', padding: '0 4px' }}>
                      {memberError}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group?.members?.map((m) => {
                      const isThisUser = m.user?.toString() === user?._id?.toString();
                      return (
                        <div
                          key={m._id || m.user}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--sv-card-border)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="sv-participant-avatar">
                              {m.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                                {m.name} {isThisUser ? '(You)' : ''}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                {m.email || 'Group Member'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="splitvault-pill splitvault-pill--live">
                              {m.role || 'Member'}
                            </span>
                            {isCreator && !isThisUser && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m._id || m.user)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                }}
                                title="Remove member"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: Invite Code */}
              {activeTab === 'invite' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Share this unique group invite code with your flatmates or roommates so they can join and split expenses.
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px dashed rgba(99, 102, 241, 0.4)',
                      padding: '14px 20px',
                      borderRadius: '14px',
                      maxWidth: '320px',
                      margin: '0 auto',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '2px', color: '#818cf8', fontFamily: 'monospace' }}>
                      {inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="sv-modal-footer">
          <button type="button" className="splitvault-btn splitvault-btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
