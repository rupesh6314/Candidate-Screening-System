import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (e, _q, res, _n) => {
  if (e instanceof ZodError) {
    const firstIssue = e.issues[0];
    const message = firstIssue?.message
      ? `Validation error on ${firstIssue.path.join('.') || 'input'}: ${firstIssue.message}`
      : 'Validation failed. Please check your inputs.';
    return res.status(400).json({ error: message, details: e.issues });
  }
  console.error(e);
  return res.status(500).json({ error: 'Internal server error' });
};
