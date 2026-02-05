import type { Sql } from "postgres";
import type { PhoneSummaryRow, SearchPhoneResultRow } from "./phone-schema.js";

export class PhoneRepository {
	async createPhone(
		sql: Sql,
		personId: number,
		phoneNumber: string,
	): Promise<void> {
		await sql`
			INSERT INTO person_phones (person_id, phone_number)
			VALUES (${personId}, ${phoneNumber})
		`;
	}

	async getPhoneById(
		sql: Sql,
		id: number,
	): Promise<PhoneSummaryRow | undefined> {
		const [phone] = await sql<PhoneSummaryRow[]>`
			SELECT id, person_id, phone_number
			FROM person_phones
			WHERE id = ${id}
		`;
		return phone;
	}

	async searchPhonesByNumber(
		sql: Sql,
		personId: number,
		phoneNumber: string,
	): Promise<SearchPhoneResultRow[]> {
		return await sql<SearchPhoneResultRow[]>`
			SELECT id, phone_number
			FROM person_phones
			WHERE person_id = ${personId} AND phone_number ILIKE ${`%${phoneNumber}%`}
			LIMIT 50
		`;
	}

	async phoneExists(
		sql: Sql,
		personId: number,
		phoneNumber: string,
	): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(
				SELECT 1 FROM person_phones
				WHERE person_id = ${personId} AND phone_number = ${phoneNumber}
			) as exists
		`;
		return result.exists;
	}

	async getPhoneIdByNumber(
		sql: Sql,
		personId: number,
		phoneNumber: string | null,
	): Promise<number | null> {
		if (!phoneNumber) {
			return null;
		}
		const [phone] = await sql<[{ id: number } | undefined]>`
			SELECT id FROM person_phones
			WHERE person_id = ${personId} AND phone_number = ${phoneNumber}
			LIMIT 1
		`;
		return phone?.id ?? null;
	}
}
