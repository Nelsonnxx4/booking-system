import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import { requireAuth, requireRole } from '../middleware/auth.ts'
import { AppError } from '../utils/AppError.ts'

export const hotelRouter = Router()

const createHotelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().default('UTC'),
  images: z.array(z.string()).default([]),
})

const createRoomTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  pricePerNight: z.number().positive(),
  maxGuests: z.number().int().positive(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

// GET /hotels?city=Lagos - public
hotelRouter.get('/', async (req, res) => {
  const city = typeof req.query.city === 'string' ? req.query.city : undefined

  const hotels = await prisma.hotel.findMany({
    where: city ? { city: { equals: city, mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
  })
  res.json(hotels)
})

// GET /hotels/:id - public, includes room types
hotelRouter.get('/:id', async (req, res) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id: req.params.id },
    include: { roomTypes: true },
  })
  if (!hotel) {
    throw new AppError(404, 'Hotel not found')
  }
  res.json(hotel)
})

// POST /hotels - admin only
hotelRouter.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const data = createHotelSchema.parse(req.body)
  const hotel = await prisma.hotel.create({ data })
  res.status(201).json(hotel)
})

// POST /hotels/:id/room-types - admin only
hotelRouter.post('/:id/room-types', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: req.params.id } })
  if (!hotel) {
    throw new AppError(404, 'Hotel not found')
  }

  const data = createRoomTypeSchema.parse(req.body)
  const roomType = await prisma.roomType.create({
    data: { ...data, hotelId: hotel.id },
  })
  res.status(201).json(roomType)
})
