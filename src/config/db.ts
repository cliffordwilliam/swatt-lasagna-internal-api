import type { FastifyInstance } from "fastify";
import postgres, { type Sql } from "postgres";

declare module "fastify" {
	interface FastifyInstance {
		db: Sql;
	}
}

export default function db(fastify: FastifyInstance) {
	const sql = postgres(process.env.DATABASE_URL!, { max: 10 });
	fastify.decorate("db", sql);
	fastify.addHook("onClose", async () => {
		await sql.end();
	});
}
