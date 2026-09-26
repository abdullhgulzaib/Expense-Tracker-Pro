import React, { useState, useEffect } from 'react';
import { X, Users, Plus, CheckCircle2, Clock, AlertCircle, Copy, Check, Share2, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSplitVault } from '../../context/SplitVaultContext';

export default function GroupDetailsModal({ isOpen, onClose, groupId, onOpenAddExpense, onOpenVerification, onOpenProofSubmit }) {
  const { user } = useAuth();
  const { fetchGroupDetails, activeGroupDetails, groupLoading } = useSplitVault();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'members' | 'invite'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && groupId) {
      fetchGroupDetails(groupId);
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

  const inviteCode = group?.inviteCode || 'GROUP-101';

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG circular ring calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((stats.settledPct || 0) / 100) * circumference;

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
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="sv-modal-header__title">{group?.name || 'Group Details'}</h2>
                <span className="splitvault-pill splitvault-pill--beta">
                  {group?.category || 'Hostel'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                {group?.description || 'Shared roommate expenses vault'}
              </p>
            </div>
          </div>

          <button className="sv-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="sv-modal-body">
          {groupLoading && !group ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              Loading group records...
            </div>
          ) : (
            <>
              {/* Circular Progress & Balance Ring (Screen 6 Highlight) */}
              <div className="sv-progress-ring-card">
                <div className="sv-progress-ring-wrapper">
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  <div className="sv-progress-ring-text">
                    <div className="sv-progress-ring-pct">{stats.settledPct}%</div>
                    <div className="sv-progress-ring-sub">Settled</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                      Remaining Outstanding
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                      Rs {Number(stats.remainingAmount).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Total Group Spend: <strong style={{ color: '#fff' }}>Rs {Number(stats.totalAmount).toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981' }}>
                    ✓ {stats.settledCount} of {stats.totalCount} splits completely settled
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
                  <Plus size={16} /> + Add Expense
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="sv-tabs-nav" style={{ maxWidth: '400px', margin: '0 auto' }}>
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
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                      No shared expenses recorded for this group yet.
                    </div>
                  ) : (
                    expenses.map((exp) => {
                      const isCreator = exp.paidBy?.toString() === user?._id?.toString();
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
                                  <span>Paid upfront by {isCreator ? 'You' : exp.paidByName}</span>
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
                                {exp.isFullySettled ? 'Fully Settled' : 'Pending Splits'}
                              </span>
                            </div>
                          </div>

                          {/* Splits with Actions */}
                          <div className="splitvault-expense-item__splits">
                            {exp.splits.map((s, idx) => {
                              const isMySplit = s.user?.toString() === user?._id?.toString();
                              const canVerify = isCreator && s.status === 'UnderReview';
                              const canSubmit = isMySplit && (s.status === 'Unpaid' || s.status === 'Rejected');

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

                                    {/* Action button: Payer verifies, Debtor submits */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {group?.members?.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--sv-card-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="sv-participant-avatar">
                          {m.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                            {m.name} {m.user?.toString() === user?._id?.toString() ? '(You)' : ''}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            {m.email || 'Hostel Resident'}
                          </div>
                        </div>
                      </div>

                      <span className="splitvault-pill splitvault-pill--beta">
                        {m.role || 'Member'}
                      </span>
                    </div>
                  ))}
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
