import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import { verifyAccessToken } from '../utils/jwt.js';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireRole(...allowedRoles) {
  const schema = Joi.array().items(Joi.string().required());
  const { error } = schema.validate(allowedRoles);
  if (error) throw new Error('Invalid roles configuration');

  return function roleChecker(req, res, next) {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

