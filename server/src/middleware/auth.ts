import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../generated/prisma/client.ts'
import { verifyToken } from '../utils/jwt.ts'
import { AppError } from '../utils/AppError.ts'

export const requireAuth=(req: Request, res: Response, next: NextFunction) =>{
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid Authorization header')
  }

  const token = header.slice('Bearer '.length)

  try {
    req.user = verifyToken(token)
  } catch {
    throw new AppError(401, 'Invalid or expired token')
  }

  next()
}

export const requireRole=(...roles: Role[])=> {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required')
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions')
    }
    next()
  }
}
