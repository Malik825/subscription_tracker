import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upsatsh.js";
import Subscription from "../models/subscription.model.js";
import dayjs from "dayjs";

// ============================================================================
// CREATE SUBSCRIPTION
// ============================================================================
export const createSubscription = async (req, res, next) => {
  try {
    console.log("\n🆕 Creating new subscription...");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("User ID:", req.user._id);

    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
      workflowStatus: "pending",
    });

    console.log("✅ Subscription created:", subscription._id);

    let workflowRunId = null;

    // Trigger workflow
    try {
      console.log("\n🚀 Triggering workflow...");
      console.log(
        "Workflow URL:",
        `${SERVER_URL}/api/v1/workflows/subscription/reminders`
      );

      const payload = {
        subscriptionId: subscription._id.toString(),
        userId: subscription.user.toString(),
        renewalDate: subscription.renewalDate,
      };

      console.log("Payload:", payload);

      const workflowResponse = await workflowClient.trigger({
        url: `${SERVER_URL}/api/v1/workflows/subscription/reminders`,
        body: payload,
      });

      workflowRunId = workflowResponse.workflowRunId;
      console.log("✅ Workflow triggered! Run ID:", workflowRunId);

      // Update subscription with workflow info
      await Subscription.findByIdAndUpdate(subscription._id, {
        workflowRunId: workflowRunId,
        workflowStatus: "running",
      });

      console.log("✅ Subscription updated with workflow ID");
    } catch (workflowError) {
      console.error("❌ Failed to trigger workflow:");
      console.error("Error message:", workflowError.message);
      console.error("Error stack:", workflowError.stack);

      // Mark workflow as failed
      await Subscription.findByIdAndUpdate(subscription._id, {
        workflowStatus: "failed",
      });
    }

    // Fetch updated subscription with workflow info
    const updatedSubscription = await Subscription.findById(
      subscription._id
    ).populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: updatedSubscription,
      workflowRunId,
    });
  } catch (error) {
    console.error("❌ Error in createSubscription:", error);
    next(error);
  }
};

// ============================================================================
// GET ALL SUBSCRIPTIONS (Admin only - optional)
// ============================================================================
export const getAllSubscriptions = async (req, res, next) => {
  try {
    console.log("\n📋 Fetching all subscriptions...");

    const {
      page = 1,
      limit = 10,
      status,
      category,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await Subscription.find(filter)
      .populate("user", "name email")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(filter);

    console.log(`✅ Found ${subscriptions.length} subscriptions`);

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
    console.error("❌ Error in getAllSubscriptions:", error);
    next(error);
  }
};

// ============================================================================
// GET USER SUBSCRIPTIONS
// ============================================================================
export const getUserSubscriptions = async (req, res, next) => {
  try {
    console.log("\n📋 Fetching user subscriptions...");
    console.log("User ID from params:", req.params.id);
    console.log("User ID from token:", req.user._id.toString());
    console.log("IDs match:", req.user._id.toString() === req.params.id);

    // Check authorization
    if (req.user._id.toString() !== req.params.id) {
      const error = new Error(
        "You are not authorized to view these subscriptions"
      );
      error.statusCode = 403;
      throw error;
    }

    const { status, category, search } = req.query;

    // Build filter
    const filter = { user: req.params.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const subscriptions = await Subscription.find(filter).sort({
      createdAt: -1,
    });

    console.log(`✅ Found ${subscriptions.length} subscriptions for user`);

    // Calculate statistics
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status.toLowerCase() === "active")
        .length,
      inactive: subscriptions.filter((s) => s.status.toLowerCase() !== "active")
        .length,
      totalMonthlySpend: subscriptions
        .filter((s) => s.status.toLowerCase() === "active")
        .reduce((sum, s) => {
          if (s.frequency.toLowerCase() === "monthly") return sum + s.price;
          if (s.frequency.toLowerCase() === "yearly") return sum + s.price / 12;
          return sum;
        }, 0),
      totalYearlySpend: subscriptions
        .filter((s) => s.status.toLowerCase() === "active")
        .reduce((sum, s) => {
          if (s.frequency.toLowerCase() === "yearly") return sum + s.price;
          if (s.frequency.toLowerCase() === "monthly")
            return sum + s.price * 12;
          return sum;
        }, 0),
    };

    res.status(200).json({
      success: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
      stats,
    });
  } catch (error) {
    console.error("❌ Error in getUserSubscriptions:", error);
    next(error);
  }
};

