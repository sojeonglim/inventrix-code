import { Router } from 'express';
import { OrderService } from './order.service.js';
import { authenticate, AuthRequest } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { validate } from '../../shared/middleware/validate.js';
import { createOrderSchema, updateStatusSchema, orderFiltersSchema } from './order.validation.js';
import { auditLog } from '../../shared/logger/audit-logger.js';

export function createOrderRoutes(orderService: OrderService): Router {
  const router = Router();

  router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
      const filters = orderFiltersSchema.parse(req.query);
      res.json(await orderService.getOrders(req.user!.userId, req.user!.role, filters));
    } catch (err) { next(err); }
  });

  router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try { res.json(await orderService.getOrderById(req.params.id, req.user!.userId, req.user!.role)); }
    catch (err) { next(err); }
  });

  router.post('/', authenticate, authorize('customer'), validate(createOrderSchema), async (req: AuthRequest, res, next) => {
    try {
      const order = await orderService.createOrder(req.user!.userId, req.body.items);
      await auditLog({ userId: req.user!.userId, action: 'ORDER_CREATED', resourceType: 'Order', resourceId: order.id, newValue: { total: order.total } });
      res.status(201).json(order);
    } catch (err) { next(err); }
  });

  router.patch('/:id/status', authenticate, validate(updateStatusSchema), async (req: AuthRequest, res, next) => {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user!.role, req.user!.userId);
      await auditLog({ userId: req.user!.userId, action: 'ORDER_STATUS_CHANGED', resourceType: 'Order', resourceId: req.params.id, newValue: { status: req.body.status } });
      res.json(order);
    } catch (err) { next(err); }
  });

  router.post('/:id/cancel', authenticate, async (req: AuthRequest, res, next) => {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user!.userId, req.user!.role);
      await auditLog({ userId: req.user!.userId, action: 'ORDER_CANCELLED', resourceType: 'Order', resourceId: req.params.id });
      res.json(order);
    } catch (err) { next(err); }
  });

  return router;
}
