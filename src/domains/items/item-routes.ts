import type { FastifyPluginAsync } from "fastify";
import {
	type CreateItemInput,
	CreateItemSchema,
	ItemSchema,
	ItemsSchema,
} from "./item-schema.js";
import { ItemService } from "./item-service.js";

const itemRoutes: FastifyPluginAsync = async (fastify) => {
	const itemService = new ItemService(fastify.db);

	fastify.post<{ Body: CreateItemInput }>(
		"/",
		{
			schema: {
				body: CreateItemSchema,
				response: { 201: ItemSchema },
			},
		},
		async (request, reply) => {
			const item = await itemService.createItem(request.body);
			return reply.status(201).send(item);
		},
	);

	fastify.get(
		"/",
		{
			schema: {
				response: { 200: ItemsSchema },
			},
		},
		async (request, reply) => {
			const items = await itemService.getAllItems();
			return reply.status(200).send(items);
		},
	);

	fastify.put<{ Body: CreateItemInput; Params: { id: number } }>(
		"/:id",
		{
			schema: {
				params: {
					type: "object",
					properties: {
						id: { type: "number" },
					},
					required: ["id"],
				},
				body: CreateItemSchema,
				response: { 200: ItemSchema },
			},
		},
		async (request, reply) => {
			const item = await itemService.putItem(request.body, request.params.id);
			return reply.status(200).send(item);
		},
	);
};

export default itemRoutes;
