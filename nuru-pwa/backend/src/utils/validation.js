const Joi = require('joi');

// Common validation schemas
const schemas = {
  // User validation
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('SUPERVISOR', 'ADMIN', 'MANAGER').default('SUPERVISOR'),
  }),

  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Client validation
  client: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    billingDetails: Joi.object().optional(),
  }),

  // Project validation
  project: Joi.object({
    clientId: Joi.string().uuid().required(),
    name: Joi.string().min(2).max(100).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  }),

  // Site validation
  site: Joi.object({
    projectId: Joi.string().uuid().required(),
    name: Joi.string().min(2).max(100).required(),
    serviceType: Joi.string().valid('WAREHOUSE', 'CARGO', 'FERTILIZER', 'EQUIPMENT', 'TRANSPORT', 'MANPOWER').required(),
    location: Joi.string().min(2).max(200).required(),
  }),

  // Worker type validation
  workerType: Joi.object({
    siteId: Joi.string().uuid().required(),
    name: Joi.string().min(2).max(100).required(),
    dailyRate: Joi.number().positive().precision(2).required(),
    overtimeMultiplier: Joi.number().positive().precision(2).default(1.5),
  }),

  // Daily report validation
  dailyReport: Joi.object({
    siteId: Joi.string().uuid().required(),
    workDate: Joi.date().required(),
    notes: Joi.string().optional(),
    workerEntries: Joi.array().items(
      Joi.object({
        workerTypeId: Joi.string().uuid().required(),
        count: Joi.number().integer().min(0).required(),
        hours: Joi.number().positive().precision(2).required(),
        overtimeHours: Joi.number().min(0).precision(2).default(0),
        productionMetrics: Joi.object().optional(),
      })
    ).min(1).required(),
  }),
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
};