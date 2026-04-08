import { Router } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';

export function createAnalyticsRoutes(analyticsService: AnalyticsService): Router {
  const router = Router();
  router.get('/dashboard', authenticate, authorize('admin'), async (_req, res, next) => {
    try { res.json(await analyticsService.getDashboardKPIs()); }
    catch (err) { next(err); }
  });
  return router;
}
