import type { FastifyInstance } from "fastify";
import postgres, { type Sql } from "postgres";

declare module "fastify" {
	interface FastifyInstance {
		db: Sql;
	}
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export default async function db(fastify: FastifyInstance) {
	const sql = postgres(process.env.DATABASE_URL!, {
		max: parseInt(process.env.DB_POOL_SIZE!),
	});
	let lastError: unknown;
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			await sql`SELECT 1`;
			fastify.log.info("Database connection established");
			fastify.decorate("db", sql);
			fastify.addHook("onClose", async () => {
				fastify.log.info("Closing database connection");
				await sql.end();
			});
			return;
		} catch (error) {
			lastError = error;
			fastify.log.warn(
				{ err: error, attempt, maxRetries: MAX_RETRIES },
				"Database connection failed, retrying...",
			);
			if (attempt < MAX_RETRIES) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
			}
		}
	}
	await sql.end();
	throw lastError;
}
