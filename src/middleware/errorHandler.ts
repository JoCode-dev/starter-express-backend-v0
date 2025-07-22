import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err.message);

  // Gestion spécifique des erreurs Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      errors: err?.issues?.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      message: 'Erreur de validation',
    });
  }

  // Gestion générique
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
} 