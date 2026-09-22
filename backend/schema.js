import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  { timestamps: true }
);

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Shopping",
        "Travel",
        "Bills",
        "Health",
        "Education",
        "Entertainment",
        "Online Services",
        "Groceries",
        "Transportation",
        "Utilities",
        "Insurance",
        "Gifts",
        "Personal Care",
        "Subscriptions",
        "Charity",
        "Taxes",
        "Investments",
        "Other",
      ],
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Card",
        "Cash",
        "Bank Transfer",
        "Auto-debit",
        "Cheque",
        "Mobile Payment",
        "Online Payment",
        "Digital Wallet",
        "Other",
      ],
      default: "Card",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Completed",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for backwards compatibility, required for user-scoped data
      index: true,
    },
  },
  { timestamps: true }
);

export { UserSchema, ExpenseSchema };
