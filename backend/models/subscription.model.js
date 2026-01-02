import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters long"],
      maxLength: [100, "Name must be at most 50 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: [0, "Price must be at least > 0"],
    },
    currency: {
      type: String,
      enum: [
        "USD",
        "EUR",
        "GBP",
        "CEDI",
        "JPY",
        "AUD",
        "CAD",
        "CHF",
        "CNY",
        "HKD",
        "IDR",
        "INR",
        "KRW",
        "MXN",
        "MYR",
        "NOK",
        "NZD",
        "PHP",
        "PKR",
        "PLN",
        "RUB",
        "SGD",
        "THB",
        "TRY",
        "ZAR",
      ],
      required: [true, "Currency is required"],
      default: "USD",
    },
    frequency: {
      type: String,
      enum: ["Monthly", "Yearly", "Weekly", "Daily"],
      required: [true, "Frequency is required"],
      default: "Monthly",
    },
    category: {
      type: String,
      enum: [
        "Entertainment",
        "Food",
        "Travel",
        "Shopping",
        "Subscription",
        "Others",
      ],
      required: [true, "Category is required"],
      trim: true,
      default: "Subscription",
    },
    status: {
      type: String,
      enum: ["Active", "Suspended", "Cancelled", "Expired", "Trial"],
      required: [true, "Status is required"],
      default: "Active",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value.getTime() > this.startDate.getTime();
        },
        message: "Renewal date must be after start date",
      },
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    trialType: {
      type: String,
      enum: ["3-day", "7-day", "none"],
      default: "none",
    },
    trialEndDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    workflowRunId: {
      type: String,
    },
    workflowStatus: {
      type: String,
      enum: ["idle", "pending", "running", "completed", "failed", "cancelled"],
      default: "idle",
    },
    remindersSent: [
      {
        type: String,
      },
    ],
    lastReminderSent: {
      type: Date,
    },
  },
  { timestamps: true }
);

subscriptionSchema.pre("save", function () {
  if (this.isTrial && this.trialType !== "none") {
    const trialDays = this.trialType === "3-day" ? 3 : 7;
    this.trialEndDate = new Date(this.startDate);
    this.trialEndDate.setDate(this.trialEndDate.getDate() + trialDays);
    this.status = "Trial";

    if (!this.renewalDate) {
      this.renewalDate = new Date(this.trialEndDate);
    }
  } else if (!this.renewalDate) {
    const renewalPeriod = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriod[this.frequency.toLowerCase()]
    );
  }

  const now = new Date();
  if (this.isTrial && this.trialEndDate && this.trialEndDate < now) {
    this.status = "Expired";
    this.isTrial = false;
  } else if (this.renewalDate < now && this.status !== "Trial") {
    this.status = "Expired";
  }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
