import { Expense } from '../models.js';

// Create a new expense (assigned to current authenticated user)
const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all expenses for the logged-in user (sorted by date, newest first)
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single expense by ID (only if belonging to logged-in user)
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an expense by ID (only if belonging to logged-in user)
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    ).lean();

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an expense by ID (only if belonging to logged-in user)
const delExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted', expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search expenses by title or category for the logged-in user
const searchExpense = async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const expenses = await Expense.find({
      userId: req.user._id,
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
