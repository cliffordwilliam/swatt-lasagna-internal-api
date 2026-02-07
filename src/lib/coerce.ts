export function toInt(v: number | string | null | undefined): number {
	if (v == null) return 0;
	return typeof v === "number" ? Math.round(v) : parseInt(String(v), 10) || 0;
}

export function toNum(v: number | string | null | undefined): number {
	if (v == null) return 0;
	return typeof v === "number" ? v : parseFloat(String(v)) || 0;
}

export function toDateStr(d: Date): string {
	return d.toISOString();
}

export function toDateOnlyStr(d: Date): string {
	return d.toISOString().slice(0, 10);
}