// ============================================================================
// GET SINGLE SUBSCRIPTION
// ============================================================================
export const getSubscription = async (req, res, next) => {
  try {
    console.log("\n🔍 Fetching subscription:", req.params.id);

    const subscription = await Subscription.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (subscription.user._id.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to view this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    console.log("✅ Subscription found:", subscription.name);

    // Calculate days until renewal
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
    console.error("❌ Error in getSubscription:", error);
    next(error);
  }
};

// ============================================================================
// UPDATE SUBSCRIPTION
// ============================================================================
export const updateSubscription = async (req, res, next) => {
  try {
    console.log("\n✏️ Updating subscription:", req.params.id);
    console.log("Update data:", JSON.stringify(req.body, null, 2));

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    // Check if renewal date is being updated
    const renewalDateChanged =
      req.body.renewalDate &&
      req.body.renewalDate !== subscription.renewalDate.toISOString();

    // Update subscription
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    console.log("✅ Subscription updated successfully");

    // If renewal date changed and workflow is running, cancel and retrigger
    if (renewalDateChanged && subscription.workflowStatus === "running") {
      console.log("🔄 Renewal date changed, retriggering workflow...");

      try {
        // Cancel existing workflow
        if (subscription.workflowRunId) {
          await workflowClient.cancel(subscription.workflowRunId);
          console.log("✅ Old workflow cancelled");
        }

        // Trigger new workflow
        const workflowResponse = await workflowClient.trigger({
          url: `${SERVER_URL}/api/v1/workflows/subscription/reminders`,
          body: {
            subscriptionId: updatedSubscription._id.toString(),
            userId: updatedSubscription.user._id.toString(),
            renewalDate: updatedSubscription.renewalDate,
          },
        });

        await Subscription.findByIdAndUpdate(req.params.id, {
          workflowRunId: workflowResponse.workflowRunId,
          workflowStatus: "running",
          remindersSent: [], // Reset reminders
        });

        console.log(
          "✅ New workflow triggered:",
          workflowResponse.workflowRunId
        );
      } catch (workflowError) {
        console.error("❌ Failed to retrigger workflow:", workflowError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("❌ Error in updateSubscription:", error);
    next(error);
  }
};

// ============================================================================
// DELETE SUBSCRIPTION
// ============================================================================
export const deleteSubscription = async (req, res, next) => {
  try {
    console.log("\n🗑️ Deleting subscription:", req.params.id);

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to delete this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    // Cancel workflow if running
    if (
      subscription.workflowRunId &&
      subscription.workflowStatus === "running"
    ) {
      try {
        await workflowClient.cancel(subscription.workflowRunId);
        console.log("✅ Workflow cancelled");
      } catch (workflowError) {
        console.error("❌ Failed to cancel workflow:", workflowError);
      }
    }

    await Subscription.findByIdAndDelete(req.params.id);

    console.log("✅ Subscription deleted successfully");

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deleteSubscription:", error);
    next(error);
  }
};

// ============================================================================
// TOGGLE SUBSCRIPTION STATUS (Activate/Deactivate)
// ============================================================================
export const toggleSubscriptionStatus = async (req, res, next) => {
  try {
    console.log("\n🔄 Toggling subscription status:", req.params.id);

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to modify this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    const newStatus =
      subscription.status.toLowerCase() === "active" ? "Inactive" : "Active";

    console.log(`Changing status from ${subscription.status} to ${newStatus}`);

    // If deactivating, cancel workflow
    if (
      newStatus === "Inactive" &&
      subscription.workflowRunId &&
      subscription.workflowStatus === "running"
    ) {
      try {
        await workflowClient.cancel(subscription.workflowRunId);
        console.log("✅ Workflow cancelled due to deactivation");
      } catch (workflowError) {
        console.error("❌ Failed to cancel workflow:", workflowError);
      }
    }

    // If activating, trigger workflow
    if (newStatus === "Active") {
      try {
        const workflowResponse = await workflowClient.trigger({
          url: `${SERVER_URL}/api/v1/workflows/subscription/reminders`,
          body: {
            subscriptionId: subscription._id.toString(),
            userId: subscription.user.toString(),
            renewalDate: subscription.renewalDate,
          },
        });

        await Subscription.findByIdAndUpdate(req.params.id, {
          status: newStatus,
          workflowRunId: workflowResponse.workflowRunId,
          workflowStatus: "running",
        });

        console.log("✅ Workflow triggered due to activation");
      } catch (workflowError) {
        console.error("❌ Failed to trigger workflow:", workflowError);
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
    ).populate("user", "name email");

    console.log("✅ Status toggled successfully");

    res.status(200).json({
      success: true,
      message: `Subscription ${newStatus.toLowerCase()} successfully`,
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("❌ Error in toggleSubscriptionStatus:", error);
    next(error);
  }
};

// ============================================================================
// RETRIGGER WORKFLOW
// ============================================================================
export const retriggerWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("\n🔄 Retriggering workflow for subscription:", id);

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to retrigger this workflow"
      );
      error.statusCode = 403;
      throw error;
    }

    // Check if workflow is already running
    if (subscription.workflowStatus === "running") {
      console.warn("⚠️ Workflow already running for this subscription");
      return res.status(400).json({
        success: false,
        message: "Workflow is already running for this subscription",
        workflowRunId: subscription.workflowRunId,
      });
    }

    // Check if subscription is active
    if (subscription.status.toLowerCase() !== "active") {
      console.warn("⚠️ Cannot trigger workflow for inactive subscription");
      return res.status(400).json({
        success: false,
        message:
          "Cannot trigger workflow for inactive subscription. Please activate it first.",
      });
    }

    console.log("✅ Checks passed. Triggering new workflow...");

    try {
      const workflowResponse = await workflowClient.trigger({
        url: `${SERVER_URL}/api/v1/workflows/subscription/reminders`,
        body: {
          subscriptionId: subscription._id.toString(),
          userId: subscription.user.toString(),
          renewalDate: subscription.renewalDate,
        },
      });

      const workflowRunId = workflowResponse.workflowRunId;
      console.log("✅ New workflow triggered! Run ID:", workflowRunId);

      // Update subscription
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          workflowRunId: workflowRunId,
          workflowStatus: "running",
          remindersSent: [], // Reset reminders
        },
        { new: true }
      ).populate("user", "name email");

      res.status(200).json({
        success: true,
        message: "Workflow retriggered successfully",
        data: updatedSubscription,
      });
    } catch (workflowError) {
      console.error("❌ Failed to trigger workflow:", workflowError);
      throw workflowError;
    }
  } catch (error) {
    console.error("❌ Error in retriggerWorkflow:", error);
    next(error);
  }
};

// ============================================================================
// CANCEL WORKFLOW
// ============================================================================
export const cancelWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("\n🛑 Cancelling workflow for subscription:", id);

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
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

    try {
      // Cancel the workflow in Upstash
      await workflowClient.cancel(subscription.workflowRunId);

      console.log("✅ Workflow cancelled:", subscription.workflowRunId);

      // Update subscription
      const updatedSubscription = await Subscription.findByIdAndUpdate(
        id,
        {
          workflowStatus: "cancelled",
        },
        { new: true }
      ).populate("user", "name email");

      res.status(200).json({
        success: true,
        message: "Workflow cancelled successfully",
        data: updatedSubscription,
      });
    } catch (error) {
      console.error("❌ Failed to cancel workflow:", error);
      throw error;
    }
  } catch (error) {
    console.error("❌ Error in cancelWorkflow:", error);
    next(error);
  }
};

