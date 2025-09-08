import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { generateDualInvoicesForReport } from '../services/invoice.service.js';
import { getFileStream } from '../services/storage.service.js';

const prisma = new PrismaClient();

const genSchema = Joi.object({ reportId: Joi.string().required() });
const bulkSchema = Joi.object({ reportIds: Joi.array().items(Joi.string().required()).min(1).required() });

export async function generate(req, res) {
  const { error, value } = genSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  try {
    const result = await generateDualInvoicesForReport(value.reportId);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to generate invoices' });
  }
}

export async function bulkGenerate(req, res) {
  const { error, value } = bulkSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input' });
  const out = [];
  for (const id of value.reportIds) {
    try {
      const r = await generateDualInvoicesForReport(id);
      out.push({ reportId: id, ok: true, reference: r.reference });
    } catch (e) {
      out.push({ reportId: id, ok: false, error: e.message });
    }
  }
  res.json(out);
}

export async function searchInvoices(req, res) {
  const { clientId, date, reference } = req.query;
  const where = {};
  if (clientId) where.dailyReport = { site: { project: { clientId } } };
  if (date) where.dailyReport = { ...(where.dailyReport || {}), workDate: new Date(date) };
  if (reference) where.referenceId = reference;
  const invoices = await prisma.invoice.findMany({ where, orderBy: { generatedAt: 'desc' } });
  res.json(invoices);
}

export async function downloadClient(req, res) {
  const { id } = req.params;
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv || inv.type !== 'CLIENT') return res.status(404).end();
  const stream = getFileStream(inv.pdfPath);
  if (!stream) return res.status(404).end();
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
}

export async function downloadInternal(req, res) {
  const { id } = req.params;
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv || inv.type !== 'INTERNAL') return res.status(404).end();
  const stream = getFileStream(inv.pdfPath);
  if (!stream) return res.status(404).end();
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
}

export async function verifyReference(req, res) {
  const { reference } = req.params;
  const invoice = await prisma.invoice.findFirst({ where: { referenceId: reference } });
  if (!invoice) return res.status(404).json({ valid: false });
  res.json({ valid: true, reference, generatedAt: invoice.generatedAt });
}

export async function invoicesByDate(req, res) {
  const { date } = req.params;
  const d = new Date(date);
  const next = new Date(d); next.setDate(d.getDate() + 1);
  const invoices = await prisma.invoice.findMany({ where: { dailyReport: { workDate: { gte: d, lt: next } } }, orderBy: { generatedAt: 'desc' } });
  res.json(invoices);
}

export async function invoicesByClient(req, res) {
  const { clientId } = req.params;
  const invoices = await prisma.invoice.findMany({ where: { dailyReport: { site: { project: { clientId } } } }, orderBy: { generatedAt: 'desc' } });
  res.json(invoices);
}

export async function invoiceReports(req, res) {
  const grouped = await prisma.invoice.groupBy({ by: ['type'], _sum: { amount: true }, _count: { _all: true } });
  res.json(grouped);
}

