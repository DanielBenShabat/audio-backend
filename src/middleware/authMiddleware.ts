import { Request, Response, NextFunction } from 'express';

/**
 * Placeholder admin authentication middleware
 * TODO: Implement real admin authentication later
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  // For now, allow all requests to pass through
  next();
};
