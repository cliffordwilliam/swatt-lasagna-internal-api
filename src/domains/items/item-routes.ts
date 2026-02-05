import type { FastifyPluginAsync } from "fastify";
import { IdParamSchema } from "../../lib/schemas.js";
import {
	type CreateItemInput,
	CreateItemSchema,
	ItemSummarySchema,
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
				response: { 201: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await itemService.createItem(request.body);
			return reply.status(201).send();
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

	fastify.get<{ Params: { id: number } }>(
		"/:id",
		{
			schema: {
				params: IdParamSchema,
				response: { 200: ItemSummarySchema },
			},
		},
		async (request, reply) => {
			const item = await itemService.getItemById(request.params.id);
			return reply.status(200).send(item);
		},
	);

	fastify.put<{ Body: CreateItemInput; Params: { id: number } }>(
		"/:id",
		{
			schema: {
				params: IdParamSchema,
				body: CreateItemSchema,
				response: { 200: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await itemService.putItem(request.body, request.params.id);
			return reply.status(200).send();
		},
	);
};

export default itemRoutes;
