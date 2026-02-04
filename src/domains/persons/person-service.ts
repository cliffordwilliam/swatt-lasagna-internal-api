import type { Sql } from "postgres";
import { ConflictError } from "../../lib/errors.js";
import { normalizeNameForDb } from "../../lib/string-utils.js";
import { PersonRepository } from "./person-repository.js";
import type { CreatePersonInput, PersonRow } from "./person-schema.js";

export class PersonService {
	private repo = new PersonRepository();

	constructor(private db: Sql) {}

	async createPerson(personData: CreatePersonInput): Promise<void> {
		const normalizedName = normalizeNameForDb(personData.name);
		await this._validatePersonNameUniqueness(this.db, normalizedName);
		await this.repo.createPerson(this.db, normalizedName);
	}

	async searchPersonsByName(name: string): Promise<PersonRow[]> {
		const normalizedName = normalizeNameForDb(name);
		if (!normalizedName) {
			return [];
		}
		return await this.repo.searchPersonsByName(this.db, normalizedName);
	}

	private async _validatePersonNameUniqueness(
		sql: Sql,
		personName: string,
	): Promise<void> {
		const exists = await this.repo.personNameExists(sql, personName);
		if (exists) {
			throw new ConflictError(`Person with name ${personName} already exists`);
		}
	}
}
