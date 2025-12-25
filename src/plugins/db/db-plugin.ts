import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import postgres from "postgres";
import * as schema from "../../db/schema.js";

declare module "fastify" {
	interface FastifyInstance {
		db: PostgresJsDatabase<typeof schema>;
	}
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
	const client = postgres(fastify.config.DATABASE_URL);
	const db = drizzle(client, { schema });
	fastify.decorate("db", db);
	fastify.addHook("onClose", async () => {
		await client.end();
	});
};
export default fp(dbPlugin);
