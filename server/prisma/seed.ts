import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotelbooking.com' },
    update: {},
    create: {
      email: 'admin@hotelbooking.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const guest = await prisma.user.upsert({
    where: { email: 'guest@hotelbooking.com' },
    update: {},
    create: {
      email: 'guest@hotelbooking.com',
      password: passwordHash,
      name: 'Guest User',
      role: 'USER',
    },
  })

  const hotel = await prisma.hotel.create({
    data: {
      name: 'Grand Palm Hotel',
      description: 'A relaxing beachfront stay in the city center.',
      address: '123 Ocean Drive',
      city: 'Lagos',
      country: 'Nigeria',
      timezone: 'Africa/Lagos',
      images: [],
    },
  })

  const standardRoom = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Standard Room',
      description: 'Cozy room with a queen bed.',
      pricePerNight: 45000,
      maxGuests: 2,
      amenities: ['wifi', 'air_conditioning', 'tv'],
      images: [],
    },
  })

  const deluxeSuite = await prisma.roomType.create({
    data: {
      hotelId: hotel.id,
      name: 'Deluxe Suite',
      description: 'Spacious suite with a city view.',
      pricePerNight: 90000,
      maxGuests: 4,
      amenities: ['wifi', 'air_conditioning', 'tv', 'minibar'],
      images: [],
    },
  })

  await prisma.room.createMany({
    data: [
      { hotelId: hotel.id, roomTypeId: standardRoom.id, number: '101', floor: 1 },
      { hotelId: hotel.id, roomTypeId: standardRoom.id, number: '102', floor: 1 },
      { hotelId: hotel.id, roomTypeId: deluxeSuite.id, number: '201', floor: 2 },
    ],
  })

  console.log({ admin: admin.email, guest: guest.email, hotel: hotel.name })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
