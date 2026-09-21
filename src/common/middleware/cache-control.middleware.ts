import type { NextFunction, Request, Response } from 'express';
import { CACHE_HEADERS } from '../constants/cache.constants';

const PRIVATE_API_PREFIXES = [
  '/api/admin',
  '/api/cart',
  '/api/orders',
  '/api/payments',
  '/api/coupons',
];

export function applyCacheControlHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (PRIVATE_API_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    res.setHeader('Cache-Control', CACHE_HEADERS.NO_STORE);
  }

  next();
}
