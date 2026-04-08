import { Router } from 'express';
import { AuthService } from './auth.service.js';
import { UserService } from './user.service.js';
import { authenticate, AuthRequest } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { validate } from '../../shared/middleware/validate.js';
import { loginLimiter } from '../../shared/middleware/rate-limiter.js';
import { registerSchema, loginSchema, updateRoleSchema } from './user.validation.js';
import { auditLog } from '../../shared/logger/audit-logger.js';

export function createUserRoutes(authService: AuthService, userService: UserService): Router {
  const router = Router();

  router.post('/auth/register', validate(registerSchema), async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  });

  router.post('/auth/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      await auditLog({ userId: result.user.id, action: 'LOGIN', resourceType: 'User', resourceId: result.user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] });
      res.json(result);
    } catch (err) { next(err); }
  });

  router.post('/auth/refresh', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (err) { next(err); }
  });

  router.post('/auth/logout', authenticate, async (req: AuthRequest, res, next) => {
    try {
      await authService.logout(req.user!.userId);
      await auditLog({ userId: req.user!.userId, action: 'LOGOUT', resourceType: 'User', resourceId: req.user!.userId });
      res.status(204).send();
    } catch (err) { next(err); }
  });

  router.get('/users', authenticate, authorize('admin'), async (_req, res, next) => {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch (err) { next(err); }
  });

  router.patch('/users/:id/role', authenticate, authorize('admin'), validate(updateRoleSchema), async (req: AuthRequest, res, next) => {
    try {
      const user = await userService.updateUserRole(req.params.id, req.body.role, req.user!.userId);
      await auditLog({ userId: req.user!.userId, action: 'ROLE_CHANGED', resourceType: 'User', resourceId: req.params.id, newValue: { role: req.body.role } });
      res.json(user);
    } catch (err) { next(err); }
  });

  return router;
}
