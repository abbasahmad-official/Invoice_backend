import { limits } from "../config/limits.js";

export const checkFeature = (feature) => {
  return (req, res, next) => {
    const user = req.user;

    const isAllowed = limits[user.plan][feature];

    if (!isAllowed) {
      return res.status(403).json({
        error: `${feature} is available only on the Pro plan.`,
      });
    }

    next();
  };
};
