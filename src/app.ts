import type { FastifyPluginAsync } from "fastify";
import orderRoutes from "./domains/orders/order-routes.js";
import dbPlugin from "./plugins/db/db-plugin.js";

const app: FastifyPluginAsync = async (fastify) => {
	fastify.register(dbPlugin);
	fastify.register(orderRoutes, { prefix: "orders" });
};
export default app;
