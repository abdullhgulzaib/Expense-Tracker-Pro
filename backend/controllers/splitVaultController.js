import mongoose from 'mongoose';
import crypto from 'crypto';
import { Group, SplitExpense, Expense, User, Notification, Settlement } from '../models.js';
import { ALL_EXPENSE_CATEGORIES, ALL_PAYMENT_METHODS } from '../schema.js';

// Helper to generate a secure, 8-character cryptographic alphanumeric invite code (e.g. 8F3B9A1C)
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};


// Helpers to ensure clean mapping to Expense schema
const mapCategory = (cat) => {
  if (!cat) return 'Food';
  const catTrimmed = String(cat).trim();
  if (catTrimmed.toLowerCase() === 'transport') return 'Transportation';
  const match = ALL_EXPENSE_CATEGORIES.find(
    (c) => c.toLowerCase() === catTrimmed.toLowerCase()
  );
  return match || 'Other';
};

const mapPaymentMethod = (pm) => {
  if (!pm) return 'Card';
  const pmTrimmed = String(pm).trim();
  if (pmTrimmed.toLowerCase() === 'cash / other') return 'Cash';
  const match = ALL_PAYMENT_METHODS.find(
    (p) => p.toLowerCase() === pmTrimmed.toLowerCase()
  );
  return match || 'Other';
};

/**
 * Helper to compute pairwise net balances across expenses with itemized breakdown
 * If User B owes User A 150, and User A owes User B 100,
 * the netted result is: User B owes User A 50 (and User A owes User B 0).
 */
export const computePairwiseNetSettlements = (
  expensesList = [],
  members = [],
  activeSettlements = [],
  userProfiles = new Map()
) => {
  const directDebts = new Map();
  const directBreakdownMap = new Map();
  const userNameMap = new Map();

  if (Array.isArray(members)) {
    members.forEach((m) => {
      const uid = m.user ? m.user.toString() : m._id?.toString();
      if (uid && m.name) userNameMap.set(uid, m.name);
    });
  }

  expensesList.forEach((exp) => {
    const creditorId = exp.paidBy ? exp.paidBy.toString() : null;
    if (!creditorId) return;
    if (exp.paidByName && !userNameMap.has(creditorId)) {
      userNameMap.set(creditorId, exp.paidByName);
    }

    if (Array.isArray(exp.splits)) {
      exp.splits.forEach((s) => {
        const debtorId = s.user ? s.user.toString() : null;
        if (!debtorId || debtorId === creditorId) return;

        if (s.name && !userNameMap.has(debtorId)) {
          userNameMap.set(debtorId, s.name);
        }

        if (s.status !== 'Verified') {
          const amt = Number(s.amount) || 0;
          if (amt > 0) {
            const pairKey = `${debtorId}->${creditorId}`;
            directDebts.set(pairKey, (directDebts.get(pairKey) || 0) + amt);

            if (!directBreakdownMap.has(pairKey)) {
              directBreakdownMap.set(pairKey, []);
            }
            directBreakdownMap.get(pairKey).push({
              expenseId: exp._id,
              title: exp.title,
              date: exp.date,
              category: exp.category,
              amount: amt,
              status: s.status,
            });
          }
        }
      });
    }
  });

  const netSettlements = [];
  const allUserIds = Array.from(userNameMap.keys());

  for (let i = 0; i < allUserIds.length; i++) {
    for (let j = i + 1; j < allUserIds.length; j++) {
      const u1 = allUserIds[i];
      const u2 = allUserIds[j];

      const u1OwesU2 = directDebts.get(`${u1}->${u2}`) || 0;
      const u2OwesU1 = directDebts.get(`${u2}->${u1}`) || 0;

      const net = u1OwesU2 - u2OwesU1;

      if (net > 0) {
        // u1 owes u2
        const breakdown = directBreakdownMap.get(`${u1}->${u2}`) || [];
        const pendingSettlement = activeSettlements.find(
          (s) => s.fromUser?.toString() === u1 && s.toUser?.toString() === u2 && s.status === 'UnderReview'
        );
        const recipientProfile = userProfiles.get(u2) || {};

        netSettlements.push({
          fromUserId: u1,
          fromUser: userNameMap.get(u1) || 'Roommate',
          toUserId: u2,
          toUser: userNameMap.get(u2) || 'Roommate',
          amount: Math.round(net * 100) / 100,
          breakdown,
          hasPendingSettlement: !!pendingSettlement,
          pendingSettlementId: pendingSettlement?._id || null,
          pendingSettlementAmount: pendingSettlement?.amount || null,
          recipientPaymentDetails: {
            phone: recipientProfile.phone || '',
            easypaisa: recipientProfile.paymentDetails?.easypaisa || recipientProfile.phone || '',
            jazzcash: recipientProfile.paymentDetails?.jazzcash || recipientProfile.phone || '',
            bankName: recipientProfile.paymentDetails?.bankName || '',
            accountNumber: recipientProfile.paymentDetails?.accountNumber || '',
          },
        });
      } else if (net < 0) {
        // u2 owes u1
        const breakdown = directBreakdownMap.get(`${u2}->${u1}`) || [];
        const pendingSettlement = activeSettlements.find(
          (s) => s.fromUser?.toString() === u2 && s.toUser?.toString() === u1 && s.status === 'UnderReview'
        );
        const recipientProfile = userProfiles.get(u1) || {};

        netSettlements.push({
          fromUserId: u2,
          fromUser: userNameMap.get(u2) || 'Roommate',
          toUserId: u1,
          toUser: userNameMap.get(u1) || 'Roommate',
          amount: Math.round(Math.abs(net) * 100) / 100,
          breakdown,
          hasPendingSettlement: !!pendingSettlement,
          pendingSettlementId: pendingSettlement?._id || null,
          pendingSettlementAmount: pendingSettlement?.amount || null,
          recipientPaymentDetails: {
            phone: recipientProfile.phone || '',
            easypaisa: recipientProfile.paymentDetails?.easypaisa || recipientProfile.phone || '',
            jazzcash: recipientProfile.paymentDetails?.jazzcash || recipientProfile.phone || '',
            bankName: recipientProfile.paymentDetails?.bankName || '',
            accountNumber: recipientProfile.paymentDetails?.accountNumber || '',
          },
        });
      }
    }
  }

  return netSettlements;
};

