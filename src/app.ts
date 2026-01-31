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

const app: FastifyPluginAsync = async (fastify) => {
	errorHandler(fastify);
	await db(fastify);
	fastify.register(cors, { origin: process.env.CORS_ORIGIN! });
	auth(fastify);
	fastify.register(orderRoutes, { prefix: "/api/orders" });
	fastify.register(itemRoutes, { prefix: "/api/items" });
	fastify.register(orderStatusRoutes, { prefix: "/api/order-statuses" });
	fastify.register(paymentMethodRoutes, { prefix: "/api/payment-methods" });
	fastify.register(deliveryMethodRoutes, { prefix: "/api/delivery-methods" });
	fastify.register(personRoutes, { prefix: "/api/persons" });
};

export default app;
