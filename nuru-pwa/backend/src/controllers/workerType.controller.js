import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

const createSchema = Joi.object({
  name: Joi.string().required(),
  dailyRate: Joi.number().positive().precision(2).required(),
  overtimeMultiplier: Joi.number().positive().precision(2).required(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  dailyRate: Joi.number().positive().precision(2).optional(),
  overtimeMultiplier: Joi.number().positive().precision(2).optional(),
});

export async function listWorkerTypes(req, res) {
  const { id: siteId } = req.params;
  const items = await prisma.workerType.findMany({ where: { siteId }, orderBy: { name: 'asc' } });
  res.json(items);
}

export async function addWorkerType(req, res) {
  const { id: siteId } = req.params;
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  const created = await prisma.workerType.create({ data: { ...value, siteId } });
  res.status(201).json(created);
}

export async function updateWorkerType(req, res) {
  const { id } = req.params;
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  try {
    const updated = await prisma.workerType.update({ where: { id }, data: value });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Worker type not found' });
  }
}

export async function deleteWorkerType(req, res) {
  const { id } = req.params;
  try {
    await prisma.workerType.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(404).json({ message: 'Worker type not found' });
  }
}

