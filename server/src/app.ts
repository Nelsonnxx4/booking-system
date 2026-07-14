import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth.routes.ts";
import { hotelRouter } from "./routes/hotel.routes.ts";
import { bookingRouter } from "./routes/booking.routes.ts";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.ts";

export const createApp = () => {
	const app = express();

	app.use(helmet());
	app.use(
		cors({ origin: process.env.FRONTEND_URL ?? true, credentials: true }),
	);
	app.use(express.json());

	app.get("/health", (req, res) => {
		res.json({ status: "ok" });
	});

	app.use("/auth", authRouter);
	app.use("/hotels", hotelRouter);
	app.use("/bookings", bookingRouter);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
};
