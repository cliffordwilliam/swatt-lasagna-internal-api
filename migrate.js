import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error("DATABASE_URL is not set");
	process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
	console.log("Running migrations...");
	const migrationDir = path.join(__dirname, "migrations");
	if (!fs.existsSync(migrationDir)) {
		console.error(`Migration directory not found: ${migrationDir}`);
		process.exit(1);
	}

	await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

	const appliedRows =
		await sql`SELECT version FROM schema_migrations ORDER BY version`;
	const applied = new Set((appliedRows ?? []).map((r) => r.version));

	const files = fs
		.readdirSync(migrationDir)
		.filter((f) => f.endsWith(".sql"))
		.sort();

	let appliedCount = 0;
	let skippedCount = 0;

	for (const file of files) {
		if (applied.has(file)) {
			console.log(`  Skipping ${file} (already applied)`);
			skippedCount += 1;
			continue;
		}

		console.log(`  Applying ${file}`);
		const migration = fs.readFileSync(path.join(migrationDir, file), "utf8");

		await sql.begin(async (tx) => {
			await tx.unsafe(migration);
			await tx`INSERT INTO schema_migrations (version, applied_at) VALUES (${file}, NOW())`;
		});

		appliedCount += 1;
	}

	if (appliedCount === 0 && skippedCount === 0) {
		console.log("No migration files found.");
	} else {
		console.log(
			`Migrations completed successfully (${appliedCount} applied, ${skippedCount} skipped)`,
		);
	}
}

try {
	await run();
} catch (err) {
	console.error("Migration failed:", err);
	process.exit(1);
} finally {
	await sql.end();
}
