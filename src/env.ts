function validateEnv() {
	const required = [
		"DATABASE_URL",
		"PORT",
		"HOST",
		"CORS_ORIGIN",
		"DB_POOL_SIZE",
		"CLERK_PUBLISHABLE_KEY",
		"CLERK_SECRET_KEY",
		"RATE_LIMIT_MAX",
		"RATE_LIMIT_TIME_WINDOW",
		"NODE_ENV",
	];

	for (const key of required) {
		if (!process.env[key]) {
			console.error(`${key} is not set`);
			process.exit(1);
		}
	}
}
export default validateEnv;
