import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShieldCheck,
  Receipt,
  FileCheck,
  Sparkles,
  ChevronRight,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSplitVault } from '../context/SplitVaultContext';

// Modals
import CreateSplitExpenseModal from '../components/splitvault/CreateSplitExpenseModal';
import SubmitPaymentProofModal from '../components/splitvault/SubmitPaymentProofModal';
import ProofVerificationModal from '../components/splitvault/ProofVerificationModal';
import GroupDetailsModal from '../components/splitvault/GroupDetailsModal';
import NewGroupModal from '../components/splitvault/NewGroupModal';

export default function SplitVault() {
  const { user } = useAuth();
  const { summary, deleteGroup } = useSplitVault();

  // 3 Primary Sections: 'balance' | 'groups' | 'activity'
  const [activeTab, setActiveTab] = useState('balance');

  // Modal states
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [selectedGroupIdForNewExpense, setSelectedGroupIdForNewExpense] = useState(null);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  const [activeGroupModalId, setActiveGroupModalId] = useState(null);
  const [proofSubmitState, setProofSubmitState] = useState({ isOpen: false, expense: null, splitData: null });
  const [verificationState, setVerificationState] = useState({ isOpen: false, expense: null, splitData: null });

  const allExpenses = summary.allExpenses || [];
  const groups = summary.groups || [];
  const recentActivity = summary.recentActivity || [];

  // Group all expenses month-wise for "Activity and Proof" section
  const monthWiseExpenses = useMemo(() => {
    const map = {};
    allExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!map[monthYear]) {
        map[monthYear] = [];
      }
      map[monthYear].push(exp);
    });
    return map;
  }, [allExpenses]);

  // Open Proof Submit Modal (For Debtor)
  const handleOpenProofSubmit = (expense, splitData) => {
    setProofSubmitState({
      isOpen: true,
      expense,
      splitData,
    });
  };

  // Open Verification Modal (For Payer Only)
  const handleOpenVerification = (expense, splitData) => {
    setVerificationState({
      isOpen: true,
      expense,
      splitData,
    });
  };

  // Open Group Details
  const handleOpenGroupDetails = (groupId) => {
    setActiveGroupModalId(groupId);
  };

  // Handle Delete Group directly from card
  const handleDeleteGroupCard = async (e, grp) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${grp.name}" and all its shared expenses?`)) {
      await deleteGroup(grp._id);
    }
  };

  return (
    <div className="splitvault-container">
      {/* HEADER SECTION */}
      <header className="splitvault-header">
        <div className="splitvault-header__left">
          <div className="splitvault-header__icon-box">
            <Users size={26} />
          </div>
          <div className="splitvault-header__titles">
            <div className="splitvault-header__title-row">
              <h1 className="splitvault-header__title">SplitVault</h1>
              <span className="splitvault-pill splitvault-pill--live">
                <Sparkles size={12} /> Active
              </span>
            </div>
            <p className="splitvault-header__subtitle">
              Mutual roommate & hostel expense splitting with proof verification
            </p>
          </div>
        </div>

        <div className="splitvault-header__actions">
          <button
            type="button"
            className="splitvault-btn splitvault-btn--secondary"
            onClick={() => setIsNewGroupOpen(true)}
          >
            <Plus size={16} /> New Group
          </button>
          <button
            type="button"
            className="splitvault-btn splitvault-btn--primary"
            onClick={() => {
              setSelectedGroupIdForNewExpense(null);
              setIsCreateExpenseOpen(true);
            }}
          >
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </header>

      {/* 3 PRIMARY SECTION SELECTOR */}
      <div className="splitvault-segment-tabs">
        <button
          type="button"
          className={`splitvault-segment-tab ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          MY Balance
        </button>
        <button
          type="button"
          className={`splitvault-segment-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Group ({groups.length})
        </button>
        <button
          type="button"
          className={`splitvault-segment-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity and Proof ({allExpenses.length})
        </button>
      </div>

      {/* =====================================================================
          SECTION 1: MY BALANCE (4 Analytics Divs + 3-4 Recent Activities Only)
          ===================================================================== */}
      {activeTab === 'balance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 4 Stat Cards */}
          <div className="splitvault-stats-grid">
            {/* Div 1: Active Groups */}
            <div className="splitvault-stat-card">
              <div className="splitvault-stat-card__top">
                <span className="splitvault-stat-card__label">Active Groups</span>
                <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--indigo">
                  <Users size={20} />
                </div>
              </div>
              <div className="splitvault-stat-card__value">{summary.activeGroupsCount || 0}</div>
              <div className="splitvault-stat-card__footer">
                <span>Total groups you belong to</span>
              </div>
            </div>

            {/* Div 2: Total Shared Spend */}
            <div className="splitvault-stat-card">
              <div className="splitvault-stat-card__top">
                <span className="splitvault-stat-card__label">Total Shared Spend</span>
                <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--sky">
                  <Wallet size={20} />
                </div>
              </div>
              <div className="splitvault-stat-card__value">
                Rs {Number(summary.totalSharedExpenses || 0).toLocaleString()}
              </div>
              <div className="splitvault-stat-card__footer">
                <span>Month-to-date group total</span>
              </div>
            </div>

            {/* Div 3: Amount You Owe (Glowing Red) */}
            <div className="splitvault-stat-card splitvault-stat-card--owe">
              <div className="splitvault-stat-card__top">
                <span className="splitvault-stat-card__label" style={{ color: '#f87171' }}>
                  Amount You Owe
                </span>
                <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--red">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <div className="splitvault-stat-card__value splitvault-stat-card__value--red">
                Rs {Number(summary.amountYouOwe || 0).toLocaleString()}
              </div>
              <div className="splitvault-stat-card__footer">
                <span style={{ color: '#f87171' }}>
                  {summary.pendingYouOweCount || 0} split payments due
                </span>
              </div>
            </div>

            {/* Div 4: Amount You're Owed (Glowing Green) */}
            <div className="splitvault-stat-card splitvault-stat-card--owed">
              <div className="splitvault-stat-card__top">
                <span className="splitvault-stat-card__label" style={{ color: '#34d399' }}>
                  Amount You're Owed
                </span>
                <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--emerald">
                  <ArrowDownLeft size={20} />
                </div>
              </div>
              <div className="splitvault-stat-card__value splitvault-stat-card__value--emerald">
                Rs {Number(summary.amountYoureOwed || 0).toLocaleString()}
              </div>
              <div className="splitvault-stat-card__footer">
                <span style={{ color: '#34d399' }}>
                  {summary.pendingVerifications?.length || 0} proofs waiting your approval
                </span>
              </div>
            </div>
          </div>

          {/* 3-4 Recent Activities */}
          <div className="splitvault-recent-box">
            <div className="splitvault-recent-header">
              <h2 className="splitvault-recent-title">
                <Receipt size={18} color="#6366f1" />
                <span>Recent Activities</span>
              </h2>
              {recentActivity.length > 4 && (
                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                  onClick={() => setActiveTab('activity')}
                >
                  View All ({recentActivity.length})
                </button>
              )}
            </div>

            {recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                No recent activity. Create a group and split an expense to start tracking.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentActivity.slice(0, 4).map((act) => (
                  <div key={act.id} className="splitvault-recent-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="splitvault-expense-item__category-icon" style={{ width: '36px', height: '36px' }}>
                        <Receipt size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {act.subtitle} • {new Date(act.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                        Rs {Number(act.amount).toLocaleString()}
                      </span>
                      <span
                        className={`sv-status-pill ${
                          act.badgeColor === 'emerald' ? 'sv-status-pill--verified' : 'sv-status-pill--review'
                        }`}
                      >
                        {act.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: GROUP (Group Cards + Add + Delete Functionality Only)
          ===================================================================== */}
      {activeTab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} color="#6366f1" />
                <span>Your Groups</span>
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Manage groups, track member splits, and settle balances
              </p>
            </div>

            <button
              type="button"
              className="splitvault-btn splitvault-btn--primary"
              onClick={() => setIsNewGroupOpen(true)}
            >
              <Plus size={16} /> Add Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                background: 'var(--sv-surface)',
                borderRadius: 'var(--sv-radius)',
                border: '1px solid var(--sv-card-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--sv-primary-light)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={28} />
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>No Groups Created Yet</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', maxWidth: '380px' }}>
                Create a group for your hostel room, flat, or outing friends to split expenses effortlessly.
              </p>
              <button
                type="button"
                className="splitvault-btn splitvault-btn--primary"
                onClick={() => setIsNewGroupOpen(true)}
              >
                <Plus size={16} /> Create Your First Group
              </button>
            </div>
          ) : (
            <div className="splitvault-groups-grid">
              {groups.map((group) => {
                const progressPct = group.stats?.settledPct ?? 0;
                const isGroupCreator = group.createdBy?.toString() === user?._id?.toString();

                return (
                  <div
                    key={group._id}
                    className="splitvault-group-card"
                    onClick={() => handleOpenGroupDetails(group._id)}
                  >
                    <div className="splitvault-group-card__header">
                      <div className="splitvault-group-card__info">
                        <div className="splitvault-group-card__icon">
                          <Users size={22} />
                        </div>
                        <div>
                          <h3 className="splitvault-group-card__name">{group.name}</h3>
                          <span className="splitvault-group-card__category">{group.category || 'Shared'}</span>
                        </div>
                      </div>

                      <div className="splitvault-group-card__actions">
                        <span className="splitvault-pill splitvault-pill--live">
                          {group.memberCount || 1} members
                        </span>
                        {isGroupCreator && (
                          <button
                            type="button"
                            className="splitvault-btn splitvault-btn--danger-outline splitvault-btn--sm"
                            onClick={(e) => handleDeleteGroupCard(e, group)}
                            title="Delete Group"
                            style={{ padding: '4px 8px', minHeight: '30px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="splitvault-group-card__stats">
                      <div className="splitvault-group-card__stat-item">
                        <span className="splitvault-group-card__stat-label">Total Spend</span>
                        <span className="splitvault-group-card__stat-value">
                          Rs {Number(group.stats?.totalAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="splitvault-group-card__stat-item" style={{ textAlign: 'right' }}>
                        <span className="splitvault-group-card__stat-label">Remaining</span>
                        <span
                          className="splitvault-group-card__stat-value"
                          style={{
                            color: '#ef4444',
                            textShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
                          }}
                        >
                          Rs {Number(group.stats?.remainingAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="splitvault-group-card__progress-container">
                      <div className="splitvault-group-card__progress-labels">
                        <span style={{ color: '#10b981', fontWeight: 700 }}>
                          {progressPct}% Settled
                        </span>
                        <span style={{ color: '#9ca3af' }}>
                          {group.stats?.settledCount || 0}/{group.stats?.totalCount || 0} Paid
                        </span>
                      </div>
                      <div className="splitvault-group-card__progress-bar">
                        <div
                          className="splitvault-group-card__progress-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="splitvault-group-card__footer">
                      <button
                        type="button"
                        className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroupIdForNewExpense(group._id);
                          setIsCreateExpenseOpen(true);
                        }}
                      >
                        <Plus size={14} /> Add Expense
                      </button>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.82rem',
                          color: '#818cf8',
                          fontWeight: 600,
                        }}
                      >
                        <span>Manage Group</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SECTION 3: ACTIVITY AND PROOF (Month-Wise Grouping, Trust Div Removed)
          ===================================================================== */}
      {activeTab === 'activity' && (
        <div className="splitvault-activity-section">
          {/* Payer Verification Alert Banner */}
          {summary.pendingVerifications && summary.pendingVerifications.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--sv-radius)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: 'var(--sv-red-glow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--sv-red-light)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.98rem' }}>
                    Action Required: {summary.pendingVerifications.length} Payment Proof(s) Submitted
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#e5e7eb' }}>
                    Roommates uploaded transfer receipts for expenses you paid. Verify to settle their balance.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="splitvault-btn splitvault-btn--emerald splitvault-btn--sm"
                onClick={() => {
                  const item = summary.pendingVerifications[0];
                  const exp = allExpenses.find((e) => e._id === item.expenseId);
                  if (exp) {
                    handleOpenVerification(exp, item.split);
                  }
                }}
              >
                Review Proof →
              </button>
            </div>
          )}

          {allExpenses.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                background: 'var(--sv-surface)',
                borderRadius: 'var(--sv-radius)',
                border: '1px solid var(--sv-card-border)',
                color: '#94a3b8',
              }}
            >
              <Receipt size={32} style={{ margin: '0 auto 12px', color: '#6366f1' }} />
              <h3 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.1rem' }}>No Shared Expenses Yet</h3>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                When you or your roommates add shared expenses, all records will appear here grouped by month.
              </p>
            </div>
          ) : (
            Object.keys(monthWiseExpenses).map((monthKey) => (
              <div key={monthKey} className="splitvault-month-group">
                <div className="splitvault-month-header">
                  <Calendar size={16} />
                  <span>{monthKey}</span>
                </div>

                <div className="splitvault-expenses-list">
                  {monthWiseExpenses[monthKey].map((exp) => {
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
                                <span>Paid upfront by {isExpensePayer ? 'You' : exp.paidByName}</span>
                                {exp.groupName && (
                                  <>
                                    <span>•</span>
                                    <span style={{ color: '#818cf8' }}>{exp.groupName}</span>
                                  </>
                                )}
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

                        {/* Splits */}
                        <div className="splitvault-expense-item__splits">
                          {exp.splits.map((s, idx) => {
                            const isMySplit = s.user?.toString() === user?._id?.toString();
                            const canVerify = isExpensePayer && s.status === 'UnderReview';
                            const canDebtorUpload = isMySplit && !isExpensePayer && (s.status === 'Unpaid' || s.status === 'Rejected');

                            return (
                              <div key={idx} className="splitvault-split-row">
                                <div className="splitvault-split-user">
                                  <div
                                    className="sv-participant-avatar"
                                    style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
                                  >
                                    {s.name?.charAt(0) || 'U'}
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
                                      onClick={() => handleOpenVerification(exp, s)}
                                    >
                                      <ShieldCheck size={14} /> Review Proof
                                    </button>
                                  )}

                                  {canDebtorUpload && (
                                    <button
                                      type="button"
                                      className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                                      onClick={() => handleOpenProofSubmit(exp, s)}
                                    >
                                      <FileCheck size={14} /> Upload Proof
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Create Split Expense Modal */}
      <CreateSplitExpenseModal
        isOpen={isCreateExpenseOpen}
        onClose={() => setIsCreateExpenseOpen(false)}
        preselectedGroupId={selectedGroupIdForNewExpense}
      />

      {/* 2. Submit Payment Proof Modal (Debtor) */}
      <SubmitPaymentProofModal
        isOpen={proofSubmitState.isOpen}
        onClose={() => setProofSubmitState({ isOpen: false, expense: null, splitData: null })}
        expense={proofSubmitState.expense}
        splitData={proofSubmitState.splitData}
      />

      {/* 3. Proof Verification Modal (Payer Only) */}
      <ProofVerificationModal
        isOpen={verificationState.isOpen}
        onClose={() => setVerificationState({ isOpen: false, expense: null, splitData: null })}
        expense={verificationState.expense}
        splitData={verificationState.splitData}
      />

      {/* 4. Group Details Modal */}
      <GroupDetailsModal
        isOpen={!!activeGroupModalId}
        groupId={activeGroupModalId}
        onClose={() => setActiveGroupModalId(null)}
        onOpenAddExpense={(grpId) => {
          setSelectedGroupIdForNewExpense(grpId);
          setIsCreateExpenseOpen(true);
        }}
        onOpenVerification={handleOpenVerification}
        onOpenProofSubmit={handleOpenProofSubmit}
      />

      {/* 5. New Group Modal */}
      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />
    </div>
  );
}
