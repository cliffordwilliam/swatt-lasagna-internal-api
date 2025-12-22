import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const migrationClient = postgres(DATABASE_URL, { max: 1 });

async function run() {
  console.log('Running migrations...');
  
  await migrate(drizzle(migrationClient), {
    migrationsFolder: './migrations',
  });
  
  console.log('Migrations completed successfully');
}

run()
  .then(async () => {
    await migrationClient.end();
  })
  .catch(async (err) => {
    console.error('Migration failed:', err);
    await migrationClient.end();
    process.exit(1);
  });