import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth } from "./config/auth.js";
import db from "./config/db.js";
import errorHandler from "./config/error-handler.js";
import deliveryMethodRoutes from "./domains/delivery-methods/delivery-method-routes.js";
import itemRoutes from "./domains/items/item-routes.js";
import orderStatusRoutes from "./domains/order-statuses/order-status-routes.js";
import orderRoutes from "./domains/orders/order-routes.js";
import paymentMethodRoutes from "./domains/payment-methods/payment-method-routes.js";
import personRoutes from "./domains/persons/person-routes.js";

interface AppOptions {
	skipDb?: boolean; // For OpenAPI JSON generation
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts) => {
	if (!opts.skipDb) {
		await db(fastify);
	}
	errorHandler(fastify);
	fastify.register(cors, {
		origin: process.env.CORS_ORIGIN!,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	});
	fastify.register(clerkPlugin);
	fastify.register(fastifyRateLimit, {
		max: parseInt(process.env.RATE_LIMIT_MAX!),
		timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW!),
	});

	fastify.register((instance) => {
		instance.get("/healthz", (_request, reply) => {
			return reply.code(200).send({ status: "ok" });
		});

		instance.get("/readyz", async (_request, reply) => {
			if (opts.skipDb) {
				return reply.code(200).send({ status: "ok", database: "skipped" });
			}
			try {
				await fastify.db`SELECT 1`;
				return reply.code(200).send({ status: "ok" });
			} catch {
				return reply.code(503).send({
					status: "not ready",
					reason: "database unavailable",
				});
			}
		});
	});

	fastify.register(
		(instance) => {
			instance.addHook("preHandler", requireAuth);

			instance.register(orderRoutes, { prefix: "/orders" });
			instance.register(itemRoutes, { prefix: "/items" });
			instance.register(orderStatusRoutes, { prefix: "/order-statuses" });
			instance.register(paymentMethodRoutes, { prefix: "/payment-methods" });
			instance.register(deliveryMethodRoutes, { prefix: "/delivery-methods" });
			instance.register(personRoutes, { prefix: "/persons" });
		},
		{ prefix: "/api" },
	);
};

export default app;
