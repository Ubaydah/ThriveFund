export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  unauthorized: (msg = 'Unauthorized') =>
    new AppError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'Forbidden') =>
    new AppError(403, 'FORBIDDEN', msg),
  notFound: (resource = 'Resource') =>
    new AppError(404, 'NOT_FOUND', `${resource} not found`),
  conflict: (msg: string) =>
    new AppError(409, 'CONFLICT', msg),
  validation: (msg: string, details?: unknown) =>
    new AppError(400, 'VALIDATION_ERROR', msg, details),
  unprocessable: (msg: string) =>
    new AppError(422, 'UNPROCESSABLE', msg),
  rateLimited: () =>
    new AppError(429, 'RATE_LIMITED', 'Too many requests'),
  provider: (msg = 'External provider error', details?: unknown) =>
    new AppError(502, 'PROVIDER_ERROR', msg, details),
  internal: (msg = 'Internal server error') =>
    new AppError(500, 'INTERNAL_ERROR', msg),
};
