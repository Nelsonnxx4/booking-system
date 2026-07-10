import { Router } from 'express'
import { registerSchema, loginSchema } from '../schemas/auth.schema.ts'
import { registerUser, loginUser } from '../services/auth.service.ts'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const input = registerSchema.parse(req.body)
  const result = await registerUser(input)
  res.status(201).json(result)
})

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body)
  const result = await loginUser(input)
  res.json(result)
})
