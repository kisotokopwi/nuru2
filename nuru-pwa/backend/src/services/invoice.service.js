import { PrismaClient } from '@prisma/client';
import { generateReferenceId } from './reference.service.js';
import { generateClientInvoicePdf, generateInternalInvoicePdf } from './pdf.service.js';
import { storeBuffer } from './storage.service.js';
import { signInvoicePayload } from './sign.service.js';

const prisma = new PrismaClient();

export async function generateDualInvoicesForReport(reportId) {
  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: {
      site: true,
      entries: { include: { workerType: true } },
      invoices: true,
    },
  });
  if (!report) throw new Error('Report not found');
  if (report.invoices && report.invoices.length > 0) throw new Error('Invoices already generated');

  const project = await prisma.project.findFirst({ where: { id: report.site.projectId }, include: { client: true } });
  if (!project) throw new Error('Project not found');

  const reference = generateReferenceId(report.workDate);

  // Create DB records first (immutable markers via timestamp fields)
  const [clientInvoice, internalInvoice] = await prisma.$transaction(async (tx) => {
    const ci = await tx.invoice.create({ data: { dailyReportId: report.id, type: 'CLIENT', referenceId: reference, amount: report.totalAmount } });
    const ii = await tx.invoice.create({ data: { dailyReportId: report.id, type: 'INTERNAL', referenceId: reference, amount: report.totalAmount } });
    return [ci, ii];
  });

  const auditEvents = await prisma.auditLog.findMany({ where: { tableName: 'DailyReport', recordId: report.id }, orderBy: { createdAt: 'asc' } });
  const audit = { supervisorEmail: 'unknown', events: auditEvents };

  const clientPdf = await generateClientInvoicePdf({ reference, client: project.client, site: report.site, report, entries: report.entries });
  const internalPdf = await generateInternalInvoicePdf({ reference, client: project.client, site: report.site, report, entries: report.entries, audit });

  const clientPath = `invoices/${reference}-client.pdf`;
  const internalPath = `invoices/${reference}-internal.pdf`;
  storeBuffer(clientPath, clientPdf);
  storeBuffer(internalPath, internalPdf);

  const signaturePayload = { reference, reportId: report.id, totalAmount: report.totalAmount, when: new Date().toISOString() };
  const signature = signInvoicePayload(signaturePayload);
  const updated = await prisma.$transaction(async (tx) => {
    const ci = await tx.invoice.update({ where: { id: clientInvoice.id }, data: { pdfPath: clientPath, generatedAt: new Date(), immutable: true, signature } });
    const ii = await tx.invoice.update({ where: { id: internalInvoice.id }, data: { pdfPath: internalPath, generatedAt: new Date(), immutable: true, signature } });
    return [ci, ii];
  });

  return { reference, signature, clientInvoice: updated[0], internalInvoice: updated[1] };
}

