import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error({ err }, 'Unhandled error');
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
};
