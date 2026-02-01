import { fileURLToPath } from "url";
import path from "path";
import fastify from "fastify";
import swagger from "@fastify/swagger";
import { writeFileSync } from "fs";
import app from "../dist/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateSpec() {
  const server = fastify({ logger: false });
  await server.register(swagger, { openapi: {} });
  await server.register(app, { skipDb: true });
  await server.ready();
  const spec = server.swagger();
  const outputPath = path.join(__dirname, "openapi.json");
  writeFileSync(outputPath, JSON.stringify(spec));
  console.log(`✅ OpenAPI spec generated at ${outputPath}`);
  await server.close();
}

generateSpec().catch((err) => {
  console.error("❌ Failed to generate OpenAPI spec:", err);
  process.exit(1);
});
