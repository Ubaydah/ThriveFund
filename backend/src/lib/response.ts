import type { Response } from 'express';

export const ok = (res: Response, data: unknown, meta?: Record<string, unknown> | object) =>
  res.json({ success: true, data, ...(meta && { meta }) });

export const created = (res: Response, data: unknown) =>
  res.status(201).json({ success: true, data });

export const noContent = (res: Response) => res.status(204).send();
