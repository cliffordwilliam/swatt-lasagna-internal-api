import type { Sql } from "postgres";
import { PaymentMethodRepository } from "./payment-method-repository.js";
import type { PaymentMethodRow } from "./payment-method-schema.js";

export class PaymentMethodService {
	private repo = new PaymentMethodRepository();

	constructor(private db: Sql) {}

	async getAllPaymentMethods(): Promise<PaymentMethodRow[]> {
		return await this.repo.getAllPaymentMethods(this.db);
	}
}
