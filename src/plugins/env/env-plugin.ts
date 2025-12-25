import fastifyEnv from "@fastify/env";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { envSchema, type envType } from "./env-schema.js";

declare module "fastify" {
	interface FastifyInstance {
		env: envType;
	}
}

const envPlugin: FastifyPluginAsync = async (fastify) => {
	fastify.register(fastifyEnv, { schema: envSchema, dotenv: true });
};
export default fp(envPlugin);
