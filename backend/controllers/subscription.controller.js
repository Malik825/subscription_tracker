import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upsatsh.js";
import { SERVER_URL } from "../config/env.js";
import { sendWelcomeEmail } from "../utils/send.email.js";
import notificationService from "../../services/notification.service.js";

const FREE_USER_LIMIT = 10;

const triggerWorkflow = async (subscriptionId, userId, renewalDate) => {
  try {
    const workflowResponse = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminders`,
      body: {
        subscriptionId: subscriptionId.toString(),
        userId: userId.toString(),
        renewalDate,
      },
    });
    return workflowResponse.workflowRunId;
  } catch (error) {
    throw error;
  }
};

const cancelWorkflow = async (workflowRunId) => {
  try {
    await workflowClient.cancel(workflowRunId);
  } catch (error) {}
};

export const createSubscription = async (req, res, next) => {
  try {
    if (req.user.plan === "free") {
      const subscriptionCount = await Subscription.countDocuments({
        user: req.user._id,
      });

      if (subscriptionCount >= FREE_USER_LIMIT) {
        return res.status(403).json({
          success: false,
          message:
            "Free users are limited to 10 subscriptions. Please upgrade to Pro for unlimited tracking.",
          code: "LIMIT_REACHED",
        });
      }
    }

    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
      workflowStatus: "pending",
    });

    let workflowRunId = null;

    try {
      workflowRunId = await triggerWorkflow(
        subscription._id,
        subscription.user,
        subscription.renewalDate
      );

      await Subscription.findByIdAndUpdate(subscription._id, {
        workflowRunId,
        workflowStatus: "running",
      });
    } catch (workflowError) {
      await Subscription.findByIdAndUpdate(subscription._id, {
        workflowStatus: "failed",
      });
    }

    const updatedSubscription = await Subscription.findById(
      subscription._id
    ).populate("user", "username email");

    await notificationService.createSubscriptionAddedNotification(
      req.user._id,
      updatedSubscription
    );

    sendWelcomeEmail({
      to: req.user.email,
      subscription: updatedSubscription,
    })
      .then((result) => {})
      .catch((error) => {});

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: updatedSubscription,
      workflowRunId,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await Subscription.find(filter)
      .populate("user", "username email")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      const error = new Error(
        "You are not authorized to view these subscriptions"
      );
      error.statusCode = 403;
      throw error;
    }

    const { status, category, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { user: req.params.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const subscriptions = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "user",
      "username email"
    );

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user._id.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to view this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    const daysUntilRenewal = dayjs(subscription.renewalDate).diff(
      dayjs(),
      "day"
    );

    res.status(200).json({
      success: true,
      message: "Subscription retrieved successfully",
      data: {
        ...subscription.toObject(),
        daysUntilRenewal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    const oldPrice = subscription.price;
    const oldStatus = subscription.status;

    const renewalDateChanged =
      req.body.renewalDate &&
      new Date(req.body.renewalDate).toISOString().split("T")[0] !==
        new Date(subscription.renewalDate).toISOString().split("T")[0];

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate("user", "username email");

    if (req.body.price && req.body.price !== oldPrice) {
      await notificationService.createPriceChangeNotification(
        req.user._id,
        updatedSubscription,
        oldPrice,
        req.body.price
      );
    }

    if (req.body.status && req.body.status !== oldStatus) {
      await notificationService.createStatusChangeNotification(
        req.user._id,
        updatedSubscription,
        oldStatus,
        req.body.status
      );
    }

    if (renewalDateChanged && subscription.workflowStatus === "running") {
      try {
        if (subscription.workflowRunId) {
          await cancelWorkflow(subscription.workflowRunId);
        }

        const workflowRunId = await triggerWorkflow(
          updatedSubscription._id,
          updatedSubscription.user._id,
          updatedSubscription.renewalDate
        );

        await Subscription.findByIdAndUpdate(req.params.id, {
          workflowRunId,
          workflowStatus: "running",
          remindersSent: [],
        });
      } catch (workflowError) {}
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to delete this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    if (
      subscription.workflowRunId &&
      subscription.workflowStatus === "running"
    ) {
      await cancelWorkflow(subscription.workflowRunId);
    }

    await Subscription.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to modify this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    const oldStatus = subscription.status;
    const newStatus =
      subscription.status.toLowerCase() === "active" ? "Suspended" : "Active";

    if (
      newStatus === "Suspended" &&
      subscription.workflowRunId &&
      subscription.workflowStatus === "running"
    ) {
      await cancelWorkflow(subscription.workflowRunId);
    }

    if (newStatus === "Active") {
      try {
        const workflowRunId = await triggerWorkflow(
          subscription._id,
          subscription.user,
          subscription.renewalDate
        );

        await Subscription.findByIdAndUpdate(req.params.id, {
          status: newStatus,
          workflowRunId,
          workflowStatus: "running",
        });
      } catch (workflowError) {
        await Subscription.findByIdAndUpdate(req.params.id, {
          status: newStatus,
          workflowStatus: "failed",
        });
      }
    } else {
      await Subscription.findByIdAndUpdate(req.params.id, {
        status: newStatus,
        workflowStatus: "cancelled",
      });
    }

    const updatedSubscription = await Subscription.findById(
      req.params.id
    ).populate("user", "username email");

    await notificationService.createStatusChangeNotification(
      req.user._id,
      updatedSubscription,
      oldStatus,
      newStatus
    );

    res.status(200).json({
      success: true,
      message: `Subscription ${newStatus.toLowerCase()} successfully`,
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const retriggerWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to retrigger this workflow"
      );
      error.statusCode = 403;
      throw error;
    }

    if (subscription.workflowStatus === "running") {
      return res.status(400).json({
        success: false,
        message: "Workflow is already running for this subscription",
        workflowRunId: subscription.workflowRunId,
      });
    }

    if (subscription.status.toLowerCase() !== "active") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot trigger workflow for inactive subscription. Please activate it first.",
      });
    }

    const workflowRunId = await triggerWorkflow(
      subscription._id,
      subscription.user,
      subscription.renewalDate
    );

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      {
        workflowRunId,
        workflowStatus: "running",
        remindersSent: [],
      },
      { new: true }
    ).populate("user", "username email");

    res.status(200).json({
      success: true,
      message: "Workflow retriggered successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelWorkflowEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error("You are not authorized to cancel this workflow");
      error.statusCode = 403;
      throw error;
    }

    if (!subscription.workflowRunId) {
      return res.status(400).json({
        success: false,
        message: "No workflow found for this subscription",
      });
    }

    if (subscription.workflowStatus !== "running") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel workflow with status: ${subscription.workflowStatus}`,
      });
    }

    await workflowClient.cancel(subscription.workflowRunId);

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { workflowStatus: "cancelled" },
      { new: true }
    ).populate("user", "username email");

    res.status(200).json({
      success: true,
      message: "Workflow cancelled successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkflowStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to view this workflow status"
      );
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        workflowRunId: subscription.workflowRunId,
        workflowStatus: subscription.workflowStatus,
        lastReminderSent: subscription.lastReminderSent,
        remindersSent: subscription.remindersSent,
        totalRemindersSent: subscription.remindersSent?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const subscriptions = await Subscription.find({ user: userId });

    const stats = {
      overview: {
        total: subscriptions.length,
        active: subscriptions.filter((s) => s.status.toLowerCase() === "active")
          .length,
        inactive: subscriptions.filter(
          (s) => s.status.toLowerCase() !== "active"
        ).length,
      },
      spending: {
        totalMonthly: 0,
        totalYearly: 0,
        byCategory: {},
        byCurrency: {},
      },
      upcomingRenewals: [],
      workflow: {
        running: subscriptions.filter((s) => s.workflowStatus === "running")
          .length,
        completed: subscriptions.filter((s) => s.workflowStatus === "completed")
          .length,
        failed: subscriptions.filter((s) => s.workflowStatus === "failed")
          .length,
        cancelled: subscriptions.filter((s) => s.workflowStatus === "cancelled")
          .length,
      },
    };

    subscriptions
      .filter((s) => s.status.toLowerCase() === "active")
      .forEach((sub) => {
        const monthlyAmount =
          sub.frequency.toLowerCase() === "monthly"
            ? sub.price
            : sub.price / 12;
        const yearlyAmount =
          sub.frequency.toLowerCase() === "yearly" ? sub.price : sub.price * 12;

        stats.spending.totalMonthly += monthlyAmount;
        stats.spending.totalYearly += yearlyAmount;

        if (!stats.spending.byCategory[sub.category]) {
          stats.spending.byCategory[sub.category] = { monthly: 0, yearly: 0 };
        }
        stats.spending.byCategory[sub.category].monthly += monthlyAmount;
        stats.spending.byCategory[sub.category].yearly += yearlyAmount;

        if (!stats.spending.byCurrency[sub.currency]) {
          stats.spending.byCurrency[sub.currency] = { monthly: 0, yearly: 0 };
        }
        stats.spending.byCurrency[sub.currency].monthly += monthlyAmount;
        stats.spending.byCurrency[sub.currency].yearly += yearlyAmount;
      });

    const thirtyDaysFromNow = dayjs().add(30, "day");
    stats.upcomingRenewals = subscriptions
      .filter(
        (s) =>
          s.status.toLowerCase() === "active" &&
          dayjs(s.renewalDate).isBefore(thirtyDaysFromNow) &&
          dayjs(s.renewalDate).isAfter(dayjs())
      )
      .map((s) => ({
        id: s._id,
        name: s.name,
        renewalDate: s.renewalDate,
        daysUntil: dayjs(s.renewalDate).diff(dayjs(), "day"),
        price: s.price,
        currency: s.currency,
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteSubscriptions = async (req, res, next) => {
  try {
    const { subscriptionIds } = req.body;

    if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
      const error = new Error("Please provide an array of subscription IDs");
      error.statusCode = 400;
      throw error;
    }

    const subscriptions = await Subscription.find({
      _id: { $in: subscriptionIds },
    });

    if (subscriptions.length !== subscriptionIds.length) {
      const error = new Error("Some subscriptions not found");
      error.statusCode = 404;
      throw error;
    }

    const unauthorized = subscriptions.some(
      (s) => s.user.toString() !== req.user._id.toString()
    );

    if (unauthorized) {
      const error = new Error(
        "You are not authorized to delete some of these subscriptions"
      );
      error.statusCode = 403;
      throw error;
    }

    const cancelPromises = subscriptions
      .filter((s) => s.workflowRunId && s.workflowStatus === "running")
      .map((s) => cancelWorkflow(s.workflowRunId));

    await Promise.all(cancelPromises);

    const result = await Subscription.deleteMany({
      _id: { $in: subscriptionIds },
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} subscription(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const seedSubscriptions = async (req, res, next) => {
  try {
    const subscriptionData = [
      {
        name: "Netflix",
        price: 15.99,
        currency: "USD",
        frequency: "Monthly",
        category: "Entertainment",
      },
      {
        name: "Spotify",
        price: 9.99,
        currency: "USD",
        frequency: "Monthly",
        category: "Entertainment",
      },
      {
        name: "GitHub Pro",
        price: 4.0,
        currency: "USD",
        frequency: "Monthly",
        category: "Subscription",
      },
      {
        name: "Figma",
        price: 12.0,
        currency: "USD",
        frequency: "Monthly",
        category: "Subscription",
      },
      {
        name: "Notion",
        price: 10.0,
        currency: "USD",
        frequency: "Monthly",
        category: "Subscription",
      },
      {
        name: "Adobe Creative Cloud",
        price: 54.99,
        currency: "USD",
        frequency: "Monthly",
        category: "Subscription",
      },
      {
        name: "Amazon Prime",
        price: 139.0,
        currency: "USD",
        frequency: "Yearly",
        category: "Shopping",
      },
      {
        name: "Uber One",
        price: 9.99,
        currency: "USD",
        frequency: "Monthly",
        category: "Travel",
      },
      {
        name: "HelloFresh",
        price: 60.0,
        currency: "USD",
        frequency: "Weekly",
        category: "Food",
      },
      {
        name: "Gym Membership",
        price: 45.0,
        currency: "USD",
        frequency: "Monthly",
        category: "Others",
      },
    ];

    const subscriptions = subscriptionData.map((sub) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));

      return {
        ...sub,
        startDate,
        status: "Active",
        user: req.user._id,
        workflowStatus: "idle",
      };
    });

    const createdSubscriptions = await Subscription.insertMany(subscriptions);

    res.status(201).json({
      success: true,
      message: "Subscriptions seeded successfully",
      data: createdSubscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { subscriptionIds, status } = req.body;

    if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
      const error = new Error("Please provide an array of subscription IDs");
      error.statusCode = 400;
      throw error;
    }

    if (!["Active", "Suspended", "Cancelled"].includes(status)) {
      const error = new Error(
        'Status must be "Active", "Suspended", or "Cancelled"'
      );
      error.statusCode = 400;
      throw error;
    }

    const subscriptions = await Subscription.find({
      _id: { $in: subscriptionIds },
    });

    const unauthorized = subscriptions.some(
      (s) => s.user.toString() !== req.user._id.toString()
    );

    if (unauthorized) {
      const error = new Error(
        "You are not authorized to update some of these subscriptions"
      );
      error.statusCode = 403;
      throw error;
    }

    const result = await Subscription.updateMany(
      { _id: { $in: subscriptionIds } },
      { status, updatedAt: Date.now() }
    );

    if (status !== "Active") {
      const cancelPromises = subscriptions
        .filter((s) => s.workflowRunId && s.workflowStatus === "running")
        .map((s) => cancelWorkflow(s.workflowRunId));

      await Promise.all(cancelPromises);
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} subscription(s)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
