export function normalizeNameForDb(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizePhoneForSearch(value: string): string {
	return value.trim().toLowerCase();
}
