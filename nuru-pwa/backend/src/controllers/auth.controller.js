import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export async function login(req, res) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid credentials' });

  const { email, password } = value;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const claims = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(claims);
  const refreshToken = generateRefreshToken(claims);

  return res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } });
}

const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });

export async function refresh(req, res) {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid refresh request' });
  try {
    const decoded = verifyRefreshToken(value.refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid token' });

    const claims = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(claims);
    const refreshToken = generateRefreshToken(claims);
    return res.json({ accessToken, refreshToken });
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function logout(req, res) {
  // Stateless JWT: client should discard tokens
  return res.json({ message: 'Logged out' });
}

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

export async function changePassword(req, res) {
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });

  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const ok = await comparePassword(value.currentPassword, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid current password' });

  const newHash = await hashPassword(value.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: newHash } });
  return res.json({ message: 'Password updated' });
}

