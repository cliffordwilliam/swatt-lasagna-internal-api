import type { Sql } from "postgres";
import { ConflictError, NotFoundError } from "../../lib/errors.js";
import { normalizeNameForDb } from "../../lib/string-utils.js";
import { PersonRepository } from "../persons/person-repository.js";
import { AddressRepository } from "./address-repository.js";
import type {
	CreateAddressInput,
	SearchAddressResultRow,
} from "./address-schema.js";

export class AddressService {
	private repo = new AddressRepository();
	private personRepo = new PersonRepository();

	constructor(private db: Sql) {}

	async createAddress(addressData: CreateAddressInput): Promise<void> {
		await this._validatePersonExists(this.db, addressData.person_id);
		await this._validateAddressUniqueness(
			this.db,
			addressData.person_id,
			addressData.address,
		);
		await this.repo.createAddress(
			this.db,
			addressData.person_id,
			addressData.address,
		);
	}

	async searchAddressesByValue(
		personId: number,
		address: string,
	): Promise<SearchAddressResultRow[]> {
		await this._validatePersonExists(this.db, personId);
		const normalizedAddress = normalizeNameForDb(address);
		if (!normalizedAddress) {
			return [];
		}
		return await this.repo.searchAddressesByValue(
			this.db,
			personId,
			normalizedAddress,
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

	private async _validateAddressUniqueness(
		sql: Sql,
		personId: number,
		addressValue: string,
	): Promise<void> {
		const exists = await this.repo.addressExists(sql, personId, addressValue);
		if (exists) {
			throw new ConflictError(
				`Address ${addressValue} already exists for person ${personId}`,
			);
		}
	}
}
