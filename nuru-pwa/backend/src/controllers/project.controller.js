import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

const projectSchema = Joi.object({
  clientId: Joi.string().required(),
  name: Joi.string().required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
});

export async function listProjects(req, res) {
  const { clientId, isActive } = req.query;
  const projects = await prisma.project.findMany({
    where: {
      clientId: clientId || undefined,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
    },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
}

export async function createProject(req, res) {
  const { error, value } = projectSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  const created = await prisma.project.create({ data: value });
  res.status(201).json(created);
}

export async function updateProject(req, res) {
  const { id } = req.params;
  const { error, value } = projectSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  try {
    const updated = await prisma.project.update({ where: { id }, data: value });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Project not found' });
  }
}

export async function closeProject(req, res) {
  const { id } = req.params;
  try {
    const updated = await prisma.project.update({ where: { id }, data: { isActive: false, endDate: new Date() } });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Project not found' });
  }
}

