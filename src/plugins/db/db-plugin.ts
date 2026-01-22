import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import postgres, { type Sql } from "postgres";

declare module "fastify" {
	interface FastifyInstance {
		db: Sql;
	}
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
	const sql = postgres(process.env.DATABASE_URL!, { max: 10 });
	fastify.decorate("db", sql);
	fastify.addHook("onClose", async () => {
		await sql.end();
	});
};
export default fp(dbPlugin);
