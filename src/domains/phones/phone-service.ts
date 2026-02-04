import type { Sql } from "postgres";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { normalizePhoneForSearch } from "../../lib/string-utils.js";
import { PersonRepository } from "../persons/person-repository.js";
import { PhoneRepository } from "./phone-repository.js";
import type { CreatePhoneInput, SearchPhoneResultRow } from "./phone-schema.js";

export class PhoneService {
	private repo = new PhoneRepository();
	private personRepo = new PersonRepository();

	constructor(private db: Sql) {}

	async createPhone(phoneData: CreatePhoneInput): Promise<void> {
		await this._validatePersonExists(this.db, phoneData.person_id);
		await this._validatePhoneUniqueness(
			this.db,
			phoneData.person_id,
			phoneData.phone_number,
		);
		await this.repo.createPhone(
			this.db,
			phoneData.person_id,
			phoneData.phone_number,
		);
	}

	async searchPhonesByNumber(
		personId: number,
		phoneNumber: string,
	): Promise<SearchPhoneResultRow[]> {
		await this._validatePersonExists(this.db, personId);
		const normalizedPhone = normalizePhoneForSearch(phoneNumber);
		if (!normalizedPhone) {
			return [];
		}
		return await this.repo.searchPhonesByNumber(
			this.db,
			personId,
			normalizedPhone,
		);
	}

	private async _validatePersonExists(
		sql: Sql,
		personId: number,
	): Promise<void> {
		const exists = await this.personRepo.personExists(sql, personId);
		if (!exists) {
			throw new NotFoundError(`Person with id ${personId} not found`);
		}
	}

	private async _validatePhoneUniqueness(
		sql: Sql,
		personId: number,
		phoneNumber: string,
	): Promise<void> {
		const exists = await this.repo.phoneExists(sql, personId, phoneNumber);
		if (exists) {
			throw new ConflictError(
				`Phone number ${phoneNumber} already exists for person ${personId}`,
			);
		}
	}
}
