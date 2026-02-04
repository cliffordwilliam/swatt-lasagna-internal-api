import type { FastifyPluginAsync } from "fastify";
import {
	type CreateAddressInput,
	CreateAddressSchema,
	SearchAddressesByValueQuerySchema,
	SearchAddressesByValueResponseSchema,
} from "./address-schema.js";
import { AddressService } from "./address-service.js";

const addressRoutes: FastifyPluginAsync = async (fastify) => {
	const addressService = new AddressService(fastify.db);

	fastify.post<{ Body: CreateAddressInput }>(
		"/",
		{
			schema: {
				body: CreateAddressSchema,
				response: { 201: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await addressService.createAddress(request.body);
			return reply.status(201).send();
		},
	);

	fastify.get<{ Querystring: { person_id: number; address: string } }>(
		"/search",
		{
			schema: {
				querystring: SearchAddressesByValueQuerySchema,
				response: { 200: SearchAddressesByValueResponseSchema },
			},
		},
		async (request, reply) => {
			const addresses = await addressService.searchAddressesByValue(
				request.query.person_id,
				request.query.address,
			);
			return reply.status(200).send(addresses);
		},
	);
};

export default addressRoutes;
