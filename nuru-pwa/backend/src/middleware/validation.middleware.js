import Joi from 'joi';

export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Invalid input', details: error.details.map((d) => d.message) });
    req.body = value;
    next();
  };
}

export const businessRules = {
  workDateNotFuture: (date) => new Date(date) <= new Date(),
  positiveInteger: (n) => Number.isInteger(n) && n > 0,
  validShiftHours: (h) => [4, 8, 12].includes(h),
  overtimeBeyondEight: (hours, overtime) => hours > 8 || overtime === 0,
};

