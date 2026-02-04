import type { FastifyPluginAsync } from "fastify";
import {
	type CreatePersonInput,
	CreatePersonSchema,
	GetPersonQuerySchema,
	SearchPersonsByNameResponseSchema,
} from "./person-schema.js";
import { PersonService } from "./person-service.js";

const personRoutes: FastifyPluginAsync = async (fastify) => {
	const personService = new PersonService(fastify.db);

	fastify.post<{ Body: CreatePersonInput }>(
		"/",
		{
			schema: {
				body: CreatePersonSchema,
				response: { 201: { description: "OK" } },
			},
		},
		async (request, reply) => {
			await personService.createPerson(request.body);
			return reply.status(201).send();
		},
	);

	fastify.get<{ Querystring: { name: string } }>(
		"/search",
		{
			schema: {
				querystring: GetPersonQuerySchema,
				response: { 200: SearchPersonsByNameResponseSchema },
			},
		},
		async (request, reply) => {
			const persons = await personService.searchPersonsByName(
				request.query.name,
			);
			return reply.status(200).send(persons);
		},
	);
};

export default personRoutes;
