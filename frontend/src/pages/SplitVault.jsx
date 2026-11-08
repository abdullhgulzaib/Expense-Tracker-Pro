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
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Key,
  Copy,
  Scale,
  Zap,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSplitVault } from '../context/SplitVaultContext';

// Modals
import CreateSplitExpenseModal from '../components/splitvault/CreateSplitExpenseModal';
import SubmitPaymentProofModal from '../components/splitvault/SubmitPaymentProofModal';
import ProofVerificationModal from '../components/splitvault/ProofVerificationModal';
import GroupDetailsModal from '../components/splitvault/GroupDetailsModal';
import NewGroupModal from '../components/splitvault/NewGroupModal';
import JoinGroupModal from '../components/splitvault/JoinGroupModal';
import SettleNetBalanceModal from '../components/splitvault/SettleNetBalanceModal';
import VerifySettlementModal from '../components/splitvault/VerifySettlementModal';
import PaymentMethodIcon from '../components/PaymentMethodIcon';

export default function SplitVault() {
  const { user } = useAuth();
  const {
    summary,
    refreshSummary,
    deleteGroup,
    deleteSplitExpense,
    sendNudgeReminder,
  } = useSplitVault();

  // 3 Primary Sections: 'balance' | 'groups' | 'activity'
  const [activeTab, setActiveTab] = useState('balance');

  // Modal states
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [selectedGroupIdForNewExpense, setSelectedGroupIdForNewExpense] = useState(null);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);

  const [activeGroupModalId, setActiveGroupModalId] = useState(null);
  const [proofSubmitState, setProofSubmitState] = useState({ isOpen: false, expense: null, splitData: null });
  const [verificationState, setVerificationState] = useState({ isOpen: false, expense: null, splitData: null });

  // One-Shot Net Settlement Modals State
  const [settleModalState, setSettleModalState] = useState({ isOpen: false, netSettlement: null });
  const [verifySettlementState, setVerifySettlementState] = useState({ isOpen: false, settlement: null });

  // Progressive Disclosure for Activity expenses
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const toggleExpenseExpand = (id) => {
    setExpandedExpenses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Nudge loading state
  const [nudging, setNudging] = useState({});
  const handleSendNudge = async (netSettlement) => {
    const targetId = netSettlement.fromUserId;
    setNudging((prev) => ({ ...prev, [targetId]: true }));
    const res = await sendNudgeReminder({
      toUserId: targetId,
      amount: netSettlement.amount,
      recipientName: netSettlement.fromUser,
    });
    setNudging((prev) => ({ ...prev, [targetId]: false }));
    if (res.success) {
      alert(`Friendly reminder sent to ${netSettlement.fromUser}!`);
    } else {
      alert(res.error || 'Failed to send reminder.');
    }
  };

  const handleOpenSettleModal = (netSettlement) => {
    setSettleModalState({ isOpen: true, netSettlement });
  };

  const handleOpenVerifySettlement = (settlementOrNet) => {
    if (settlementOrNet?.coveredExpenses || settlementOrNet?.status) {
      setVerifySettlementState({ isOpen: true, settlement: settlementOrNet });
    } else {
      const match =
        summary.pendingSettlementsToVerify?.find(
          (st) =>
            st._id === settlementOrNet.pendingSettlementId ||
            (st.fromUser?.toString() === settlementOrNet.fromUserId &&
              st.toUser?.toString() === user?._id?.toString())
        ) ||
        summary.settlements?.find((st) => st._id === settlementOrNet.pendingSettlementId);

      if (match) {
        setVerifySettlementState({ isOpen: true, settlement: match });
      } else {
        alert('Settlement record not found or already verified.');
      }
    }
  };

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

  // Handle Delete Shared Expense (Creator / Payer only)
  const handleDeleteExpense = async (expenseId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will remove it from all roommates and adjust group balances.`)) {
      const res = await deleteSplitExpense(expenseId);
      if (!res.success) {
        alert(res.error || 'Failed to delete expense.');
      }
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
              <span className="splitvault-pill splitvault-pill--beta">
                <Sparkles size={12} /> Beta
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
            onClick={() => setIsJoinGroupOpen(true)}
            title="Join an existing group with an invite code"
          >
            <Key size={16} /> Join Group
          </button>
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
          <span className="tab-label-full">MY Balance</span>
          <span className="tab-label-short">Balance</span>
        </button>
        <button
          type="button"
          className={`splitvault-segment-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <span className="tab-label-full">Group ({groups.length})</span>
          <span className="tab-label-short">Groups ({groups.length})</span>
        </button>
        <button
          type="button"
          className={`splitvault-segment-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <span className="tab-label-full">Activity and Proof ({allExpenses.length})</span>
          <span className="tab-label-short">Activity ({allExpenses.length})</span>
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

            {/* Div 3: Amount You Owe (Warm Glowing Amber/Orange) */}
            <div className="splitvault-stat-card splitvault-stat-card--owe">
              <div className="splitvault-stat-card__top">
                <span className="splitvault-stat-card__label" style={{ color: '#f59e0b' }}>
                  Amount You Owe
                </span>
                <div className="splitvault-stat-card__icon-box splitvault-stat-card__icon-box--amber">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <div className="splitvault-stat-card__value splitvault-stat-card__value--amber">
                Rs {Number(summary.amountYouOwe || 0).toLocaleString()}
              </div>
              <div className="splitvault-stat-card__footer">
                <span style={{ color: '#f59e0b' }}>
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

          {/* Simplified Net Balances / Who Owes Whom */}
          {summary.netSettlements && summary.netSettlements.length > 0 && (
            <div className="splitvault-recent-box">
              <div className="splitvault-recent-header">
                <h2 className="splitvault-recent-title">
                  <Scale size={18} color="#10b981" />
                  <span>Simplified Net Balances</span>
                </h2>
                <span className="splitvault-pill splitvault-pill--live" style={{ fontSize: '0.74rem' }}>
                  Auto-Netted Debts
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {summary.netSettlements.map((s, idx) => {
                  const isDebtor = s.fromUserId === user?._id?.toString();
                  const isCreditor = s.toUserId === user?._id?.toString();
                  const fromName = isDebtor ? 'You' : s.fromUser;
                  const toName = isCreditor ? 'You' : s.toUser;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: isDebtor
                          ? 'rgba(245, 158, 11, 0.08)'
                          : isCreditor
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${
                          isDebtor
                            ? 'rgba(245, 158, 11, 0.28)'
                            : isCreditor
                            ? 'rgba(16, 185, 129, 0.28)'
                            : 'var(--sv-card-border)'
                        }`,
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isDebtor
                              ? 'rgba(245, 158, 11, 0.2)'
                              : isCreditor
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(255, 255, 255, 0.08)',
                            color: isDebtor ? '#f59e0b' : isCreditor ? '#10b981' : '#cbd5e1',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {fromName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                            <span style={{ color: isDebtor ? '#f59e0b' : '#fff' }}>{fromName}</span>
                            <span style={{ color: '#94a3b8', margin: '0 5px', fontWeight: 400, fontSize: '0.82rem' }}>owes</span>
                            <span style={{ color: isCreditor ? '#10b981' : '#fff' }}>{toName}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            {isDebtor ? 'You need to pay' : isCreditor ? 'To be received' : 'Mutual balance'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                        <div
                          style={{
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: isDebtor ? '#f59e0b' : isCreditor ? '#10b981' : '#fff',
                          }}
                        >
                          Rs {Number(s.amount).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <span
                            className={`sv-status-pill ${
                              isCreditor ? 'sv-status-pill--verified' : 'sv-status-pill--review'
                            }`}
                            style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                          >
                            {isDebtor ? 'You Owe' : isCreditor ? 'Owed to You' : 'Pending'}
                          </span>

                          {/* Debtor: One-shot settle button or under review indicator */}
                          {isDebtor && (
                            s.hasPendingSettlement ? (
                              <span
                                className="sv-status-pill sv-status-pill--review"
                                style={{ fontSize: '0.68rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Clock size={11} /> Proof Submitted
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                                style={{ padding: '3px 9px', fontSize: '0.74rem' }}
                                onClick={() => handleOpenSettleModal(s)}
                              >
                                <Zap size={12} /> Settle
                              </button>
                            )
                          )}

                          {/* Creditor: Review pending proof or send polite nudge */}
                          {isCreditor && (
                            s.hasPendingSettlement ? (
                              <button
                                type="button"
                                className="splitvault-btn splitvault-btn--emerald splitvault-btn--sm"
                                style={{ padding: '3px 9px', fontSize: '0.74rem' }}
                                onClick={() => handleOpenVerifySettlement(s)}
                              >
                                <ShieldCheck size={12} /> Review Proof
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                                style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                                disabled={nudging[s.fromUserId]}
                                onClick={() => handleSendNudge(s)}
                                title="Send gentle payment reminder"
                              >
                                <Bell size={12} /> {nudging[s.fromUserId] ? 'Sending...' : 'Remind'}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                No recent activity. Create or join a group to start tracking shared expenses.
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
          SECTION 2: GROUP (Group Cards - Clean Professional UI/UX)
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

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="splitvault-btn splitvault-btn--secondary"
                onClick={() => setIsJoinGroupOpen(true)}
              >
                <Key size={16} /> Join via Code
              </button>
              <button
                type="button"
                className="splitvault-btn splitvault-btn--primary"
                onClick={() => setIsNewGroupOpen(true)}
              >
                <Plus size={16} /> Add Group
              </button>
            </div>
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
                Create a group for your hostel room, flat, or outing friends — or join an existing group with an invite code.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--secondary"
                  onClick={() => setIsJoinGroupOpen(true)}
                >
                  <Key size={16} /> Join via Code
                </button>
                <button
                  type="button"
                  className="splitvault-btn splitvault-btn--primary"
                  onClick={() => setIsNewGroupOpen(true)}
                >
                  <Plus size={16} /> Create Your First Group
                </button>
              </div>
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
                    {/* Header: Title & Category on left, Category badge & Delete on right */}
                    <div className="splitvault-group-card__header">
                      <div className="splitvault-group-card__info">
                        <div className="splitvault-group-card__icon">
                          <Users size={22} />
                        </div>
                        <div className="splitvault-group-card__name-block">
                          <h3 className="splitvault-group-card__name" title={group.name}>
                            {group.name}
                          </h3>
                          <span className="splitvault-group-card__category">{group.category || 'Shared Group'}</span>
                        </div>
                      </div>

                      <div className="splitvault-group-card__actions">
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

                    {/* Row 2: Badges (Member Count + Invite Code) */}
                    <div className="splitvault-group-card__badges-row">
                      <span className="splitvault-pill splitvault-pill--live" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={13} /> {group.memberCount || 1} {group.memberCount === 1 ? 'member' : 'members'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', fontWeight: 600 }}>
                        Code: {group.inviteCode}
                      </span>
                    </div>

                    {/* Row 3: Spend Stats */}
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
                            color: '#f59e0b',
                            textShadow: '0 0 10px rgba(245, 158, 11, 0.4)',
                          }}
                        >
                          Rs {Number(group.stats?.remainingAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Row 4: Settlement Progress Bar */}
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

                    {/* Footer: Action Buttons */}
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

                      <button
                        type="button"
                        className="splitvault-btn splitvault-btn--secondary splitvault-btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenGroupDetails(group._id);
                        }}
                      >
                        Manage Group <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SECTION 3: ACTIVITY AND PROOF (Two-Tier Clean Architecture)
          Tier 1: Action Center (Settlements & Verifications Hub)
          Tier 2: Itemized Shared Expenses Ledger (Progressive Disclosure)
          ===================================================================== */}
      {activeTab === 'activity' && (
        <div className="splitvault-activity-section" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* TIER 1: ACTION CENTER */}
          <div className="sv-action-center">
            <div className="sv-action-center__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="sv-action-center__badge-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 className="sv-action-center__title">Settlement Action Center</h2>
                  <p className="sv-action-center__subtitle">
                    Batch payment approvals, submitted proofs, and 1-tap net debt clearances
                  </p>
                </div>
              </div>
            </div>

            {/* Case A: Proofs Awaiting Your Verification (Creditor View) */}
            {((summary.pendingSettlementsToVerify && summary.pendingSettlementsToVerify.length > 0) ||
              (summary.pendingVerifications && summary.pendingVerifications.length > 0)) && (
              <div className="sv-action-block sv-action-block--verify">
                <div className="sv-action-block__title">
                  <ShieldCheck size={18} color="#10b981" />
                  <span>
                    Awaiting Your Approval (
                    {(summary.pendingSettlementsToVerify?.length || 0) +
                      (summary.pendingVerifications?.length || 0)}
                    )
                  </span>
                </div>

                <div className="sv-action-card-grid">
                  {/* Batch Settlements */}
                  {summary.pendingSettlementsToVerify?.map((st) => (
                    <div key={st._id} className="sv-action-card sv-action-card--creditor">
                      <div className="sv-action-card__main">
                        <div
                          className="sv-participant-avatar sv-participant-avatar--lg"
                          style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                        >
                          {st.fromUserName?.charAt(0) || 'R'}
                        </div>
                        <div className="sv-action-card__info">
                          <div className="sv-action-card__sender">
                            <strong>{st.fromUserName || 'Roommate'}</strong> sent a <strong>Net Settlement</strong>
                          </div>
                          <div className="sv-action-card__meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <PaymentMethodIcon method={st.proof?.method} size={15} />
                            <span>via {st.proof?.method || 'Easypaisa'} • TID: {st.proof?.transactionId || 'Slip attached'} • Covering {st.coveredExpenses?.length || 0} expenses</span>
                          </div>
                          {st.proof?.senderNote && (
                            <div className="sv-action-card__note">"{st.proof.senderNote}"</div>
                          )}
                        </div>
                      </div>

                      <div className="sv-action-card__right">
                        <div className="sv-action-card__amount" style={{ color: '#10b981' }}>
                          Rs {Number(st.amount).toLocaleString()}
                        </div>
                        <button
                          type="button"
                          className="splitvault-btn splitvault-btn--emerald splitvault-btn--sm"
                          onClick={() => handleOpenVerifySettlement(st)}
                        >
                          <ShieldCheck size={14} /> Review Proof →
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Legacy Single Verifications if any */}
                  {summary.pendingVerifications?.map((item, idx) => {
                    const exp = allExpenses.find((e) => e._id === item.expenseId);
                    const matchingSplit = exp?.splits?.find(
                      (s) =>
                        s.user?.toString() === item.splitUserId?.toString() ||
                        s._id?.toString() === item.splitUserId?.toString()
                    );
                    return (
                      <div key={item.expenseId + '-' + idx} className="sv-action-card sv-action-card--creditor">
                        <div className="sv-action-card__main">
                          <div
                            className="sv-participant-avatar sv-participant-avatar--lg"
                            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                          >
                            {item.debtorName?.charAt(0) || 'R'}
                          </div>
                          <div className="sv-action-card__info">
                            <div className="sv-action-card__sender">
                              <strong>{item.debtorName}</strong> paid for <em>"{item.expenseTitle}"</em>
                            </div>
                            <div className="sv-action-card__meta">
                              via {item.method} • TID: {item.transactionId || 'Slip attached'}
                            </div>
                          </div>
                        </div>

                        <div className="sv-action-card__right">
                          <div className="sv-action-card__amount" style={{ color: '#10b981' }}>
                            Rs {Number(item.amount).toLocaleString()}
                          </div>
                          <button
                            type="button"
                            className="splitvault-btn splitvault-btn--emerald splitvault-btn--sm"
                            onClick={() => {
                              if (exp) {
                                handleOpenVerification(exp, matchingSplit || item);
                              }
                            }}
                          >
                            <ShieldCheck size={14} /> Review Proof →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Case B: Your Submitted Settlements (Debtor View - Waiting for Roommate to Approve) */}
            {summary.pendingSettlementsSubmitted && summary.pendingSettlementsSubmitted.length > 0 && (
              <div className="sv-action-block sv-action-block--pending">
                <div className="sv-action-block__title">
                  <Clock size={18} color="#f59e0b" />
                  <span>Your Submitted Proofs Under Review ({summary.pendingSettlementsSubmitted.length})</span>
                </div>

                <div className="sv-action-card-grid">
                  {summary.pendingSettlementsSubmitted.map((st) => (
                    <div key={st._id} className="sv-action-card sv-action-card--debtor">
                      <div className="sv-action-card__main">
                        <div
                          className="sv-participant-avatar sv-participant-avatar--lg"
                          style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
                        >
                          <FileCheck size={20} />
                        </div>
                        <div className="sv-action-card__info">
                          <div className="sv-action-card__sender">
                            Paid to <strong>{st.toUserName || 'Roommate'}</strong>
                          </div>
                          <div className="sv-action-card__meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <PaymentMethodIcon method={st.proof?.method} size={15} />
                            <span>via {st.proof?.method || 'Easypaisa'} • TID: {st.proof?.transactionId || 'Attached'} • Covering {st.coveredExpenses?.length || 0} expenses</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            All covered expenses will be marked as settled once {st.toUserName || 'roommate'} approves.
                          </div>
                        </div>
                      </div>

                      <div className="sv-action-card__right">
                        <div className="sv-action-card__amount" style={{ color: '#f59e0b' }}>
                          Rs {Number(st.amount).toLocaleString()}
                        </div>
                        <span className="sv-status-pill sv-status-pill--review" style={{ fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Under Review
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Case C: Active Net Debts (Debtor View - Need to Settle) */}
            {summary.netSettlements?.some(
              (s) => s.fromUserId === user?._id?.toString() && !s.hasPendingSettlement && s.amount > 0
            ) && (
              <div className="sv-action-block sv-action-block--pay">
                <div className="sv-action-block__title">
                  <Zap size={18} color="#f59e0b" />
                  <span>Pending Balances to Settle</span>
                </div>

                <div className="sv-action-card-grid">
                  {summary.netSettlements
                    .filter(
                      (s) => s.fromUserId === user?._id?.toString() && !s.hasPendingSettlement && s.amount > 0
                    )
                    .map((s, idx) => (
                      <div key={idx} className="sv-action-card sv-action-card--debtor">
                        <div className="sv-action-card__main">
                          <div
                            className="sv-participant-avatar sv-participant-avatar--lg"
                            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}
                          >
                            {s.toUser?.charAt(0) || 'R'}
                          </div>
                          <div className="sv-action-card__info">
                            <div className="sv-action-card__sender">
                              You owe <strong>{s.toUser}</strong>
                            </div>
                            <div className="sv-action-card__meta">
                              Total net debt consolidated across {s.breakdown?.length || 1} shared expenses
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Zap size={12} /> Pay once via Easypaisa/JazzCash and submit 1 proof to clear all!
                            </div>
                          </div>
                        </div>

                        <div className="sv-action-card__right">
                          <div className="sv-action-card__amount" style={{ color: '#f59e0b' }}>
                            Rs {Number(s.amount).toLocaleString()}
                          </div>
                          <button
                            type="button"
                            className="splitvault-btn splitvault-btn--primary splitvault-btn--sm"
                            onClick={() => handleOpenSettleModal(s)}
                          >
                            <Zap size={14} /> Settle Total Balance
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Empty Action Center: Everything is clean */}
            {!(
              (summary.pendingSettlementsToVerify && summary.pendingSettlementsToVerify.length > 0) ||
              (summary.pendingVerifications && summary.pendingVerifications.length > 0) ||
              (summary.pendingSettlementsSubmitted && summary.pendingSettlementsSubmitted.length > 0) ||
              summary.netSettlements?.some(
                (s) => s.fromUserId === user?._id?.toString() && !s.hasPendingSettlement && s.amount > 0
              )
            ) && (
              <div className="sv-action-center__empty">
                <CheckCircle2 size={28} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    All Balances & Settlements Up to Date!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    No pending payment proofs to review or outstanding net debts to settle.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TIER 2: SHARED EXPENSES HISTORY (PROGRESSIVE DISCLOSURE) */}
          <div className="sv-history-feed">
            <div className="sv-history-feed__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="#6366f1" />
                <h3 className="sv-history-feed__title">Itemized Shared Expenses</h3>
                <span className="splitvault-pill splitvault-pill--live" style={{ fontSize: '0.72rem' }}>
                  {allExpenses.length} Records
                </span>
              </div>
              <span className="sv-history-feed__hint">
                Tap any expense to view participant splits
              </span>
            </div>

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
                      const isExpanded = !!expandedExpenses[exp._id];
                      const isExpensePayer = exp.paidBy?.toString() === user?._id?.toString();
                      const mySplit = exp.splits?.find(
                        (s) => s.user?.toString() === user?._id?.toString()
                      );

                      return (
                        <div
                          key={exp._id}
                          className={`splitvault-expense-item ${
                            isExpanded ? 'splitvault-expense-item--expanded' : ''
                          }`}
                        >
                          {/* Row Header (Clickable to toggle progressive disclosure) */}
                          <div
                            className="splitvault-expense-item__header"
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleExpenseExpand(exp._id)}
                          >
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  className={`sv-status-pill ${
                                    exp.isFullySettled ? 'sv-status-pill--verified' : 'sv-status-pill--review'
                                  }`}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  {exp.isFullySettled ? (
                                    <>
                                      <CheckCircle2 size={12} /> Settled via Net Settlement
                                    </>
                                  ) : (
                                    'Auto-Netted in Net Debt'
                                  )}
                                </span>

                                <button
                                  type="button"
                                  className="splitvault-expense-toggle-btn"
                                  title={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpenseExpand(exp._id);
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {isExpensePayer && (
                                  <button
                                    type="button"
                                    className="splitvault-expense-delete-btn"
                                    title="Delete this shared expense"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteExpense(exp._id, exp.title);
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progressive Disclosure: Participant Breakdown */}
                          {isExpanded && (
                            <div className="splitvault-expense-item__splits">
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.74rem',
                                  color: '#94a3b8',
                                  padding: '0 4px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                <span>Roommate</span>
                                <span>Share & Status</span>
                              </div>

                              {exp.splits.map((s, idx) => {
                                const isMySplit = s.user?.toString() === user?._id?.toString();
                                const isPayerSplit = s.user?.toString() === exp.paidBy?.toString();

                                return (
                                  <div key={idx} className="splitvault-split-row">
                                    <div className="splitvault-split-user">
                                      <div
                                        className="sv-participant-avatar"
                                        style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
                                      >
                                        {s.name?.charAt(0) || 'U'}
                                      </div>
                                      <span
                                        style={{
                                          fontWeight: isMySplit ? 700 : 500,
                                          color: isMySplit ? '#38bdf8' : '#e2e8f0',
                                        }}
                                      >
                                        {s.name} {isMySplit && '(You)'}
                                        {isPayerSplit && (
                                          <span
                                            style={{
                                              fontSize: '0.7rem',
                                              color: '#10b981',
                                              marginLeft: '6px',
                                              fontWeight: 600,
                                            }}
                                          >
                                            • Paid upfront
                                          </span>
                                        )}
                                      </span>
                                    </div>

                                    <div className="splitvault-split-status">
                                      <span style={{ fontWeight: 700, color: '#e5e7eb' }}>
                                        Rs {Number(s.amount).toLocaleString()}
                                      </span>

                                      {s.status === 'Verified' && (
                                        <span className="sv-status-pill sv-status-pill--verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <CheckCircle2 size={11} /> Settled
                                        </span>
                                      )}

                                      {s.status === 'UnderReview' && (
                                        <span className="sv-status-pill sv-status-pill--review" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <Clock size={11} /> Under Review
                                        </span>
                                      )}

                                      {s.status === 'Unpaid' && (
                                        <span className="sv-status-pill sv-status-pill--unpaid">
                                          Auto-Netted
                                        </span>
                                      )}

                                      {s.status === 'Rejected' && (
                                        <span className="sv-status-pill sv-status-pill--rejected">
                                          Rejected
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Helpful Footer inside expanded card */}
                              <div
                                style={{
                                  marginTop: '8px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  fontSize: '0.76rem',
                                  color: '#94a3b8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '8px',
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Scale size={13} color="#10b981" />
                                  <span>
                                    Debts are auto-netted into your total balance. No need for separate slips per expense!
                                  </span>
                                </span>

                                {mySplit && (mySplit.status === 'Unpaid' || mySplit.status === 'Rejected') && !isExpensePayer && (
                                  <button
                                    type="button"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#818cf8',
                                      cursor: 'pointer',
                                      fontSize: '0.74rem',
                                      textDecoration: 'underline',
                                      padding: 0,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenProofSubmit(exp, mySplit);
                                    }}
                                  >
                                    Upload single receipt instead
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
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
        onOpenSettleModal={handleOpenSettleModal}
        onOpenVerifySettlement={handleOpenVerifySettlement}
      />

      {/* 5. New Group Modal */}
      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      {/* 6. Join Group Modal via Code */}
      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
      />

      {/* 7. Settle Net Balance Modal (One-Shot Batch Repayment) */}
      <SettleNetBalanceModal
        isOpen={settleModalState.isOpen}
        onClose={() => setSettleModalState({ isOpen: false, netSettlement: null })}
        netSettlement={settleModalState.netSettlement}
        onSettlementComplete={() => refreshSummary()}
      />

      {/* 8. Verify Settlement Modal (1-Tap Batch Approval) */}
      <VerifySettlementModal
        isOpen={verifySettlementState.isOpen}
        onClose={() => setVerifySettlementState({ isOpen: false, settlement: null })}
        settlement={verifySettlementState.settlement}
        onVerificationComplete={() => refreshSummary()}
      />
    </div>
  );
}