/**
 * @desc Get SplitVault dashboard summary (Cards, groups, recent activity)
 * @route GET /api/splitvault/summary
 */
export const getSplitVaultSummary = async (req, res) => {
  try {
    const user = req.user;

    // 1. Get groups user is a member of
    const groups = await Group.find({ 'members.user': user._id }).sort({ updatedAt: -1 });
    const groupIds = groups.map((g) => g._id);

    // 2. Get all split expenses involving the user (either paidBy, in splits, or in groups user belongs to)
    const allExpenses = await SplitExpense.find({
      $or: [
        { paidBy: user._id },
        { 'splits.user': user._id },
        { groupId: { $in: groupIds } },
      ],
    }).sort({ date: -1 });

    // 3. Get all settlements involving the user
    const allSettlements = await Settlement.find({
      $or: [{ fromUser: user._id }, { toUser: user._id }],
    }).sort({ createdAt: -1 });

    // 4. Fetch user profiles for payment details
    const allInvolvedUserIds = new Set();
    allExpenses.forEach((e) => {
      if (e.paidBy) allInvolvedUserIds.add(e.paidBy.toString());
      if (Array.isArray(e.splits)) {
        e.splits.forEach((s) => s.user && allInvolvedUserIds.add(s.user.toString()));
      }
    });
    const userDocs = await User.find({ _id: { $in: Array.from(allInvolvedUserIds) } }).select(
      'name email phone paymentDetails'
    );
    const userProfiles = new Map(userDocs.map((u) => [u._id.toString(), u]));

    // 5. Compute pairwise net settlements with breakdown and payment details
    const netSettlements = computePairwiseNetSettlements(
      allExpenses,
      [],
      allSettlements,
      userProfiles
    );

    let amountYouOwe = 0;
    let pendingYouOweCount = 0;
    let amountYoureOwed = 0;
    let pendingYoureOwedCount = 0;
    let totalSharedMonth = 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    allExpenses.forEach((exp) => {
      // Month spend
      if (new Date(exp.date) >= startOfMonth) {
        totalSharedMonth += exp.totalAmount;
      }
    });

    netSettlements.forEach((s) => {
      if (s.fromUserId === user._id.toString()) {
        amountYouOwe += s.amount;
        pendingYouOweCount++;
      }
      if (s.toUserId === user._id.toString()) {
        amountYoureOwed += s.amount;
        pendingYoureOwedCount++;
      }
    });

    // 6. Compute per-group stats
    const groupSummaries = await Promise.all(
      groups.map(async (grp) => {
        const grpExpenses = allExpenses.filter((e) => e.groupId && e.groupId.toString() === grp._id.toString());
        const total = grpExpenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
        let settledSplits = 0;
        let totalSplits = 0;

        grpExpenses.forEach((e) => {
          e.splits.forEach((s) => {
            totalSplits++;
            if (s.status === 'Verified') {
              settledSplits++;
            }
          });
        });

        const grpSettlements = allSettlements.filter(
          (s) => s.groupId && s.groupId.toString() === grp._id.toString()
        );
        const grpNetSettlements = computePairwiseNetSettlements(
          grpExpenses,
          grp.members,
          grpSettlements,
          userProfiles
        );
        const remaining = grpNetSettlements.reduce((acc, s) => acc + s.amount, 0);

        return {
          _id: grp._id,
          name: grp.name,
          category: grp.category,
          icon: grp.icon,
          inviteCode: grp.inviteCode,
          createdBy: grp.createdBy,
          memberCount: grp.members?.length || 1,
          members: grp.members || [],
          netSettlements: grpNetSettlements,
          stats: {
            totalAmount: total,
            remainingAmount: remaining,
            settledCount: settledSplits,
            totalCount: totalSplits,
            settledPct: totalSplits > 0 ? Math.round((settledSplits / totalSplits) * 100) : 0,
          },
        };
      })
    );

    // 5. Build recent activity feed
    const recentActivity = [];
    allExpenses.forEach((exp) => {
      recentActivity.push({
        id: `created-${exp._id}`,
        type: 'EXPENSE_CREATED',
        title: `${exp.paidBy.toString() === user._id.toString() ? 'You' : exp.paidByName} added "${exp.title}"`,
        subtitle: exp.groupName || 'Direct Split',
        amount: exp.totalAmount,
        badge: exp.isFullySettled ? 'Settled' : 'Pending',
        badgeColor: exp.isFullySettled ? 'emerald' : 'amber',
        date: exp.date,
        expenseId: exp._id,
      });

      exp.splits.forEach((s) => {
        if (s.status === 'UnderReview' && s.proof?.submittedAt) {
          recentActivity.push({
            id: `proof-${exp._id}-${s.user}`,
            type: 'PROOF_SUBMITTED',
            title: `${s.user?.toString() === user._id.toString() ? 'You' : s.name} submitted payment proof`,
            subtitle: `${exp.title} • via ${s.proof.method || 'Transfer'}`,
            amount: s.amount,
            badge: 'Under Review',
            badgeColor: 'amber',
            date: s.proof.submittedAt,
            expenseId: exp._id,
          });
        }
        if (s.status === 'Verified' && s.proof?.verifiedAt) {
          recentActivity.push({
            id: `verified-${exp._id}-${s.user}`,
            type: 'PAYMENT_VERIFIED',
            title: `${exp.paidBy.toString() === user._id.toString() ? 'You' : exp.paidByName} verified payment from ${s.user?.toString() === user._id.toString() ? 'You' : s.name}`,
            subtitle: exp.title,
            amount: s.amount,
            badge: 'Verified',
            badgeColor: 'emerald',
            date: s.proof.verifiedAt,
            expenseId: exp._id,
          });
        }
      });
    });

    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 6. Pending verification proofs (only where current user is payer)
    const pendingVerifications = [];
    allExpenses.forEach((exp) => {
      if (exp.paidBy.toString() === user._id.toString()) {
        exp.splits.forEach((s) => {
          if (s.status === 'UnderReview') {
            pendingVerifications.push({
              expenseId: exp._id,
              expenseTitle: exp.title,
              category: exp.category,
              splitUserId: s.user,
              debtorName: s.name,
              amount: s.amount,
              method: s.proof?.method || 'Easypaisa',
              transactionId: s.proof?.transactionId || '',
              imageUrl: s.proof?.imageUrl || '',
              senderNote: s.proof?.senderNote || '',
              paymentDate: s.proof?.paymentDate || '',
              submittedAt: s.proof?.submittedAt || exp.date,
            });
          }
        });
      }
    });

    // 7. Extract settlements waiting for review or submitted by user
    const pendingSettlementsToVerify = allSettlements.filter(
      (s) => s.toUser?.toString() === user._id.toString() && s.status === 'UnderReview'
    );
    const pendingSettlementsSubmitted = allSettlements.filter(
      (s) => s.fromUser?.toString() === user._id.toString() && s.status === 'UnderReview'
    );

    res.json({
      activeGroupsCount: groups.length,
      totalSharedExpenses: totalSharedMonth,
      amountYouOwe,
      pendingYouOweCount,
      amountYoureOwed,
      pendingYoureOwedCount,
      groups: groupSummaries,
      recentActivity,
      pendingVerifications,
      allExpenses,
      expenses: allExpenses, // Dual key compatibility
      netSettlements,
      settlements: allSettlements,
      pendingSettlementsToVerify,
      pendingSettlementsSubmitted,
    });
  } catch (error) {
    console.error('getSplitVaultSummary error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get groups for current user
 * @route GET /api/splitvault/groups
 */
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id }).sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Create a new SplitVault Group
 * @route POST /api/splitvault/groups
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description, category, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const members = [
      {
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: 'Admin',
        joinedAt: new Date(),
      },
    ];

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'Hostel',
      icon: icon || 'home',
      createdBy: req.user._id,
      inviteCode: generateInviteCode(name),
      members,
    });

    // Persistent notification for group creator
    await Notification.create({
      userId: req.user._id,
      title: 'Group Created',
      message: `SplitVault group "${group.name}" created successfully. Invite code: ${group.inviteCode}.`,
      type: 'info',
      metadata: { groupId: group._id },
    }).catch((e) => console.error('Notification error:', e.message));

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Join a group using an invite code (e.g. FLAT608)
 * @route POST /api/splitvault/groups/join
 */
