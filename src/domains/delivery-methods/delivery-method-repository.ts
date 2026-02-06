import type { Sql } from "postgres";
import type { DeliveryMethodRow } from "./delivery-method-schema.js";

export class DeliveryMethodRepository {
	async getAllDeliveryMethods(sql: Sql): Promise<DeliveryMethodRow[]> {
		return await sql<DeliveryMethodRow[]>`
			SELECT id, name FROM delivery_methods
		`;
	}

	async deliveryMethodExists(sql: Sql, id: number): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM delivery_methods WHERE id = ${id}) as exists
		`;
		return result.exists;
	}
}
