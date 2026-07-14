import type { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import { AppError } from "../utils/AppError.ts";
import type { Role } from "../generated/prisma/client.ts";
import type { createBookingSchema } from "../schemas/booking.schema.ts";

type CreateBookingInput = z.infer<typeof createBookingSchema>;

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"] as const;

export const createBooking = async (
	userId: string,
	input: CreateBookingInput,
) => {
	const { roomId, checkIn, checkOut, guestCount, specialNotes } = input;

	const room = await prisma.room.findUnique({
		where: { id: roomId },
		include: { roomType: true },
	});
	if (!room) {
		throw new AppError(404, "Room not found");
	}
	if (room.status !== "AVAILABLE") {
		throw new AppError(409, "Room is not available for booking");
	}
	if (guestCount > room.roomType.maxGuests) {
		throw new AppError(
			400,
			`Room only accommodates up to ${room.roomType.maxGuests} guests`,
		);
	}

	const overlapping = await prisma.booking.findFirst({
		where: {
			roomId,
			status: { in: [...ACTIVE_STATUSES] },
			checkIn: { lt: checkOut },
			checkOut: { gt: checkIn },
		},
	});
	if (overlapping) {
		throw new AppError(409, "Room is already booked for the selected dates");
	}

	const nights = Math.ceil(
		(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
	);
	const totalPrice = room.roomType.pricePerNight.toNumber() * nights;

	return prisma.booking.create({
		data: {
			userId,
			roomId,
			checkIn,
			checkOut,
			guestCount,
			specialNotes,
			totalPrice,
		},
	});
};

export const listUserBookings = async (userId: string) => {
	return prisma.booking.findMany({
		where: { userId },
		include: { room: { include: { roomType: true } } },
		orderBy: { checkIn: "desc" },
	});
};

export const cancelBooking = async (
	bookingId: string,
	requester: { userId: string; role: Role },
) => {
	const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
	if (!booking) {
		throw new AppError(404, "Booking not found");
	}
	if (booking.userId !== requester.userId && requester.role !== "ADMIN") {
		throw new AppError(403, "You do not have access to this booking");
	}
	if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
		throw new AppError(
			409,
			`Booking is already ${booking.status.toLowerCase()}`,
		);
	}

	return prisma.booking.update({
		where: { id: booking.id },
		data: { status: "CANCELLED" },
	});
};
