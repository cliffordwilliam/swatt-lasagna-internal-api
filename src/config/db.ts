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
	await sql`SELECT 1`;
	fastify.decorate("db", sql);
	fastify.addHook("onClose", async () => {
		await sql.end();
	});
}
