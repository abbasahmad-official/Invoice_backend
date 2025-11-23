import { check, body, validationResult } from "express-validator";

export const invoiceValidator = [
  check("client")
    .notEmpty().withMessage("Client is required")
    .isMongoId().withMessage("Invalid client ID"),

  // Validate items array exists
  check("items")
    .isArray({ min: 1 }).withMessage("Invoice must contain at least one item"),

  // Validate each item inside items[]
//   body("items.*.productId")
//     .notEmpty().withMessage("Product is required")
//     .isMongoId().withMessage("Invalid product ID"),

  body("items.*.quantity")
    .notEmpty().withMessage("Quantity is required")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("items.*.price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be ≥ 0"),

  // Optional fields
  body("tax").optional().isFloat({ min: 0 }),
  body("discount").optional().isFloat({ min: 0 }),

  // Handle errors globally
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    next();
  }
];
