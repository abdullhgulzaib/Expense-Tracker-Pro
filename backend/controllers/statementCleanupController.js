import nodemailer from 'nodemailer';
import { Expense, Notification, MonthlyArchive } from '../models.js';

// Helper to configure Nodemailer transporter
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback to ephemeral Ethereal test account (logs preview URL so testing works seamlessly)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * @desc Get status of 2-month completed cycle for storage cleanup & statement export
 * @route GET /api/expenses/cleanup-status
 */
export const getCleanupStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    // Current month start
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find all expenses recorded before current month
    const pastExpenses = await Expense.find({
      userId,
      date: { $lt: startOfCurrentMonth },
    }).sort({ date: 1 }).lean();

    if (!pastExpenses || pastExpenses.length === 0) {
      return res.json({
        hasPendingCleanup: false,
        message: 'No completed monthly transactions pending cleanup.',
        count: 0,
        totalAmount: 0,
      });
    }

    const monthSet = new Set();
    let totalAmount = 0;
    const categoryTotals = {};

    pastExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      const mName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      monthSet.add(mName);
      totalAmount += Number(exp.amount || 0);
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount || 0);
    });

    const monthsArr = Array.from(monthSet);
    const periodName = monthsArr.join(' & ');

    return res.json({
      hasPendingCleanup: true,
      periodName: periodName || 'Past 2 Months',
      count: pastExpenses.length,
      totalAmount,
      months: monthsArr,
      categoryTotals,
      expenses: pastExpenses.slice(0, 50),
    });
  } catch (error) {
    console.error('getCleanupStatus error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Send 2-month statement via email using nodemailer
 * @route POST /api/expenses/send-statement-email
 */
export const sendStatementEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const pastExpenses = await Expense.find({
      userId,
      date: { $lt: startOfCurrentMonth },
    }).sort({ date: -1 }).lean();

    if (!pastExpenses || pastExpenses.length === 0) {
      return res.status(400).json({ error: 'No past monthly transactions available to email.' });
    }

    const monthSet = new Set();
    let totalAmount = 0;
    const categoryTotals = {};

    pastExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      monthSet.add(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
      totalAmount += Number(exp.amount || 0);
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount || 0);
    });

    const periodName = Array.from(monthSet).join(' & ');

    const categoryRows = Object.entries(categoryTotals)
      .map(([cat, amt]) => `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${cat}</td><td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: right;">Rs ${Number(amt).toLocaleString()}</td></tr>`)
      .join('');

    const recentRows = pastExpenses.slice(0, 15).map(e => `
      <tr>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 13px;">${new Date(e.date).toLocaleDateString()}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 13px;">${e.title}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 13px;">${e.category}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right; font-weight: bold;">Rs ${Number(e.amount).toLocaleString()}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 28px 24px; color: white;">
          <h1 style="margin: 0 0 6px; font-size: 22px;">Expense Tracker Pro</h1>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Bi-Monthly Financial Statement (${periodName})</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Here is your official expense statement for <strong>${periodName}</strong>. 
            This statement contains all your recorded transactions before database storage cleanup.
          </p>

          <div style="display: flex; gap: 16px; margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;">
            <div style="flex: 1;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Total Spent</span>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">Rs ${totalAmount.toLocaleString()}</div>
            </div>
            <div style="flex: 1;">
              <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Transactions</span>
              <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">${pastExpenses.length}</div>
            </div>
          </div>

          <h3 style="font-size: 16px; margin: 24px 0 10px; color: #0f172a;">Category Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              ${categoryRows}
            </tbody>
          </table>

          <h3 style="font-size: 16px; margin: 24px 0 10px; color: #0f172a;">Transactions in Statement</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; font-size: 12px; color: #475569;">
                <th style="padding: 6px 10px;">Date</th>
                <th style="padding: 6px 10px;">Title</th>
                <th style="padding: 6px 10px;">Category</th>
                <th style="padding: 6px 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${recentRows}
            </tbody>
          </table>

          <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            Expense Tracker Pro • Safe automated financial statements • You are receiving this because you use Expense Tracker Pro.
          </div>
        </div>
      </div>
    `;

    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Expense Tracker Pro" <${process.env.EMAIL_USER || 'no-reply@expensetrackerpro.com'}>`,
      to: userEmail,
      subject: `📄 Your ${periodName} Expense Statement — Expense Tracker Pro`,
      html: htmlContent,
    });

    res.json({
      success: true,
      message: `Statement email successfully sent to ${userEmail}.`,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || null,
    });
  } catch (error) {
    console.error('sendStatementEmail error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Execute 2-month batch cleanup (archives summary and deletes past transactions)
 * @route POST /api/expenses/execute-cleanup
 */
export const executeBatchCleanup = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const pastExpenses = await Expense.find({
      userId,
      date: { $lt: startOfCurrentMonth },
    }).sort({ date: 1 }).lean();

    if (!pastExpenses || pastExpenses.length === 0) {
      return res.status(400).json({ error: 'No past completed monthly transactions to clean up.' });
    }

    const monthSet = new Set();
    let totalAmount = 0;
    const categoryTotals = {};
    let minDate = new Date(pastExpenses[0].date);
    let maxDate = new Date(pastExpenses[pastExpenses.length - 1].date);

    pastExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      monthSet.add(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
      totalAmount += Number(exp.amount || 0);
      const cat = exp.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount || 0);
    });

    const periodName = Array.from(monthSet).join(' & ');

    // 1. Create MonthlyArchive entry
    await MonthlyArchive.create({
      userId,
      periodName: periodName || 'Bi-Monthly Archive',
      startDate: minDate,
      endDate: maxDate,
      totalAmount,
      transactionCount: pastExpenses.length,
      categoryBreakdown: categoryTotals,
      archivedAt: new Date(),
    });

    // 2. Delete the past expenses
    const deleteResult = await Expense.deleteMany({
      userId,
      date: { $lt: startOfCurrentMonth },
    });

    // 3. Create persistent Notification
    await Notification.create({
      userId,
      title: 'Database Cleaned & Space Cleared 🧹',
      message: `${deleteResult.deletedCount} transactions from ${periodName} were safely archived and removed from active storage.`,
      type: 'info',
    }).catch((e) => console.error('Notification error:', e.message));

    res.json({
      success: true,
      message: `Successfully archived and deleted ${deleteResult.deletedCount} past transactions.`,
      deletedCount: deleteResult.deletedCount,
      periodName,
    });
  } catch (error) {
    console.error('executeBatchCleanup error:', error);
    res.status(500).json({ error: error.message });
  }
};
