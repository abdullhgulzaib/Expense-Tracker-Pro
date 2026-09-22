import mongoose from 'mongoose';
import { ExpenseSchema, UserSchema } from './schema.js';

const Expense = mongoose.model('Expense', ExpenseSchema);
const User = mongoose.model('User', UserSchema);

export { Expense, User };
