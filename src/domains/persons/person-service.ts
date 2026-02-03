import type { Sql } from "postgres";
import { NotFoundError } from "../../lib/errors.js";
import { normalizeNameForDb } from "../../lib/string-utils.js";
import { PersonRepository } from "./person-repository.js";
import type { PersonRow } from "./person-schema.js";

export class PersonService {
	private repo = new PersonRepository();

	constructor(private db: Sql) {}

	async getPersonByName(name: string): Promise<PersonRow> {
		const normalizedName = normalizeNameForDb(name);
		const person = await this.repo.getPersonByName(this.db, normalizedName);
		if (!person) {
			throw new NotFoundError(`Person with name ${name} not found`);
		}
		return person;
	}

	async searchPersonsByName(name: string): Promise<PersonRow[]> {
		const normalizedName = normalizeNameForDb(name);
		if (!normalizedName) {
			return [];
		}
		return await this.repo.searchPersonsByName(this.db, normalizedName);
	}
}
