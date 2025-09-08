import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { bulkGenerate, downloadClient, downloadInternal, generate, invoiceReports, invoicesByClient, invoicesByDate, searchInvoices, verifyReference } from '../controllers/invoice.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/generate', generate);
router.post('/bulk-generate', requireRole('ADMIN'), bulkGenerate);
router.get('/', searchInvoices);
router.get('/:id/client', downloadClient);
router.get('/:id/internal', requireRole('ADMIN'), downloadInternal);
router.get('/verify/:reference', verifyReference);
router.get('/daily/:date', invoicesByDate);
router.get('/client/:clientId', invoicesByClient);
router.get('/reports', requireRole('ADMIN'), invoiceReports);

export default router;

