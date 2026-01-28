import type { FastifyPluginAsync } from "fastify";
import db from "./config/db.js";
import errorHandler from "./config/error-handler.js";
import orderRoutes from "./domains/orders/order-routes.js";

const app: FastifyPluginAsync = async (fastify) => {
	errorHandler(fastify);
	db(fastify);
	fastify.register(orderRoutes, { prefix: "orders" });
};

export default app;
