import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

const ItemSchema = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	price: Type.Integer({ minimum: 0 }),
	created_at: Type.String({ format: "date-time" }),
	updated_at: Type.String({ format: "date-time" }),
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
			SELECT id, name, price, created_at, updated_at
			FROM items
			ORDER BY id
		`;
			return items;
		},
	);
};
export default itemRoutes;
