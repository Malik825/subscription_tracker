import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    sharingGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharingGroup",
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "paypal", "venmo", "other"],
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Notes must be less than 500 characters"],
    },
    remindersSent: {
      type: Number,
      default: 0,
    },
    lastReminderDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ sharingGroup: 1, dueDate: -1 });
paymentSchema.index({ payer: 1, status: 1 });
paymentSchema.index({ status: 1, dueDate: 1 });

paymentSchema.methods.markAsPaid = function (paymentMethod = "other") {
  this.status = "paid";
  this.paidDate = new Date();
  this.paymentMethod = paymentMethod;
  return this.save();
};

paymentSchema.methods.markAsOverdue = function () {
  if (this.status === "pending" && new Date() > this.dueDate) {
    this.status = "overdue";
    return this.save();
  }
  return this;
};

paymentSchema.statics.checkAndUpdateOverdue = async function () {
  const result = await this.updateMany(
    {
      status: "pending",
      dueDate: { $lt: new Date() },
    },
    {
      $set: { status: "overdue" },
    }
  );
  return result;
};

paymentSchema.statics.getGroupPaymentSummary = async function (
  sharingGroupId,
  startDate,
  endDate
) {
  const payments = await this.find({
    sharingGroup: sharingGroupId,
    dueDate: { $gte: startDate, $lte: endDate },
  }).populate("payer", "username email");

  const summary = {
    totalExpected: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    payments: payments,
  };

  payments.forEach((payment) => {
    summary.totalExpected += payment.amount;

    if (payment.status === "paid") {
      summary.totalPaid += payment.amount;
      summary.paidCount++;
    } else if (payment.status === "pending") {
      summary.totalPending += payment.amount;
      summary.pendingCount++;
    } else if (payment.status === "overdue") {
      summary.totalOverdue += payment.amount;
      summary.overdueCount++;
    }
  });

  return summary;
};

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
