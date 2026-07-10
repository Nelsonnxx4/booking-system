import { Router } from 'express'
import { requireAuth } from '../middleware/auth.ts'
import { createBookingSchema } from '../schemas/booking.schema.ts'
import { createBooking, listUserBookings, cancelBooking } from '../services/booking.service.ts'

export const bookingRouter = Router()

bookingRouter.use(requireAuth)

// POST /bookings
bookingRouter.post('/', async (req, res) => {
  const input = createBookingSchema.parse(req.body)
  const booking = await createBooking(req.user!.userId, input)
  res.status(201).json(booking)
})

// GET /bookings/me
bookingRouter.get('/me', async (req, res) => {
  const bookings = await listUserBookings(req.user!.userId)
  res.json(bookings)
})

// PATCH /bookings/:id/cancel
bookingRouter.patch('/:id/cancel', async (req, res) => {
  const booking = await cancelBooking(req.params.id, req.user!)
  res.json(booking)
})
