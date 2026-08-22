import { Expense } from '../models.js';

// Create a new expense
const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all expenses (sorted by date, newest first)
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 }).lean();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).lean();
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an expense by ID
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an expense by ID
const delExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id).lean();
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted', expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search expenses by title or category
const searchExpense = async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const expenses = await Expense.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ],
    }).lean();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  delExpense,
  searchExpense,
};
