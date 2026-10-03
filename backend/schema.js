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
      required: function () {
        return !this.googleId;
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true }
);

export const ALL_EXPENSE_CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Online Services",
  "GYM",
  "Groceries",
  "Transportation",
  "Transport",
  "Housing",
  "Utilities",
  "Insurance",
  "Gifts",
  "Personal Care",
  "Subscriptions",
  "Charity",
  "Taxes",
  "Investments",
  "Rent",
  "Maintenance",
  "General",
  "Dining",
  "Fitness",
  "Electronics",
  "Salary",
  "Savings",
  "Hostel",
  "Medical",
  "Personal",
  "Family",
  "Business",
  "Uncategorized",
  "Other",
];

export const ALL_PAYMENT_METHODS = [
  "Card",
  "Cash",
  "Bank Transfer",
  "Auto-debit",
  "Cheque",
  "Mobile Payment",
  "Online Payment",
  "Digital Wallet",
  "Easypaisa",
  "EasyPaisa",
  "Easy Paisa",
  "JazzCash",
  "Jazz Cash",
  "Raast",
  "SadaPay",
  "Sadapay",
  "Sada Pay",
  "NayaPay",
  "Nayapay",
  "Naya Pay",
  "Debit Card",
  "Credit Card",
  "Cash / Other",
  "Other",
];

export const ALL_EXPENSE_STATUSES = [
  "Completed",
  "Pending",
  "Cancelled",
  "Failed",
  "Draft",
];

export const ALL_SPLIT_STATUSES = [
  "Unpaid",
  "UnderReview",
  "Verified",
  "Rejected",
  "Paid",
  "Pending",
  "Settled",
];

export const ALL_SPLIT_TYPES = [
  "Equal",
  "Custom",
  "Percentage",
  "Exact",
  "Unequal",
  "Shares",
];

export const ALL_NOTIFICATION_TYPES = [
  "info",
  "success",
  "warning",
  "danger",
  "tip",
  "welcome",
  "expense-add",
  "expense-delete",
  "expense-update",
  "split-created",
  "proof-submitted",
  "proof-verified",
  "proof-rejected",
  "general",
];

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
      enum: ALL_EXPENSE_CATEGORIES,
      default: "Food",
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ALL_PAYMENT_METHODS,
      default: "Card",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ALL_EXPENSE_STATUSES,
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

// Pre-validate hook: automatically maps any case variations or unknown inputs
// so Mongoose validation NEVER fails on category, paymentMethod or status!
ExpenseSchema.pre("validate", function (next) {
  if (this.category) {
    const rawCat = String(this.category).trim();
    const matched = ALL_EXPENSE_CATEGORIES.find(
      (c) => c.toLowerCase() === rawCat.toLowerCase()
    );
    if (matched) {
      this.category = matched;
    } else {
      this.category = "Other";
    }
  } else {
    this.category = "Food";
  }

  if (this.paymentMethod) {
    const rawPm = String(this.paymentMethod).trim();
    const matched = ALL_PAYMENT_METHODS.find(
      (p) => p.toLowerCase() === rawPm.toLowerCase()
    );
    if (matched) {
      this.paymentMethod = matched;
    } else {
      this.paymentMethod = "Other";
    }
  } else {
    this.paymentMethod = "Card";
  }

  if (this.status) {
    const rawStatus = String(this.status).trim();
    const matched = ALL_EXPENSE_STATUSES.find(
      (s) => s.toLowerCase() === rawStatus.toLowerCase()
    );
    if (matched) {
      this.status = matched;
    } else {
      this.status = "Completed";
    }
  }

  next();
});

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
      enum: ALL_SPLIT_TYPES,
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
          enum: ALL_SPLIT_STATUSES,
          default: "Unpaid",
          index: true,
        },
        proof: {
          method: {
            type: String,
            enum: ALL_PAYMENT_METHODS,
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

// Pre-validate hook for SplitExpenseSchema: normalize splitType, split status, and payment method
SplitExpenseSchema.pre("validate", function (next) {
  if (this.splitType) {
    const rawType = String(this.splitType).trim();
    const matchedType = ALL_SPLIT_TYPES.find(
      (t) => t.toLowerCase() === rawType.toLowerCase()
    );
    if (matchedType) {
      this.splitType = matchedType;
    } else {
      this.splitType = "Equal";
    }
  }

  if (Array.isArray(this.splits)) {
    this.splits.forEach((split) => {
      if (split.status) {
        const rawStatus = String(split.status).trim();
        const matched = ALL_SPLIT_STATUSES.find(
          (s) => s.toLowerCase() === rawStatus.toLowerCase()
        );
        if (matched) {
          split.status = matched;
        } else {
          split.status = "Unpaid";
        }
      }

      if (split.proof && split.proof.method) {
        const rawMethod = String(split.proof.method).trim();
        const matched = ALL_PAYMENT_METHODS.find(
          (p) => p.toLowerCase() === rawMethod.toLowerCase()
        );
        if (matched) {
          split.proof.method = matched;
        } else {
          split.proof.method = "Other";
        }
      }
    });
  }

  next();
});

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
      enum: ALL_NOTIFICATION_TYPES,
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

// Pre-validate hook for NotificationSchema
NotificationSchema.pre("validate", function (next) {
  if (this.type) {
    const rawType = String(this.type).trim();
    const matched = ALL_NOTIFICATION_TYPES.find(
      (t) => t.toLowerCase() === rawType.toLowerCase()
    );
    if (matched) {
      this.type = matched;
    } else {
      this.type = "info";
    }
  }
  next();
});

export const MonthlyArchiveSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    periodName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    transactionCount: { type: Number, required: true },
    categoryBreakdown: { type: Map, of: Number, default: {} },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export { UserSchema, ExpenseSchema, GroupSchema, SplitExpenseSchema, NotificationSchema };

