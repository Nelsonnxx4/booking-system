import { z } from 'zod'

export const createHotelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().default('UTC'),
  images: z.array(z.string()).default([]),
})

export const createRoomTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  pricePerNight: z.number().positive(),
  maxGuests: z.number().int().positive(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})
