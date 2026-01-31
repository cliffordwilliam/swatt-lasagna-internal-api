import fastify from "fastify";
import swagger from "@fastify/swagger";
import { writeFileSync } from "fs";
import app from "./dist/app.js";

async function generateSpec() {
  const server = fastify({ logger: false });
  await server.register(swagger, {openapi: {}});
  await server.register(app, { skipDb: true });
  await server.ready();
  const spec = server.swagger();
  writeFileSync("./docs/openapi.json", JSON.stringify(spec, null, 2));
  console.log("✅ OpenAPI spec generated at ./docs/openapi.json");
  await server.close();
}

generateSpec().catch((err) => {
  console.error("❌ Failed to generate OpenAPI spec:", err);
  process.exit(1);
});