import type { FastifyPluginAsync } from "fastify";
import { IdParamSchema } from "../../lib/schemas.js";
import {
	type CreateOrderInput,
	CreateOrderSchema,
	GetOrderResponseSchema,
	type ListOrdersQuery,
	ListOrdersQuerySchema,
	OrdersListSchema,
} from "./order-schema.js";
import { OrderService } from "./order-service.js";

const orderRoutes: FastifyPluginAsync = async (fastify) => {
	const orderService = new OrderService(fastify.db);

	fastify.post<{ Body: CreateOrderInput }>(
		"/",
		{
			schema: {
				body: CreateOrderSchema,
				response: { 201: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await orderService.createOrder(request.body);
			return reply.status(201).send();
		},
	);

	fastify.get<{ Querystring: ListOrdersQuery }>(
		"/",
		{
			schema: {
				querystring: ListOrdersQuerySchema,
				response: { 200: OrdersListSchema },
			},
		},
		async (request, reply) => {
			const orders = await orderService.getAllOrders(request.query);
			return reply.status(200).send(orders);
		},
	);

	fastify.get<{ Params: { id: number } }>(
		"/:id",
		{
			schema: {
				params: IdParamSchema,
				response: { 200: GetOrderResponseSchema },
			},
		},
		async (request, reply) => {
			const order = await orderService.getOrderById(request.params.id);
			return reply.status(200).send(order);
		},
	);

	fastify.put<{ Body: CreateOrderInput; Params: { id: number } }>(
		"/:id",
		{
			schema: {
				params: IdParamSchema,
				body: CreateOrderSchema,
				response: { 200: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await orderService.putOrder(request.body, request.params.id);
			return reply.status(200).send();
		},
	);
};

export default orderRoutes;
