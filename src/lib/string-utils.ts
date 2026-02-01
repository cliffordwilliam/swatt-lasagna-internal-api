export function normalizeNameForDb(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}
