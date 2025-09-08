import { PrismaClient, Role } from '@prisma/client';
import Joi from 'joi';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

const baseUserSchema = {
  email: Joi.string().email().required(),
  role: Joi.string().valid(Role.SUPERVISOR, Role.ADMIN).required(),
  isActive: Joi.boolean().optional(),
};

const createSchema = Joi.object({
  ...baseUserSchema,
  password: Joi.string().min(8).required(),
});

const updateSchema = Joi.object({
  email: Joi.string().email().optional(),
  role: Joi.string().valid(Role.SUPERVISOR, Role.ADMIN).optional(),
  isActive: Joi.boolean().optional(),
});

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, isActive: true, createdAt: true } });
  return res.json(users);
}

export async function createUser(req, res) {
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });

  const existing = await prisma.user.findUnique({ where: { email: value.email } });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await hashPassword(value.password);
  const user = await prisma.user.create({ data: { email: value.email, role: value.role, isActive: value.isActive ?? true, password: passwordHash } });
  return res.status(201).json({ id: user.id, email: user.email, role: user.role, isActive: user.isActive });
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });

  try {
    const user = await prisma.user.update({ where: { id }, data: value });
    return res.json({ id: user.id, email: user.email, role: user.role, isActive: user.isActive });
  } catch {
    return res.status(404).json({ message: 'User not found' });
  }
}

export async function deactivateUser(req, res) {
  const { id } = req.params;
  try {
    const user = await prisma.user.update({ where: { id }, data: { isActive: false } });
    return res.json({ id: user.id, email: user.email, role: user.role, isActive: user.isActive });
  } catch {
    return res.status(404).json({ message: 'User not found' });
  }
}

