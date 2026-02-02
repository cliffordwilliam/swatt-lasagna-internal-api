import type { FastifyPluginAsync } from "fastify";
import {
	type CreateOrderInput,
	CreateOrderSchema,
	OrderSchema,
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
				response: { 201: OrderSchema },
			},
		},
		async (request, reply) => {
			const order = await orderService.createOrder(request.body);
			return reply.status(201).send(order);
		},
	);

	fastify.get(
		"/",
		{
			schema: {
				response: { 200: OrdersListSchema },
			},
		},
		async (request, reply) => {
			const orders = await orderService.getAllOrders();
			return reply.status(200).send(orders);
		},
	);

	fastify.put<{ Body: CreateOrderInput; Params: { id: number } }>(
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
				body: CreateOrderSchema,
				response: { 200: OrderSchema },
			},
		},
		async (request, reply) => {
			const order = await orderService.putOrder(
				request.body,
				request.params.id,
			);
			return reply.status(200).send(order);
		},
	);
};

export default orderRoutes;
