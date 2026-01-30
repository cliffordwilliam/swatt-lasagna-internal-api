import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";
import db from "./config/db.js";
import errorHandler from "./config/error-handler.js";
import itemRoutes from "./domains/items/item-routes.js";
import orderRoutes from "./domains/orders/order-routes.js";

const app: FastifyPluginAsync = async (fastify) => {
	await fastify.register(cors, { origin: "*" });
	errorHandler(fastify);
	db(fastify);
	fastify.register(orderRoutes, { prefix: "orders" });
	fastify.register(itemRoutes, { prefix: "items" });
};

export default app;
