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

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      default: "Hostel", // "Hostel", "Friends", "Classmates", "Trip", "General"
    },
    icon: {
      type: String,
      default: "home",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          default: "",
        },
        email: {
          type: String,
          default: "",
        },
        role: {
          type: String,
          enum: ["Admin", "Member"],
          default: "Member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const SplitExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount must be positive"],
    },
    category: {
      type: String,
      default: "Food",
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Paid by user ID is required"],
      index: true,
    },
    paidByName: {
      type: String,
      default: "",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
    },
    groupName: {
      type: String,
      default: "",
    },
    splitType: {
      type: String,
      enum: ["Equal", "Custom", "Percentage"],
      default: "Equal",
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          default: "",
        },
        email: {
          type: String,
          default: "",
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        percentage: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ["Unpaid", "UnderReview", "Verified", "Rejected"],
          default: "Unpaid",
          index: true,
        },
        proof: {
          method: {
            type: String,
            enum: ["Easypaisa", "JazzCash", "Bank Transfer", "Other", "Cash"],
            default: "Easypaisa",
          },
          imageUrl: {
            type: String,
            default: "",
          },
          transactionId: {
            type: String,
            trim: true,
            default: "",
          },
          senderNote: {
            type: String,
            default: "",
          },
          paymentDate: {
            type: String,
            default: "",
          },
          submittedAt: {
            type: Date,
          },
          verifiedAt: {
            type: Date,
          },
          verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          rejectionReason: {
            type: String,
            default: "",
          },
        },
      },
    ],
    isFullySettled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger", "tip", "welcome"],
      default: "info",
    },
    unread: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export { UserSchema, ExpenseSchema, GroupSchema, SplitExpenseSchema, NotificationSchema };

