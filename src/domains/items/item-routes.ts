import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

const ItemSchema = Type.Object({
	name: Type.String(),
});

type Item = Static<typeof ItemSchema>;

const itemRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get(
		"/",
		{
			schema: {
				response: {
					200: Type.Array(ItemSchema),
				},
			},
		},
		async () => {
			const items = await fastify.db<Item[]>`
			SELECT name
			FROM items
			ORDER BY id
		`;
			return items;
		},
	);
};
export default itemRoutes;
