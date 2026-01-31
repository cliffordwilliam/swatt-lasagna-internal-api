import type { Sql } from "postgres";
import { NotFoundError } from "../../lib/errors.js";
import { PersonRepository } from "./person-repository.js";
import type { PersonRow } from "./person-schema.js";

export class PersonService {
	private repo = new PersonRepository();

	constructor(private db: Sql) {}

	async getPersonByName(name: string): Promise<PersonRow> {
		const person = await this.repo.getPersonByName(this.db, name);
		if (!person) {
			throw new NotFoundError(`Person with name ${name} not found`);
		}
		return person;
	}
}
