import type { FastifyPluginAsync } from "fastify";

const itemRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get("/", () => {
		return "list of items";
	});
};
export default itemRoutes;
