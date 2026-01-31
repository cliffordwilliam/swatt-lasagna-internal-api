import type { Sql } from "postgres";
import type { DeliveryMethodRow } from "./delivery-method-schema.js";

export class DeliveryMethodRepository {
	async getAllDeliveryMethods(sql: Sql): Promise<DeliveryMethodRow[]> {
		return await sql<DeliveryMethodRow[]>`
			SELECT id, name FROM delivery_methods
		`;
	}

	async getDeliveryMethodById(
		sql: Sql,
		id: number,
	): Promise<{ id: number } | undefined> {
		const [method] = await sql<{ id: number }[]>`
			SELECT id FROM delivery_methods WHERE id = ${id}
		`;
		return method;
	}
}
