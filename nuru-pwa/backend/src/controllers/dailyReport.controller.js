import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { calculateReportTotal } from '../services/calculation.service.js';

const prisma = new PrismaClient();

const entrySchema = Joi.object({
  workerTypeId: Joi.string().required(),
  count: Joi.number().integer().positive().required(),
  hours: Joi.number().valid(4, 8, 12).required(),
  overtimeHours: Joi.number().integer().min(0).required(),
  productionMetrics: Joi.object().unknown(true).optional(),
});

const createSchema = Joi.object({
  siteId: Joi.string().required(),
  workDate: Joi.date().required(),
  entries: Joi.array().items(entrySchema).min(1).required(),
});

export async function getMyReports(req, res) {
  const supervisorId = req.user.userId;
  const { from, to } = req.query;
  const where = { supervisorId };
  if (from || to) {
    where.workDate = {};
    if (from) where.workDate.gte = new Date(from);
    if (to) where.workDate.lte = new Date(to);
  }
  const reports = await prisma.dailyReport.findMany({ where, orderBy: { workDate: 'desc' }, include: { site: true } });
  res.json(reports);
}

export async function getReportById(req, res) {
  const { id } = req.params;
  const report = await prisma.dailyReport.findUnique({ where: { id }, include: { entries: true, site: true } });
  if (!report || report.supervisorId !== req.user.userId) return res.status(404).json({ message: 'Not found' });
  res.json(report);
}

export async function createDailyReport(req, res) {
  const supervisorId = req.user.userId;
  const { error, value } = createSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });

  const today = new Date();
  const workDate = new Date(value.workDate);
  if (workDate > today) return res.status(400).json({ message: 'Work date cannot be in the future' });

  const site = await prisma.site.findUnique({ where: { id: value.siteId } });
  if (!site) return res.status(400).json({ message: 'Invalid site' });

  // Ensure supervisor is assigned to site
  const assignment = await prisma.usersOnSites.findUnique({ where: { userId_siteId: { userId: supervisorId, siteId: site.id } } });
  if (!assignment) return res.status(403).json({ message: 'Not assigned to this site' });

  // Load worker types
  const workerTypeIds = value.entries.map((e) => e.workerTypeId);
  const workerTypes = await prisma.workerType.findMany({ where: { id: { in: workerTypeIds } } });
  const map = new Map(workerTypes.map((wt) => [wt.id, wt]));

  const entriesWithTypes = value.entries.map((e) => ({ entry: e, workerType: map.get(e.workerTypeId) }));
  if (entriesWithTypes.some((et) => !et.workerType)) return res.status(400).json({ message: 'Invalid worker type' });

  const totalAmount = calculateReportTotal(site.serviceType, entriesWithTypes);

  const created = await prisma.dailyReport.create({
    data: {
      supervisorId,
      siteId: value.siteId,
      workDate,
      submittedAt: new Date(),
      totalAmount,
      entries: {
        create: value.entries.map((e) => ({
          workerTypeId: e.workerTypeId,
          count: e.count,
          hours: e.hours,
          overtimeHours: e.overtimeHours,
          productionMetrics: e.productionMetrics ?? {},
        })),
      },
    },
    include: { entries: true },
  });

  await prisma.auditLog.create({ data: { userId: supervisorId, action: 'CREATE', tableName: 'DailyReport', recordId: created.id, newValues: created } });
  res.status(201).json(created);
}

const updateSchema = Joi.object({
  reason: Joi.string().required(),
  entries: Joi.array().items(entrySchema).min(1).required(),
});

export async function updateDailyReport(req, res) {
  const supervisorId = req.user.userId;
  const { id } = req.params;
  const { error, value } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });

  const report = await prisma.dailyReport.findUnique({ where: { id }, include: { site: true, entries: true } });
  if (!report || report.supervisorId !== supervisorId) return res.status(404).json({ message: 'Not found' });

  const now = new Date();
  const midnight = new Date(report.workDate);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  if (now > midnight) return res.status(400).json({ message: 'Deadline passed for same-day corrections' });

  const workerTypeIds = value.entries.map((e) => e.workerTypeId);
  const workerTypes = await prisma.workerType.findMany({ where: { id: { in: workerTypeIds } } });
  const map = new Map(workerTypes.map((wt) => [wt.id, wt]));
  const entriesWithTypes = value.entries.map((e) => ({ entry: e, workerType: map.get(e.workerTypeId) }));
  if (entriesWithTypes.some((et) => !et.workerType)) return res.status(400).json({ message: 'Invalid worker type' });

  const totalAmount = calculateReportTotal(report.site.serviceType, entriesWithTypes);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.workerEntry.deleteMany({ where: { dailyReportId: id } });
    const newReport = await tx.dailyReport.update({
      where: { id },
      data: { totalAmount, updatedAt: new Date() },
      include: { entries: true },
    });
    await tx.workerEntry.createMany({
      data: value.entries.map((e) => ({ dailyReportId: id, workerTypeId: e.workerTypeId, count: e.count, hours: e.hours, overtimeHours: e.overtimeHours, productionMetrics: e.productionMetrics ?? {} })),
    });
    return newReport;
  });

  await prisma.auditLog.create({ data: { userId: supervisorId, action: 'UPDATE', tableName: 'DailyReport', recordId: id, oldValues: report, newValues: updated, reason: value.reason } });
  res.json(updated);
}

