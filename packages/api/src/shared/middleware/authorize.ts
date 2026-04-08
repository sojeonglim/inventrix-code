import { Response, NextFunction, RequestHandler } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './authenticate.js';

export const authorize = (...roles: Role[]): RequestHandler => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
      return;
    }
    next();
  };
};

export const ownerOrRole = (userIdParam: string, ...roles: Role[]): RequestHandler => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }
    if (roles.includes(req.user.role)) {
      next();
      return;
    }
    const resourceUserId = req.params[userIdParam];
    if (req.user.userId === resourceUserId) {
      next();
      return;
    }
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
  };
};
