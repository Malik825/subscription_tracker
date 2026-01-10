import mongoose from "mongoose";
import SharingGroup from "../models/sharingGroup.model.js";
import Payment from "../models/payment.model.js";

const createPaymentRecord = async (req, res) => {
  try {
    const { sharingGroupId, subscriptionId, payerId, amount, dueDate, notes } =
      req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(sharingGroupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sharing group ID",
      });
    }

    const group = await SharingGroup.findById(sharingGroupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can create payment records",
      });
    }

    const payment = await Payment.create({
      sharingGroup: sharingGroupId,
      subscription: subscriptionId,
      payer: payerId,
      amount,
      dueDate: new Date(dueDate),
      notes: notes || "",
      status: "pending",
    });

    await payment.populate("payer", "username email");

    res.status(201).json({
      success: true,
      message: "Payment record created successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Create payment record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment record",
      error: error.message,
    });
  }
};

const getGroupPayments = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { startDate, endDate, status } = req.query;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const query = { sharingGroup: groupId };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const payments = await Payment.find(query)
      .populate("payer", "username email")
      .populate("subscription", "name price")
      .sort({ dueDate: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error("Get group payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payments",
      error: error.message,
    });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const query = { payer: userId };

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate("sharingGroup", "name")
      .populate("subscription", "name price")
      .sort({ dueDate: -1 });

    const summary = {
      totalOwed: 0,
      totalPaid: 0,
      overdueCount: 0,
      pendingCount: 0,
    };

    payments.forEach((payment) => {
      if (payment.status === "pending" || payment.status === "overdue") {
        summary.totalOwed += payment.amount;
        if (payment.status === "overdue") {
          summary.overdueCount++;
        } else {
          summary.pendingCount++;
        }
      } else if (payment.status === "paid") {
        summary.totalPaid += payment.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary,
      },
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user payments",
      error: error.message,
    });
  }
};

const markPaymentAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = "other" } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id).populate("sharingGroup");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const group = await SharingGroup.findById(payment.sharingGroup._id);

    if (
      !group.canManage(userId) &&
      payment.payer.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark this payment as paid",
      });
    }

    await payment.markAsPaid(paymentMethod);

    res.status(200).json({
      success: true,
      message: "Payment marked as paid",
      data: payment,
    });
  } catch (error) {
    console.error("Mark payment as paid error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark payment as paid",
      error: error.message,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id).populate("sharingGroup");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const group = await SharingGroup.findById(payment.sharingGroup._id);

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can update payment status",
      });
    }

    if (status) {
      payment.status = status;
      if (status === "paid" && !payment.paidDate) {
        payment.paidDate = new Date();
      }
    }

    if (notes !== undefined) {
      payment.notes = notes;
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      data: payment,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

const sendPaymentReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id)
      .populate("sharingGroup")
      .populate("payer", "username email")
      .populate("subscription", "name price");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const group = await SharingGroup.findById(payment.sharingGroup._id);

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can send reminders",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot send reminder for paid payment",
      });
    }

    payment.remindersSent += 1;
    payment.lastReminderDate = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment reminder sent",
      data: payment,
    });
  } catch (error) {
    console.error("Send payment reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send payment reminder",
      error: error.message,
    });
  }
};

const getPaymentSummary = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    const group = await SharingGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Sharing group not found",
      });
    }

    if (!group.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const summary = await Payment.getGroupPaymentSummary(
      groupId,
      startOfMonth,
      endOfMonth
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get payment summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment summary",
      error: error.message,
    });
  }
};

const deletePaymentRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(id).populate("sharingGroup");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const group = await SharingGroup.findById(payment.sharingGroup._id);

    if (!group.canManage(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or admin can delete payment records",
      });
    }

    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Payment record deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete payment record",
      error: error.message,
    });
  }
};

const checkOverduePayments = async (req, res) => {
  try {
    const result = await Payment.checkAndUpdateOverdue();

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} payments marked as overdue`,
      data: result,
    });
  } catch (error) {
    console.error("Check overdue payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check overdue payments",
      error: error.message,
    });
  }
};

export {
  createPaymentRecord,
  getGroupPayments,
  getUserPayments,
  markPaymentAsPaid,
  updatePaymentStatus,
  sendPaymentReminder,
  getPaymentSummary,
  deletePaymentRecord,
  checkOverduePayments,
};
