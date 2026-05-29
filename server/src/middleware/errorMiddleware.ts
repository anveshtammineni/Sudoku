import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFoundMiddleware: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: error instanceof Error ? error.message : 'Unexpected server error',
  });
};
