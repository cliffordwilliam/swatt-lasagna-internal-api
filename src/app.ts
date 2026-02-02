import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import auth from "./config/auth.js";
import db from "./config/db.js";
import errorHandler from "./config/error-handler.js";
import deliveryMethodRoutes from "./domains/delivery-methods/delivery-method-routes.js";
import itemRoutes from "./domains/items/item-routes.js";
import orderStatusRoutes from "./domains/order-statuses/order-status-routes.js";
import orderRoutes from "./domains/orders/order-routes.js";
import paymentMethodRoutes from "./domains/payment-methods/payment-method-routes.js";
import personRoutes from "./domains/persons/person-routes.js";

interface AppOptions {
	skipDb?: boolean; // For explicit swagger JSON generation
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts) => {
	errorHandler(fastify);
	if (!opts.skipDb) {
		await db(fastify);
	}
	fastify.register(cors, {
		origin: process.env.CORS_ORIGIN!,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	});
	auth(fastify);

	fastify.get("/healthz", async (_request, reply) => {
		return reply.code(200).send({ status: "ok" });
	});

	fastify.get("/readyz", async (_request, reply) => {
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

	fastify.register(orderRoutes, { prefix: "/api/orders" });
	fastify.register(itemRoutes, { prefix: "/api/items" });
	fastify.register(orderStatusRoutes, { prefix: "/api/order-statuses" });
	fastify.register(paymentMethodRoutes, { prefix: "/api/payment-methods" });
	fastify.register(deliveryMethodRoutes, { prefix: "/api/delivery-methods" });
	fastify.register(personRoutes, { prefix: "/api/persons" });
};

export default app;
