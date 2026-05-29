import type { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

export function validateRequest<T extends ZodTypeAny>(schema: T, source: 'body' | 'query' | 'params' = 'body'): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.flatten(),
      });
    }

    req[source] = parsed.data;
    return next();
  };
}
