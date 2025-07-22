import { type NextFunction, type Request, type Response } from 'express';
import type { z } from 'zod';

export function createHandler<T extends z.ZodType>(
  schema: T,
  handler: (
    req: Omit<Request, keyof z.output<T>> & z.output<T>,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>,
): (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function createHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>,
): (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function createHandler<T extends z.ZodType>(
  schemaOrHandler:
    | T
    | ((
        req: Request,
        res: Response,
        next: NextFunction,
      ) => void | Promise<void>),
  handler?: (
    req: Omit<Request, 'body'> & { body: z.output<T> },
    res: Response,
    next: NextFunction,
  ) => void | Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (handler) {
        const schema = schemaOrHandler as T;
        req.body = schema.parse(req.body);
        await handler(req, res, next);
      } else {
        const handler = schemaOrHandler as (
          req: Request,
          res: Response,
          next: NextFunction,
        ) => void | Promise<void>;
        await handler(req, res, next);
      }
    } catch (error) {
      next(error);
    }
  };
}
