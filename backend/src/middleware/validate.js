const { validationResult } = require('express-validator');

/**
 * Middleware to run express-validator checks and return formatted errors.
 * Usage: router.post('/path', [...validators], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }
  next();
};

module.exports = validate;
