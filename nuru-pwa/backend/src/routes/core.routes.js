import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { listClients, createClient, updateClient, deactivateClient } from '../controllers/client.controller.js';
import { listProjects, createProject, updateProject, closeProject } from '../controllers/project.controller.js';
import { listSites, createSite, updateSite, deactivateSite } from '../controllers/site.controller.js';
import { listWorkerTypes, addWorkerType, updateWorkerType, deleteWorkerType } from '../controllers/workerType.controller.js';
import { getMyReports, createDailyReport, updateDailyReport, getReportById } from '../controllers/dailyReport.controller.js';

const router = Router();

// Admin-only management
router.use('/admin', requireAuth, requireRole('ADMIN'));
router.get('/admin/clients', listClients);
router.post('/admin/clients', createClient);
router.put('/admin/clients/:id', updateClient);
router.delete('/admin/clients/:id', deactivateClient);

router.get('/admin/projects', listProjects);
router.post('/admin/projects', createProject);
router.put('/admin/projects/:id', updateProject);
router.delete('/admin/projects/:id', closeProject);

router.get('/admin/sites', listSites);
router.post('/admin/sites', createSite);
router.put('/admin/sites/:id', updateSite);
router.delete('/admin/sites/:id', deactivateSite);

router.get('/admin/sites/:id/worker-types', listWorkerTypes);
router.post('/admin/sites/:id/worker-types', addWorkerType);
router.put('/admin/worker-types/:id', updateWorkerType);
router.delete('/admin/worker-types/:id', deleteWorkerType);

// Supervisor reporting
router.use(requireAuth);
router.get('/my-reports', getMyReports);
router.get('/daily-reports/:id', getReportById);
router.post('/daily-reports', createDailyReport);
router.put('/daily-reports/:id', updateDailyReport);

export default router;

