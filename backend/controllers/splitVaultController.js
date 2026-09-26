import mongoose from 'mongoose';
import { Group, SplitExpense, Expense, User } from '../models.js';

// Helper to generate a unique invite code (e.g., HOSTEL-482)
const generateInviteCode = (name = 'GROUP') => {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'FLAT';
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}${randomNum}`;
};

/**
 * Ensures seed data exists for a user if they are new,
 * so they instantly see the groups matching their design mockup.
 */
const ensureSeedData = async (currentUser) => {
  const existingGroupsCount = await Group.countDocuments({ 'members.user': currentUser._id });
  if (existingGroupsCount > 0) return;

  // Create standard starter groups from the UI mockup
  const hostelGroup = await Group.create({
    name: 'Hostel Group',
    description: 'Room & flat shared expenses',
    category: 'Hostel',
    icon: 'home',
    createdBy: currentUser._id,
    inviteCode: generateInviteCode('HOSTEL'),
    members: [
      { user: currentUser._id, name: currentUser.name, email: currentUser.email, role: 'Admin' },
    ],
  });

  const friendsGroup = await Group.create({
    name: 'Friends Group',
    description: 'Outings, dinners & casual hangouts',
    category: 'Friends',
    icon: 'users',
    createdBy: currentUser._id,
    inviteCode: generateInviteCode('FRIENDS'),
    members: [
      { user: currentUser._id, name: currentUser.name, email: currentUser.email, role: 'Admin' },
    ],
  });

  const classmatesGroup = await Group.create({
    name: 'Classmates',
    description: 'Semester projects, books & printouts',
    category: 'Classmates',
    icon: 'graduation-cap',
    createdBy: currentUser._id,
    inviteCode: generateInviteCode('CLASS'),
    members: [
      { user: currentUser._id, name: currentUser.name, email: currentUser.email, role: 'Admin' },
    ],
  });

  // Seed sample expenses matching the mockup
  // Sample 1: Monal Dinner (Rs 1,500 total, 50% split)
  const dummyAliId = new mongoose.Types.ObjectId();
  await SplitExpense.create({
    title: 'Monal Dinner',
    totalAmount: 1500,
    category: 'Food',
    paidBy: currentUser._id,
    paidByName: currentUser.name,
    groupId: friendsGroup._id,
    groupName: friendsGroup.name,
    splitType: 'Equal',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    notes: 'Dinner at Monal Restaurant',
    splits: [
      {
        user: currentUser._id,
        name: `${currentUser.name} (You)`,
        email: currentUser.email,
        amount: 750,
        percentage: 50,
        status: 'Verified',
      },
      {
        user: dummyAliId,
        name: 'Ali',
        email: 'ali@example.com',
        amount: 750,
        percentage: 50,
        status: 'UnderReview', // Under review waiting for verification!
        proof: {
          method: 'Easypaisa',
          imageUrl: '',
          transactionId: '1234567890',
          senderNote: 'Sent via Easypaisa mobile app',
          paymentDate: '20 Sep 2026, 08:45 PM',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      },
    ],
  });

  // Sample 2: Fuel (Rs 850)
  const dummyHamzaId = new mongoose.Types.ObjectId();
  await SplitExpense.create({
    title: 'Fuel',
    totalAmount: 850,
    category: 'Transportation',
    paidBy: dummyHamzaId,
    paidByName: 'Hamza',
    groupId: friendsGroup._id,
    groupName: friendsGroup.name,
    splitType: 'Equal',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    notes: 'Fuel for trip',
    splits: [
      {
        user: dummyHamzaId,
        name: 'Hamza',
        email: 'hamza@example.com',
        amount: 425,
        percentage: 50,
        status: 'Verified',
      },
      {
        user: currentUser._id,
        name: `${currentUser.name} (You)`,
        email: currentUser.email,
        amount: 425,
        percentage: 50,
        status: 'Unpaid', // User owes Hamza Rs 425
      },
    ],
  });

  // Sample 3: Groceries (Rs 1,200)
  await SplitExpense.create({
    title: 'Groceries',
    totalAmount: 1200,
    category: 'Groceries',
    paidBy: dummyAliId,
    paidByName: 'Ali',
    groupId: hostelGroup._id,
    groupName: hostelGroup.name,
    splitType: 'Equal',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    notes: 'Hostel flat groceries & eggs',
    splits: [
      {
        user: dummyAliId,
        name: 'Ali',
        email: 'ali@example.com',
        amount: 400,
        percentage: 33.3,
        status: 'Verified',
      },
      {
        user: currentUser._id,
        name: `${currentUser.name} (You)`,
        email: currentUser.email,
        amount: 400,
        percentage: 33.3,
        status: 'Unpaid', // User owes Ali Rs 400
      },
      {
        user: dummyHamzaId,
        name: 'Hamza',
        email: 'hamza@example.com',
        amount: 400,
        percentage: 33.3,
        status: 'Unpaid',
      },
    ],
  });
};

/**
 * @desc Get SplitVault dashboard summary (Cards, groups, recent activity)
 * @route GET /api/splitvault/summary
 */
export const getSplitVaultSummary = async (req, res) => {
  try {
    const user = req.user;
    await ensureSeedData(user);

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
        const mySplit = exp.splits.find((s) => s.user.toString() === user._id.toString());
        if (mySplit && mySplit.status !== 'Verified') {
          amountYouOwe += mySplit.amount;
          pendingYouOweCount++;
        }
      }

      // Check what others owe to user
      if (exp.paidBy.toString() === user._id.toString()) {
        exp.splits.forEach((s) => {
          if (s.user.toString() !== user._id.toString() && s.status !== 'Verified') {
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
          memberCount: grp.members?.length || 1,
          members: grp.members,
          inviteCode: grp.inviteCode,
          settledRatio: totalSplits > 0 ? `${settledSplits}/${totalSplits}` : '1/1',
          settledPct: totalSplits > 0 ? Math.round((settledSplits / totalSplits) * 100) : 100,
          remainingAmount: remaining,
          totalAmount: total,
        };
      })
    );

    // 5. Build Recent Activity Feed
    const recentActivity = [];
    allExpenses.forEach((exp) => {
      // Expense created event
      recentActivity.push({
        id: `created-${exp._id}`,
        type: 'EXPENSE_ADDED',
        title: `New expense added: ${exp.title}`,
        subtitle: `Added by ${exp.paidBy.toString() === user._id.toString() ? 'You' : exp.paidByName}`,
        amount: exp.totalAmount,
        badge: 'Split',
        badgeColor: 'blue',
        date: exp.date,
        expenseId: exp._id,
      });

      // Proof events
      exp.splits.forEach((s) => {
        if (s.status === 'UnderReview' && s.proof?.submittedAt) {
          recentActivity.push({
            id: `proof-${exp._id}-${s.user}`,
            type: 'PROOF_SUBMITTED',
            title: `${s.user.toString() === user._id.toString() ? 'You' : s.name} submitted payment proof for ${exp.title}`,
            subtitle: 'Awaiting verification',
            amount: s.amount,
            badge: 'Under Review',
            badgeColor: 'amber',
            date: s.proof.submittedAt,
            expenseId: exp._id,
            splitUserId: s.user,
            isPayer: exp.paidBy.toString() === user._id.toString(),
          });
        }
        if (s.status === 'Verified' && s.proof?.verifiedAt) {
          recentActivity.push({
            id: `verified-${exp._id}-${s.user}`,
            type: 'PAYMENT_VERIFIED',
            title: `${exp.paidBy.toString() === user._id.toString() ? 'You' : exp.paidByName} verified payment from ${s.user.toString() === user._id.toString() ? 'You' : s.name}`,
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

    // Sort recent activity newest first
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 6. Pending verification proofs (only where current user is payer!)
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
      recentActivity: recentActivity.slice(0, 10),
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
    const { name, description, category, icon, memberEmails = [] } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const members = [
      {
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: 'Admin',
      },
    ];

    // Find and add any existing users by email
    if (Array.isArray(memberEmails) && memberEmails.length > 0) {
      const foundUsers = await User.find({ email: { $in: memberEmails } });
      foundUsers.forEach((u) => {
        if (u._id.toString() !== req.user._id.toString()) {
          members.push({
            user: u._id,
            name: u.name,
            email: u.email,
            role: 'Member',
          });
        }
      });
    }

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
        settledPct: totalCount > 0 ? Math.round((settledCount / totalCount) * 100) : 100,
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

    let groupName = '';
    if (groupId) {
      const grp = await Group.findById(groupId);
      if (grp) groupName = grp.name;
    }

    // Build splits array
    const splits = participants.map((p) => {
      const isPayer = p.userId?.toString() === req.user._id.toString();
      return {
        user: p.userId || req.user._id,
        name: p.name || (isPayer ? `${req.user.name} (You)` : 'Roommate'),
        email: p.email || '',
        amount: Number(p.amount) || 0,
        percentage: Number(p.percentage) || 0,
        status: isPayer ? 'Verified' : 'Unpaid', // Payer is already verified (paid upfront)
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

    // Authorization: User can only submit proof for their OWN share
    if (req.user._id.toString() !== splitUserId.toString()) {
      return res.status(403).json({ error: 'You can only submit payment proof for your own share.' });
    }

    const expense = await SplitExpense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Shared expense not found' });
    }

    const split = expense.splits.find((s) => s.user.toString() === splitUserId.toString());
    if (!split) {
      return res.status(404).json({ error: 'Participant split not found in this expense' });
    }

    if (split.status === 'Verified') {
      return res.status(400).json({ error: 'This payment has already been verified and settled.' });
    }

    // Update status to UnderReview
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
    const { action, reason = '' } = req.body; // 'APPROVE' | 'REJECT' | 'REQUEST_INFO'

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

    const split = expense.splits.find((s) => s.user.toString() === splitUserId.toString());
    if (!split) {
      return res.status(404).json({ error: 'Participant split not found in this expense' });
    }

    if (action === 'APPROVE') {
      split.status = 'Verified';
      if (!split.proof) split.proof = {};
      split.proof.verifiedAt = new Date();
      split.proof.verifiedBy = req.user._id;

      // Check if all splits in expense are verified
      const allDone = expense.splits.every((s) => s.status === 'Verified');
      expense.isFullySettled = allDone;

      await expense.save();

      // AUTOMATICALLY DEDUCT / LOG EXPENSE in Debtor's personal account
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

      return res.json({
        message: 'Payment proof rejected. Roommate has been notified to re-submit.',
        expense,
        status: 'Rejected',
      });
    } else {
      // REQUEST_INFO / Note
      if (!split.proof) split.proof = {};
      split.proof.rejectionReason = reason || 'Please provide clear transaction ID or full slip.';
      await expense.save();

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
