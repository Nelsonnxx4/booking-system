import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import type { Role } from '../generated/prisma/client.ts'

dotenv.config({ path: '.env.local' })

export interface TokenPayload {
  userId: string
  role: Role
}

const secret = process.env.JWT_SECRET
if (!secret) {
  throw new Error('JWT_SECRET is not set')
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
  })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload
}
