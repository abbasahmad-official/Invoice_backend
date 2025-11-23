import { check, validationResult } from "express-validator";

export const clientValidator = [
  check('name')
    .notEmpty().withMessage('Name is required'),

  check('email')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ min: 4, max: 32 }).withMessage('Email must be between 4 to 32 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    next();
  }
];