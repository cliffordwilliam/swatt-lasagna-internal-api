function validateEnv() {
	const required = ["DATABASE_URL"];

	for (const key of required) {
		if (!process.env[key]) {
			console.error(`${key} is not set`);
			process.exit(1);
		}
	}
}
export default validateEnv;
