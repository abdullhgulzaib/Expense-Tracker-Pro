import React, { useState } from 'react';
import {
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  FileCheck,
  Sparkles,
  ChevronRight,
  Home,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
  const { summary, loading } = useSplitVault();

  // Mobile Tab State ('balances' | 'groups' | 'activity')
  const [mobileTab, setMobileTab] = useState('balances');

  // Filter for shared expenses list
  const [expenseFilter, setExpenseFilter] = useState('all'); // 'all' | 'owe' | 'owed' | 'settled'

  // Modal states
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [selectedGroupIdForNewExpense, setSelectedGroupIdForNewExpense] = useState(null);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  const [activeGroupModalId, setActiveGroupModalId] = useState(null);
  const [proofSubmitState, setProofSubmitState] = useState({ isOpen: false, expense: null, splitData: null });
  const [verificationState, setVerificationState] = useState({ isOpen: false, expense: null, splitData: null });

  // Filtered expenses
  const allExpenses = summary.allExpenses || [];
  const filteredExpenses = allExpenses.filter((exp) => {
    const isPayer = exp.paidBy?.toString() === user?._id?.toString();
    const mySplit = exp.splits?.find((s) => s.user?.toString() === user?._id?.toString());

    if (expenseFilter === 'owe') {
      return !isPayer && mySplit && mySplit.status !== 'Verified';
    }
    if (expenseFilter === 'owed') {
      return isPayer && exp.splits?.some((s) => s.user?.toString() !== user?._id?.toString() && s.status !== 'Verified');
    }
    if (expenseFilter === 'settled') {
      return exp.isFullySettled;
    }
    return true;
  });

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

  return (
    <div className="splitvault-container">
      {/* HEADER SECTION (Screen 1 & 2) */}
      <header className="splitvault-header">
        <div className="splitvault-header__left">
          <div className="splitvault-header__icon-box">
            <Users size={28} />
          </div>
          <div className="splitvault-header__titles">
            <div className="splitvault-header__title-row">
              <h1 className="splitvault-header__title">SplitVault</h1>
              <span className="splitvault-pill splitvault-pill--beta">
                <Sparkles size={12} /> Beta
              </span>
            </div>
            <p className="splitvault-header__subtitle">
              Mutual roommate & hostel expense splitting with strict proof verification
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
            <Plus size={18} /> Create New Expense
          </button>
        </div>
      </header>

      {/* MOBILE SEGMENT SELECTOR (Matches Screen 2 mockup) */}
      <div className="splitvault-segment-tabs">
        <button
          type="button"
          className={`splitvault-segment-tab ${mobileTab === 'balances' ? 'active' : ''}`}
          onClick={() => setMobileTab('balances')}
        >
          My Balances
        </button>
        <button
          type="button"
          className={`splitvault-segment-tab ${mobileTab === 'groups' ? 'active' : ''}`}
          onClick={() => setMobileTab('groups')}
        >
          Groups ({summary.groups.length})
        </button>
        <button
          type="button"
          className={`splitvault-segment-tab ${mobileTab === 'activity' ? 'active' : ''}`}
          onClick={() => setMobileTab('activity')}
        >
          Activity & Proofs
        </button>
      </div>

      {/* 4 STAT CARDS (Desktop always, Mobile when in 'balances') */}
      <section
        className="splitvault-stats-grid"
        style={{ display: mobileTab !== 'balances' ? undefined : undefined }}
      >
        {/* Card 1: Active Groups */}
        <div className="splitvault-stat-card">
          <div className="splitvault-stat-card__top">
            <span className="splitvault-stat-card__label">Active Groups</span>
            <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--indigo">
              <Users size={20} />
            </div>
          </div>
          <div className="splitvault-stat-card__value">{summary.activeGroupsCount || 0}</div>
          <div className="splitvault-stat-card__footer">
            <span>Hostel, Friends & Flatmates</span>
          </div>
        </div>

        {/* Card 2: Total Shared Expenses */}
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
            <span>This month's group pool</span>
          </div>
        </div>

        {/* Card 3: Amount You Owe */}
        <div className="splitvault-stat-card">
          <div className="splitvault-stat-card__top">
            <span className="splitvault-stat-card__label">Amount You Owe</span>
            <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--amber">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="splitvault-stat-card__value splitvault-stat-card__value--amber">
            Rs {Number(summary.amountYouOwe || 0).toLocaleString()}
          </div>
          <div className="splitvault-stat-card__footer">
            <span>{summary.pendingYouOweCount || 0} payments awaiting proof upload</span>
          </div>
        </div>

        {/* Card 4: Amount You're Owed */}
        <div className="splitvault-stat-card">
          <div className="splitvault-stat-card__top">
            <span className="splitvault-stat-card__label">Amount You're Owed</span>
            <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--emerald">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div className="splitvault-stat-card__value splitvault-stat-card__value--emerald">
            Rs {Number(summary.amountYoureOwed || 0).toLocaleString()}
          </div>
          <div className="splitvault-stat-card__footer">
            <span>
              {summary.pendingVerifications?.length || 0} receipts ready for your verification
            </span>
          </div>
        </div>
      </section>

      {/* PAYER VERIFICATION DESK ALERT (Screen 1 & 5 banner) */}
      {summary.pendingVerifications && summary.pendingVerifications.length > 0 && (
        <div className="splitvault-payer-banner">
          <div className="splitvault-payer-banner__left">
            <div className="splitvault-payer-banner__icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.98rem' }}>
                Action Required: {summary.pendingVerifications.length} Payment Proof(s) Submitted
              </div>
              <div style={{ fontSize: '0.82rem', color: '#e5e7eb' }}>
                Roommates uploaded transfer slips for bills you paid upfront. Verify and settle their balances.
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
            Review First Proof →
          </button>
        </div>
      )}

      {/* GROUPS SECTION (Screen 1 & 6) */}
      {(mobileTab === 'balances' || mobileTab === 'groups') && (
        <section>
          <div className="splitvault-section-title">
            <h2>
              <Users size={20} color="#818cf8" />
              <span>Your SplitVault Groups</span>
            </h2>
            <button
              type="button"
              className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
              onClick={() => setIsNewGroupOpen(true)}
            >
              <Plus size={14} /> Add Group
            </button>
          </div>

          <div className="splitvault-groups-grid">
            {summary.groups.map((group) => {
              const progressPct = group.stats?.settledPct ?? 0;
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
                    <span className="splitvault-group-card__badge">
                      {group.memberCount || 1} members
                    </span>
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
                      <span className="splitvault-group-card__stat-value" style={{ color: '#f59e0b' }}>
                        Rs {Number(group.stats?.remainingAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="splitvault-group-card__progress-container">
                    <div className="splitvault-group-card__progress-labels">
                      <span style={{ color: '#10b981' }}>{progressPct}% Settled</span>
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

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: '#a5b4fc',
                      fontWeight: 600,
                      marginTop: '4px',
                    }}
                  >
                    <span>View Group & Settle</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* LOWER GRID: SHARED ACTIVITY + TRUST VAULT (Desktop 2-Col, Mobile in 'activity' or 'balances') */}
      {(mobileTab === 'balances' || mobileTab === 'activity') && (
        <div className="splitvault-main-grid">
          {/* LEFT COLUMN: ACTIVITY & EXPENSES LIST */}
          <div className="splitvault-activity-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                <Receipt size={20} color="#6366f1" />
                <span>Recent Shared Expenses</span>
              </h2>

              {/* Expense Filter Pills */}
              <div className="sv-tabs-nav" style={{ padding: '2px' }}>
                <button
                  type="button"
                  className={`sv-tab-btn ${expenseFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setExpenseFilter('all')}
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${expenseFilter === 'owe' ? 'active' : ''}`}
                  onClick={() => setExpenseFilter('owe')}
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  You Owe
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${expenseFilter === 'owed' ? 'active' : ''}`}
                  onClick={() => setExpenseFilter('owed')}
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  You're Owed
                </button>
                <button
                  type="button"
                  className={`sv-tab-btn ${expenseFilter === 'settled' ? 'active' : ''}`}
                  onClick={() => setExpenseFilter('settled')}
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  Settled
                </button>
              </div>
            </div>

            <div className="splitvault-expenses-list">
              {filteredExpenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No split expenses found matching the selected filter.
                </div>
              ) : (
                filteredExpenses.map((exp) => {
                  const isPayer = exp.paidBy?.toString() === user?._id?.toString();

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
                              <span>
                                {isPayer ? 'Paid upfront by You' : `Paid by ${exp.paidByName}`}
                              </span>
                              {exp.groupName && (
                                <>
                                  <span>•</span>
                                  <span style={{ color: '#a5b4fc' }}>{exp.groupName}</span>
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

                      {/* Splits List with Role-based Actions */}
                      <div className="splitvault-expense-item__splits">
                        {exp.splits.map((s, idx) => {
                          const isMySplit = s.user?.toString() === user?._id?.toString();
                          // STRICT SECURITY LOGIC:
                          // ONLY payer can verify! Debtor CANNOT verify their own proof!
                          const canPayerVerify = isPayer && s.status === 'UnderReview';
                          const canDebtorUpload = isMySplit && !isPayer && (s.status === 'Unpaid' || s.status === 'Rejected');

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

                                {/* ACTION 1: STRICT PAYER ONLY VERIFY */}
                                {canPayerVerify && (
                                  <button
                                    type="button"
                                    className="splitvault-btn splitvault-btn--emerald splitvault-btn--sm"
                                    onClick={() => handleOpenVerification(exp, s)}
                                  >
                                    <ShieldCheck size={14} /> Review Proof
                                  </button>
                                )}

                                {/* ACTION 2: DEBTOR UPLOAD PROOF */}
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
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ZERO DISPUTES GUARANTEE & TRUST CARD */}
          <div className="splitvault-trust-card">
            <div className="splitvault-trust-card__icon">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h3 className="splitvault-trust-card__title">Zero-Disputes Settlement</h3>
              <p className="splitvault-trust-card__desc">
                SplitVault removes hostel & roommate friction by requiring verified transaction receipts
                before deducting mutual balances.
              </p>
            </div>

            <div className="splitvault-trust-card__features">
              <div className="splitvault-trust-feature">
                <CheckCircle2 size={16} />
                <span><strong>Strict Payer-Only Approval:</strong> Only whoever paid upfront can approve transfer proofs.</span>
              </div>
              <div className="splitvault-trust-feature">
                <CheckCircle2 size={16} />
                <span><strong>E-Receipt Capture:</strong> Supports JazzCash, Easypaisa, Raast & Bank Transfer slips.</span>
              </div>
              <div className="splitvault-trust-feature">
                <CheckCircle2 size={16} />
                <span><strong>Auto Personal Ledger:</strong> Settling a split automatically logs an expense entry in the debtor's account.</span>
              </div>
              <div className="splitvault-trust-feature">
                <CheckCircle2 size={16} />
                <span><strong>Audit Trail & TID:</strong> Reference numbers and timestamps are permanently tracked.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Screen 2) */}
      <nav className="sv-mobile-nav">
        <NavLink to="/" className="sv-mobile-nav__item">
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/transactions" className="sv-mobile-nav__item">
          <Receipt size={20} />
          <span>Transactions</span>
        </NavLink>
        <NavLink to="/splitvault" className="sv-mobile-nav__item active">
          <Users size={20} />
          <span>SplitVault</span>
        </NavLink>
        <NavLink to="/analytics" className="sv-mobile-nav__item">
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/settings" className="sv-mobile-nav__item">
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

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
