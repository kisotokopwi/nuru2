import { PrismaClient, ServiceType } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

const siteSchema = Joi.object({
  projectId: Joi.string().required(),
  name: Joi.string().required(),
  serviceType: Joi.string().valid(
    ServiceType.WAREHOUSE,
    ServiceType.CARGO,
    ServiceType.FERTILIZER,
    ServiceType.EQUIPMENT,
    ServiceType.TRANSPORT
  ).required(),
  location: Joi.string().optional(),
});

export async function listSites(req, res) {
  const { projectId } = req.query;
  const sites = await prisma.site.findMany({ where: { projectId: projectId || undefined }, orderBy: { createdAt: 'desc' } });
  res.json(sites);
}

export async function createSite(req, res) {
  const { error, value } = siteSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  const created = await prisma.site.create({ data: value });
  res.status(201).json(created);
}

export async function updateSite(req, res) {
  const { id } = req.params;
  const { error, value } = siteSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  try {
    const updated = await prisma.site.update({ where: { id }, data: value });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Site not found' });
  }
}

export async function deactivateSite(req, res) {
  const { id } = req.params;
  try {
    const updated = await prisma.site.update({ where: { id }, data: { updatedAt: new Date() } });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Site not found' });
  }
}

