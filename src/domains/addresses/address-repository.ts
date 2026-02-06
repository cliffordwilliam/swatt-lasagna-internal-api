import type { Sql } from "postgres";
import type {
	AddressSummaryRow,
	SearchAddressResultRow,
} from "./address-schema.js";

export class AddressRepository {
	async createAddress(
		sql: Sql,
		personId: number,
		addressValue: string,
	): Promise<void> {
		await sql`
			INSERT INTO person_addresses (person_id, address)
			VALUES (${personId}, ${addressValue})
		`;
	}

	async getAddressById(
		sql: Sql,
		id: number,
	): Promise<AddressSummaryRow | undefined> {
		const [address] = await sql<AddressSummaryRow[]>`
			SELECT id, person_id, address
			FROM person_addresses
			WHERE id = ${id}
		`;
		return address;
	}

	async searchAddressesByValue(
		sql: Sql,
		personId: number,
		addressValue: string,
	): Promise<SearchAddressResultRow[]> {
		return await sql<SearchAddressResultRow[]>`
			SELECT id, address
			FROM person_addresses
			WHERE person_id = ${personId} AND address ILIKE ${`%${addressValue}%`}
			LIMIT 50
		`;
	}

	async addressExists(
		sql: Sql,
		personId: number,
		addressValue: string,
	): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(
				SELECT 1 FROM person_addresses
				WHERE person_id = ${personId} AND address = ${addressValue}
			) as exists
		`;
		return result.exists;
	}
}
