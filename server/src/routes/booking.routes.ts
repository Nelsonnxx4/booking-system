import { Router } from 'express'
import { prisma } from '../lib/prisma.ts'
import { requireAuth } from '../middleware/auth.ts'
import { AppError } from '../utils/AppError.ts'
import { createBookingSchema } from '../schemas/booking.schema.ts'

export const bookingRouter = Router()

bookingRouter.use(requireAuth)

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'] as const

// POST /bookings
bookingRouter.post('/', async (req, res) => {
  const { roomId, checkIn, checkOut, guestCount, specialNotes } = createBookingSchema.parse(
    req.body,
  )

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { roomType: true },
  })
  if (!room) {
    throw new AppError(404, 'Room not found')
  }
  if (room.status !== 'AVAILABLE') {
    throw new AppError(409, 'Room is not available for booking')
  }
  if (guestCount > room.roomType.maxGuests) {
    throw new AppError(400, `Room only accommodates up to ${room.roomType.maxGuests} guests`)
  }

  const overlapping = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { in: [...ACTIVE_STATUSES] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  })
  if (overlapping) {
    throw new AppError(409, 'Room is already booked for the selected dates')
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = room.roomType.pricePerNight.toNumber() * nights

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.userId,
      roomId,
      checkIn,
      checkOut,
      guestCount,
      specialNotes,
      totalPrice,
    },
  })

  res.status(201).json(booking)
})

// GET /bookings/me
bookingRouter.get('/me', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.userId },
    include: { room: { include: { roomType: true } } },
    orderBy: { checkIn: 'desc' },
  })
  res.json(bookings)
})

// PATCH /bookings/:id/cancel
bookingRouter.patch('/:id/cancel', async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } })
  if (!booking) {
    throw new AppError(404, 'Booking not found')
  }
  if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'You do not have access to this booking')
  }
  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    throw new AppError(409, `Booking is already ${booking.status.toLowerCase()}`)
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  })
  res.json(updated)
})
