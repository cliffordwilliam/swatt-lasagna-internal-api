import fastify from "fastify";

const server = fastify({
	logger: true,
});

server.get("/", async () => {
	return {
		message: "Hello from Fastify!",
		timestamp: new Date().toISOString(),
	};
});

const start = async () => {
	try {
		await server.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Server is running on http://localhost:3000");
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
