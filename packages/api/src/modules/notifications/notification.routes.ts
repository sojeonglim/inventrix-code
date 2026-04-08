import { Router } from 'express';
import { NotificationService } from './notification.service.js';
import { authenticate, AuthRequest } from '../../shared/middleware/authenticate.js';
import { sseManager } from './sse-manager.js';

export function createNotificationRoutes(notificationService: NotificationService): Router {
  const router = Router();

  router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try { res.json(await notificationService.getNotifications(req.user!.userId)); }
    catch (err) { next(err); }
  });

  router.get('/unread-count', authenticate, async (req: AuthRequest, res, next) => {
    try { res.json({ count: await notificationService.getUnreadCount(req.user!.userId) }); }
    catch (err) { next(err); }
  });

  router.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
    try { await notificationService.markAsRead(req.params.id, req.user!.userId); res.status(204).send(); }
    catch (err) { next(err); }
  });

  return router;
}

export function createSSERoutes(): Router {
  const router = Router();

  router.get('/connect', authenticate, (req: AuthRequest, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    sseManager.addConnection(req.user!.userId, req.user!.role, res);
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);
    res.on('close', () => clearInterval(heartbeat));
  });

  return router;
}
