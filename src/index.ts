import fastify from "fastify";
import app from "./app.js";

const server = fastify({ logger: true });
await server.register(app);
await server.listen({ port: 3000, host: "0.0.0.0" });
