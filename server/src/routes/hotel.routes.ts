import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.ts";
import {
	createHotelSchema,
	createRoomTypeSchema,
} from "../schemas/hotel.schema.ts";
import {
	listHotels,
	getHotelById,
	createHotel,
	addRoomType,
} from "../services/hotel.service.ts";

export const hotelRouter = Router();

// GET /hotels?city=Lagos - public
hotelRouter.get("/", async (req, res) => {
	const city = typeof req.query.city === "string" ? req.query.city : undefined;
	const hotels = await listHotels(city);
	res.json(hotels);
});

// GET /hotels/:id - public, includes room types
hotelRouter.get("/:id", async (req, res) => {
	const hotel = await getHotelById(req.params.id);
	res.json(hotel);
});

// POST /hotels - admin only
hotelRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
	const input = createHotelSchema.parse(req.body);
	const hotel = await createHotel(input);
	res.status(201).json(hotel);
});

// POST /hotels/:id/room-types - admin only
hotelRouter.post(
	"/:id/room-types",
	requireAuth,
	requireRole("ADMIN"),
	async (req, res) => {
		const input = createRoomTypeSchema.parse(req.body);
		const roomType = await addRoomType(req.params.id, input);
		res.status(201).json(roomType);
	},
);
