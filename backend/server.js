// Load environment variables first, before anything else uses them
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} from './controllers/authController.js';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  delExpense,
  searchExpense,
} from './controllers/expenseController.js';
import {
  getSummary,
  getByCategory,
  getMonthlyTrend,
} from './controllers/analyticsController.js';
import {
  getSplitVaultSummary,
  getGroups,
  createGroup,
  joinGroupByInviteCode,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  getGroupDetails,
  createSplitExpense,
  submitPaymentProof,
  verifyPaymentProof,
} from './controllers/splitVaultController.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;
let databaseConnection;

const connectToDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      family: 4,
    }).catch((error) => {
      databaseConnection = null;
      throw error;
    });
  }

  return databaseConnection;
};

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Wait for MongoDB before handling database-backed requests.
app.use(['/auth', '/api/auth', '/expenses', '/api/expenses', '/analytics', '/api/analytics', '/splitvault', '/api/splitvault'], async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    next(error);
  }
});

// Authentication Routes (supports both /auth and /api/auth prefixes)
app.post(['/auth/register', '/api/auth/register'], registerUser);
app.post(['/auth/login', '/api/auth/login'], loginUser);
app.get(['/auth/me', '/api/auth/me'], protect, getMe);
app.put(['/auth/profile', '/api/auth/profile'], protect, updateProfile);

// Expense CRUD Routes (Protected)
app.post(['/expenses', '/api/expenses'], protect, createExpense);
app.get(['/expenses', '/api/expenses'], protect, getExpenses);
app.get(['/expenses/search', '/api/expenses/search'], protect, searchExpense);
app.get(['/expenses/:id', '/api/expenses/:id'], protect, getExpenseById);
app.put(['/expenses/:id', '/api/expenses/:id'], protect, updateExpense);
app.delete(['/expenses/:id', '/api/expenses/:id'], protect, delExpense);

// Analytics Routes (Protected)
app.get(['/analytics/summary', '/api/analytics/summary'], protect, getSummary);
app.get(['/analytics/by-category', '/api/analytics/by-category'], protect, getByCategory);
app.get(['/analytics/monthly-trend', '/api/analytics/monthly-trend'], protect, getMonthlyTrend);

// SplitVault Routes (Protected)
app.get(['/splitvault/summary', '/api/splitvault/summary'], protect, getSplitVaultSummary);
app.get(['/splitvault/groups', '/api/splitvault/groups'], protect, getGroups);
app.post(['/splitvault/groups', '/api/splitvault/groups'], protect, createGroup);
app.post(['/splitvault/groups/join', '/api/splitvault/groups/join'], protect, joinGroupByInviteCode);
app.delete(['/splitvault/groups/:groupId', '/api/splitvault/groups/:groupId'], protect, deleteGroup);
app.post(['/splitvault/groups/:groupId/members', '/api/splitvault/groups/:groupId/members'], protect, addMemberToGroup);
app.delete(['/splitvault/groups/:groupId/members/:memberId', '/api/splitvault/groups/:groupId/members/:memberId'], protect, removeMemberFromGroup);
app.get(['/splitvault/groups/:groupId', '/api/splitvault/groups/:groupId'], protect, getGroupDetails);
app.post(['/splitvault/expenses', '/api/splitvault/expenses'], protect, createSplitExpense);
app.post(['/splitvault/expenses/:expenseId/splits/:splitUserId/proof', '/api/splitvault/expenses/:expenseId/splits/:splitUserId/proof'], protect, submitPaymentProof);
app.post(['/splitvault/expenses/:expenseId/splits/:splitUserId/verify', '/api/splitvault/expenses/:expenseId/splits/:splitUserId/verify'], protect, verifyPaymentProof);

// Error handling fallback
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
