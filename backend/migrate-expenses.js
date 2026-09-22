import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Expense, User } from './models.js';

dotenv.config();

async function migrate() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from .env");
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!\n");

    const targetEmail = process.argv[2];

    let user;
    if (targetEmail) {
      user = await User.findOne({ email: targetEmail.toLowerCase() });
      if (!user) {
        console.error(`❌ User with email "${targetEmail}" was not found.`);
        const allUsers = await User.find({}).select('email name');
        console.log("\nExisting users in database:");
        allUsers.forEach((u) => console.log(` - ${u.name} (${u.email}) [ID: ${u._id}]`));
        process.exit(1);
      }
    } else {
      const users = await User.find({});
      if (users.length === 0) {
        console.error("❌ No users found in database. Please register a user first!");
        process.exit(1);
      } else if (users.length === 1) {
        user = users[0];
        console.log(`ℹ️ Found single user in database: ${user.name} (${user.email})`);
      } else {
        console.log("ℹ️ Multiple users found. Please specify the target user email as an argument:");
        console.log("   node migrate-expenses.js <user_email>\n");
        users.forEach((u) => console.log(` - ${u.name} (${u.email})`));
        process.exit(1);
      }
    }

    console.log(`\nSelected User: ${user.name} (${user.email}) [ID: ${user._id}]`);

    // Find expenses that don't have a userId or have userId: null
    const filter = {
      $or: [
        { userId: { $exists: false } },
        { userId: null },
      ],
    };

    const countToMigrate = await Expense.countDocuments(filter);
    console.log(`Found ${countToMigrate} unassigned expenses to migrate.`);

    if (countToMigrate === 0) {
      console.log("🎉 No unassigned expenses need migration.");
      process.exit(0);
    }

    const result = await Expense.updateMany(filter, {
      $set: { userId: user._id },
    });

    console.log(`\n✅ Migration Complete! Successfully assigned ${result.modifiedCount} expenses to ${user.email}.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
