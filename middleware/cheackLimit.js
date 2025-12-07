import { limits } from "../config/limits.js";

// Map limit keys to usage fields
const usageFieldMap = {
  customerLimit: "customersCreated",
  invoiceLimit: "invoicesCreated",
  emailLimit: "emailsSent", // adjust if your usage object has a different key
};

export const checkLimit = (limitField) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // PRO users skip limits entirely
    if (user.plan?.toLowerCase() === "pro") {
      return next();
    }

    // Map the requested limit to the correct usage field
    const usageField = usageFieldMap[limitField];
    if (!usageField) {
      return res.status(500).json({ error: `Invalid limit field: ${limitField}` });
    }

    const planLimits = limits[user.plan];
    if (!planLimits) {
      return res.status(500).json({ error: `Invalid plan: ${user.plan}` });
    }

    const planLimit = planLimits[limitField];
    const usage = user.usage?.[usageField] ?? 0;

    // Check if user has reached the limit
    if (usage >= planLimit) {
      return res.status(403).json({
        error: `Limit reached for ${limitField}. Upgrade to Pro to continue.`,
      });
    }

    // All good, continue
    next();
  };
};
