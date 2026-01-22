import type { FastifyPluginAsync } from "fastify";
import itemRoutes from "./domains/items/item-routes.js";
import dbPlugin from "./plugins/db/db-plugin.js";

const app: FastifyPluginAsync = async (fastify) => {
	fastify.register(dbPlugin);
	fastify.register(itemRoutes, { prefix: "items" });
};
export default app;
