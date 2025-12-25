import type { FastifyPluginAsync } from "fastify";

const itemRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get("/", () => {
		return fastify.db.query.itemsTable.findMany();
	});
};
export default itemRoutes;
