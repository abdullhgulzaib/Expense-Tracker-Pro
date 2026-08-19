import { Expense } from '../models.js';

// Get summary statistics (total, highest, average, count)
const getSummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          highestExpense: { $max: '$amount' },
          averageExpense: { $avg: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalExpenses: { $round: ['$totalExpenses', 2] },
          highestExpense: { $round: ['$highestExpense', 2] },
          averageExpense: { $round: ['$averageExpense', 2] },
          transactionCount: 1,
        },
      },
    ]);

    // If no expenses exist, return zeros
    const result = summary.length > 0 ? summary[0] : {
      totalExpenses: 0,
      highestExpense: 0,
      averageExpense: 0,
      transactionCount: 0,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expenses grouped by category (for pie/bar charts)
const getByCategory = async (req, res) => {
  try {
    const byCategory = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
          count: 1,
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    res.json(byCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get monthly trend (sum grouped by month, last 6 months)
const getMonthlyTrend = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalAmount: { $round: ['$totalAmount', 2] },
          count: 1,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);

    res.json(monthlyTrend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getSummary, getByCategory, getMonthlyTrend };
