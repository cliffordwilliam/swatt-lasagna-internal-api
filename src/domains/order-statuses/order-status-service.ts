import type { Sql } from "postgres";
import { OrderStatusRepository } from "./order-status-repository.js";
import type { OrderStatusRow } from "./order-status-schema.js";

export class OrderStatusService {
	private repo = new OrderStatusRepository();

	constructor(private db: Sql) {}

	async getAllOrderStatuses(): Promise<OrderStatusRow[]> {
		return await this.repo.getAllOrderStatuses(this.db);
	}
}
