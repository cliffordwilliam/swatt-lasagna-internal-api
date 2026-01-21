import type { FastifyPluginAsync } from "fastify";

type Item = {
	id: number;
	item_name: string;
	price: number;
};

const itemRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get("/", async () => {
		const items = await fastify.db<Item[]>`
			SELECT id, item_name, price
			FROM items
			ORDER BY id
		`;
		return items;
	});
};
export default itemRoutes;
