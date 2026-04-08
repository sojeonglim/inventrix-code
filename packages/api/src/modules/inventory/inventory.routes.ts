import { Router } from 'express';
import { InventoryService } from './inventory.service.js';
import { authenticate, AuthRequest } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { validate } from '../../shared/middleware/validate.js';
import { updateStockSchema, stockFiltersSchema } from './inventory.validation.js';
import { auditLog } from '../../shared/logger/audit-logger.js';

export function createInventoryRoutes(inventoryService: InventoryService): Router {
  const router = Router();

  router.get('/', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
    try {
      const filters = stockFiltersSchema.parse(req.query);
      res.json(await inventoryService.getStockList(filters));
    } catch (err) { next(err); }
  });

  router.patch('/:productId', authenticate, authorize('admin', 'staff'), validate(updateStockSchema), async (req: AuthRequest, res, next) => {
    try {
      const result = await inventoryService.updateStock(req.params.productId, req.body.stock);
      await auditLog({ userId: req.user!.userId, action: 'STOCK_UPDATED', resourceType: 'Product', resourceId: req.params.productId, newValue: { stock: req.body.stock } });
      res.json(result);
    } catch (err) { next(err); }
  });

  return router;
}
