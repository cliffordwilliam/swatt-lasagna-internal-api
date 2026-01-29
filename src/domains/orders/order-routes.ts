import type { FastifyPluginAsync } from "fastify";
import {
	type CreateOrderInput,
	CreateOrderSchema,
	OrderSchema,
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
};

export default orderRoutes;
