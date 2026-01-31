import type { Sql } from "postgres";
import type { PaymentMethodRow } from "./payment-method-schema.js";

export class PaymentMethodRepository {
	async getAllPaymentMethods(sql: Sql): Promise<PaymentMethodRow[]> {
		return await sql<PaymentMethodRow[]>`
			SELECT id, name FROM payment_methods
		`;
	}

	async getPaymentMethodById(
		sql: Sql,
		id: number,
	): Promise<{ id: number } | undefined> {
		const [method] = await sql<{ id: number }[]>`
			SELECT id FROM payment_methods WHERE id = ${id}
		`;
		return method;
	}
}
