import bcrypt from "bcryptjs";
import type { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import { signToken } from "../utils/jwt.ts";
import { AppError } from "../utils/AppError.ts";
import type { registerSchema, loginSchema } from "../schemas/auth.schema.ts";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const toPublicUser = (user: {
	id: string;
	email: string;
	name: string;
	role: string;
}) => {
	return { id: user.id, email: user.email, name: user.name, role: user.role };
};

export const registerUser = async (input: RegisterInput) => {
	const existing = await prisma.user.findUnique({
		where: { email: input.email },
	});
	if (existing) {
		throw new AppError(409, "An account with this email already exists");
	}

	const passwordHash = await bcrypt.hash(input.password, 10);
	const user = await prisma.user.create({
		data: {
			email: input.email,
			password: passwordHash,
			name: input.name,
			phone: input.phone,
		},
	});

	const token = signToken({ userId: user.id, role: user.role });
	return { token, user: toPublicUser(user) };
};

export const loginUser = async (input: LoginInput) => {
	const user = await prisma.user.findUnique({ where: { email: input.email } });
	if (!user) {
		throw new AppError(401, "Invalid email or password");
	}

	const valid = await bcrypt.compare(input.password, user.password);
	if (!valid) {
		throw new AppError(401, "Invalid email or password");
	}

	const token = signToken({ userId: user.id, role: user.role });
	return { token, user: toPublicUser(user) };
};

export const logoutUser = () => {
	return { message: "Logged out" };
};
