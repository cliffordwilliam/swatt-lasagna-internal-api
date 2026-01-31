import type { FastifyPluginAsync } from "fastify";
import { OrderStatusesSchema } from "./order-status-schema.js";
import { OrderStatusService } from "./order-status-service.js";

const orderStatusRoutes: FastifyPluginAsync = async (fastify) => {
	const orderStatusService = new OrderStatusService(fastify.db);

	fastify.get(
		"/",
		{
			schema: {
				response: { 200: OrderStatusesSchema },
			},
		},
		async (request, reply) => {
			const orderStatuses = await orderStatusService.getAllOrderStatuses();
			return reply.status(200).send(orderStatuses);
		},
	);
};

export default orderStatusRoutes;
