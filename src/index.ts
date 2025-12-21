import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import fastify from "fastify";
import { itemsTable } from "./db/schema.js";

const server = fastify({
	logger: true,
});

server.get("/items", async () => {
	const db = drizzle(`${process.env.DATABASE_URL}`);
	const allItems = await db.select().from(itemsTable);
	return { items: allItems };
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
