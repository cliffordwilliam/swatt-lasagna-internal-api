import type { FastifyPluginAsync } from "fastify";
import itemRoutes from "./items/item-routes.js";

const app: FastifyPluginAsync = async (fastify) => {
	fastify.register(itemRoutes, { prefix: "items" });
};
export default app;
