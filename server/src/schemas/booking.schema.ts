import { z } from 'zod'

export const createBookingSchema = z
  .object({
    roomId: z.string().uuid(),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guestCount: z.number().int().positive(),
    specialNotes: z.string().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'checkOut must be after checkIn',
    path: ['checkOut'],
  })
