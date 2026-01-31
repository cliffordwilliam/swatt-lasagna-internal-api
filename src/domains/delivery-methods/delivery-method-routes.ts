import type { FastifyPluginAsync } from "fastify";
import { DeliveryMethodsSchema } from "./delivery-method-schema.js";
import { DeliveryMethodService } from "./delivery-method-service.js";

const deliveryMethodRoutes: FastifyPluginAsync = async (fastify) => {
	const deliveryMethodService = new DeliveryMethodService(fastify.db);

	fastify.get(
		"/",
		{
			schema: {
				response: { 200: DeliveryMethodsSchema },
			},
		},
		async (request, reply) => {
			const deliveryMethods =
				await deliveryMethodService.getAllDeliveryMethods();
			return reply.status(200).send(deliveryMethods);
		},
	);
};

export default deliveryMethodRoutes;
