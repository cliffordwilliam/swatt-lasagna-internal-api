import validateEnv from "./env.js";

validateEnv();

import closeWithGrace from "close-with-grace";
import fastify from "fastify";
import app from "./app.js";

const server = fastify({
	logger: {
		level: process.env.NODE_ENV === "production" ? "info" : "debug",
		serializers: {
			req: (req) => ({
				method: req.method,
				url: req.url?.split("?")[0],
			}),
		},
	},
});

try {
	await server.register(app);

	closeWithGrace(async ({ err, signal }) => {
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
