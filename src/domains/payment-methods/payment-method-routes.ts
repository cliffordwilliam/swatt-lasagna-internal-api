import type { FastifyPluginAsync } from "fastify";
import { PaymentMethodsSchema } from "./payment-method-schema.js";
import { PaymentMethodService } from "./payment-method-service.js";

const paymentMethodRoutes: FastifyPluginAsync = async (fastify) => {
	const paymentMethodService = new PaymentMethodService(fastify.db);

	fastify.get(
		"/",
		{
			schema: {
				response: { 200: PaymentMethodsSchema },
			},
		},
		async (request, reply) => {
			const paymentMethods = await paymentMethodService.getAllPaymentMethods();
			return reply.status(200).send(paymentMethods);
		},
	);
};

export default paymentMethodRoutes;