// ============================================================================
// GET WORKFLOW STATUS
// ============================================================================
export const getWorkflowStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("\n📊 Fetching workflow status for subscription:", id);

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to view this workflow status"
      );
      error.statusCode = 403;
      throw error;
    }

    console.log("✅ Workflow status retrieved");

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
    console.error("❌ Error in getWorkflowStatus:", error);
    next(error);
  }
};

// ============================================================================
// GET SUBSCRIPTION STATISTICS
// ============================================================================
export const getSubscriptionStats = async (req, res, next) => {
  try {
    console.log("\n📊 Calculating subscription statistics...");

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

    // Calculate spending
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

        // By category
        if (!stats.spending.byCategory[sub.category]) {
          stats.spending.byCategory[sub.category] = { monthly: 0, yearly: 0 };
        }
        stats.spending.byCategory[sub.category].monthly += monthlyAmount;
        stats.spending.byCategory[sub.category].yearly += yearlyAmount;

        // By currency
        if (!stats.spending.byCurrency[sub.currency]) {
          stats.spending.byCurrency[sub.currency] = { monthly: 0, yearly: 0 };
        }
        stats.spending.byCurrency[sub.currency].monthly += monthlyAmount;
        stats.spending.byCurrency[sub.currency].yearly += yearlyAmount;
      });

    // Get upcoming renewals (next 30 days)
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

    console.log("✅ Statistics calculated");

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error in getSubscriptionStats:", error);
    next(error);
  }
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================
export const bulkDeleteSubscriptions = async (req, res, next) => {
  try {
    const { subscriptionIds } = req.body;

    console.log("\n🗑️ Bulk deleting subscriptions:", subscriptionIds);

    if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
      const error = new Error("Please provide an array of subscription IDs");
      error.statusCode = 400;
      throw error;
    }

    // Verify ownership of all subscriptions
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

    // Cancel all running workflows
    const cancelPromises = subscriptions
      .filter((s) => s.workflowRunId && s.workflowStatus === "running")
      .map((s) =>
        workflowClient.cancel(s.workflowRunId).catch((err) => {
          console.error(`Failed to cancel workflow ${s.workflowRunId}:`, err);
        })
      );

    await Promise.all(cancelPromises);

    // Delete subscriptions
    const result = await Subscription.deleteMany({
      _id: { $in: subscriptionIds },
    });

    console.log(`✅ Deleted ${result.deletedCount} subscriptions`);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} subscription(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error in bulkDeleteSubscriptions:", error);
    next(error);
  }
};

