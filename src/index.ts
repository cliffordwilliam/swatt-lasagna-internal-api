import closeWithGrace from "close-with-grace";
import fastify from "fastify";
import app from "./app.js";
import validateEnv from "./env.js";

validateEnv();

const server = fastify({ logger: true });

try {
	await server.register(app);

	closeWithGrace({ delay: 500 }, async ({ err, signal }) => {
		if (err) {
			server.log.error(err);
		}
		server.log.info({ signal }, "shutting down");
		await server.close();
	});

	await server.listen({ port: 3000, host: "0.0.0.0" });
} catch (err) {
	server.log.error(err);
	process.exit(1);
}
