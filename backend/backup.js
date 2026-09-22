import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Expense } from './models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackup() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from .env");
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    console.log("Fetching all expenses...");
    const allExpenses = await Expense.find({});
    console.log(`Found ${allExpenses.length} expenses.`);

    // Create backup directory
    const backupDir = path.join(__dirname, '..', 'mongodb-backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Write to JSON file
    const backupPath = path.join(backupDir, 'expenses_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(allExpenses, null, 2));
    
    console.log(`\n✅ Backup successfully saved to: ${backupPath}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Backup failed:", err);
    process.exit(1);
  }
}

runBackup();
