import { clerkPlugin, getAuth } from "@clerk/fastify";
import type { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

export default function auth(fastify: FastifyInstance) {
	fastify.register(clerkPlugin);
	fastify.addHook("preHandler", (request, reply) => {
		const { userId } = getAuth(request);

		if (!userId) {
			throw new UnauthorizedError("Authentication required");
		}
	});
}
