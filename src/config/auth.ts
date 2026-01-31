import { clerkPlugin, getAuth } from "@clerk/fastify";
import type { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../lib/errors.js";

export default async function auth(fastify: FastifyInstance) {
	await fastify.register(clerkPlugin);
	fastify.addHook("preHandler", async (request, reply) => {
		const { userId } = getAuth(request);

		if (!userId) {
			throw new UnauthorizedError("Authentication required");
		}
	});
}
