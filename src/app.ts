import type { FastifyPluginAsync } from "fastify";
import itemRoutes from "./domains/items/item-routes.js";
import envPlugin from "./plugins/env/env-plugin.js";

const app: FastifyPluginAsync = async (fastify) => {
	fastify.register(envPlugin);
	fastify.register(itemRoutes, { prefix: "items" });
};
export default app;
