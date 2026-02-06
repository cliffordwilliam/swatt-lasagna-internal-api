import type { Sql } from "postgres";
import type { PaymentMethodRow } from "./payment-method-schema.js";

export class PaymentMethodRepository {
	async getAllPaymentMethods(sql: Sql): Promise<PaymentMethodRow[]> {
		return await sql<PaymentMethodRow[]>`
			SELECT id, name FROM payment_methods
		`;
	}

	async paymentMethodExists(sql: Sql, id: number): Promise<boolean> {
		const [result] = await sql<[{ exists: boolean }]>`
			SELECT EXISTS(SELECT 1 FROM payment_methods WHERE id = ${id}) as exists
		`;
		return result.exists;
	}
}
