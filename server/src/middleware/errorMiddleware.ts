import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFoundMiddleware: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Unexpected server error';

  if (error instanceof Error) {
    message = error.message;

    switch (error.message) {
      case 'Invalid credentials':
        statusCode = 401;
        break;
      case 'User not found':
        statusCode = 404;
        break;
      case 'Email already registered':
        statusCode = 409;
        break;
      default:
        if ('code' in error && error.code === 11000) {
          statusCode = 409;
          message = 'Email already registered';
        } else if (error.name === 'CastError') {
          statusCode = 400;
          message = 'Invalid identifier';
        } else {
          statusCode = res.statusCode >= 400 ? res.statusCode : 500;
        }
    }

    console.error('Unhandled error:', error.stack ?? error.message);
  }

  res.status(statusCode).json({ message });
};
