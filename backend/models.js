import mongoose from 'mongoose';
import { ExpenseSchema } from './schema.js';

const Expense = mongoose.model('Expense', ExpenseSchema);

export { Expense };
