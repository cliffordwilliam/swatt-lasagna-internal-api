import { randomUUID } from "node:crypto";
import validateEnv from "./env.js";

validateEnv();

import closeWithGrace from "close-with-grace";
import fastify from "fastify";
import app from "./app.js";

const server = fastify({
	genReqId: (req) => {
		const id = req.headers["x-request-id"];
		return (Array.isArray(id) ? id[0] : id) ?? randomUUID();
	},
	requestIdHeader: "x-request-id",
	requestIdLogLabel: "requestId",
	logger: {
		level: process.env.NODE_ENV === "production" ? "info" : "debug",
		serializers: {
			req: (req) => ({
				method: req.method,
				url: req.url?.split("?")[0],
			}),
		},
	},
	connectionTimeout: 30000,
	keepAliveTimeout: 5000,
	requestTimeout: 30000,
});

process.on("uncaughtException", (err) => {
	server.log.fatal({ err }, "uncaught exception");
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	server.log.fatal({ err: reason, promise }, "unhandled promise rejection");
	process.exit(1);
});

try {
	await server.register(app);

	closeWithGrace({ delay: 10000 }, async ({ err, signal }) => {
		if (err) {
			server.log.error(err);
		}
		server.log.info({ signal }, "shutting down");
		await server.close();
	});

	await server.listen({
		port: Number(process.env.PORT!),
		host: process.env.HOST!,
	});
} catch (err) {
	server.log.error(err);
	process.exit(1);
}
