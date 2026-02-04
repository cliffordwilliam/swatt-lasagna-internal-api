import type { Sql } from "postgres";
import type { PersonRow } from "./person-schema.js";

export class PersonRepository {
	async createPerson(sql: Sql, name: string): Promise<void> {
		await sql`
			INSERT INTO persons (name) VALUES (${name})
		`;
	}

	async getPersonById(sql: Sql, id: number): Promise<PersonRow | undefined> {
		const [person] = await sql<PersonRow[]>`
			SELECT id, name FROM persons WHERE id = ${id}
		`;
		return person;
	}

	async searchPersonsByName(sql: Sql, name: string): Promise<PersonRow[]> {
		return await sql<PersonRow[]>`
			SELECT id, name FROM persons WHERE name ILIKE ${`%${name}%`} LIMIT 50
		`;
	}

	async personExists(sql: Sql, id: number): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM persons WHERE id = ${id}) as exists
		`;
		return result.exists;
	}

	async personNameExists(sql: Sql, name: string): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM persons WHERE name = ${name}) as exists
		`;
		return result.exists;
	}
}
