import type { Sql } from "postgres";
import type { AddressRow, PersonRow, PhoneRow } from "./person-schema.js";

export class PersonRepository {
	async createPerson(sql: Sql, name: string): Promise<PersonRow> {
		const [person] = await sql<PersonRow[]>`
			INSERT INTO persons (name) VALUES (${name}) RETURNING id, name
		`;
		return person!;
	}

	async getPersonById(sql: Sql, id: number): Promise<PersonRow | undefined> {
		const [person] = await sql<PersonRow[]>`
			SELECT id, name FROM persons WHERE id = ${id}
		`;
		return person;
	}

	async getPersonByName(
		sql: Sql,
		name: string,
	): Promise<PersonRow | undefined> {
		const [person] = await sql<PersonRow[]>`
			SELECT id, name FROM persons WHERE name = ${name}
		`;
		return person;
	}

	async getPhoneById(sql: Sql, id: number): Promise<PhoneRow | undefined> {
		const [phone] = await sql<PhoneRow[]>`
			SELECT id, person_id, phone_number FROM person_phones WHERE id = ${id}
		`;
		return phone;
	}

	async createPhone(
		sql: Sql,
		personId: number,
		phoneNumber: string,
	): Promise<PhoneRow> {
		const [phone] = await sql<PhoneRow[]>`
			INSERT INTO person_phones (person_id, phone_number)
			VALUES (${personId}, ${phoneNumber})
			RETURNING id, person_id, phone_number
		`;
		return phone!;
	}

	async getAddressById(sql: Sql, id: number): Promise<AddressRow | undefined> {
		const [address] = await sql<AddressRow[]>`
			SELECT id, person_id, address FROM person_addresses WHERE id = ${id}
		`;
		return address;
	}

	async createAddress(
		sql: Sql,
		personId: number,
		addressValue: string,
	): Promise<AddressRow> {
		const [address] = await sql<AddressRow[]>`
			INSERT INTO person_addresses (person_id, address)
			VALUES (${personId}, ${addressValue})
			RETURNING id, person_id, address
		`;
		return address!;
	}
}
