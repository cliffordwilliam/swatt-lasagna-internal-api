import { getAuth } from "@clerk/fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

declare module "fastify" {
	interface FastifyRequest {
		userId?: string;
	}
}

export async function captureUserId(
	request: FastifyRequest,
	_reply: FastifyReply,
): Promise<void> {
	const { userId } = getAuth(request);
	request.userId = userId ?? undefined;
}

// Must async, so error is caught and response arrives
export async function requireAuth(
	request: FastifyRequest,
	_reply: FastifyReply,
): Promise<void> {
	const { userId } = getAuth(request);
	if (!userId) {
		throw new UnauthorizedError("Authentication required");
	}
}
