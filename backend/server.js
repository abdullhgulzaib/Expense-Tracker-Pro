// Load environment variables first, before anything else uses them
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
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
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Wait for MongoDB before handling database-backed requests.
app.use(['/expenses', '/analytics'], async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    next(error);
  }
});

// Expense CRUD Routes
app.post('/expenses', createExpense);
app.get('/expenses', getExpenses);
app.get('/expenses/search', searchExpense);
app.get('/expenses/:id', getExpenseById);
app.put('/expenses/:id', updateExpense);
app.delete('/expenses/:id', delExpense);

// Analytics Routes
app.get('/analytics/summary', getSummary);
app.get('/analytics/by-category', getByCategory);
app.get('/analytics/monthly-trend', getMonthlyTrend);

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
