const validateProfile = (req, res, next) => {
  const { fullName, avatarUrl } = req.body;

  if (fullName && typeof fullName !== "string") {
    return res.status(400).json({
      success: false,
      message: "Full name must be a string",
    });
  }

  if (fullName && fullName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Full name cannot be empty",
    });
  }

  if (avatarUrl && typeof avatarUrl !== "string") {
    return res.status(400).json({
      success: false,
      message: "Avatar URL must be a string",
    });
  }

  next();
};

const validatePreferences = (req, res, next) => {
  const { darkMode, currency, language } = req.body;

  const validCurrencies = ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR"];
  const validLanguages = ["en", "fr", "es", "de"];

  if (darkMode !== undefined && typeof darkMode !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Dark mode must be a boolean",
    });
  }

  if (currency && !validCurrencies.includes(currency)) {
    return res.status(400).json({
      success: false,
      message: `Currency must be one of: ${validCurrencies.join(", ")}`,
    });
  }

  if (language && !validLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      message: `Language must be one of: ${validLanguages.join(", ")}`,
    });
  }

  next();
};

const validateNotifications = (req, res, next) => {
  const {
    emailDigest,
    pushNotifications,
    renewalReminders,
    marketingEmails,
    paymentAlerts,
    spendingInsights,
    priceChangeAlerts,
    productUpdates,
    deliveryMethods,
    renewalReminderTiming,
  } = req.body;

  const booleanFields = [
    "emailDigest",
    "pushNotifications",
    "renewalReminders",
    "marketingEmails",
    "paymentAlerts",
    "spendingInsights",
    "priceChangeAlerts",
    "productUpdates",
  ];

  for (const field of booleanFields) {
    if (req.body[field] !== undefined && typeof req.body[field] !== "boolean") {
      return res.status(400).json({
        success: false,
        message: `${field} must be a boolean`,
      });
    }
  }

  if (deliveryMethods) {
    const { email, push, inApp } = deliveryMethods;
    if (email !== undefined && typeof email !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Delivery method email must be a boolean",
      });
    }
    if (push !== undefined && typeof push !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Delivery method push must be a boolean",
      });
    }
    if (inApp !== undefined && typeof inApp !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Delivery method inApp must be a boolean",
      });
    }
  }

  const validTimings = ["1day", "3days", "1week", "2weeks"];
  if (renewalReminderTiming && !validTimings.includes(renewalReminderTiming)) {
    return res.status(400).json({
      success: false,
      message: `Renewal reminder timing must be one of: ${validTimings.join(
        ", "
      )}`,
    });
  }

  next();
};

const validateBilling = (req, res, next) => {
  const { plan, billingCycle, status } = req.body;

  const validPlans = ["free", "pro", "premium"];
  const validCycles = ["monthly", "yearly"];
  const validStatuses = ["active", "inactive", "trial", "cancelled"];

  if (plan && !validPlans.includes(plan)) {
    return res.status(400).json({
      success: false,
      message: `Plan must be one of: ${validPlans.join(", ")}`,
    });
  }

  if (billingCycle && !validCycles.includes(billingCycle)) {
    return res.status(400).json({
      success: false,
      message: `Billing cycle must be one of: ${validCycles.join(", ")}`,
    });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${validStatuses.join(", ")}`,
    });
  }

  next();
};

const validateDeleteAccount = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required to delete account",
    });
  }

  if (typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password must be a string",
    });
  }

  next();
};

export {
  validateProfile,
  validatePreferences,
  validateNotifications,
  validateBilling,
  validateDeleteAccount,
};
