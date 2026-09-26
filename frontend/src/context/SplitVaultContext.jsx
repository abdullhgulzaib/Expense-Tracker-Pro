import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const SplitVaultContext = createContext(null);

export function SplitVaultProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [summary, setSummary] = useState({
    activeGroupsCount: 0,
    totalSharedExpenses: 0,
    amountYouOwe: 0,
    pendingYouOweCount: 0,
    amountYoureOwed: 0,
    pendingYoureOwedCount: 0,
    groups: [],
    recentActivity: [],
    pendingVerifications: [],
    allExpenses: [],
  });

  const [loading, setLoading] = useState(false);
  const [activeGroupDetails, setActiveGroupDetails] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);

  // Fetch SplitVault master dashboard summary
  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/splitvault/summary');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load SplitVault summary:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch specific group details
  const fetchGroupDetails = useCallback(async (groupId) => {
    setGroupLoading(true);
    try {
      const { data } = await api.get(`/splitvault/groups/${groupId}`);
      setActiveGroupDetails(data);
      return data;
    } catch (err) {
      console.error('Failed to load group details:', err);
      return null;
    } finally {
      setGroupLoading(false);
    }
  }, []);

  // Create a new group
  const createGroup = async (groupData) => {
    try {
      const { data } = await api.post('/splitvault/groups', groupData);
      addNotification({
        title: 'Group Created',
        message: `SplitVault group "${data.name}" created successfully.`,
        type: 'welcome',
      });
      await fetchSummary();
      return { success: true, group: data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Create a new split expense
  const createSplitExpense = async (expenseData) => {
    try {
      const { data } = await api.post('/splitvault/expenses', expenseData);
      addNotification({
        title: 'Split Expense Created',
        message: `"${data.title}" (Rs ${data.totalAmount}) recorded and split.`,
        type: 'expense-add',
      });
      await fetchSummary();
      if (data.groupId) {
        await fetchGroupDetails(data.groupId);
      }
      return { success: true, expense: data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Debtor submits payment proof
  const submitProof = async (expenseId, splitUserId, proofData) => {
    try {
      const { data } = await api.post(
        `/splitvault/expenses/${expenseId}/splits/${splitUserId}/proof`,
        proofData
      );
      addNotification({
        title: 'Proof Submitted',
        message: 'Payment proof sent for verification.',
        type: 'welcome',
      });
      await fetchSummary();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Payer verifies or rejects proof (Strict Payer Only!)
  const verifyProof = async (expenseId, splitUserId, { action, reason }) => {
    try {
      const { data } = await api.post(
        `/splitvault/expenses/${expenseId}/splits/${splitUserId}/verify`,
        { action, reason }
      );
      if (action === 'APPROVE') {
        addNotification({
          title: 'Payment Verified & Settled',
          message: 'Roommate balance marked as settled.',
          type: 'expense',
        });
      } else {
        addNotification({
          title: 'Payment Proof Rejected',
          message: 'Roommate notified to re-submit proof.',
          type: 'alert',
        });
      }
      await fetchSummary();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Delete a group
  const deleteGroup = async (groupId) => {
    try {
      await api.delete(`/splitvault/groups/${groupId}`);
      addNotification({
        title: 'Group Deleted',
        message: 'Group and associated split records removed.',
        type: 'alert',
      });
      await fetchSummary();
      setActiveGroupDetails(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Add member to group
  const addMemberToGroup = async (groupId, memberData) => {
    try {
      const { data } = await api.post(`/splitvault/groups/${groupId}/members`, memberData);
      addNotification({
        title: 'Member Added',
        message: `${memberData.name} added to the group.`,
        type: 'welcome',
      });
      await fetchGroupDetails(groupId);
      await fetchSummary();
      return { success: true, group: data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Remove member from group
  const removeMemberFromGroup = async (groupId, memberId) => {
    try {
      const { data } = await api.delete(`/splitvault/groups/${groupId}/members/${memberId}`);
      await fetchGroupDetails(groupId);
      await fetchSummary();
      return { success: true, group: data };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  // Join a group by invite code
  const joinGroup = async (inviteCode) => {
    try {
      const { data } = await api.post('/splitvault/groups/join', { inviteCode });
      addNotification({
        title: 'Joined Group',
        message: data.message || 'Joined group successfully!',
        type: 'welcome',
      });
      await fetchSummary();
      return { success: true, group: data.group };
    } catch (err) {
      return { success: false, error: err?.response?.data?.error || err.message };
    }
  };

  return (
    <SplitVaultContext.Provider
      value={{
        summary,
        loading,
        refreshSummary: fetchSummary,
        activeGroupDetails,
        groupLoading,
        fetchGroupDetails,
        createGroup,
        joinGroup,
        deleteGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        createSplitExpense,
        submitProof,
        verifyProof,
      }}
    >
      {children}
    </SplitVaultContext.Provider>
  );
}

export function useSplitVault() {
  const context = useContext(SplitVaultContext);
  if (!context) {
    throw new Error('useSplitVault must be used within a SplitVaultProvider');
  }
  return context;
}