// ============================================================================
// SEED SUBSCRIPTIONS
// ============================================================================
export const seedSubscriptions = async (req, res, next) => {
  try {
    console.log("\n🌱 Seeding subscriptions for user:", req.user._id);

    const subscriptionData = [
      { name: "Netflix", price: 15.99, currency: "USD", frequency: "Monthly", category: "Entertainment" },
      { name: "Spotify", price: 9.99, currency: "USD", frequency: "Monthly", category: "Entertainment" },
      { name: "GitHub Pro", price: 4.00, currency: "USD", frequency: "Monthly", category: "Subscription" },
      { name: "Figma", price: 12.00, currency: "USD", frequency: "Monthly", category: "Subscription" },
      { name: "Notion", price: 10.00, currency: "USD", frequency: "Monthly", category: "Subscription" },
      { name: "Adobe Creative Cloud", price: 54.99, currency: "USD", frequency: "Monthly", category: "Subscription" },
      { name: "Amazon Prime", price: 139.00, currency: "USD", frequency: "Yearly", category: "Shopping" },
      { name: "Uber One", price: 9.99, currency: "USD", frequency: "Monthly", category: "Travel" },
      { name: "HelloFresh", price: 60.00, currency: "USD", frequency: "Weekly", category: "Food" },
      { name: "Gym Membership", price: 45.00, currency: "USD", frequency: "Monthly", category: "Others" },
    ];

    const subscriptions = await Promise.all(
      subscriptionData.map(async (sub) => {
        const startDate = new Date(); // Start today
        // Randomize start date slightly to last month or so
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));

        return {
          ...sub,
          startDate,
          status: "Active",
          user: req.user._id,
          workflowStatus: "idle", // Don't trigger workflows for seeds to avoid spamming
        };
      })
    );

    const createdSubscriptions = [];
    for (const sub of subscriptions) {
      const createdSub = await Subscription.create(sub);
      createdSubscriptions.push(createdSub);
    }

    console.log(`✅ Seeded ${createdSubscriptions.length} subscriptions`);

    res.status(201).json({
      success: true,
      message: "Subscriptions seeded successfully",
      data: createdSubscriptions,
    });
  } catch (error) {
    console.error("❌ Error in seedSubscriptions:", error);
    next(error);
  }
};

export const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { subscriptionIds, status } = req.body;

    console.log("\n🔄 Bulk updating subscription status to:", status);

    if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
      const error = new Error("Please provide an array of subscription IDs");
      error.statusCode = 400;
      throw error;
    }

    if (!["Active", "Inactive"].includes(status)) {
      const error = new Error('Status must be either "Active" or "Inactive"');
      error.statusCode = 400;
      throw error;
    }

    // Verify ownership
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

    // Update subscriptions
    const result = await Subscription.updateMany(
      { _id: { $in: subscriptionIds } },
      { status, updatedAt: Date.now() }
    );

    // Handle workflows based on status
    if (status === "Inactive") {
      // Cancel workflows for deactivated subscriptions
      const cancelPromises = subscriptions
        .filter((s) => s.workflowRunId && s.workflowStatus === "running")
        .map((s) =>
          workflowClient.cancel(s.workflowRunId).catch((err) => {
            console.error(`Failed to cancel workflow ${s.workflowRunId}:`, err);
          })
        );
      await Promise.all(cancelPromises);
    }

    console.log(`✅ Updated ${result.modifiedCount} subscriptions`);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} subscription(s)`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error in bulkUpdateStatus:", error);
    next(error);
  }
};
