import mongoose from "mongoose";

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
      required: false, // flips to true in Phase 2 auth
    },
  },
  { timestamps: true },
);

export { ExpenseSchema };
