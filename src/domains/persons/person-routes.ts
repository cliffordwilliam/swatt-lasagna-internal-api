import type { FastifyPluginAsync } from "fastify";
import {
	GetPersonByNameQuerySchema,
	PersonSchema,
	SearchPersonsByNameQuerySchema,
	SearchPersonsByNameResponseSchema,
} from "./person-schema.js";
import { PersonService } from "./person-service.js";

const personRoutes: FastifyPluginAsync = async (fastify) => {
	const personService = new PersonService(fastify.db);

	fastify.get<{ Querystring: { name: string } }>(
		"/",
		{
			schema: {
				querystring: GetPersonByNameQuerySchema,
				response: { 200: PersonSchema },
			},
		},
		async (request, reply) => {
			const person = await personService.getPersonByName(request.query.name);
			return reply.status(200).send(person);
		},
	);

	fastify.get<{ Querystring: { name: string } }>(
		"/search",
		{
			schema: {
				querystring: SearchPersonsByNameQuerySchema,
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
