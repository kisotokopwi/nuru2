import { Router } from 'express';
import { login, logout, refresh, changePassword } from '../controllers/auth.controller.js';
import { loginRateLimiter, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.post('/logout', requireAuth, logout);
router.post('/refresh', refresh);
router.post('/change-password', requireAuth, changePassword);

export default router;