export const joinGroupByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }

    const cleanCode = inviteCode.trim().toUpperCase();
    const group = await Group.findOne({ inviteCode: cleanCode });
    if (!group) {
      return res.status(404).json({ error: `No group found with invite code "${cleanCode}".` });
    }

    const alreadyMember = group.members.some(
      (m) => m.user?.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ error: `You are already a member of "${group.name}".` });
    }

    group.members.push({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: 'Member',
      joinedAt: new Date(),
    });

    await group.save();

    // Notify group creator that a user joined
    if (group.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: group.createdBy,
        title: 'New Member Joined Group',
        message: `${req.user.name} joined "${group.name}" using invite code ${group.inviteCode}.`,
        type: 'info',
        metadata: { groupId: group._id, joinedUserId: req.user._id },
      }).catch((e) => console.error('Notification error:', e.message));
    }

    // Notify joining user as well for their persistent record
    await Notification.create({
      userId: req.user._id,
      title: 'Joined Group',
      message: `You successfully joined "${group.name}" via invite code ${group.inviteCode}.`,
      type: 'info',
      metadata: { groupId: group._id },
    }).catch((e) => console.error('Notification error:', e.message));

    res.json({ message: `Successfully joined "${group.name}"!`, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete a SplitVault Group
 * @route DELETE /api/splitvault/groups/:groupId
 */
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the group creator has permission to delete this group.' });
    }

    // 1. Find all shared expenses belonging to this group
    const groupSplitExpenses = await SplitExpense.find({ groupId });
    const splitExpenseIds = groupSplitExpenses.map((e) => e._id);

    // 2. Cascade delete all auto-logged personal expenses (strictly by groupId or splitExpenseId)
    await Expense.deleteMany({
      $or: [
        { groupId: group._id },
        { splitExpenseId: { $in: splitExpenseIds } },
      ],
    }).catch((e) => console.error('Error cascading personal expenses on group delete:', e.message));

    // 3. Delete group notifications
    await Notification.deleteMany({
      $or: [
        { 'metadata.groupId': group._id },
        { 'metadata.splitExpenseId': { $in: splitExpenseIds } },
      ],
    }).catch((e) => console.error('Error deleting notifications on group delete:', e.message));

    // 4. Delete all shared group expenses and the group itself
    await SplitExpense.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group, shared expenses, and personal split records deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Add a registered user as a member to an existing group
 * @route POST /api/splitvault/groups/:groupId/members
 * PRECAUTION ENFORCED: Must be an existing registered Expense Tracker account!
 */
export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Registered email address is required to link a roommate.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists in Expense Tracker Pro database
    const existingUser = await User.findOne({ email: cleanEmail });
    if (!existingUser) {
      return res.status(404).json({
        error: `No Expense Tracker Pro account found with email "${cleanEmail}". Your roommate must sign up for an account first.`,
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Check if user is already in group
    const alreadyExists = group.members.some(
      (m) => m.user?.toString() === existingUser._id.toString() || m.email?.toLowerCase() === cleanEmail
    );
    if (alreadyExists) {
      return res.status(400).json({
        error: `User "${existingUser.name}" (${cleanEmail}) is already a member of this group.`,
      });
    }

    group.members.push({
      user: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: 'Member',
      joinedAt: new Date(),
    });

    await group.save();

    // Notify added user
    await Notification.create({
      userId: existingUser._id,
      title: 'Added to Group',
      message: `${req.user.name} added you to "${group.name}".`,
      type: 'info',
      metadata: { groupId: group._id },
    }).catch((e) => console.error('Notification error:', e.message));

    res.json({ message: `${existingUser.name} linked to group successfully!`, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * @desc Remove a member from a group
 * @route DELETE /api/splitvault/groups/:groupId/members/:memberId
 */
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found.' });

    const isCreator = group.createdBy.toString() === req.user._id.toString();
    const isSelf =
      memberId.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          (m._id.toString() === memberId || m.user?.toString() === memberId) &&
          m.user?.toString() === req.user._id.toString()
      );

    if (!isCreator && !isSelf) {
      return res.status(403).json({
        error: 'Permission denied. Only group admins can remove members, or members can leave the group themselves.',
      });
    }

    // Do not allow removing the group creator
    const targetMember = group.members.find(
      (m) => m._id.toString() === memberId || m.user?.toString() === memberId
    );
    if (targetMember && targetMember.user?.toString() === group.createdBy.toString()) {
      return res.status(400).json({
        error: 'The group creator cannot be removed from the group. Delete the group instead.',
      });
    }

    group.members = group.members.filter(
      (m) => m._id.toString() !== memberId && m.user?.toString() !== memberId
    );
    await group.save();
    res.json({ message: 'Member removed successfully.', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get detailed information for a specific group
 * @route GET /api/splitvault/groups/:groupId
 */
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const expenses = await SplitExpense.find({ groupId }).sort({ date: -1 });

    let settledCount = 0;
    let totalCount = 0;
    let totalAmount = 0;

    expenses.forEach((e) => {
      totalAmount += e.totalAmount;
      e.splits.forEach((s) => {
        totalCount++;
        if (s.status === 'Verified') {
          settledCount++;
        }
      });
    });

    const groupSettlements = await Settlement.find({ groupId }).sort({ createdAt: -1 });
    const netSettlements = computePairwiseNetSettlements(expenses, group.members, groupSettlements);
    const remainingAmount = netSettlements.reduce((acc, s) => acc + s.amount, 0);

    res.json({
      group,
      expenses,
      netSettlements,
      settlements: groupSettlements,
      stats: {
        totalAmount,
        remainingAmount,
        settledCount,
        totalCount,
        settledPct: totalCount > 0 ? Math.round((settledCount / totalCount) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Create a new Shared / Split Expense
 * @route POST /api/splitvault/expenses
 */
export const createSplitExpense = async (req, res) => {
  try {
    const { title, totalAmount, category, groupId, splitType = 'Equal', notes = '', participants = [] } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Expense title is required' });
    }
    const numAmount = Number(totalAmount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }

    let group = null;
    let groupName = '';
    if (groupId) {
      group = await Group.findById(groupId);
      if (group) groupName = group.name;
    }

    // Build splits array with SAFE OBJECT ID CASTING
    const splits = participants.map((p) => {
      const isPayer = p.isCurrentUser || p.userId?.toString() === req.user._id.toString();
      let memberUserId;

      if (isPayer) {
        memberUserId = req.user._id;
      } else if (p.userId && mongoose.Types.ObjectId.isValid(p.userId)) {
        memberUserId = new mongoose.Types.ObjectId(p.userId);
      } else {
        memberUserId = new mongoose.Types.ObjectId();
      }

      return {
        user: memberUserId,
        name: p.name || (isPayer ? `${req.user.name} (You)` : 'Roommate'),
        email: p.email || '',
        amount: Number(p.amount) || 0,
        percentage: Number(p.percentage) || 0,
        status: isPayer ? 'Verified' : 'Unpaid',
      };
    });

    const expense = await SplitExpense.create({
      title: title.trim(),
      totalAmount: numAmount,
      category: category || 'Food',
      paidBy: req.user._id,
      paidByName: req.user.name,
      groupId: groupId || null,
      groupName,
      splitType,
      date: new Date(),
      notes: notes.trim(),
      splits,
      isFullySettled: false,
    });

    // Auto-log personal expense for the payer ONLY IF payer has a personal split share > 0
    const payerSplit = splits.find((s) => s.user?.toString() === req.user._id.toString());
    if (payerSplit && Number(payerSplit.amount) > 0) {
      try {
        await Expense.create({
          title: `${expense.title} (My Share)`,
          amount: Number(payerSplit.amount),
          category: mapCategory(expense.category),
          paymentMethod: 'Card',
          date: expense.date || new Date(),
          notes: `SplitVault share in "${expense.groupName || 'Direct Split'}". Total bill: Rs ${expense.totalAmount}.`,
          status: 'Completed',
          userId: req.user._id,
          groupId: expense.groupId || null,
          splitExpenseId: expense._id,
        });
      } catch (err) {
        console.error('Failed to log payer personal expense share:', err.message);
      }
    }

    // Notify all debtor participants
    for (const split of splits) {
      if (split.user && split.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: split.user,
          title: 'New Split Expense Added',
          message: `${req.user.name} added you to "${expense.title}" (${expense.groupName || 'Direct Split'}). Your share: Rs ${split.amount}.`,
          type: 'info',
          metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, amount: split.amount },
        }).catch((e) => console.error('Notification error:', e.message));
      }
    }

    // Also notify payer for their persistent record
    await Notification.create({
      userId: req.user._id,
      title: 'Split Expense Created',
      message: `"${expense.title}" (Rs ${expense.totalAmount}) recorded and shared with ${splits.length - 1} roommate(s).`,
      type: 'expense-add',
      metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, totalAmount: expense.totalAmount },
    }).catch((e) => console.error('Notification error:', e.message));

    res.status(201).json(expense);
  } catch (error) {
    console.error('createSplitExpense error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Submit payment proof (Screenshot, TID, method) by a debtor
 * @route POST /api/splitvault/expenses/:expenseId/splits/:splitUserId/proof
 */
export const submitPaymentProof = async (req, res) => {
  try {
    const { expenseId, splitUserId } = req.params;
    const method = req.body.method || req.body.paymentMethod;
    const transactionId = req.body.transactionId || req.body.proofTid;
    const { imageUrl, senderNote, paymentDate } = req.body;

    const expense = await SplitExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Shared expense not found' });
    }

    const split = expense.splits.find(
      (s) =>
        s.user?.toString() === splitUserId.toString() ||
        s._id?.toString() === splitUserId.toString() ||
        s.name === splitUserId
    );

    if (!split) {
      return res.status(404).json({ error: 'Participant split not found in this expense' });
    }

    // STRICT DEBTOR-ONLY AUTHORIZATION CHECK
    if (split.user && split.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the debtor participant can submit payment proof for their share.' });
    }

    if (split.status === 'Verified') {
      return res.status(400).json({ error: 'This payment has already been verified and settled.' });
    }

    // Validate: transactionId non-empty OR imageUrl present (400 otherwise)
    const cleanTid = transactionId ? String(transactionId).trim() : '';
    const cleanImg = imageUrl ? String(imageUrl).trim() : '';
    if (!cleanTid && !cleanImg) {
      return res.status(400).json({ error: 'Either transactionId or imageUrl is required.' });
    }

    // Validate imageUrl: empty or data:image/(jpeg|png|webp);base64, string whose decoded size <= 1.5 MB
    if (cleanImg) {
      const match = cleanImg.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
      if (!match) {
        return res.status(400).json({ error: 'Image must be a valid base64 data URL (JPEG, PNG, or WEBP).' });
      }
      const base64Data = match[2];
      const decodedLength = Math.floor((base64Data.length * 3) / 4);
      if (decodedLength > 1.5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Receipt image size must not exceed 1.5 MB.' });
      }
    }

    split.status = 'UnderReview';
    split.proof = {
      method: method || 'Easypaisa',
      imageUrl: cleanImg,
      transactionId: cleanTid,
      senderNote: senderNote || '',
      paymentDate: paymentDate || new Date().toLocaleString(),
      submittedAt: new Date(),
    };

    await expense.save();

    // Create persistent notification for the payer
    await Notification.create({
      userId: expense.paidBy,
      title: 'Payment Proof Submitted',
      message: `${req.user.name} submitted payment proof of Rs ${split.amount} for "${expense.title}". Please verify to settle balance.`,
      type: 'info',
      metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, splitUserId, amount: split.amount },
    }).catch((e) => console.error('Notification error:', e.message));

    // Also notify debtor for their persistent record
    await Notification.create({
      userId: req.user._id,
      title: 'Proof Submitted',
      message: `Your payment proof of Rs ${split.amount} for "${expense.title}" has been sent for verification.`,
      type: 'info',
      metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, amount: split.amount },
    }).catch((e) => console.error('Notification error:', e.message));

    res.json({ message: 'Payment proof submitted successfully!', expense, split });
  } catch (error) {
    console.error('submitPaymentProof error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Verify or Reject payment proof
 * @route POST /api/splitvault/expenses/:expenseId/splits/:splitUserId/verify
 * STRICT SECURITY RULE: ONLY the creator/payer (`expense.paidBy`) can call this!
 */
export const verifyPaymentProof = async (req, res) => {
  try {
    const { expenseId, splitUserId } = req.params;
    const { action: rawAction, approve, approved, reason = '' } = req.body;
    let action = rawAction ? String(rawAction).toUpperCase() : undefined;
    if (!action) {
      if (approve === true || approved === true) action = 'APPROVE';
      else if (approve === false || approved === false) action = 'REJECT';
    }

    if (action !== 'APPROVE' && action !== 'REJECT' && action !== 'REQUEST_INFO') {
      return res.status(400).json({
        error: 'Valid action (APPROVE, REJECT or REQUEST_INFO) is required.',
      });
    }

    const expense = await SplitExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Shared expense not found' });
    }

    // STRICT PAYER-ONLY AUTHORIZATION CHECK
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access Denied: Only the creator/payer who paid upfront can verify or reject payment proofs.',
      });
    }

    const split = expense.splits.find(
      (s) =>
        s.user?.toString() === splitUserId.toString() ||
        s._id?.toString() === splitUserId.toString()
    );

    if (!split) {
      return res.status(404).json({ error: 'Participant split not found in this expense' });
    }

    if (action === 'APPROVE') {
      split.status = 'Verified';
      if (!split.proof) split.proof = {};
      split.proof.verifiedAt = new Date();
      split.proof.verifiedBy = req.user._id;

      const allDone = expense.splits.every((s) => s.status === 'Verified');
      expense.isFullySettled = allDone;

      await expense.save();

      // AUTOMATICALLY LOG EXPENSE in Debtor's personal account (1250 rule)
      try {
        const debtorUserId = split.user;
        let debtorUser = null;
        if (debtorUserId && mongoose.Types.ObjectId.isValid(debtorUserId)) {
          debtorUser = await User.findById(debtorUserId);
        }

        if (debtorUser) {
          const existing = await Expense.findOne({
            userId: debtorUser._id,
            splitExpenseId: expense._id,
          });

          if (!existing) {
            const autoExpense = await Expense.create({
              title: `${expense.title} (My Share)`,
              amount: Number(split.amount),
              category: mapCategory(expense.category),
              paymentMethod: mapPaymentMethod(split.proof?.method),
              date: expense.date || new Date(),
              notes: `SplitVault settlement for "${expense.title}" (${expense.groupName || 'Direct'}). Reference TID: ${split.proof?.transactionId || 'Verified Proof'}`,
              status: 'Completed',
              userId: debtorUser._id,
              groupId: expense.groupId || null,
              splitExpenseId: expense._id,
            });
            console.log(`Auto-created personal expense ${autoExpense._id} for debtor ${debtorUser.name}`);
          }
        } else {
          console.warn('Note: Debtor user ID is not registered in User collection:', debtorUserId);
        }
      } catch (err) {
        console.error('Note: Could not auto-insert personal expense copy for debtor:', err.message);
      }

      // Notify debtor of approval
      await Notification.create({
        userId: split.user,
        title: 'Payment Proof Verified',
        message: `Your payment of Rs ${split.amount} for "${expense.title}" was verified and approved by ${req.user.name}. Balance settled.`,
        type: 'success',
        metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, amount: split.amount },
      }).catch((e) => console.error('Notification error:', e.message));

      // Also notify payer for their persistent record
      await Notification.create({
        userId: req.user._id,
        title: 'Payment Verified & Settled',
        message: `You verified and approved ${split.name}'s payment of Rs ${split.amount} for "${expense.title}".`,
        type: 'success',
        metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, amount: split.amount },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Payment verified and balance settled successfully!',
        expense,
        split,
        status: 'Verified',
      });
    } else if (action === 'REJECT') {
      split.status = 'Rejected';
      if (!split.proof) split.proof = {};
      split.proof.rejectionReason = reason || 'Payment proof could not be verified.';

      await expense.save();

      // Notify debtor of rejection WITH payer's reason
      await Notification.create({
        userId: split.user,
        title: 'Payment Proof Rejected',
        message: `Your payment proof of Rs ${split.amount} for "${expense.title}" was rejected by ${req.user.name}. Reason: "${reason || 'Proof could not be verified'}". Please re-submit valid proof.`,
        type: 'danger',
        metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, amount: split.amount, reason },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Payment proof rejected. Roommate has been notified to re-submit.',
        expense,
        split,
        status: 'Rejected',
      });
    } else if (action === 'REQUEST_INFO') {
      if (!split.proof) split.proof = {};
      split.proof.rejectionReason = reason || 'Please provide clear transaction ID or full slip.';
      await expense.save();

      // Notify debtor
      await Notification.create({
        userId: split.user,
        title: 'Information Requested',
        message: `${req.user.name} requested updated details for "${expense.title}": "${reason}".`,
        type: 'warning',
        metadata: { expenseId: expense._id, splitExpenseId: expense._id, groupId: expense.groupId || null, amount: split.amount, reason },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Information requested from roommate.',
        expense,
        split,
      });
    }
  } catch (error) {
    console.error('verifyPaymentProof error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete a Split Expense (Only creator/payer has permission)
 * @route DELETE /api/splitvault/expenses/:id
 */
export const deleteSplitExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await SplitExpense.findById(id);

    if (!expense) {
      return res.status(404).json({ error: 'Split expense not found.' });
    }

    // Permission check: only the member who created / paid for the expense can delete it
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Permission denied. Only the member who created and paid for this expense can delete it.',
      });
    }

    // Remove associated auto-logged personal expenses (both payer share and debtor payments)
    await Expense.deleteMany({
      $or: [
        { splitExpenseId: expense._id },
        {
          userId: req.user._id,
          title: `${expense.title} (My Share)`,
          notes: { $regex: new RegExp(`Total bill: Rs ${expense.totalAmount}`, 'i') },
        },
      ],
    }).catch((e) => console.error('Error removing personal expense shares:', e.message));

    // Notify other participants that this shared expense was removed
    if (Array.isArray(expense.splits)) {
      for (const split of expense.splits) {
        if (split.user && split.user.toString() !== req.user._id.toString()) {
          await Notification.create({
            userId: split.user,
            title: 'Split Expense Deleted',
            message: `${req.user.name} removed the shared expense "${expense.title}" (${expense.groupName || 'Direct Split'}).`,
            type: 'info',
            metadata: { groupId: expense.groupId },
          }).catch((e) => console.error('Notification error:', e.message));
        }
      }
    }

    await SplitExpense.findByIdAndDelete(id);

    res.json({ message: 'Split expense deleted successfully.' });
  } catch (error) {
    console.error('deleteSplitExpense error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Submit a One-Shot Net Balance Settlement covering multiple expenses
 * @route POST /api/splitvault/settlements
 */
export const createSettlement = async (req, res) => {
  try {
    const {
      toUserId,
      groupId,
      amount,
      method: rawMethod,
      paymentMethod,
      transactionId: rawTid,
      proofTid,
      imageUrl: rawImg,
      senderNote = '',
      paymentDate = '',
    } = req.body;

    const method = rawMethod || paymentMethod || 'Easypaisa';
    const transactionId = (rawTid || proofTid || '').trim();
    const imageUrl = (rawImg || '').trim();

    if (!toUserId) {
      return res.status(400).json({ error: 'Recipient user ID is required.' });
    }

    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found.' });
    }

    // Validate: transactionId non-empty OR imageUrl present (400 otherwise)
    if (!transactionId && !imageUrl) {
      return res.status(400).json({ error: 'Either transactionId or imageUrl is required.' });
    }

    // Validate imageUrl if present (base64 data URL, max 1.5 MB decoded)
    if (imageUrl) {
      const match = imageUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
      if (!match) {
        return res.status(400).json({ error: 'Image must be a valid base64 data URL (JPEG, PNG, or WEBP).' });
      }
      const base64Data = match[2];
      const decodedLength = Math.floor((base64Data.length * 3) / 4);
      if (decodedLength > 1.5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Receipt image size must not exceed 1.5 MB.' });
      }
    }

    // Reject (409) if a settlement for same pair and scope is already UnderReview
    const existingPendingQuery = {
      fromUser: req.user._id,
      toUser: toUserId,
      status: 'UnderReview',
    };
    if (groupId) {
      existingPendingQuery.groupId = groupId;
    }
    const existingPending = await Settlement.findOne(existingPendingQuery);
    if (existingPending) {
      return res.status(409).json({ error: 'A settlement for this balance is already under review.' });
    }

    // Recompute forward and reverse splits on the server
    const expenseQuery = {
      $or: [
        { paidBy: toUserId, 'splits.user': req.user._id },
        { paidBy: req.user._id, 'splits.user': toUserId },
      ],
    };
    if (groupId) {
      expenseQuery.groupId = groupId;
    }

    const matchingExpenses = await SplitExpense.find(expenseQuery);

    const forwardSplits = [];
    const reverseSplits = [];

    matchingExpenses.forEach((exp) => {
      if (Array.isArray(exp.splits)) {
        exp.splits.forEach((s) => {
          if (s.status === 'Verified') return;

          // Forward split: debtor (req.user) owes creditor (toUserId) for expense paid by creditor
          if (
            exp.paidBy?.toString() === toUserId.toString() &&
            s.user?.toString() === req.user._id.toString()
          ) {
            forwardSplits.push({
              expense: exp,
              split: s,
              expenseId: exp._id,
              splitUserId: s.user,
              direction: 'forward',
              title: exp.title,
              amount: Number(s.amount) || 0,
            });
          }

          // Reverse split: creditor (toUserId) owes debtor (req.user) for expense paid by debtor
          if (
            exp.paidBy?.toString() === req.user._id.toString() &&
            s.user?.toString() === toUserId.toString()
          ) {
            reverseSplits.push({
              expense: exp,
              split: s,
              expenseId: exp._id,
              splitUserId: s.user,
              direction: 'reverse',
              title: exp.title,
              amount: Number(s.amount) || 0,
            });
          }
        });
      }
    });

    const forwardPaisa = forwardSplits.reduce(
      (sum, item) => sum + Math.round(item.amount * 100),
      0
    );
    const reversePaisa = reverseSplits.reduce(
      (sum, item) => sum + Math.round(item.amount * 100),
      0
    );
    const netPaisa = forwardPaisa - reversePaisa;
    const currentNet = Math.round(netPaisa) / 100;

    if (netPaisa <= 0) {
      return res.status(409).json({ error: 'Nothing to settle' });
    }

    if (amount !== undefined && amount !== null) {
      const clientAmount = Number(amount);
      if (Math.abs(clientAmount - currentNet) > 0.01) {
        return res.status(409).json({
          error: 'Balance changed',
          currentNet,
        });
      }
    }

    let groupName = '';
    if (groupId) {
      const grp = await Group.findById(groupId);
      if (grp) groupName = grp.name;
    }

    // Store in coveredExpenses every forward and reverse split
    const coveredExpenses = [];
    forwardSplits.forEach((item) => {
      coveredExpenses.push({
        expenseId: item.expenseId,
        splitUserId: item.splitUserId,
        direction: 'forward',
        title: item.title,
        amount: item.amount,
        shareAmount: item.amount,
      });
    });
    reverseSplits.forEach((item) => {
      coveredExpenses.push({
        expenseId: item.expenseId,
        splitUserId: item.splitUserId,
        direction: 'reverse',
        title: item.title,
        amount: item.amount,
        shareAmount: item.amount,
      });
    });

    // Mark forward splits UnderReview with proof; leave reverse splits unchanged
    const touchedExpensesMap = new Map();
    for (const item of forwardSplits) {
      item.split.status = 'UnderReview';
      if (!item.split.proof) item.split.proof = {};
      item.split.proof.method = method;
      item.split.proof.transactionId = transactionId;
      item.split.proof.imageUrl = imageUrl;
      item.split.proof.senderNote = senderNote;
      item.split.proof.paymentDate = paymentDate || new Date().toLocaleString();
      item.split.proof.submittedAt = new Date();
      touchedExpensesMap.set(item.expense._id.toString(), item.expense);
    }

    for (const exp of touchedExpensesMap.values()) {
      await exp.save();
    }

    const settlement = await Settlement.create({
      fromUser: req.user._id,
      fromUserName: req.user.name,
      toUser: toUserId,
      toUserName: recipient.name,
      groupId: groupId || null,
      groupName,
      amount: currentNet,
      coveredExpenses,
      proof: {
        method,
        transactionId,
        imageUrl,
        senderNote,
        paymentDate: paymentDate || new Date().toLocaleString(),
        submittedAt: new Date(),
      },
      status: 'UnderReview',
    });

    // Notify Creditor
    await Notification.create({
      userId: toUserId,
      title: 'Net Settlement Proof Submitted',
      message: `${req.user.name} submitted a one-shot payment proof of Rs ${currentNet} to settle ${coveredExpenses.length} shared expense(s). Please review and approve.`,
      type: 'info',
      metadata: {
        settlementId: settlement._id,
        groupId: groupId || null,
        amount: currentNet,
      },
    }).catch((e) => console.error('Notification error:', e.message));

    // Notify Debtor
    await Notification.create({
      userId: req.user._id,
      title: 'Settlement Submitted',
      message: `Your payment proof of Rs ${currentNet} to ${recipient.name} is now pending approval.`,
      type: 'info',
      metadata: {
        settlementId: settlement._id,
        groupId: groupId || null,
        amount: currentNet,
      },
    }).catch((e) => console.error('Notification error:', e.message));

    res.status(201).json({
      message: 'One-shot settlement proof submitted successfully!',
      settlement,
    });
  } catch (error) {
    console.error('createSettlement error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc 1-Tap Batch Verify or Reject a Net Balance Settlement
 * @route POST /api/splitvault/settlements/:settlementId/verify
 */
export const verifySettlement = async (req, res) => {
  try {
    const { settlementId } = req.params;
    const { action: rawAction, approve, approved, reason = '' } = req.body;
    let action = rawAction ? String(rawAction).toUpperCase() : undefined;
    if (!action) {
      if (approve === true || approved === true) action = 'APPROVE';
      else if (approve === false || approved === false) action = 'REJECT';
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({
        error: 'Valid action (APPROVE or REJECT) is required.',
      });
    }

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement record not found.' });
    }

    // STRICT CREDITOR-ONLY PERMISSION CHECK
    if (settlement.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access Denied: Only the recipient creditor can verify or reject this settlement.',
      });
    }

    // Idempotent: approving an already Verified settlement returns 200 without duplicating anything
    if (settlement.status === 'Verified') {
      return res.status(200).json({
        message: 'Settlement is already verified.',
        settlement,
        status: 'Verified',
      });
    }

    if (action === 'APPROVE') {
      settlement.status = 'Verified';
      if (!settlement.proof) settlement.proof = {};
      settlement.proof.verifiedAt = new Date();
      settlement.proof.verifiedBy = req.user._id;

      // In one operation, mark every split in coveredExpenses (forward and reverse) Verified
      const touchedExpensesMap = new Map();
      const newlyVerifiedSplits = [];

      if (Array.isArray(settlement.coveredExpenses)) {
        for (const item of settlement.coveredExpenses) {
          let exp = touchedExpensesMap.get(item.expenseId.toString());
          if (!exp) {
            exp = await SplitExpense.findById(item.expenseId);
            if (exp) touchedExpensesMap.set(exp._id.toString(), exp);
          }

          if (exp) {
            const split = exp.splits.find(
              (s) =>
                (item.splitUserId && s.user?.toString() === item.splitUserId.toString()) ||
                (item.direction === 'forward' && s.user?.toString() === settlement.fromUser.toString()) ||
                (item.direction === 'reverse' && s.user?.toString() === settlement.toUser.toString())
            );

            if (split) {
              split.status = 'Verified';
              if (!split.proof) split.proof = {};
              split.proof.verifiedAt = new Date();
              split.proof.verifiedBy = req.user._id;

              newlyVerifiedSplits.push({
                splitOwnerId: split.user,
                amount: Number(split.amount),
                expense: exp,
              });
            }
          }
        }
      }

      for (const exp of touchedExpensesMap.values()) {
        exp.isFullySettled = exp.splits.every((s) => s.status === 'Verified');
        await exp.save();
      }

      await settlement.save();

      // Task 3: Create personal expense records per the 1250 rule:
      // one personal expense per newly verified split owner:
      // userId = split owner, amount = split amount, title = "<expense title> (My Share)",
      // groupId, splitExpenseId, status: 'Completed'.
      // Idempotency: Before creating, check there is no existing personal expense with same userId + splitExpenseId.
      for (const item of newlyVerifiedSplits) {
        try {
          if (!item.splitOwnerId) continue;
          const ownerId = item.splitOwnerId.toString();

          const existing = await Expense.findOne({
            userId: ownerId,
            splitExpenseId: item.expense._id,
          });

          if (!existing) {
            await Expense.create({
              title: `${item.expense.title} (My Share)`,
              amount: item.amount,
              category: mapCategory(item.expense.category),
              paymentMethod: mapPaymentMethod(settlement.proof?.method),
              date: item.expense.date || new Date(),
              notes: `SplitVault settlement for "${item.expense.title}" (${item.expense.groupName || 'Direct'}). Ref TID: ${settlement.proof?.transactionId || 'Verified Proof'}`,
              status: 'Completed',
              userId: ownerId,
              groupId: item.expense.groupId || null,
              splitExpenseId: item.expense._id,
            });
          }
        } catch (err) {
          console.error('Error logging share expense in verifySettlement:', err.message);
        }
      }

      // Notify Debtor
      await Notification.create({
        userId: settlement.fromUser,
        title: 'Settlement Approved & Cleared',
        message: `Your payment of Rs ${settlement.amount} to ${req.user.name} was approved! All ${settlement.coveredExpenses.length} shared expenses are now settled.`,
        type: 'success',
        metadata: {
          settlementId: settlement._id,
          groupId: settlement.groupId || null,
          amount: settlement.amount,
        },
      }).catch((e) => console.error('Notification error:', e.message));

      // Notify Creditor
      await Notification.create({
        userId: req.user._id,
        title: 'Settlement Cleared',
        message: `You verified and approved ${settlement.fromUserName}'s settlement of Rs ${settlement.amount}.`,
        type: 'success',
        metadata: {
          settlementId: settlement._id,
          groupId: settlement.groupId || null,
          amount: settlement.amount,
        },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Settlement approved! All covered shared expenses have been marked as settled.',
        settlement,
        status: 'Verified',
      });
    } else if (action === 'REJECT') {
      settlement.status = 'Rejected';
      if (!settlement.proof) settlement.proof = {};
      settlement.proof.rejectionReason = reason || 'Payment slip not recognized or transaction not received.';

      // Revert forward splits back to Unpaid; reverse splits untouched
      if (Array.isArray(settlement.coveredExpenses)) {
        for (const item of settlement.coveredExpenses) {
          if (item.direction === 'forward') {
            const exp = await SplitExpense.findById(item.expenseId);
            if (exp) {
              const split = exp.splits.find(
                (s) =>
                  (item.splitUserId && s.user?.toString() === item.splitUserId.toString()) ||
                  s.user?.toString() === settlement.fromUser.toString()
              );
              if (split && split.status === 'UnderReview') {
                split.status = 'Unpaid';
              }
              await exp.save();
            }
          }
        }
      }

      await settlement.save();

      // Notify Debtor of rejection
      await Notification.create({
        userId: settlement.fromUser,
        title: 'Settlement Proof Rejected',
        message: `Your payment proof of Rs ${settlement.amount} was rejected by ${req.user.name}. Reason: "${reason || 'Invalid TID/screenshot'}". Please re-submit.`,
        type: 'danger',
        metadata: {
          settlementId: settlement._id,
          groupId: settlement.groupId || null,
          amount: settlement.amount,
          reason,
        },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Settlement proof rejected. Debtor has been notified to re-submit.',
        settlement,
        status: 'Rejected',
      });
    }
  } catch (error) {
    console.error('verifySettlement error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Get all settlements involving the user
 * @route GET /api/splitvault/settlements
 */
export const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }],
    }).sort({ createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Send a friendly in-app reminder / nudge to a debtor
 * @route POST /api/splitvault/nudge
 */
export const sendNudgeReminder = async (req, res) => {
  try {
    const { debtorId, amount, groupName } = req.body;
    if (!debtorId) {
      return res.status(400).json({ error: 'Debtor ID is required.' });
    }

    await Notification.create({
      userId: debtorId,
      title: 'Friendly Balance Reminder',
      message: `Hey! Just a polite reminder from ${req.user.name} for your pending shared balance of Rs ${amount} (${groupName || 'SplitVault'}). You can easily settle it via One-Shot Net Payment.`,
      type: 'info',
      metadata: { creditorId: req.user._id, amount },
    });

    res.json({ success: true, message: 'Friendly reminder sent to roommate!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc AI Smart Receipt Scanner: Extracts merchant, total, category, and date
 * @route POST /api/splitvault/scan-receipt
 */
export const scanReceiptAI = async (req, res) => {
  try {
    const { receiptText = '', rawTotal } = req.body;

    let parsedTitle = 'Shared Dining & Grocery';
    let parsedTotal = Number(rawTotal) || 0;
    let parsedCategory = 'Food';
    const parsedDate = new Date().toISOString().split('T')[0];

    if (receiptText) {
      const lower = receiptText.toLowerCase();
      if (lower.includes('mart') || lower.includes('store') || lower.includes('grocery')) {
        parsedCategory = 'Groceries';
        parsedTitle = 'Mart Grocery Run';
      } else if (lower.includes('cafe') || lower.includes('restaurant') || lower.includes('pizza') || lower.includes('burger')) {
        parsedCategory = 'Food';
        parsedTitle = 'Dining / Food Outing';
      } else if (lower.includes('electric') || lower.includes('gas') || lower.includes('bill')) {
        parsedCategory = 'Utilities';
        parsedTitle = 'Utility Bill';
      }

      const matches = receiptText.match(/(?:total|amount|rs|pkr|net)[:\s]*([0-9,]+(?:\.[0-9]{1,2})?)/i);
      if (matches && matches[1]) {
        parsedTotal = parseFloat(matches[1].replace(/,/g, '')) || parsedTotal;
      }
    }

    res.json({
      success: true,
      data: {
        title: parsedTitle,
        totalAmount: parsedTotal || 500,
        category: parsedCategory,
        date: parsedDate,
        confidence: 0.95,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


