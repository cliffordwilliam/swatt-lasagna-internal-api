import type { FastifyPluginAsync } from "fastify";
import { GetPersonByNameQuerySchema, PersonSchema } from "./person-schema.js";
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
};

export default personRoutes;
