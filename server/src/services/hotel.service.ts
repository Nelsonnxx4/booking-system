import type { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import { AppError } from '../utils/AppError.ts'
import type { createHotelSchema, createRoomTypeSchema } from '../schemas/hotel.schema.ts'

type CreateHotelInput = z.infer<typeof createHotelSchema>
type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>

export async function listHotels(city?: string) {
  return prisma.hotel.findMany({
    where: city ? { city: { equals: city, mode: 'insensitive' } } : undefined,
    orderBy: { name: 'asc' },
  })
}

export async function getHotelById(id: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { roomTypes: true },
  })
  if (!hotel) {
    throw new AppError(404, 'Hotel not found')
  }
  return hotel
}

export async function createHotel(input: CreateHotelInput) {
  return prisma.hotel.create({ data: input })
}

export async function addRoomType(hotelId: string, input: CreateRoomTypeInput) {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } })
  if (!hotel) {
    throw new AppError(404, 'Hotel not found')
  }

  return prisma.roomType.create({
    data: { ...input, hotelId: hotel.id },
  })
}
