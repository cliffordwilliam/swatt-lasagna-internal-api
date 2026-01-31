function validateEnv() {
	const required = [
		"DATABASE_URL",
		"PORT",
		"HOST",
		"CORS_ORIGIN",
		"DB_POOL_SIZE",
	];

	for (const key of required) {
		if (!process.env[key]) {
			console.error(`${key} is not set`);
			process.exit(1);
		}
	}
}
export default validateEnv;
