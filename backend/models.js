import mongoose from 'mongoose';
import { ExpenseSchema, UserSchema, GroupSchema, SplitExpenseSchema, NotificationSchema } from './schema.js';

const Expense = mongoose.model('Expense', ExpenseSchema);
const User = mongoose.model('User', UserSchema);
const Group = mongoose.model('Group', GroupSchema);
const SplitExpense = mongoose.model('SplitExpense', SplitExpenseSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

export { Expense, User, Group, SplitExpense, Notification };

