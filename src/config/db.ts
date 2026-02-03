import type { FastifyInstance } from "fastify";
import postgres, { type Sql } from "postgres";

declare module "fastify" {
	interface FastifyInstance {
		db: Sql;
	}
}

export default async function db(fastify: FastifyInstance) {
	const sql = postgres(process.env.DATABASE_URL!, {
		max: parseInt(process.env.DB_POOL_SIZE!),
	});
	try {
		await sql`SELECT 1`;
		fastify.log.info("Database connection established");
	} catch (error) {
		await sql.end();
		throw error;
	}
	fastify.decorate("db", sql);
	fastify.addHook("onClose", async () => {
		fastify.log.info("Closing database connection");
		await sql.end();
	});
}
