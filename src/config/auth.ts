import { clerkPlugin, getAuth } from "@clerk/fastify";
import type { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

export default function auth(fastify: FastifyInstance) {
	fastify.register(clerkPlugin);
	fastify.addHook("preHandler", async (request, reply) => {
		if (request.url === "/healthz" || request.url === "/readyz") {
			return;
		}
		const { userId } = getAuth(request);
		// Must async, so error is caught and response arrives
		if (!userId) {
			throw new UnauthorizedError("Authentication required");
		}
	});
}
