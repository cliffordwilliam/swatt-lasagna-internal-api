import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('Running migrations...');
  const migrationDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationDir)) {
    console.error(`Migration directory not found: ${migrationDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`Applying ${file}`);
    const migration = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    await sql.unsafe(migration);
  }
  
  console.log('Migrations completed successfully');
}

try {
  await run();
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await sql.end();
}
