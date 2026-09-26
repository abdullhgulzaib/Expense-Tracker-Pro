import mongoose from 'mongoose';
import { ExpenseSchema, UserSchema, GroupSchema, SplitExpenseSchema } from './schema.js';

const Expense = mongoose.model('Expense', ExpenseSchema);
const User = mongoose.model('User', UserSchema);
const Group = mongoose.model('Group', GroupSchema);
const SplitExpense = mongoose.model('SplitExpense', SplitExpenseSchema);

export { Expense, User, Group, SplitExpense };
