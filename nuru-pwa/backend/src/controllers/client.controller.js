import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

const clientSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  billingDetails: Joi.object().optional(),
  isActive: Joi.boolean().optional(),
});

export async function listClients(req, res) {
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });
  res.json(clients);
}

export async function createClient(req, res) {
  const { error, value } = clientSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  const created = await prisma.client.create({ data: value });
  res.status(201).json(created);
}

export async function updateClient(req, res) {
  const { id } = req.params;
  const { error, value } = clientSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  try {
    const updated = await prisma.client.update({ where: { id }, data: value });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Client not found' });
  }
}

export async function deactivateClient(req, res) {
  const { id } = req.params;
  try {
    const updated = await prisma.client.update({ where: { id }, data: { isActive: false } });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Client not found' });
  }
}

