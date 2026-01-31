import type { Sql } from "postgres";
import { DeliveryMethodRepository } from "./delivery-method-repository.js";
import type { DeliveryMethodRow } from "./delivery-method-schema.js";

export class DeliveryMethodService {
	private repo = new DeliveryMethodRepository();

	constructor(private db: Sql) {}

	async getAllDeliveryMethods(): Promise<DeliveryMethodRow[]> {
		return await this.repo.getAllDeliveryMethods(this.db);
	}
}
