import type { FastifyPluginAsync } from "fastify";
import {
	type CreatePhoneInput,
	CreatePhoneSchema,
	SearchPhonesByNumberQuerySchema,
	SearchPhonesByNumberResponseSchema,
} from "./phone-schema.js";
import { PhoneService } from "./phone-service.js";

const phoneRoutes: FastifyPluginAsync = async (fastify) => {
	const phoneService = new PhoneService(fastify.db);

	fastify.post<{ Body: CreatePhoneInput }>(
		"/",
		{
			schema: {
				body: CreatePhoneSchema,
				response: { 201: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await phoneService.createPhone(request.body);
			return reply.status(201).send();
		},
	);

	fastify.get<{ Querystring: { person_id: number; phone_number: string } }>(
		"/search",
		{
			schema: {
				querystring: SearchPhonesByNumberQuerySchema,
				response: { 200: SearchPhonesByNumberResponseSchema },
			},
		},
		async (request, reply) => {
			const phones = await phoneService.searchPhonesByNumber(
				request.query.person_id,
				request.query.phone_number,
			);
			return reply.status(200).send(phones);
		},
	);
};

export default phoneRoutes;
