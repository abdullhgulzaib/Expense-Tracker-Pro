import mongoose from 'mongoose';
import crypto from 'crypto';
import { Group, SplitExpense, Expense, User, Notification } from '../models.js';

// Helper to generate a secure, 8-character cryptographic alphanumeric invite code (e.g. 8F3B9A1C)
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};


/**
 * @desc Get SplitVault dashboard summary (Cards, groups, recent activity)
 * @route GET /api/splitvault/summary
 * Automatically purges legacy sample groups from earlier demo runs, ensuring a 100% clean account.
 */
export const getSplitVaultSummary = async (req, res) => {
  try {
    const user = req.user;

    // Purge legacy sample/seed groups created in earlier demo runs
    await Group.deleteMany({
      createdBy: user._id,
      name: { $in: ['Hostel Group', 'Friends Group', 'Classmates'] },
    });
    await SplitExpense.deleteMany({
      paidBy: user._id,
      title: { $in: ['Monal Dinner', 'Fuel', 'Groceries'] },
    });

    // 1. Get groups user is a member of
    const groups = await Group.find({ 'members.user': user._id }).sort({ updatedAt: -1 });

    // 2. Get all split expenses involving the user (either paidBy or in splits)
    const allExpenses = await SplitExpense.find({
      $or: [
        { paidBy: user._id },
        { 'splits.user': user._id },
      ],
    }).sort({ date: -1 });

    // 3. Compute balances
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

      // Check what user owes to others
      if (exp.paidBy.toString() !== user._id.toString()) {
        const mySplit = exp.splits.find((s) => s.user?.toString() === user._id.toString());
        if (mySplit && mySplit.status !== 'Verified') {
          amountYouOwe += mySplit.amount;
          pendingYouOweCount++;
        }
      }

      // Check what others owe to user
      if (exp.paidBy.toString() === user._id.toString()) {
        exp.splits.forEach((s) => {
          if (s.user?.toString() !== user._id.toString() && s.status !== 'Verified') {
            amountYoureOwed += s.amount;
            pendingYoureOwedCount++;
          }
        });
      }
    });

    // 4. Compute per-group stats
    const groupSummaries = await Promise.all(
      groups.map(async (grp) => {
        const grpExpenses = allExpenses.filter((e) => e.groupId && e.groupId.toString() === grp._id.toString());
        const total = grpExpenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
        let settledSplits = 0;
        let totalSplits = 0;
        let remaining = 0;

        grpExpenses.forEach((e) => {
          e.splits.forEach((s) => {
            totalSplits++;
            if (s.status === 'Verified') {
              settledSplits++;
            } else {
              remaining += s.amount;
            }
          });
        });

        return {
          _id: grp._id,
          name: grp.name,
          category: grp.category,
          icon: grp.icon,
          inviteCode: grp.inviteCode,
          createdBy: grp.createdBy,
          memberCount: grp.members?.length || 1,
          members: grp.members || [],
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
        title: 'New Member Joined Group 👥',
        message: `${req.user.name} joined "${group.name}" using invite code ${group.inviteCode}.`,
        type: 'info',
        metadata: { groupId: group._id, joinedUserId: req.user._id },
      }).catch((e) => console.error('Notification error:', e.message));
    }

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

    await Group.findByIdAndDelete(groupId);
    await SplitExpense.deleteMany({ groupId });

    res.json({ message: 'Group and all associated shared expenses deleted successfully.' });
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
      title: 'Added to Group 👥',
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

    group.members = group.members.filter(
      (m) => m._id.toString() !== memberId && m.user?.toString() !== memberId
    );
    await group.save();
    res.json(group);
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
    let remainingAmount = 0;
    let totalAmount = 0;

    expenses.forEach((e) => {
      totalAmount += e.totalAmount;
      e.splits.forEach((s) => {
        totalCount++;
        if (s.status === 'Verified') {
          settledCount++;
        } else {
          remainingAmount += s.amount;
        }
      });
    });

    res.json({
      group,
      expenses,
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

    // Notify all debtor participants
    for (const split of splits) {
      if (split.user && split.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          userId: split.user,
          title: 'New Split Expense Added',
          message: `${req.user.name} added you to "${expense.title}" (${expense.groupName || 'Direct Split'}). Your share: Rs ${split.amount}.`,
          type: 'info',
          metadata: { expenseId: expense._id, amount: split.amount },
        }).catch((e) => console.error('Notification error:', e.message));
      }
    }

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
    const { method, imageUrl, transactionId, senderNote, paymentDate } = req.body;

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

    if (split.status === 'Verified') {
      return res.status(400).json({ error: 'This payment has already been verified and settled.' });
    }

    split.status = 'UnderReview';
    split.proof = {
      method: method || 'Easypaisa',
      imageUrl: imageUrl || '',
      transactionId: transactionId || '',
      senderNote: senderNote || '',
      paymentDate: paymentDate || new Date().toLocaleString(),
      submittedAt: new Date(),
    };

    await expense.save();

    // Create persistent notification for the payer
    await Notification.create({
      userId: expense.paidBy,
      title: 'Payment Proof Submitted 📄',
      message: `${req.user.name} submitted payment proof of Rs ${split.amount} for "${expense.title}". Please verify to settle balance.`,
      type: 'info',
      metadata: { expenseId: expense._id, splitUserId, amount: split.amount },
    }).catch((e) => console.error('Notification error:', e.message));

    res.json({ message: 'Payment proof submitted successfully!', expense });
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
    const { action, reason = '' } = req.body;

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

      // AUTOMATICALLY LOG EXPENSE in Debtor's personal account
      try {
        await Expense.create({
          title: `${expense.title} (Paid to ${req.user.name})`,
          amount: split.amount,
          category: expense.category || 'Food',
          paymentMethod: split.proof?.method || 'Mobile Payment',
          date: new Date(),
          notes: `SplitVault settlement for "${expense.title}". Reference: ${split.proof?.transactionId || 'Verified Screenshot'}`,
          status: 'Completed',
          userId: split.user,
        });
      } catch (err) {
        console.warn('Note: Could not auto-insert personal expense copy:', err.message);
      }

      // Notify debtor of approval
      await Notification.create({
        userId: split.user,
        title: 'Payment Proof Verified! ✅',
        message: `Your payment of Rs ${split.amount} for "${expense.title}" was verified and approved by ${req.user.name}. Balance settled.`,
        type: 'success',
        metadata: { expenseId: expense._id, amount: split.amount },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Payment verified and balance settled successfully!',
        expense,
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
        title: 'Payment Proof Rejected ❌',
        message: `Your payment proof of Rs ${split.amount} for "${expense.title}" was rejected by ${req.user.name}. Reason: "${reason || 'Proof could not be verified'}". Please re-submit valid proof.`,
        type: 'danger',
        metadata: { expenseId: expense._id, amount: split.amount, reason },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Payment proof rejected. Roommate has been notified to re-submit.',
        expense,
        status: 'Rejected',
      });
    } else {
      if (!split.proof) split.proof = {};
      split.proof.rejectionReason = reason || 'Please provide clear transaction ID or full slip.';
      await expense.save();

      // Notify debtor
      await Notification.create({
        userId: split.user,
        title: 'Information Requested ⚠️',
        message: `${req.user.name} requested updated details for "${expense.title}": "${reason}".`,
        type: 'warning',
        metadata: { expenseId: expense._id, amount: split.amount, reason },
      }).catch((e) => console.error('Notification error:', e.message));

      return res.json({
        message: 'Information requested from roommate.',
        expense,
      });
    }
  } catch (error) {
    console.error('verifyPaymentProof error:', error);
    res.status(500).json({ error: error.message });
  }
};

