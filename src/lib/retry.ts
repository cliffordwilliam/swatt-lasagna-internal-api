export async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
	const maxAttempts = 3;
	const retryableCodes = new Set([
		"40001", // serialization_failure
		"40P01", // deadlock_detected
		"55P03", // lock_not_available
		"57014", // query_canceled (timeout)
	]);
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await operation();
		} catch (error) {
			const pgError = error as { code?: string };
			const isRetryable = pgError.code && retryableCodes.has(pgError.code);
			if (attempt === maxAttempts || !isRetryable) {
				throw error;
			}
			const delay = 100 * 2 ** attempt;
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	// This should never execute, just to satisfy TypeScript's return type
	throw new Error("Unreachable");
}
