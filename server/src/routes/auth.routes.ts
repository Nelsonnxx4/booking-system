import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.ts'
import { signToken } from '../utils/jwt.ts'
import { AppError } from '../utils/AppError.ts'
import { registerSchema, loginSchema } from '../schemas/auth.schema.ts'

export const authRouter = Router()

function toPublicUser(user: { id: string; email: string; name: string; role: string }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

authRouter.post('/register', async (req, res) => {
  const { email, password, name, phone } = registerSchema.parse(req.body)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: passwordHash, name, phone },
  })

  const token = signToken({ userId: user.id, role: user.role })
  res.status(201).json({ token, user: toPublicUser(user) })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new AppError(401, 'Invalid email or password')
  }

  const token = signToken({ userId: user.id, role: user.role })
  res.json({ token, user: toPublicUser(user) })
})
