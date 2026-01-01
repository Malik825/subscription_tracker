import Subscription from "../models/subscription.model.js";
import {
  processReceiptImage,
  processNaturalLanguageCommand,
} from "../utils/aiHelper.js";

// Helper function to map AI fields to database schema
const mapAIFieldsToSchema = (aiData) => {
  return {
    name: aiData.name,
    price: aiData.amount || aiData.price,
    currency: aiData.currency || "USD",
    frequency: mapFrequency(aiData.billingCycle || aiData.frequency),
    category: aiData.category || "Others",
    startDate: aiData.startDate || new Date(),
    renewalDate: aiData.renewalDate || aiData.nextBillingDate,
    status: aiData.status || "Active",
    website: aiData.website || "",
  };
};

// Helper function to convert billingCycle to frequency
const mapFrequency = (cycle) => {
  const mapping = {
    Monthly: "Monthly",
    Yearly: "Yearly",
    Weekly: "Weekly",
    Daily: "Daily",
    monthly: "Monthly",
    yearly: "Yearly",
    weekly: "Weekly",
    daily: "Daily",
  };
  return mapping[cycle] || "Monthly";
};

// Receipt/Bill Scanning
export const scanReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No image file uploaded");
      error.statusCode = 400;
      throw error;
    }

    console.log("📸 Processing receipt image...");

    // Convert file to base64
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Process with AI
    const extractedData = await processReceiptImage(base64Image, mimeType);

    console.log("✅ Receipt processed successfully");

    res.status(200).json({
      success: true,
      message: "Receipt scanned successfully",
      data: extractedData,
    });
  } catch (error) {
    console.error("❌ Receipt scanning error:", error);
    next(error);
  }
};

// Create subscription from scanned receipt
export const createFromReceipt = async (req, res, next) => {
  try {
    const { extractedData } = req.body;

    if (!extractedData) {
      const error = new Error("No extracted data provided");
      error.statusCode = 400;
      throw error;
    }

    // Map AI fields to schema and create subscription
    const mappedData = mapAIFieldsToSchema(extractedData);

    const subscription = await Subscription.create({
      ...mappedData,
      user: req.user._id,
    });

    console.log("✅ Subscription created from receipt:", subscription.name);

    res.status(201).json({
      success: true,
      message: "Subscription created from receipt",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// AI Chat Interface
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      const error = new Error("Message is required");
      error.statusCode = 400;
      throw error;
    }

    console.log(`💬 User message: "${message}"`);

    // Get user's subscriptions for context
    const subscriptions = await Subscription.find({
      user: req.user._id,
    }).lean();

    // Process with AI
    const response = await processNaturalLanguageCommand(
      message,
      subscriptions,
      conversationHistory,
      req.user
    );

    console.log("✅ AI response generated");

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("❌ Chat error:", error);
    next(error);
  }
};

// Execute AI suggested action
export const executeAIAction = async (req, res, next) => {
  try {
    const { action, parameters } = req.body;

    if (!action) {
      const error = new Error("Action is required");
      error.statusCode = 400;
      throw error;
    }

    console.log(`🎯 Executing AI action: ${action}`);
    console.log(`📦 Parameters:`, parameters);

    let result;
    let message = "";

    switch (action) {
      case "show_subscription_form":
      case "show_update_form":
        // These are handled on frontend - return success
        result = { success: true };
        message = "Form displayed";
        break;

      case "create_subscription":
        // Validate that we have required data
        if (!parameters || !parameters.name) {
          const error = new Error(
            "Insufficient data to create subscription. Please provide subscription details."
          );
          error.statusCode = 400;
          throw error;
        }

        // Map AI fields to database schema
        const mappedData = mapAIFieldsToSchema(parameters);

        result = await Subscription.create({
          ...mappedData,
          user: req.user._id,
        });

        console.log("✅ Subscription created:", result.name);
        break;

      case "update_subscription":
        if (!parameters.subscriptionId) {
          const error = new Error("Subscription ID is required for update");
          error.statusCode = 400;
          throw error;
        }

        // Map updates if they contain AI field names
        const updates = parameters.updates
          ? mapAIFieldsToSchema(parameters.updates)
          : parameters;

        result = await Subscription.findOneAndUpdate(
          { _id: parameters.subscriptionId, user: req.user._id },
          updates,
          { new: true, runValidators: true }
        );

        if (!result) {
          const error = new Error("Subscription not found");
          error.statusCode = 404;
          throw error;
        }

        console.log("✅ Subscription updated:", result.name);
        break;

      case "delete_subscription":
        if (!parameters.subscriptionId) {
          const error = new Error("Subscription ID is required for deletion");
          error.statusCode = 400;
          throw error;
        }

        result = await Subscription.findOneAndDelete({
          _id: parameters.subscriptionId,
          user: req.user._id,
        });

        if (!result) {
          const error = new Error("Subscription not found");
          error.statusCode = 404;
          throw error;
        }

        console.log("✅ Subscription deleted:", result.name);
        message = `Subscription "${result.name}" has been deleted`;
        break;

      case "get_subscriptions":
        // Build filter from parameters
        const filters = { user: req.user._id };

        if (parameters?.filters) {
          // Map AI field names to schema field names if necessary
          if (parameters.filters.billingCycle) {
            filters.frequency = mapFrequency(parameters.filters.billingCycle);
          }
          if (parameters.filters.category) {
            filters.category = parameters.filters.category;
          }
          if (parameters.filters.minPrice) {
            filters.price = { $gte: parameters.filters.minPrice };
          }
          if (parameters.filters.maxPrice) {
            filters.price = {
              ...filters.price,
              $lte: parameters.filters.maxPrice,
            };
          }
        }

        result = await Subscription.find(filters).sort({ createdAt: -1 });
        message = `Found ${result.length} subscription(s)`;
        console.log(`✅ Found ${result.length} subscriptions`);
        break;

      case "get_insights":
        // Return subscriptions for client-side processing
        result = await Subscription.find({ user: req.user._id }).lean();
        message = `Retrieved ${result.length} subscription(s) for analysis`;
        console.log(`✅ Retrieved ${result.length} subscriptions for insights`);
        break;

      default:
        const error = new Error(`Unknown action: ${action}`);
        error.statusCode = 400;
        throw error;
    }

    res.status(200).json({
      success: true,
      message: message || `Action ${action} executed successfully`,
      data: result,
    });
  } catch (error) {
    console.error("❌ Action execution error:", error);
    console.error(error);
    next(error);
  }
};
